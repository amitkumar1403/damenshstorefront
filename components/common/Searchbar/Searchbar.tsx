import { FC, memo, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { SearchIcon } from '@heroicons/react/outline'
import { Transition } from '@headlessui/react'
import { BTN_SEARCH } from '@components/utils/textVariables'
interface Props {
  id?: string
  onClick: any
}

const Searchbar: FC<Props> = ({ id = 'search', onClick }) => {
  return (
    <div className="px-1 w-16 flow-root">
      <button
        onClick={onClick}
        className="p-1 text-gray-400 hover:text-gray-500" aria-label="Search"
      >
        <span className="sr-only" aria-label="Search">{BTN_SEARCH}</span>
        <SearchIcon className="flex-shrink-0 h-6 w-6 block text-black group-hover:text-gray-500 mx-auto" aria-hidden="true" aria-label="Search" />
        <span className='font-normal block text-sm text-black'>Search</span>
      </button>
    </div>
  )
}

export default memo(Searchbar)
