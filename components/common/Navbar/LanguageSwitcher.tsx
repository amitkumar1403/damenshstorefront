import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { FlagIcon } from '@heroicons/react/outline'
import Cookies from 'js-cookie'
import { Router } from 'next/router'

export default function CurrencySwitcher({ config, title, action }: any) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="p-2 text-gray-400 hover:text-gray-500 inline-flex justify-center w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"  aria-label="Currency">
        <FlagIcon
          className="flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
          aria-hidden="true"  aria-label="Flags"
        />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-50 right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1 flex flex-col text-gray-900 divide-y divide-gray-100">
            <Menu.Item>
              {({ active }) => {
                return (
                  <>
                    <h1 className="text-left font-bold p-2">{title}</h1>
                    {config.map((item: any, idx: number) => {
                      return (
                        <div
                          key={'language' + idx}
                          className={
                            'text-left p-2 cursor-pointer hover:bg-gray-200'
                          }
                          onClick={() => {
                            Cookies.set('googtrans', `/en/${item.languageCode}`)
                            action({ Language: item.languageCode })
                          }}
                        >
                          {item.languageCode} - {item.name}
                        </div>
                      )
                    })}
                  </>
                )
              }}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
