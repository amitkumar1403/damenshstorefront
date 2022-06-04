import ProductSort from '@components/product/ProductSort'
import { BTN_CLEAR_ALL,  GENERAL_FILTER_TITLE, PRODUCT_FILTER } from '@components/utils/textVariables'

/**
 *
 * {
 *  key: "brandNoAnlz",
 *  value: "Accessorize"
 *  "isSelected": true
 * }
 * */
interface Props {
  products: any
  handleSortBy: any
  routerFilters: any
  clearAll: any
  routerSortOption: any
}

export default function FiltersRightOpen({
  products = { filters: [] },
  handleSortBy,
  routerFilters,
  clearAll,
  routerSortOption,
}: Props) {
  const appliedFilters = products.filters.reduce(
    (acc: any, obj: any) => {
      acc.forEach((item: any) => {
        if (item.Key === obj.key) {
          item['name'] = obj.name
          return item
        }
        return acc
      })
      return acc
    },
    [...routerFilters]
  )

  return (
    <div className="bg-transparent">
      {/* Mobile filter dialog */}
      <div className="max-w-3xl px-4 text-center sm:px-0 lg:max-w-7xl lg:px-0">
        <section
          aria-labelledby="filter-heading-top"
          className="py-1"
        >
          <h2 className="sr-only">
            {PRODUCT_FILTER}
          </h2>

          <div className="flex items-center justify-between">
            <h2 id="filter-heading-top" className="sr-only">
              {GENERAL_FILTER_TITLE}
            </h2>
            <div className="relative col-start-1 row-start-1 py-4">
              <div className="max-w-7xl mx-auto flex space-x-6 text-sm px-0 sm:px-0 lg:px-0">
                
                <div className="pl-0">
                  <button
                    onClick={clearAll}
                    type="button"
                    className="text-black relative top-2 left-2 uppercase font-semibold underline"
                  >
                    {BTN_CLEAR_ALL}
                  </button>
                </div>
                <div className="pl-2  grid grid-cols-6">
                  {appliedFilters.map((appliedFilter: any, idx: number) => {
                    return (
                      <div
                        key={`applied-filter-${idx}`}
                        className="flex justify-center text-gray-600"
                      >
                        {appliedFilter.name ? (
                          <>
                            <span className="bg-selected-facet text-gray-600 font-medium text-sm rounded-2xl px-3 border-2 border-gray-300">{appliedFilter.Value}</span>
                          </>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <ProductSort
              routerSortOption={routerSortOption}
              products={products}
              action={handleSortBy}
            />
          </div>
        </section>
      </div>   
    </div>
  )
}
