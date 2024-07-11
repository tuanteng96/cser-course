import { useQuery } from '@tanstack/react-query'
import React from 'react'
import Select from 'react-select'
import ClientsAPI from '../../api/clients.api'
import clsx from 'clsx'

const SelectOrderClient = ({ value, MemberID, errorMessage, errorMessageForce, className, ...props }) => {
  
  const SelectOrders = useQuery({
    queryKey: ['SelectOrders'],
    queryFn: async () => {
      let { data } = await ClientsAPI.listOrdersSelect({
        MemberIDs: [MemberID]
      })
      let res = []
      if (data.Orders && data.Orders.length > 0) {
        res = data.Orders.map((x) => ({
          ...x,
          label: 'Đơn hàng #' + x.ID,
          value: x.ID
        }))
      }
      return res
    },
    initialData: [],
    enabled: Number(MemberID) > 0
  })

  return (
    <>
      <Select
        className={clsx(className, errorMessageForce && 'select-control-error')}
        isDisabled={SelectOrders.isLoading || !MemberID}
        isLoading={SelectOrders.isLoading}
        value={value ? SelectOrders?.data?.filter((x) => x.value === Number(value)) : ''}
        menuPosition='fixed'
        styles={{
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999
          })
        }}
        menuPortalTarget={document.body}
        classNamePrefix='select'
        options={SelectOrders.data || []}
        placeholder='Chọn đơn hàng'
        noOptionsMessage={() => 'Không có dữ liệu'}
        {...props}
      />
    </>
  )
}

export { SelectOrderClient }
