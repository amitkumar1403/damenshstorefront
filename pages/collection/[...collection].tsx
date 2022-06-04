import dynamic from 'next/dynamic'
import type { GetStaticPathsContext, GetStaticPropsContext } from 'next'
import getCollections from '@framework/api/content/getCollections'
import { Layout } from '@components/common'
import Link from 'next/link'
import getCollectionBySlug from '@framework/api/content/getCollectionBySlug'

//DYNAMINC COMPONENT CALLS
const ProductFilterRight = dynamic(() => import('@components/product/Filters/filtersRight'))
const ProductMobileFilters = dynamic(() => import('@components/product/Filters'))
const ProductFiltersTopBar = dynamic(() => import('@components/product/Filters/FilterTopBar'))
const ProductGridWithFacet = dynamic(() => import('@components/product/Grid'))
const ProductGrid = dynamic(() => import('@components/product/Grid/ProductGrid'))

import { useReducer, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useSwr from 'swr'
import Image from 'next/image'
import { NextSeo } from 'next-seo'
import { postData } from '@components/utils/clientFetcher'
import { IMG_PLACEHOLDER, RESULTS } from '@components/utils/textVariables'
import { Swiper, SwiperSlide } from 'swiper/react'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'

import SwiperCore, { Navigation } from 'swiper'
import commerce from '@lib/api/commerce'
export const ACTION_TYPES = {
  SORT_BY: 'SORT_BY',
  PAGE: 'PAGE',
  SORT_ORDER: 'SORT_ORDER',
  CLEAR: 'CLEAR',
  HANDLE_FILTERS_UI: 'HANDLE_FILTERS_UI',
  ADD_FILTERS: 'ADD_FILTERS',
  REMOVE_FILTERS: 'REMOVE_FILTERS',
}

interface actionInterface {
  type?: string
  payload?: object | any
}

interface stateInterface {
  sortBy?: string
  currentPage?: string | number
  sortOrder?: string
  filters: any
}

const IS_INFINITE_SCROLL =
  process.env.NEXT_PUBLIC_ENABLE_INFINITE_SCROLL === 'true'

const {
  SORT_BY,
  PAGE,
  SORT_ORDER,
  CLEAR,
  HANDLE_FILTERS_UI,
  ADD_FILTERS,
  REMOVE_FILTERS,
} = ACTION_TYPES

const DEFAULT_STATE = {
  sortBy: '',
  sortOrder: 'asc',
  currentPage: 1,
  filters: [],
}

function reducer(state: stateInterface, { type, payload }: actionInterface) {
  switch (type) {
    case SORT_BY:
      return { ...state, sortBy: payload }
    case PAGE:
      return { ...state, currentPage: payload }
    case SORT_ORDER:
      return { ...state, sortOrder: payload }
    case CLEAR:
      return { ...state, filters: [] }
    case HANDLE_FILTERS_UI:
      return { ...state, areFiltersOpen: payload }
    case ADD_FILTERS:
      return { ...state, filters: [...state.filters, payload] }
    case REMOVE_FILTERS:
      return {
        ...state,
        filters: state.filters.filter(
          (item: any) => item.Value !== payload.Value
        ),
      }
    default:
      return { ...state }
  }
}

export default function CollectionPage(props: any) {
  const router = useRouter()
  const adaptedQuery: any = { ...router.query }

  adaptedQuery.currentPage
    ? (adaptedQuery.currentPage = Number(adaptedQuery.currentPage))
    : false
  adaptedQuery.filters
    ? (adaptedQuery.filters = JSON.parse(adaptedQuery.filters))
    : false

  const initialState = {
    ...DEFAULT_STATE,
    filters: adaptedQuery.filters || [],
    collectionId: props.id,
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  const {
    data = {
      products: {
        results: [],
        sortList: [],
        pages: 0,
        total: 0,
        currentPage: 1,
        filters: [],
        collectionId: props.id,
      },
    },
    error,
  } = useSwr(['/api/catalog/products', state], postData)

  const [productListMemory, setProductListMemory] = useState({
    products: {
      results: [],
      sortList: [],
      pages: 0,
      total: 0,
      currentPage: 1,
      filters: [],
      collectionId: props.id,
    },
  })

  const productDataToPass = IS_INFINITE_SCROLL
    ? productListMemory.products
    : props.products

  useEffect(() => {
    if (IS_INFINITE_SCROLL) {
      if (
        data.products.currentPage !== productListMemory.products.currentPage ||
        data.products.total !== productListMemory.products.total
      ) {
        setProductListMemory((prevData: any) => {
          let dataClone = { ...data }
          if (state.currentPage > 1) {
            dataClone.products.results = [
              ...prevData.products.results,
              ...dataClone.products.results,
            ]
          }
          return dataClone
        })
      }
    }
  }, [data.products.results.length])

  const handlePageChange = (page: any) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, currentPage: page.selected + 1 },
      },
      undefined,
      { shallow: true }
    )
    dispatch({ type: PAGE, payload: page.selected + 1 })
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  }

  const handleInfiniteScroll = () => {
    if (
      data.products.pages &&
      data.products.currentPage < data.products.pages
    ) {
      dispatch({ type: PAGE, payload: data.products.currentPage + 1 })
    }
  }

  const handleFilters = (filter: null, type: string) => {
    dispatch({
      type,
      payload: filter,
    })
    dispatch({ type: PAGE, payload: 1 })
  }

  const handleSortBy = (payload: any) => {
    dispatch({
      type: SORT_BY,
      payload: payload,
    })
  }
  const clearAll = () => dispatch({ type: CLEAR })
  
  return (
    <main className="pb-0">
      <div className="sm:max-w-7xl sm:px-7 mx-auto sm:mt-4 mt-0 flex justify-center items-center w-full">
        <Swiper navigation={true} loop={true} className="mySwiper">
          {props.images.map((img: any, idx: number) => {
            return (
              <SwiperSlide key={idx}>
                <Link href={img.link || '#'}>
                  <Image
                      layout='fixed'
                      width={1920} 
                      height={460}
                      src={img.url || IMG_PLACEHOLDER}
                      alt={props.name}
                      className="cursor-pointer w-full h-48 sm:h-96 sm:max-h-96 object-center object-cover sm:rounded-md"
                    ></Image>
                </Link>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
      <div className="text-center sm:py-8 py-4 px-4 sm:px-6 lg:px-8">
        <h1 className="sm:text-4xl text-2xl font-extrabold tracking-tight text-gray-900">
          {props.name}
        </h1>
        <h2>{props.description}</h2>
        <h1 className="sm:text-xl text-md mt-2 font-bold tracking-tight text-gray-500">
          {props.products.total}{' '}{RESULTS}
        </h1>
      </div>

      <div className="grid sm:grid-cols-12 grid-cols-1 gap-1 max-w-7xl mx-auto overflow-hidden sm:px-6 lg:px-8">
        {props.allowFacets && (
          <>
            {/* {MOBILE FILTER PANEL SHOW ONLY IN MOBILE} */}

            <div className="sm:col-span-3 sm:hidden flex flex-col">
              <ProductMobileFilters
                handleFilters={handleFilters}
                products={props.products}
                routerFilters={state.filters}
                handleSortBy={handleSortBy}
                clearAll={clearAll}
                routerSortOption={state.sortBy}
              />
            </div>
            <div className="sm:col-span-3 sm:block hidden">
              <ProductFilterRight
                handleFilters={handleFilters}
                products={props.products}
                routerFilters={state.filters}
              />
            </div>
            <div className="sm:col-span-9">
              {/* {HIDE FILTER TOP BAR IN MOBILE} */}

              <div className="flex-1 sm:block hidden">
                <ProductFiltersTopBar
                  products={data.products}
                  handleSortBy={handleSortBy}
                  routerFilters={state.filters}
                  clearAll={clearAll}
                  routerSortOption={state.sortBy}
                />
              </div>
              <ProductGridWithFacet
                products={productDataToPass}
                currentPage={props.currentPage}
                handlePageChange={handlePageChange}
                handleInfiniteScroll={handleInfiniteScroll}
              />
            </div>
          </>
        )}
        {!props.allowFacets && (
          <>
            <div className="col-span-12">
              <ProductGrid
                products={productDataToPass}
                currentPage={props.currentPage}
                handlePageChange={handlePageChange}
                handleInfiniteScroll={handleInfiniteScroll}
              />
            </div>
          </>
        )}
        <div></div>
      </div>
      <NextSeo
        title={props.name}
        description={props.description}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: props.metaKeywords,
          },
        ]}
        openGraph={{
          type: 'website',
          title: props.metaTitle,
          description: props.metaDescription,
          images: [
            {
              url: props.image,
              width: 800,
              height: 600,
              alt: props.name,
            },
          ],
        }}
      />
    </main>
  )
}

CollectionPage.Layout = Layout

export async function getStaticProps({ params, ...context }: any) {
  const slug: any = params!.collection
  const data = await getCollectionBySlug(slug[0]);

  const infraPromise = commerce.getInfra();
  const infra = await infraPromise;

  //console.log(context)
  return {
    props: {
      ...data,
      query: context,
      slug: params!.collection[0],
      globalSnippets: infra?.snippets,
      snippets: data?.snippets
    },
    revalidate: 60,
  }
}

export async function getStaticPaths() {
  const data = await getCollections()
  return {
    paths: data
      .map((col: any) => {
        if (col.slug) {
          let collectionSlug =
            col.slug[0] === '/'
              ? `/collection${col.slug}`
              : `/collection/${col.slug}`
          return collectionSlug
        }
      })
      .filter((i: any) => !!i),
    fallback: 'blocking',
  }
}
