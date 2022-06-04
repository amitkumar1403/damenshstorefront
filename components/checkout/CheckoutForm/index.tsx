import { useUI, basketId as generateBasketId } from '@components/ui/context'
import Cookies from 'js-cookie'
import { useReducer, useEffect } from 'react'
import cartHandler from '@components/services/cart'
import Delivery from './Delivery'
import Summary from './Summary'
import Form from './Form'
import axios from 'axios'
import {
  NEXT_UPDATE_CHECKOUT_ADDRESS,
  NEXT_PAYMENT_METHODS,
  NEXT_CONFIRM_ORDER,
  NEXT_POST_PAYMENT_RESPONSE,
  LOQATE_ADDRESS,
  RETRIEVE_ADDRESS,
} from '@components/utils/constants'
import {
  shippingFormConfig,
  shippingSchema,
  billingFormConfig,
  billingSchema,
} from './config'
import Payments from './Payments'
import Router from 'next/router'
import { asyncHandler } from '@components/account/Address/AddressBook'
import eventDispatcher from '@components/services/analytics/eventDispatcher'
import { EVENTS_MAP } from '@components/services/analytics/constants'
import setSessionIdCookie from '@components/utils/setSessionId'
import {
  BILLING_INFORMATION,
  BTN_DELIVER_TO_THIS_ADDRESS,
  GENERAL_CHECKOUT,
  GENERAL_PAYMENT,
  GENERAL_SAVE_CHANGES,
  SHIPPING_INFORMATION,
} from '@components/utils/textVariables'
import PaymentWidget from '@components/checkout/PaymentWidget'

