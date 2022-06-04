import { Tab, Disclosure } from '@headlessui/react'
import { HeartIcon, MinusSmIcon, PlusSmIcon } from '@heroicons/react/outline'
import { StarIcon, PlayIcon } from '@heroicons/react/solid'
import classNames from '@components/utils/classNames'
import {PRODUCT_DESCRIPTION,PRODUCT_SPECIFICATION,GENERAL_SHIPPING,GENERAL_RETURNS, GENERAL_DELIVERY} from '@components/utils/textVariables'
import Bundles from '@components/product/Bundles'

const colorRegex = /^#(?:[0-9a-f]{3}){1,2}$/i

const Attributes = ({ attributes = [] }: any) => {
  return (
    <table className="text-gray-900 table">
      <tbody>
        {attributes.map((attr: any, idx: number) => {
          return (
            <tr key={idx}>
              <th className="border text-left px-3 py-2 bg-gray-50 text-md font-medium">{attr.display}</th>
              <td className="border text-left px-3 uppercase text-sm py-2">
                {colorRegex.test(attr.value) ? (
                  <div
                    className="h-6 w-6 rounded-full mr-2 border border-gray-100"
                    style={{ backgroundColor: attr.value }}
                  />
                ) : (
                  attr.value
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default function ProductDetails({ product, description }: any) {
  const detailsConfig = [
    {
      title: PRODUCT_SPECIFICATION,
      InnerComponent: (props: any) => <Attributes {...props} />,
    },
    {
      title: GENERAL_RETURNS,
      InnerComponent: (props: any) => (
        <p className="text-gray-900 text-sm sm:pr-32">
          {props.returnsMessage || '30-Day First Try Guarantee If you’re a first time customer of our innerwear products , and find the size, colour or fit not to your liking and comfort, we’ll send a replacement or refund the same. Only eligible on first purchase on one single product.'}
        </p>
      ),
    },
  ]

  return (
    <div className="border-b divide-y divide-gray-200 ">      
       <div className='flex-1 mt-6 py-3'>
          <div
            className="text-gray-800 text- leading-7 font-normal"
            dangerouslySetInnerHTML={{ __html: product.description ||  product.metaDescription }}
          />
        </div>
        <div className="flex flex-col mt-2 py-6">
            <div className="font-md font-bold text-black">
              <img src='/assets/images/free-delivery.svg' className='inline-block pr-2 relative -top-1' /> Free Delivery
            </div>
            <p className='text-xs text-gray-500 font-normal'>For orders above ₹600, Usually delivered in 2-5 days</p>
            <div className='grid grid-cols-1 my-4 relative'>
                <input type="text" className='border border-gray-700 py-4 px-3 bg-white placeholder:text-gray-400 text-black font-normal text-lg hover:border-orange' placeholder='Enter pincode for exact delivery date' /> 
                <button className='uppercase text-sm absolute top-5 right-5 underline font-medium text-black hover:text-orange'>Check</button>
            </div>
            <div className='grid grid-cols-2 gap-x-4 mt-6'>
                <div className='flex items-center border-r border-gray-300 content-center align-center'>
                  <div className='inline-block'>
                      <img src='/assets/images/500days.svg' alt='500 Days' />
                  </div>
                  <div className='inline-block font-sm font-medium text-black pl-4'>Replacement Warranty</div>
                </div>
                <div className='flex items-center content-center align-center'>
                  <div className='inline-block'>
                      <img src='/assets/images/30days.svg' alt='500 Days' />
                  </div>
                  <div className='inline-block font-sm font-medium text-black pl-4'>Easy Returns &amp; Exchange</div>
                </div>
            </div>
        </div>
      {detailsConfig.map((detail: any, idx: number) => (
        <Disclosure as="div" key={`${idx}-detail-item`}>
          {({ open }) => (
            <>
              <h3>
                <Disclosure.Button className="group relative w-full sm:py-2 py-2 pr-2 flex justify-between items-center text-left">
                  <span
                    className={classNames(
                      open ? 'text-orange' : 'text-gray-900',
                      'text-lg font-medium'
                    )}
                  >
                    {detail.title}
                  </span>
                  <span className="ml-6 flex items-center">
                    {open ? (
                      <MinusSmIcon
                        className="block h-6 w-6 text-orange group-hover:text-orange"
                        aria-hidden="true"
                      />
                    ) : (
                      <PlusSmIcon
                        className="block h-6 w-6 text-orange group-hover:text-orange"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                </Disclosure.Button>
              </h3>
              <Disclosure.Panel as="div" className="pb-6 prose prose-sm">
                {detail.InnerComponent({
                  attributes: product.customAttributes || product.attributes,
                })}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  )
}
