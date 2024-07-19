import React, { useMemo, useState } from 'react'
import ReactBaseTable from 'src/app/_ezs/partials/table'
import { AdjustmentsVerticalIcon, ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useMutation, useQuery } from '@tanstack/react-query'
import CourseAPI from 'src/app/_ezs/api/course.api'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { useRoles } from 'src/app/_ezs/hooks/useRoles'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { PickerFilters } from './components'
import PickerClient from './components/PickerClient'
import { formatString } from 'src/app/_ezs/utils/formatString'
import { useWindowSize } from 'src/app/_ezs/hooks/useWindowSize'
import moment from 'moment'

const getOutOfDate = (rowData) => {
  if (rowData.Status === '1') return
  let { Course, MinDate } = rowData
  let { DayCount } = Course

  if (!MinDate) return

  let EndDate = moment(MinDate, 'YYYY-MM-DD').add(Number(DayCount), 'days').format('YYYY-MM-DD')

  let ofDate = moment(EndDate, 'YYYY-MM-DD').diff(new Date(), 'days')

  if (ofDate < 0) {
    return `Quán hạn tốt nghiệp ${Math.abs(ofDate)} ngày`
  }
}

function Student(props) {
  let { id } = useParams()
  const [filters, setFilters] = useState({
    pi: 1,
    ps: 20,
    filter: {
      MemberID: '',
      CourseID: id,
      Status: '',
      Places: '',
      no: ''
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
    queryKey: ['ListStudentCourses', filters],
    queryFn: async () => {
      let newFilters = {
        ...filters,
        filter: {
          ...filters.filter,
          Places: filters.filter?.Places ? filters.filter?.Places?.value : ''
        }
      }
      let { data } = await CourseAPI.listStudentCourse(newFilters)

      return data
        ? {
            ...data,
            items: data?.items
              ? data?.items.map((x) => ({
                  ...x,
                  OutOfDate: getOutOfDate(x)
                }))
              : []
          }
        : null
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (data) => CourseAPI.deleteStudentCourse(data)
  })

  const onDelete = (rowData) => {
    let dataPost = {
      delete: [rowData.ID]
    }
    Swal.fire({
      customClass: {
        confirmButton: '!bg-danger'
      },
      title: 'Xóa học viên ?',
      html: `Bạn có chắc chắn muốn xóa <span class="text-primary font-medium">${rowData?.Member?.FullName}</span> ? Hành động này không thể được hoàn tác.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Thực hiện xóa',
      cancelButtonText: 'Đóng',
      reverseButtons: true,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const data = await deleteMutation.mutateAsync(dataPost)
        await refetch()
        return data
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        if (!result?.value?.data?.error) {
          toast.success('Đã xóa thành công.')
        } else {
          toast.error('Xảy ra lỗi không xác định.')
        }
      }
    })
  }

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
        key: 'Member.BirthDate',
        title: 'Ngày sinh',
        dataKey: 'Member.BirthDate',
        width: width > 767 ? 220 : 140,
        sortable: false,
        cellRenderer: ({ rowData }) =>
          rowData?.Member?.BirthDate ? moment(rowData.Member.BirthDate).format('DD-MM-YYYY') : <></>
      },

      {
        key: 'Places',
        title: 'Ký túc xá',
        dataKey: 'Places',
        width: width > 767 ? 250 : 200,
        sortable: false,
        cellRenderer: ({ rowData }) => rowData?.Places
      },
      {
        key: 'Member.HomeAddress',
        title: 'Địa chỉ',
        dataKey: 'Member.HomeAddress',
        width: width > 767 ? 300 : 200,
        sortable: false,
        cellRenderer: ({ rowData }) => rowData?.Member?.HomeAddress
      },
      {
        key: 'OrderItem.ToPay',
        title: 'Giá trị khoá học',
        dataKey: 'OrderItem.ToPay',
        width: width > 767 ? 250 : 200,
        sortable: false,
        cellRenderer: ({ rowData }) => formatString.formatVNDPositive(rowData?.OrderItem?.ToPay)
      },
      {
        key: 'Total',
        title: 'Buổi / Tổng',
        dataKey: 'Total',
        width: width > 767 ? 160 : 120,
        sortable: false,
        cellRenderer: ({ rowData }) =>
          `${rowData?.TotalCheck + Number(rowData?.TotalBefore || 0)}/${rowData?.Course?.Total}`
      },
      {
        key: 'Order.RemainPay',
        title: 'Nợ',
        dataKey: 'Order.RemainPay',
        width: width > 767 ? 220 : 150,
        sortable: false,
        cellRenderer: ({ rowData }) => formatString.formatVNDPositive(rowData?.RemainPay)
      },
      {
        key: 'DayToPay',
        title: 'Ngày dự kiến thu nợ',
        dataKey: 'DayToPay',
        width: width > 767 ? 180 : 180,
        sortable: false,
        cellRenderer: ({ rowData }) =>
          rowData?.DayToPay && rowData?.RemainPay ? moment(rowData?.DayToPay).format('DD-MM-YYYY') : ''
      },
      {
        key: 'Status',
        title: 'Trạng thái',
        dataKey: 'Status',
        width: width > 767 ? 220 : 150,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <>
            {Number(rowData?.Status) === 1 && 'Đã tốt nghiệp'}
            {Number(rowData?.Status) === 2 && 'Chưa tốt nghiệp'}
            {Number(rowData?.Status) === 3 && 'Đang tạm dừng'}
          </>
        )
      },
      {
        key: 'Desc',
        title: 'Ghi chú',
        dataKey: 'Desc',
        width: width > 767 ? 300 : 200,
        sortable: false
      },
      {
        key: '#',
        title: '',
        dataKey: '#',
        width: width > 767 ? 150 : 100,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <div className='flex justify-center w-full'>
            <PickerClient data={rowData}>
              {({ open }) => (
                <button
                  type='button'
                  className='bg-primary hover:bg-primaryhv text-white text-sm rounded cursor-pointer p-2 transition mr-[4px] disabled:opacity-30'
                  onClick={open}
                  disabled={
                    !course_nang_cao.hasRight &&
                    moment().format('DD-MM-YYYY') !== moment(rowData.CreateDate).format('DD-MM-YYYY')
                  }
                >
                  <PencilIcon className='w-5' />
                </button>
              )}
            </PickerClient>

            {(course_nang_cao.hasRight ||
              moment().format('DD-MM-YYYY') === moment(rowData.CreateDate).format('DD-MM-YYYY')) && (
              <button
                type='button'
                className='p-2 text-sm text-white transition rounded cursor-pointer bg-danger hover:bg-dangerhv'
                onClick={() => onDelete(rowData)}
              >
                <TrashIcon className='w-5' />
              </button>
            )}
          </div>
        ),
        frozen: width > 767 ? 'right' : false
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
            DS học viên
            <span className='text-base text-primary pl-1'>
              {searchParams.get('title')} ({data?.total || 0} bạn)
            </span>
          </div>
          <div className='pl-4 text-xl font-bold md:text-3xl md:hidden'>
            DS Học viên
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
                  MemberID: values.filter?.MemberID ? values.filter?.MemberID?.value : ''
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
          <PickerClient>
            {({ open }) => (
              <button
                type='button'
                className='flex items-center justify-center h-11 md:h-12 px-2 md:px-5 md:ml-2 ml-1.5 text-white transition border rounded bg-primary border-primary hover:bg-primaryhv hover:border-primaryhv text-[14px] md:text-base'
                onClick={open}
              >
                Thêm mới
              </button>
            )}
          </PickerClient>
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

export default Student
