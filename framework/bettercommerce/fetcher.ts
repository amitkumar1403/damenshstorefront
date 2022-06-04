// Package Imports
import store from 'store';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { isEmpty, merge, assign } from 'lodash';

// Other Imports
import { BASE_URL, AUTH_URL, CLIENT_ID, SHARED_SECRET } from './utils/constants';
import { writeFetcherLog } from './utils';

const singletonEnforcer = Symbol();

class Axios {
    private accessToken: string = "";
    private axiosClient: AxiosInstance;
    static axiosInstance: Axios;

    constructor(enforcer: any) {
        if (enforcer !== singletonEnforcer) {
            throw new Error('Cannot initialize Axios client single instance');
        }

        this.axiosClient = axios.create({
            baseURL: BASE_URL,
            withCredentials: true,
        });
        this._initializeResponseInterceptor(this.axiosClient);
        this._createAxiosResponseInterceptor(this.axiosClient);
    }

    static get instance(): Axios {
        if (!this.axiosInstance) {
            this.axiosInstance = new Axios(singletonEnforcer);
        }

        return this.axiosInstance;
    }
    client = (): AxiosInstance => this.axiosClient;

    private getToken = () => this.accessToken;

    private setToken = (token: string) => (this.accessToken = token)

    private _initializeResponseInterceptor = (client: AxiosInstance) => {
        client.interceptors.response.use(
            async (config: any) => {
                const token = this.getToken()
                //console.log("--------------------------------------------------");
                //console.log(token);

                //this is to be changed when we implement currency / language switcher
                if (token) {
                    config.headers['Authorization'] = 'Bearer ' + token;
                }
                return config;
            },
            (err) => Promise.reject(err)
        );
    }

    private _createAxiosResponseInterceptor(client: AxiosInstance) {
        const interceptor = client.interceptors.response.use(
            (response: any) => response,
            (error: any) => {
                // Reject promise if usual error
                if (error.response.status !== 401) {
                    return Promise.reject(error);
                }
                /*
                 * When response code is 401, try to refresh the token.
                 * Eject the interceptor so it doesn't loop in case
                 * token refresh causes the 401 response
                 */
                client.interceptors.response.eject(interceptor);

                // return getAuthToken().finally(createAxiosResponseInterceptor)
                const authUrl = new URL('/oAuth/token', AUTH_URL);

                return client({
                    url: authUrl.href,
                    method: 'post',
                    data: `client_id=${CLIENT_ID}&client_secret=${SHARED_SECRET}&grant_type=client_credentials`,
                })
                    .then((res: any) => {
                        this.setToken(res.data.access_token);
                        error.response.config.headers['Authorization'] =
                            'Bearer ' + res.data.access_token
                        return client(error.response.config);
                    })
                    .catch((error) => {
                        //@TODO redirect here to Login page
                        return Promise.reject(error);
                    })
                    .finally(() => this._createAxiosResponseInterceptor(client))
            }
        )
    }
}

export const setGeneralParams = (param: any, value: any) => {
    store.remove(param)
    store.set(param, value)
}

const instance = Axios.instance;

const fetcher = async ({
    url = '',
    method = 'post',
    data = {},
    params = {},
    headers = {},
    cookies = {},
    baseUrl = "",
    logRequest = false,
}: any) => {
    const computedUrl = new URL(url, baseUrl || BASE_URL)
    const newConfig = {
        Currency: (!cookies.Currency ? "INR": cookies.Currency) || store.get('Currency') || 'GBP',
        Language: (!cookies.Language ? "en": cookies.Language) || store.get('Language') || 'en',
        Country: (!cookies.Country ? "IN": cookies.Country) || store.get('Country') || 'GB',
    }
    const config: any = {
        method: method,
        url: computedUrl.href,
        headers: { ...headers, ...newConfig },
    }

    if (Object.keys(params).length) {
        config.params = params
    }

    if (Object.keys(data).length) {
        config.data = data
    }
    //console.log(config)
    try {
        if (instance && instance.client()) {
            const client = instance.client();
            const response: AxiosResponse<any> = await client(config);
            if (logRequest) {
                writeFetcherLog(config, response?.data);
            }
            return response.data
        }
        return null;
    } catch (error: any) {
        console.log(error, 'error inside fetcher')
        throw new Error(error.response.data.message)
    }
}
export default fetcher