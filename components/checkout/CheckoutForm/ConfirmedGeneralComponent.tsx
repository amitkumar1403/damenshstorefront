import {GENERAL_EDIT} from '@components/utils/textVariables'

export default function ConfirmedGeneralComponent({
  onStateChange,
  content = {},
}: any) {
  return (
    <div className="text-gray-900 flex flex-col">
      <div className="flex">
        <ul className={`text-gray-900 mt-3 sm:flex xs:flex-col`}>
          {Object.keys(content).map((item: any, idx: number) => {
            return (
              <li key={idx} className="font-normal d-inline font-sm pr-1">
                {content[item]}
              </li>
            )
          })}
        </ul>
      </div>
      <div className="flex">
        <button onClick={onStateChange} className="btn text-indigo-500 font-xs" type="button">
          {GENERAL_EDIT}
        </button>
      </div>
    </div>
  )
}
