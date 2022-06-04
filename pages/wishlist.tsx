import type { GetStaticPropsContext } from 'next'
import commerce from '@lib/api/commerce'
import { Heart } from '@components/icons'
import { Layout } from '@components/common'
import { Text, Container, Skeleton } from '@components/ui'
import { useCustomer } from '@framework/customer'
import { WishlistCard } from '@components/wishlist'
import useWishlist from '@framework/wishlist/use-wishlist'
import rangeMap from '@lib/range-map'
import { 
  GENERAL_WISHLIST, 
  MESSAGE_NO_ORDER_FOUND_TEXT, 
  WISHLIST_SUB_TITLE
} from '@components/utils/textVariables'

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  // Disabling page if Feature is not available
  if (!process.env.COMMERCE_WISHLIST_ENABLED) {
    return {
      notFound: true,
    }
  }

  const config = { locale, locales }
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { pages } = await pagesPromise
  const { categories } = await siteInfoPromise

  return {
    props: {
      pages,
      categories,
    },
  }
}

export default function Wishlist() {
  const { data: customer } = useCustomer()
  // @ts-ignore  - Fix this types
  const { data, isLoading, isEmpty } = useWishlist({ includeProducts: true })

  return (
    <Container>
      <div className="mt-3 mb-20">
        <Text variant="pageHeading">
          {GENERAL_WISHLIST}
        </Text>
        <div className="group flex flex-col">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rangeMap(12, (i) => (
                <Skeleton key={i}>
                  <div className="w-60 h-60" />
                </Skeleton>
              ))}
            </div>
          ) : isEmpty ? (
            <div className="flex-1 px-12 py-24 flex flex-col justify-center items-center ">
              <span className="border border-dashed border-secondary flex items-center justify-center w-16 h-16 bg-primary p-12 rounded-lg text-primary">
                <Heart className="absolute" />
              </span>
              <h2 className="pt-6 text-2xl font-bold tracking-wide text-center">
                {WISHLIST_SUB_TITLE}
              </h2>
              <p className="text-accent-6 px-10 text-center pt-2">
                {MESSAGE_NO_ORDER_FOUND_TEXT}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data &&
                // @ts-ignore  - Fix this types
                data.items?.map((item) => (
                  <WishlistCard key={item.id} product={item.product! as any} />
                ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

Wishlist.Layout = Layout