import React, { useMemo, useState } from 'react'
import ReactBaseTable from 'src/app/_ezs/partials/table'
import { AdjustmentsVerticalIcon, ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useMutation, useQuery } from '@tanstack/react-query'
import CourseAPI from 'src/app/_ezs/api/course.api'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { useRoles } from 'src/app/_ezs/hooks/useRoles'
import { useNavigate, useParams } from 'react-router-dom'
import { PickerFilters } from './components'
import PickerClient from './components/PickerClient'
import { formatString } from 'src/app/_ezs/utils/formatString'
import { useWindowSize } from 'src/app/_ezs/hooks/useWindowSize'

function Student(props) {
  let { id } = useParams()
  const [filters, setFilters] = useState({
    pi: 1,
    ps: 20,
    filter: {
      MemberID: '',
      CourseID: id,
      Status: ''
    },
    order: {
      CreateDate: 'desc'
    }
  })

  let { width } = useWindowSize()

  const navigate = useNavigate()

  const { course_nang_cao } = useRoles(['course_nang_cao'])

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['ListStudentCourses', filters],
    queryFn: async () => {
      let newFilters = {
        ...filters,
        filter: {
          ...filters.filter
        }
      }
      let { data } = await CourseAPI.listStudentCourse(newFilters)
      return data
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
        cellRenderer: ({ rowData }) => rowData?.Member?.FullName
      },
      {
        key: 'Member.MobilePhone',
        title: 'Số điện thoại',
        dataKey: 'Member.MobilePhone',
        width: width > 767 ? 220 : 140,
        sortable: false
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
        key: 'Total',
        title: 'Buổi / Tổng',
        dataKey: 'Total',
        width: width > 767 ? 160 : 120,
        sortable: false,
        cellRenderer: ({ rowData }) => `0/${rowData?.Course?.Total}`
      },
      {
        key: 'Order.RemainPay',
        title: 'Nợ',
        dataKey: 'Order.RemainPay',
        width: width > 767 ? 220 : 150,
        sortable: false,
        cellRenderer: ({ rowData }) => formatString.formatVND(rowData?.Order?.RemainPay)
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
          <div className='flex w-full justify-center'>
            <PickerClient data={rowData}>
              {({ open }) => (
                <button
                  type='button'
                  className='bg-primary hover:bg-primaryhv text-white text-sm rounded cursor-pointer p-2 transition mr-[4px]'
                  onClick={open}
                >
                  <PencilIcon className='w-5' />
                </button>
              )}
            </PickerClient>
            {course_nang_cao.hasRight && (
              <button
                type='button'
                className='bg-danger hover:bg-dangerhv text-white text-sm rounded cursor-pointer p-2 transition'
                onClick={() => onDelete(rowData)}
              >
                <TrashIcon className='w-5' />
              </button>
            )}
          </div>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width]
  )

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-between items-center px-5 md:py-4 py-3 border-b'>
        <div className='flex items-center'>
          <div className='cursor-pointer' onClick={() => navigate(-1)}>
            <ArrowLeftIcon className='w-7 md:w-8' />
          </div>
          <div className='text-xl md:text-3xl font-bold pl-4 hidden md:block'>Danh sách học viên</div>
          <div className='text-xl md:text-3xl font-bold pl-4 md:hidden'>DS Học viên</div>
        </div>

        <div className='flex'>
          <PickerFilters
            isLoading={isLoading}
            filters={filters}
            onChange={(values) => setFilters((prevState) => ({ ...prevState, filter: values.filter }))}
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
