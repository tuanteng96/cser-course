import { useQuery } from '@tanstack/react-query'
import React from 'react'
import Select from 'react-select'
import ClientsAPI from '../../api/clients.api'
import clsx from 'clsx'

const SelectClient = ({
  value,
  StockID = 0,
  isMulti,
  StockRoles,
  errorMessage,
  errorMessageForce,
  className,
  ...props
}) => {
  const ListMembers = useQuery({
    queryKey: ['ListMemberSelect'],
    queryFn: async () => {
      const data = await ClientsAPI.listSelect({
        Key: '',
        StockID: StockID || 0
      })

      let newData = []
      if (data?.data?.data) {
        for (let key of data?.data?.data) {
          const { StockTitle, StockID, text, id } = key
          const index = newData.findIndex((item) => item.groupid === StockID)
          if (index > -1) {
            newData[index].options.push({
              label: text,
              value: id,
              ...key
            })
          } else {
            const newItem = {}
            newItem.label = StockTitle || 'Khác'
            newItem.groupid = StockID
            newItem.options = [
              {
                label: text,
                value: id,
                ...key
              }
            ]
            newData.push(newItem)
          }
        }
      }

      if (StockRoles && StockRoles.length > 0) {
        newData = newData.filter((x) => StockRoles.some((s) => s.value === x.groupid))
      }

      return {
        data: newData,
        dataList:
          data?.data?.data?.length > 0 ? data?.data?.data.map((x) => ({ ...x, value: x.id, label: x.text })) : []
      }
    },
    onSuccess: () => {}
  })

  return (
    <>
      <Select
        className={clsx(className, errorMessageForce && 'select-control-error')}
        isMulti={isMulti}
        key={StockID}
        isLoading={ListMembers.isLoading}
        value={
          isMulti
            ? ListMembers?.data?.dataList && ListMembers?.data?.dataList.length > 0
              ? ListMembers?.data?.dataList.filter((x) => value && value.some((k) => k === x.value))
              : null
            : ListMembers?.data?.dataList && ListMembers?.data?.dataList.length > 0
            ? ListMembers?.data?.dataList.filter((x) => x.value === Number(value))
            : null
        }
        classNamePrefix='select'
        options={ListMembers?.data?.data || []}
        placeholder='Chọn học viên'
        noOptionsMessage={() => 'Không có dữ liệu'}
        menuPosition='fixed'
        styles={{
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999
          })
        }}
        menuPortalTarget={document.body}
        {...props}
      />
      {errorMessage && errorMessageForce && <div className='mt-1.5 text-sm text-danger'>{errorMessage}</div>}
    </>
  )
}

export { SelectClient }
