import { useState } from 'react'
import { ACTION_TYPES } from 'pages/search'
import { BTN_SEARCH } from '@components/utils/textVariables'

const FILTER_KEYS = {
  BRAND: 'brandNoAnlz',
  CATEGORY: 'classification.category',
  PRICE: 'price.raw.withTax',
  RATING: 'rating',
  CLOTHING_TYPE: 'attributes.value~clothing.type',
  COLOR: 'attributes.value~global.colour',
  DRESS_STYLE: 'attributes.value~dress.style',
  GENDER: 'attributes.value~global.gender',
  OCCASION: 'attributes.value~occasion.type',
  SIZE: 'attributes.value~clothing.size',
}

const FilterItem = ({
  option,
  optionIdx,
  sectionKey,
  isChecked = false,
  isCheckboxTickDisabled = false,
  bgColor = () => false,
  onSelect,
  closeSidebar = () => {},
  ...props
}: any) => {
  const [isCheckboxChecked, setCheckbox] = useState(isChecked)

  const handleCheckbox = () => {
    setCheckbox(!isCheckboxChecked)
    let obj = {
      Key: sectionKey,
      Value: option.name,
      IsSelected: true,
    }
    let type = !isCheckboxChecked
      ? ACTION_TYPES.ADD_FILTERS
      : ACTION_TYPES.REMOVE_FILTERS
    onSelect(obj, type)
    closeSidebar()
  }

  const generateOptionName = () => {
    if (sectionKey === FILTER_KEYS.PRICE) return `${option.name} £` //TBD
    if (sectionKey === FILTER_KEYS.COLOR) return option.name.split('|')[1]
    else return option.name
  }
  
  let checkboxBgColor = bgColor(option) || 'transparent'
  let borderColor = '#cccccc'
  let bgClass = 'bg-nonselected-facet'

  if(isCheckboxChecked && !isCheckboxTickDisabled){
    checkboxBgColor = '#EC5E28';
    borderColor = '#EC5E28';
    bgClass = 'bg-selected-facet'
  }
  return (
    <div key={option.value} className={bgClass}>
      <div className="grid grid-cols-1 items-center w-full">
        <input
          name={`${optionIdx}-input[]`}
          defaultValue={option.value}
          type="checkbox"
          className="h-4 w-4 border-gray-300 rounded filter-input"
        />

        <label
          htmlFor={`${optionIdx}-input[]`}
          onClick={handleCheckbox}
          className="cursor-pointer ml-0 text-sm text-black relative filter-label relative"
        >
          {isCheckboxChecked && !isCheckboxTickDisabled && (
            <div
              style={{
                content: '',
                float: 'left',
                left: 'auto',
                top: '5px',
                zIndex: 99999,
                position: 'absolute',
                width: '6px',
                height: '10px',
                border: 'solid #ffffff',
                borderWidth: '0 2px 2px 0',
                transform: 'rotate(45deg)',
                right: '12px'
              }}
            />
          )}
          {generateOptionName()}
          <span className="px-1 text-sm font-normal text-gray-400 relative top-0">{option.count}</span>
          {sectionKey === FILTER_KEYS.COLOR &&          
          <div
            style={{
              content: '',
              top:'2px',
              float: 'left',
              height: '18px',
              width: '18px',
              borderRadius: '10px',
              background: checkboxBgColor,
              border: '1px solid '+ borderColor,
              position: 'relative',
              marginRight: '6px',
              right:'0',
            }}
          />
        }
        {sectionKey != FILTER_KEYS.COLOR &&          
          <div
            style={{
              content: '',
              top:'2px',
              float: 'left',
              height: '18px',
              width: '18px',
              borderRadius: '2px',
              background: checkboxBgColor,
              border: '1px solid ' + borderColor,
              position: 'absolute',
              marginRight: '6px',
              right:'0'
            }}
          />
        }
        </label>
      </div>      
    </div>
  )
}

const SearchInput = ({ placeholder, handleSearch }: any) => {
  return (
    <>
      <label className="sr-only">
        {BTN_SEARCH}
      </label>
      <input
        type="text"
        onChange={(e) => handleSearch(e.target.value)}
        autoComplete={BTN_SEARCH}
        placeholder={BTN_SEARCH}
        className="appearance-none min-w-0 w-full bg-white border border-gray-300 rounded-md shadow-sm py-1 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      />
    </>
  )
}

const getCustomComponent = (type: string) => {
  switch (type) {
    case FILTER_KEYS.BRAND:
      return (props: any) => <SearchInput {...props} />
    case FILTER_KEYS.CATEGORY:
      return (props: any) => <SearchInput {...props} />
    case FILTER_KEYS.SIZE:
      return (props: any) => <SearchInput {...props} />
    case FILTER_KEYS.OCCASION:
      return (props: any) => <SearchInput {...props} />
    default:
      return () => null
  }
}

export default function FilterList({
  items = [],
  sectionKey,
  handleFilters,
  routerFilters,
  closeSidebar,
}: any) {
  const [filterItems, setFilterItems] = useState(items)

  const handleSearch = (value: string) => {
    const itemsClone = [...items]
    const filteredItems = itemsClone.filter((item: any) =>
      item.name.toLowerCase().includes(value.toLowerCase())
    )
    setFilterItems(filteredItems)
  }

  const PROPS_LIST = {
    [FILTER_KEYS.BRAND]: {
      handleSearch: (value: string) => handleSearch(value),
    },
    [FILTER_KEYS.CATEGORY]: {
      handleSearch: (value: string) => handleSearch(value),
    },
    [FILTER_KEYS.SIZE]: {
      handleSearch: (value: string) => handleSearch(value),
    },
    [FILTER_KEYS.OCCASION]: {
      handleSearch: (value: string) => handleSearch(value),
    },
    [FILTER_KEYS.COLOR]: {
      isCheckboxTickDisabled: true,
      bgColor: (item: any) => item.name.split('|')[0],
    },
  }

  const isDefaultChecked = (sectionKey: string, value: string) => {
    return !!routerFilters.find(
      (filter: any) => filter.Key === sectionKey && filter.Value === value
    )
  }

  return (
    <>
      {getCustomComponent(sectionKey)({ ...PROPS_LIST[sectionKey] })}
      <div className="max-panel space-y-2">
        {filterItems.map((option: any, optionIdx: number) => {
          const isChecked = isDefaultChecked(sectionKey, option.name)
          return (
            <FilterItem
              sectionKey={sectionKey}
              option={option}
              onSelect={handleFilters}
              optionIdx={optionIdx}
              key={optionIdx}
              isChecked={isChecked}
              closeSidebar={closeSidebar}
              {...PROPS_LIST[sectionKey]}
            />
          )
        })}
      </div>
    </>
  )
}
