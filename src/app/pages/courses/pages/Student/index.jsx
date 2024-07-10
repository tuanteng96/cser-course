import React, { useMemo, useState } from 'react'
import ReactBaseTable from 'src/app/_ezs/partials/table'
import { ArrowLeftIcon, Cog6ToothIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useMutation, useQuery } from '@tanstack/react-query'
import CourseAPI from 'src/app/_ezs/api/course.api'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { useRoles } from 'src/app/_ezs/hooks/useRoles'
import { useAuth } from 'src/app/_ezs/core/Auth'
import { useNavigate } from 'react-router-dom'

function Student(props) {
  let { CrStocks } = useAuth()
  const [filters, setFilters] = useState({
    pi: 1,
    ps: 20,
    filter: {
      StockID: CrStocks?.ID || '',
      Tags: '',
      Status: '',
      Teachers: ''
    }
  })

  const navigate = useNavigate()

  const { course_nang_cao } = useRoles(['course_nang_cao'])

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['ListCourses', filters],
    queryFn: async () => {
      let newFilters = {
        ...filters,
        filter: {
          ...filters.filter,
          Tags: filters.filter.Tags ? filters.filter.Tags.map((x) => x.value).toString() : '',
          Teachers: filters.filter.Teachers ? filters.filter.Teachers.toString() : ''
        }
      }
      let { data } = await CourseAPI.list(newFilters)
      return data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (data) => CourseAPI.deleteCourse(data)
  })

  const onDelete = (rowData) => {
    let dataPost = {
      delete: [rowData.ID]
    }
    Swal.fire({
      customClass: {
        confirmButton: '!bg-danger'
      },
      title: 'Xóa khóa học ?',
      html: `Bạn có chắc chắn muốn xóa <span class="text-primary font-medium">${rowData.Title}</span> ? Hành động này không thể được hoàn tác.`,
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
        key: 'FullName',
        title: 'Họ và tên',
        dataKey: 'FullName',
        cellRenderer: ({ rowData }) => rowData?.FullName,
        width: 300,
        sortable: false
      },
      {
        key: 'Phone',
        title: 'Số điện thoại',
        dataKey: 'Phone',
        width: 220,
        sortable: false
      },
      {
        key: 'Address',
        title: 'Địa chỉ',
        dataKey: 'Address',
        width: 300,
        sortable: false
      },
      {
        key: 'Total',
        title: 'Buổi / Tổng',
        dataKey: 'Total',
        width: 160,
        sortable: false
      },
      {
        key: 'Status',
        title: 'Nợ',
        dataKey: 'Status',
        cellRenderer: ({ rowData }) => (
          <>{rowData?.Status ? (Number(rowData?.Status) === 1 ? 'Đang vận hành' : 'Đã kết thúc') : ''}</>
        ),
        width: 220,
        sortable: false
      },
      {
        key: 'Tags',
        title: 'Trạng thái',
        dataKey: 'Tags',
        width: 220,
        sortable: false
      },
      {
        key: 'Desc',
        title: 'Ghi chú',
        dataKey: 'Desc',
        width: 300,
        sortable: false
      },
      {
        key: '#',
        title: '',
        dataKey: '#',
        width: 150,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <div className='flex w-full justify-center'>
            <button
              type='button'
              className='bg-primary hover:bg-primaryhv text-white text-sm rounded cursor-pointer p-2 transition mr-[4px]'
            >
              <PencilIcon className='w-5' />
            </button>
            <button
              type='button'
              className='bg-danger hover:bg-dangerhv text-white text-sm rounded cursor-pointer p-2 transition'
            >
              <TrashIcon className='w-5' />
            </button>
          </div>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-between items-center px-5 py-4 border-b'>
        <div className='flex items-center'>
          <div className='cursor-pointer' onClick={() => navigate(-1)}>
            <ArrowLeftIcon className='w-8' />
          </div>
          <div className='text-3xl font-bold pl-4'>Danh sách học viên</div>
        </div>

        <div className='flex'>
          <button
            type='button'
            className='flex items-center px-3.5 border border-gray-300 transition rounded h-12 bg-white font-semibold'
          >
            Bộ lọc
          </button>
          <button
            type='button'
            className='flex items-center justify-center h-12 px-2 md:px-5 ml-2 text-white transition border rounded bg-primary border-primary hover:bg-primaryhv hover:border-primaryhv text-[14px] md:text-base'
          >
            Thêm mới
          </button>
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