const Spinner = () => {
  return (
    <main className="fit bg-white">
      <div className="fixed top-0 right-0 h-screen w-screen z-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    </main>
  )
}
export default function CheckoutForm({
  cart,
  user,
  defaultShippingAddress,
  defaultBillingAddress,
  addresses = [],
  fetchAddress,
  config,
  location,
}: any) {
  const {
    setCartItems,
    basketId,
    cartItems,
    setOrderId,
    orderId,
    setBasketId,
  } = useUI()

  const isShippingDisabled =
    cartItems.lineItems.filter(
      (i: any) => i.itemType === 2 || i.itemType === 20
    ).length === cartItems.lineItems.length

  const defaultDeliveryMethod = cartItems.shippingMethods.find(
    (i: any) => i.id === cartItems.shippingMethodId
  )
  const INITIAL_STATE = {
    isDeliveryMethodSelected: false,
    isShippingInformationCompleted: !!Object.keys(defaultShippingAddress)
      .length,
    isPaymentInformationCompleted: !!Object.keys(defaultBillingAddress).length,
    shippingInformation: defaultShippingAddress,
    billingInformation: defaultBillingAddress,
    deliveryMethod: defaultDeliveryMethod,
    isSameAddress: true,
    selectedPaymentMethod: null,
    shippingMethod: null,
    storeId: '',
    isCNC: false,
    error: '',
    orderResponse: {},
    showStripe: false,
    isPaymentIntent: new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    ),
    isPaymentWidgetActive: false,
  }

  interface stateInterface {
    isDeliveryMethodSelected: boolean
    isShippingInformationCompleted: boolean
    isPaymentInformationCompleted: boolean
    shippingInformation: any
    billingInformation: any
    deliveryMethod: any
    isSameAddress: boolean
    selectedPaymentMethod: any
    shippingMethod: any
    storeId: string
    isCNC: boolean
    error: string
    orderResponse: any
    showStripe: boolean
    isPaymentIntent: boolean
    isPaymentWidgetActive: boolean
  }
  interface actionInterface {
    type?: string
    payload?: any
  }

  const checkoutCallback = async (orderId: any) => {
    Cookies.remove('sessionId')
    setSessionIdCookie()
    Cookies.remove('basketId')
    const generatedBasketId = generateBasketId()
    setBasketId(generatedBasketId)
    const userId = cartItems.userId
    const newCart = await associateCart(userId, generatedBasketId)
    setCartItems(newCart.data)
    setOrderId(orderId)
    Router.push('/thank-you')
  }
  function reducer(state: stateInterface, { type, payload }: actionInterface) {
    switch (type) {
      case 'SET_SHIPPING_METHOD': {
        return {
          ...state,
          shippingMethod: payload,
        }
      }
      case 'IS_CNC': {
        return {
          ...state,
          storeId: payload,
          isCNC: !state.isCNC,
        }
      }
      case 'SET_PAYMENT_METHOD': {
        return {
          ...state,
          selectedPaymentMethod: payload,
        }
      }
      case 'TOGGLE_DELIVERY_METHOD': {
        return {
          ...state,
          isDeliveryMethodSelected: !state.isDeliveryMethodSelected,
          deliveryMethod: payload || state.deliveryMethod,
        }
      }
      case 'TOGGLE_SHIPPING': {
        return {
          ...state,
          isShippingInformationCompleted: !state.isShippingInformationCompleted,
        }
      }
      case 'TOGGLE_PAYMENT': {
        return {
          ...state,
          isPaymentInformationCompleted: payload,
        }
      }
      case 'SET_SHIPPING_INFORMATION': {
        return {
          ...state,
          shippingInformation: payload,
        }
      }
      case 'SET_BILLING_INFORMATION': {
        return {
          ...state,
          billingInformation: payload,
        }
      }
      case 'SET_SAME_ADDRESS': {
        return {
          ...state,
          isSameAddress: !state.isSameAddress,
        }
      }
      case 'SET_ERROR': {
        return {
          ...state,
          error: payload,
        }
      }
      case 'SET_ORDER_RESPONSE': {
        return {
          ...state,
          orderResponse: payload,
        }
      }
      case 'TRIGGER_STRIPE': {
        return {
          ...state,
          showStripe: payload,
        }
      }
      case 'SET_PAYMENT_INTENT': {
        return {
          ...state,
          isPaymentIntent: payload,
        }
      }
      case 'TRIGGER_PAYMENT_WIDGET': {
        return {
          ...state,
          isPaymentWidgetActive: payload,
        }
      }
      default: {
        return state
      }
    }
  }

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const { addToCart, associateCart } = cartHandler()

  const { createAddress } = asyncHandler()

  const { CheckoutConfirmation } = EVENTS_MAP.EVENT_TYPES
  const { Order } = EVENTS_MAP.ENTITY_TYPES

  const handleNewAddress = (values: any, callback: any = () => {}) => {
    const newValues = {
      ...values,
      userId: cartItems.userId,
      country: state.deliveryMethod.name,
      countryCode: state.deliveryMethod.twoLetterIsoCode,
    }

    createAddress(newValues)
      .then((response: any) => {
        callback()
        fetchAddress()
        setShippingInformation({ ...newValues, id: response.id })
      })
      .catch((error: any) => console.log(error))
  }

  const toggleDelivery = (payload?: any) =>
    dispatch({ type: 'TOGGLE_DELIVERY_METHOD', payload })

  const toggleShipping = () => {
    dispatch({ type: 'TOGGLE_SHIPPING' })
  }

  const paymentData = async () => {
    const response = await axios.post(NEXT_PAYMENT_METHODS, {
      currencyCode: cartItems.baseCurrency,
      countryCode: state.deliveryMethod.twoLetterIsoCode || 'GB',
    })
    return response
  }

  const setShippingMethod = (payload: any, isCNC = false, storeId = '') => {
    dispatch({ type: 'SET_SHIPPING_METHOD', payload })
    if (isCNC) {
      dispatch({ type: 'IS_CNC', payload: storeId })
    }
    if (!isCNC && state.isCNC) {
      dispatch({ type: 'IS_CNC', payload: '' })
    }
  }

  const togglePayment = (
    payload: boolean = !state.isPaymentInformationCompleted
  ) => {
    dispatch({
      type: 'TOGGLE_PAYMENT',
      payload: payload,
    })
  }

  const handleItem = (product: any, type = 'increase') => {
    const asyncHandleItem = async () => {
      const data: any = {
        basketId,
        productId: product.id,
        stockCode: product.stockCode,
        manualUnitPrice: product.manualUnitPrice,
        displayOrder: product.displayOrderta,
        qty: -1,
      }
      if (type === 'increase') {
        data.qty = 1
      }
      if (type === 'delete') {
        data.qty = 0
      }
      try {
        const item = await addToCart(data, type, { product })
        setCartItems(item)
      } catch (error) {
        console.log(error)
      }
    }
    asyncHandleItem()
  }

  const setShippingInformation = (payload: any) =>
    dispatch({ type: 'SET_SHIPPING_INFORMATION', payload })

  const updateAddress = (type: string, payload: any) => {
    switch (type) {
      case 'SHIPPING':
        dispatch({
          type: 'SET_SHIPPING_INFORMATION',
          payload: { ...state.shippingInformation, ...payload },
        })
        return true
      case 'BILLING':
        dispatch({
          type: 'SET_BILLING_INFORMATION',
          payload: { ...state.billingInformation, ...payload },
        })
        return true
      default:
        return false
    }
  }

  const setBillingInformation = (payload: any, update = true) => {
    const handleAsync = async () => {
      const billingInfoClone = { ...payload }
      delete billingInfoClone.id
      const shippingClone = { ...state.shippingInformation }
      delete shippingClone.id

      const data = {
        billingAddress: {
          ...billingInfoClone,
          country: state.deliveryMethod.name,
          countryCode: state.deliveryMethod.twoLetterIsoCode,
        },
        shippingAddress: {
          ...shippingClone,
          country: state.deliveryMethod.name,
          countryCode: state.deliveryMethod.twoLetterIsoCode,
        },
      }

      try {
        await axios.post(NEXT_UPDATE_CHECKOUT_ADDRESS, {
          basketId,
          model: data,
        })
      } catch (error) {}
    }
    dispatch({ type: 'SET_BILLING_INFORMATION', payload })
    if (update) handleAsync()
  }

  const handleShippingSubmit = (values: any) => {
    toggleShipping()
    if (state.isSameAddress) {
      setBillingInformation(values)
      togglePayment(true)
    }
    setShippingInformation(values)
  }

  const handleBillingSubmit = (values: any) => {
    togglePayment()
    setBillingInformation(values)
  }

  useEffect(() => {
    if (!Object.keys(state.shippingInformation).length) {
      setShippingInformation(defaultShippingAddress)
      setBillingInformation(defaultBillingAddress, false)
    }
  }, [defaultShippingAddress])

  const handlePayments = (method: any) => {
    // const isTestUrl = state.selectedPaymentMethod.settings.find((method:any) => method.key === 'UseSandbox').value === 'True';
    const paymentObject = method.settings.reduce((acc: any, obj: any) => {
      if (obj.key === 'UseSandbox') {
        acc['isTestUrl'] = obj.value === 'True'
        return acc
      }
      if (obj.key === 'TestUrl') {
        acc['testUrl'] = obj.value
        return acc
      }
      if (obj.key === 'ProductionUrl') {
        acc['prodUrl'] = obj.value
        return acc
      }
      return acc
    }, {})
  }

  const confirmOrder = (method: any) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method })

    const billingInfoClone = { ...state.billingInformation }
    delete billingInfoClone.id
    const shippingClone = { ...state.shippingInformation }
    delete shippingClone.id

    const data = {
      basketId,
      customerId: cartItems.userId,
      basket: cartItems,
      billingAddress: {
        ...billingInfoClone,
        country: state.deliveryMethod.name,
        countryCode: state.deliveryMethod.twoLetterIsoCode,
      },
      shippingAddress: {
        ...shippingClone,
        country: state.deliveryMethod.name,
        countryCode: state.deliveryMethod.twoLetterIsoCode,
      },
      selectedShipping: state.shippingMethod,
      selectedPayment: method,
      storeId: state.storeId,
      Payment: {
        Id: null,
        CardNo: null,
        OrderNo: 0,
        OrderAmount: cartItems.grandTotal.raw.withTax,
        PaidAmount: 0.0,
        BalanceAmount: 0.0,
        IsValid: false,
        Status: 0,
        AuthCode: null,
        IssuerUrl: null,
        PaRequest: null,
        PspSessionCookie: null,
        PspResponseCode: null,
        PspResponseMessage: null,
        PaymentGatewayId: method.id,
        PaymentGateway: method.systemName,
        Token: null,
        PayerId: null,
        CvcResult: null,
        AvsResult: null,
        Secure3DResult: null,
        CardHolderName: null,
        IssuerCountry: null,
        Info1: null,
        FraudScore: null,
        PaymentMethod: method.systemName,
        IsVerify: false,
        IsValidAddress: false,
        LastUpdatedBy: null,
        OperatorId: null,
        RefStoreId: null,
        TillNumber: null,
        ExternalRefNo: null,
        ExpiryYear: null,
        ExpiryMonth: null,
        IsMoto: false,
      },
    }

    const handleAsync = async () => {
      try {
        const response: any = await axios.post(NEXT_CONFIRM_ORDER, {
          basketId,
          model: data,
        })

        if (state.error) dispatch({ type: 'SET_ERROR', payload: '' })

        if (response.data?.result?.id) {
          // handlePayments(method)
          //@TODO temporary move to BE
          dispatch({
            type: 'SET_ORDER_RESPONSE',
            payload: response.data.result,
          })
          localStorage.setItem(
            'orderResponse',
            JSON.stringify(response.data.result)
          )

          const orderModel = {
            id: response.data.result.payment.id,
            cardNo: null,
            orderNo: response.data.result.orderNo,
            orderAmount: response.data.result.grandTotal.raw.withTax,
            paidAmount: response.data.result.grandTotal.raw.withTax,
            balanceAmount: '0.00',
            isValid: true,
            status: 2,
            authCode: null,
            issuerUrl: null,
            paRequest: null,
            pspSessionCookie: null,
            pspResponseCode: null,
            pspResponseMessage: null,
            paymentGatewayId: method.id,
            paymentGateway: method.systemName,
            token: null,
            payerId: null,
            cvcResult: null,
            avsResult: null,
            secure3DResult: null,
            cardHolderName: null,
            issuerCountry: null,
            info1: '',
            fraudScore: null,
            paymentMethod: method.systemName,
            cardType: null,
            operatorId: null,
            refStoreId: null,
            tillNumber: null,
            externalRefNo: null,
            expiryYear: null,
            expiryMonth: null,
            isMoto: true,
            upFrontPayment: false,
            upFrontAmount: '0.00',
            upFrontTerm: '76245369',
            isPrePaid: false,
          }
          localStorage.setItem('orderModelPayment', JSON.stringify(orderModel))

          dispatch({ type: 'TRIGGER_PAYMENT_WIDGET', payload: true })
        } else {
          dispatch({ type: 'SET_ERROR', payload: response.data.message })
        }
      } catch (error) {
        window.alert(error)
        console.log(error)
      }
    }
    handleAsync()
  }

  const handlePaymentMethod = (method: any) => {
    confirmOrder(method)
  }

  const loqateAddress = (postCode: string = 'E1') => {
    const handleAsync = async () => {
      const response: any = await axios.post(LOQATE_ADDRESS, {
        postCode,
        country: state.deliveryMethod.twoLetterIsoCode,
      })

      //TODO normalize data
      if (response.data) {
        return response.data.response.data.map((item: any) => {
          return {
            text: item.Text,
            id: item.Id,
            description: item.Description,
          }
        })
      } else return []
    }
    return handleAsync()
  }

  const retrieveAddress = async (id: string) => {
    const response: any = await axios.post(RETRIEVE_ADDRESS, {
      id,
    })
    return {
      postCode: response.data.response.data[0].PostalCode,
      address1: response.data.response.data[0].Line1,
      city: response.data.response.data[0].City,
    }
  }

  const setPaymentIntent = (payload: boolean) =>
    dispatch({ type: 'SET_PAYMENT_INTENT', payload })

  return (
    <>
      {state.isPaymentIntent && <Spinner />}
      <div
        className={`bg-gray-50 relative ${
          state.isPaymentIntent
            ? 'pointer-events-none hidden overflow-hidden'
            : ''
        }`}
      >
        <div className="max-w-2xl mx-auto sm:pt-16 pt-2 pb-24 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 className="sr-only">{GENERAL_CHECKOUT}</h2>
          <form className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
            <div>
              {!isShippingDisabled && (
                <Delivery
                  appConfig={config}
                  geoData={location}
                  setParentShipping={setShippingMethod}
                  toggleDelivery={toggleDelivery}
                  isDeliveryMethodSelected={state?.isDeliveryMethodSelected}
                />
              )}

              {state.isCNC || isShippingDisabled ? null : (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {SHIPPING_INFORMATION}
                  </h2>
                  {state?.isDeliveryMethodSelected ? (
                    <>
                      <Form
                        toggleAction={toggleShipping}
                        appConfig={config}
                        values={state?.shippingInformation}
                        updateAddress={updateAddress}
                        onSubmit={handleShippingSubmit}
                        infoType="SHIPPING"
                        schema={shippingSchema}
                        loqateAddress={loqateAddress}
                        config={shippingFormConfig}
                        initialValues={defaultShippingAddress}
                        isInfoCompleted={state?.isShippingInformationCompleted}
                        btnTitle={BTN_DELIVER_TO_THIS_ADDRESS}
                        addresses={addresses}
                        retrieveAddress={retrieveAddress}
                        handleNewAddress={handleNewAddress}
                        setAddress={setShippingInformation}
                        isGuest={cartItems.isGuestCheckout}
                        isSameAddress={state?.isSameAddress}
                        isSameAddressCheckboxEnabled={true}
                        sameAddressAction={() => {
                          dispatch({ type: 'SET_SAME_ADDRESS' })
                        }}
                      />
                    </>
                  ) : null}
                </div>
              )}

              {/* Payment */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {BILLING_INFORMATION}
                </h2>
                {(state?.isShippingInformationCompleted ||
                  state.isCNC ||
                  isShippingDisabled) && (
                  <Form
                    toggleAction={() =>
                      togglePayment(!state.isPaymentInformationCompleted)
                    }
                    onSubmit={handleBillingSubmit}
                    appConfig={config}
                    values={state?.billingInformation}
                    schema={billingSchema}
                    updateAddress={updateAddress}
                    infoType="BILLING"
                    loqateAddress={loqateAddress}
                    config={billingFormConfig}
                    handleNewAddress={handleNewAddress}
                    initialValues={defaultBillingAddress}
                    retrieveAddress={retrieveAddress}
                    isInfoCompleted={state?.isPaymentInformationCompleted}
                    btnTitle={GENERAL_SAVE_CHANGES}
                    addresses={addresses}
                    isGuest={cartItems.isGuestCheckout}
                    setAddress={setBillingInformation}
                    isSameAddressCheckboxEnabled={false}
                  />
                )}
              </div>
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {GENERAL_PAYMENT}
                </h2>
                {state.isPaymentInformationCompleted && (
                  <Payments
                    handlePaymentMethod={handlePaymentMethod}
                    paymentData={paymentData}
                    selectedPaymentMethod={state.selectedPaymentMethod}
                  />
                )}
                {(state.isPaymentWidgetActive || !!state.isPaymentIntent) && (
                  <PaymentWidget
                    paymentMethod={state.selectedPaymentMethod}
                    checkoutCallback={checkoutCallback}
                    orderModelResponse={state.orderResponse}
                  />
                )}
                {state.error && (
                  <h4 className="py-5 text-lg font-semibold text-red-500">
                    {state.error}
                  </h4>
                )}
              </div>
            </div>

            {/* Order summary */}
            <Summary
              confirmOrder={confirmOrder}
              isShippingDisabled={isShippingDisabled}
              cart={cartItems}
              handleItem={handleItem}
            />
          </form>
        </div>
      </div>
    </>
  )
}
