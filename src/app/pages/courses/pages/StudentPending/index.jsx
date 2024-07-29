import React, { useMemo, useState } from 'react'
import ReactBaseTable from 'src/app/_ezs/partials/table'
import { AdjustmentsVerticalIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import CourseAPI from 'src/app/_ezs/api/course.api'
import { useRoles } from 'src/app/_ezs/hooks/useRoles'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { PickerFilters } from './components'
import { formatString } from 'src/app/_ezs/utils/formatString'
import { useWindowSize } from 'src/app/_ezs/hooks/useWindowSize'
import moment from 'moment'
import { useAuth } from 'src/app/_ezs/core/Auth'

function StudentPending(props) {
  let { CrStocks } = useAuth()
  const [filters, setFilters] = useState({
    pi: 1,
    ps: 20,
    filter: {
      StockID: CrStocks?.ID || 0
    },
    order: {
      CreateDate: 'desc'
    }
  })
  
  let { width } = useWindowSize()

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { course_nang_cao } = useRoles(['course_nang_cao'])

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['ListStudentPendingCourses', filters],
    queryFn: async () => {
      let newFilters = {
        ...filters,
        filter: {
          ...filters.filter
        }
      }
      let { data } = await CourseAPI.studentPendingList(newFilters)
      return data
        ? {
            ...data
          }
        : null
    }
  })

  const columns = useMemo(
    () => [
      {
        key: 'Member.FullName',
        title: 'Họ và tên',
        dataKey: 'Member.FullName',
        width: width > 767 ? 300 : 180,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <div>
            <div>{rowData?.Member?.FullName}</div>
            {rowData.OutOfDate && <div className='text-danger text-[13px]'>{rowData.OutOfDate}</div>}
          </div>
        ),
        frozen: width > 767 ? 'left' : false
      },
      {
        key: 'Member.MobilePhone',
        title: 'Số điện thoại',
        dataKey: 'Member.MobilePhone',
        width: width > 767 ? 220 : 140,
        sortable: false
      },
      {
        key: 'OrderItem.ProdTitle',
        title: 'Khoá học',
        dataKey: 'OrderItem.ProdTitle',
        width: width > 767 ? 300 : 200,
        sortable: false,
        cellRenderer: ({ rowData }) => rowData?.OrderItem?.ProdTitle
      },
      {
        key: 'Order.ToPay',
        title: 'Số tiền',
        dataKey: 'Order.ToPay',
        width: width > 767 ? 250 : 200,
        sortable: false,
        cellRenderer: ({ rowData }) => formatString.formatVNDPositive(rowData?.Order?.ToPay)
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width]
  )

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center justify-between px-5 py-3 border-b md:py-4'>
        <div className='flex items-center'>
          <div className='cursor-pointer' onClick={() => navigate(-1)}>
            <ArrowLeftIcon className='w-7 md:w-8' />
          </div>
          <div className='hidden pl-4 text-xl font-bold md:text-3xl md:block'>
            Học viên chưa có lớp
            <span className='pl-1 text-base text-primary'>
              {searchParams.get('title')} ({data?.total || 0} bạn)
            </span>
          </div>
          <div className='pl-4 text-xl font-bold md:text-3xl md:hidden'>
            Học viên chưa có lớp
            <div className='text-sm text-primary'>
              {searchParams.get('title')} ({data?.total || 0} bạn)
            </div>
          </div>
        </div>
            
        <div className='flex'>
          <PickerFilters
            isLoading={isLoading}
            filters={filters}
            onChange={(values) =>
              setFilters((prevState) => ({
                ...prevState,
                filter: {
                  ...values.filter,
                }
              }))
            }
          >
            {({ open }) => (
              <button
                type='button'
                className='flex items-center px-2.5 md:px-3.5 border border-gray-300 transition rounded h-11 md:h-12 bg-white font-semibold'
                onClick={open}
              >
                <span className='hidden md:block'>Bộ lọc</span>
                <AdjustmentsVerticalIcon className='w-6 md:hidden' />
              </button>
            )}
          </PickerFilters>
        </div>
      </div>
      <ReactBaseTable
        fixed
        pagination
        wrapClassName='grow p-5'
        rowKey='ID'
        columns={columns}
        data={data?.items || []}
        rowHeight={80}
        isPreviousData={false}
        loading={isLoading}
        pageCount={data?.pcount || 0}
        pageOffset={filters.pi}
        pageSizes={filters.ps}
        onChange={({ pageIndex, pageSize }) =>
          setFilters((prevState) => ({
            ...prevState,
            pi: pageIndex,
            ps: pageSize
          }))
        }
        footerClass='flex items-center justify-between w-full px-5 pb-5'
      />
    </div>
  )
}

export default StudentPending
