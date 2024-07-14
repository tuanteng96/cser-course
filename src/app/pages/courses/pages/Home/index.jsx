import React, { useMemo, useState } from 'react'
import ReactBaseTable from 'src/app/_ezs/partials/table'
import { PickerCourses, PickerCreateTags, PickerDormitory, PickerFilters } from './components'
import {
  AdjustmentsVerticalIcon,
  Cog6ToothIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { useMutation, useQuery } from '@tanstack/react-query'
import CourseAPI from 'src/app/_ezs/api/course.api'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { useRoles } from 'src/app/_ezs/hooks/useRoles'
import { useAuth } from 'src/app/_ezs/core/Auth'
import { Link } from 'react-router-dom'
import { useWindowSize } from 'src/app/_ezs/hooks/useWindowSize'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import moment from 'moment'

function Home(props) {
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

  let { width } = useWindowSize()

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
        key: 'ID',
        title: 'ID',
        dataKey: 'ID',
        cellRenderer: ({ rowData }) => rowData?.ID,
        width: 100,
        sortable: false
      },
      {
        key: 'Title',
        title: 'Tên khóa học',
        dataKey: 'Title',
        width: width > 767 ? 300 : 200,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <PickerCourses data={rowData}>
            {({ open }) => (
              <span
                className='font-medium cursor-pointer text-primary'
                onClick={() => {
                  if (
                    course_nang_cao.hasRight ||
                    moment().format('DD-MM-YYYY') === moment(rowData.CreateDate).format('DD-MM-YYYY')
                  ) {
                    open()
                  }
                }}
              >
                {rowData?.Title}
              </span>
            )}
          </PickerCourses>
        )
      },
      {
        key: 'StockTitle',
        title: 'Cơ sở',
        dataKey: 'StockTitle',
        width: width > 767 ? 300 : 200,
        sortable: false,
        cellRenderer: ({ rowData }) => rowData?.StockTitle
      },
      {
        key: 'Total',
        title: 'Số buổi',
        dataKey: 'Total',
        width: width > 767 ? 160 : 120,
        sortable: false
      },
      {
        key: 'Status',
        title: 'Trạng thái thái',
        dataKey: 'Status',
        cellRenderer: ({ rowData }) => (
          <>{rowData?.Status ? (Number(rowData?.Status) === 1 ? 'Đang vận hành' : 'Đã kết thúc') : ''}</>
        ),
        width: width > 767 ? 200 : 150,
        sortable: false
      },
      {
        key: 'Tags',
        title: 'Tags',
        dataKey: 'Tags',
        width: 220,
        sortable: false
      },
      {
        key: 'Teachers',
        title: 'Giáo viên phụ trách',
        dataKey: 'Teachers',
        width: width > 767 ? 350 : 250,
        sortable: false,
        cellRenderer: ({ rowData }) =>
          rowData?.TeacherList ? rowData?.TeacherList.map((x) => x.FullName).join(', ') : <></>
      },
      {
        key: '#',
        title: '',
        dataKey: '#',
        width: 240,
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <div className='flex justify-center w-full'>
            <Link
              to={`student/${rowData.ID}?title=${rowData.Title}`}
              className='px-3 py-2 text-sm text-white transition rounded cursor-pointer bg-primary hover:bg-primaryhv'
            >
              <UserGroupIcon className='w-5' />
            </Link>

            <Link
              to={`attendance/${rowData.ID}?title=${rowData.Title}`}
              className='bg-success hover:bg-successhv text-white text-sm rounded cursor-pointer px-3 py-2 transition mx-[4px]'
            >
              Điểm danh
            </Link>

            {(course_nang_cao.hasRight ||
              moment().format('DD-MM-YYYY') === moment(rowData.CreateDate).format('DD-MM-YYYY')) && (
              <PickerCourses data={rowData}>
                {({ open }) => (
                  <button
                    type='button'
                    className='bg-primary hover:bg-primaryhv text-white text-sm rounded cursor-pointer p-2 transition mr-[4px]'
                    onClick={open}
                  >
                    <PencilIcon className='w-5' />
                  </button>
                )}
              </PickerCourses>
            )}
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
        <div className='text-xl font-bold md:text-3xl'>Khóa đào tạo</div>
        <div className='flex'>
          <Popover className='relative'>
            <PopoverButton className='flex items-center justify-center text-gray-900 bg-light border rounded border-light h-11 md:h-12 w-11 md:w-12 mr-1.5 md:mr-2.5'>
              <Cog6ToothIcon className='w-6 md:w-7' />
            </PopoverButton>
            <PopoverPanel anchor='bottom end' className='flex flex-col py-2 bg-white rounded shadow-lg'>
              <PickerCreateTags>
                {({ open }) => (
                  <div
                    className='px-5 py-2.5 cursor-pointer text-[#181C32] hover:bg-[#EBEDF3] hover:text-[#101221]'
                    onClick={open}
                  >
                    Tags khóa học
                  </div>
                )}
              </PickerCreateTags>
              <PickerDormitory>
                {({ open }) => (
                  <div
                    className='px-5 py-2.5 cursor-pointer text-[#181C32] hover:bg-[#EBEDF3] hover:text-[#101221]'
                    onClick={open}
                  >
                    Ký túc xá
                  </div>
                )}
              </PickerDormitory>
            </PopoverPanel>
          </Popover>
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

          <PickerCourses>
            {({ open }) => (
              <button
                type='button'
                className='flex items-center justify-center h-11 md:h-12 px-2 md:px-5 ml-1.5 md:ml-2.5 text-white transition border rounded bg-primary border-primary hover:bg-primaryhv hover:border-primaryhv text-[14px] md:text-base'
                onClick={open}
              >
                Thêm mới
              </button>
            )}
          </PickerCourses>
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

export default Home
