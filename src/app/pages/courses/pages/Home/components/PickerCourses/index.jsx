import React, { useEffect, useState } from 'react'
import { FloatingPortal } from '@floating-ui/react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { AnimatePresence, LayoutGroup, m } from 'framer-motion'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button } from 'src/app/_ezs/partials/button'
import { Input, InputDatePicker, InputNumber, InputTextarea } from 'src/app/_ezs/partials/forms'
import { SelectStaffs, SelectStatus, SelectStocks, SelectTags } from 'src/app/_ezs/partials/select'
import moment from 'moment'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import CourseAPI from 'src/app/_ezs/api/course.api'
import { toast } from 'react-toastify'
import { useRoles } from 'src/app/_ezs/hooks/useRoles'
import { useAuth } from 'src/app/_ezs/core/Auth'

const schemaAddEdit = yup.object().shape({
  Title: yup.string().required('Vui lòng nhập tên khóa học')
})

function PickerCourses({ children, data }) {
  const queryClient = useQueryClient()
  const [visible, setVisible] = useState(false)

  let isAddMode = Boolean(!(data?.ID > 0))

  let { CrStocks } = useAuth()
  const { course_nang_cao, course_co_ban } = useRoles(['course_nang_cao', 'course_co_ban'])

  const onHide = () => {
    setVisible(false)
    reset()
  }

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      ID: 0,
      Title: '',
      StockID: CrStocks?.ID,
      Total: '',
      Status: '',
      Teachers: [],
      Desc: '',
      DateStart: '', //2024-12-31
      DayCount: '',
      Tags: '',
      CalendarJSON: ''
    },
    resolver: yupResolver(schemaAddEdit)
  })

  useEffect(() => {
    if (visible && data) {
      reset({
        ...data,
        DateStart: data?.DateStart ? moment(data?.DateStart, 'YYYY-MM-DD HH:mm').toDate() : '',
        Tags: data?.Tags ? data?.Tags.split(',').map((x) => ({ label: x, value: x })) : '',
        Teachers: data?.Teachers ? data?.Teachers.split(',').map((x) => Number(x)) : ''
      })
    }
  }, [data, visible])

  const addMutation = useMutation({
    mutationFn: (data) => CourseAPI.addEditCourse(data)
  })

  const onSubmit = (values) => {
    let newValues = {
      ...values,
      Tags: values?.Tags ? values?.Tags.map((x) => x.value).toString() : '',
      DateStart: values.DateStart ? moment(values.DateStart).format('YYYY-MM-DD') : '',
      Teachers: values.Teachers ? values?.Teachers.toString() : ''
    }

    addMutation.mutate(
      { edit: [newValues] },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ['ListCourses'] }).then(() => {
            reset()
            toast.success(isAddMode ? 'Thêm mới thành công.' : 'Cập nhập thành công.')
            onHide()
          })
        }
      }
    )
  }

  return (
    <>
      {children({
        open: () => setVisible(true),
        close: onHide
      })}
      <AnimatePresence>
        {visible && (
          <FloatingPortal>
            <LayoutGroup>
              <Dialog open={visible} onClose={onHide}>
                <m.div
                  className='fixed inset-0 bg-black/[.2] z-[1003]'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                ></m.div>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className='fixed inset-0 flex items-center justify-center z-[1003]'
                  autoComplete='off'
                >
                  <m.div
                    className='absolute flex flex-col justify-center h-full py-10 max-w-[500px] w-full px-5 md:px-0'
                    initial={{ opacity: 0, top: '60%' }}
                    animate={{ opacity: 1, top: 'auto' }}
                    exit={{ opacity: 0, top: '60%' }}
                  >
                    <Dialog.Panel tabIndex={0} className='flex flex-col w-full max-h-full bg-white rounded shadow-lg'>
                      <Dialog.Title className='relative flex justify-between px-5 py-4 border-b md:py-5 border-light'>
                        <div className='text-lg font-bold md:text-2xl'>
                          {isAddMode ? 'Thêm mới khóa học' : 'Chỉnh sửa khóa học'}
                        </div>
                        <div
                          className='absolute flex items-center justify-center w-12 h-12 cursor-pointer right-2 top-2/4 -translate-y-2/4'
                          onClick={onHide}
                        >
                          <XMarkIcon className='w-6 md:w-8' />
                        </div>
                      </Dialog.Title>
                      <div className='p-5 overflow-auto grow'>
                        <div className='mb-3.5'>
                          <div className='font-light'>Tên khóa học</div>
                          <div className='mt-1'>
                            <Controller
                              name='Title'
                              control={control}
                              render={({ field: { ref, ...field }, fieldState }) => (
                                <Input
                                  placeholder='Nhập tên khóa học'
                                  value={field.value}
                                  onChange={field.onChange}
                                  errorMessageForce={fieldState?.invalid}
                                  errorMessage={fieldState?.error?.message}
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div className='mb-3.5'>
                          <div className='font-light'>Cơ sở</div>
                          <div className='mt-1'>
                            <Controller
                              name='StockID'
                              control={control}
                              render={({ field: { ref, ...field }, fieldState }) => (
                                <SelectStocks
                                  isClearable
                                  className='select-control'
                                  value={field.value}
                                  onChange={(val) => field.onChange(val?.value || '')}
                                  StockRoles={course_co_ban.StockRoles}
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div className='mb-3.5'>
                          <div className='font-light'>Tags</div>
                          <div className='mt-1'>
                            <Controller
                              name='Tags'
                              control={control}
                              render={({ field: { ref, ...field }, fieldState }) => (
                                <SelectTags
                                  isMulti
                                  isClearable
                                  className='select-control'
                                  value={field.value}
                                  onChange={(val) => field.onChange(val)}
                                />
                              )}
                            />
                          </div>
                        </div>
                        {window?.top?.GlobalConfig?.Admin?.khoahocinfo && (
                          <div className='mb-3.5'>
                            <div className='font-light'>Số buổi</div>
                            <div className='mt-1'>
                              <Controller
                                name='Total'
                                control={control}
                                render={({ field: { ref, ...field }, fieldState }) => (
                                  <InputNumber
                                    placeholder='Nhập số buổi'
                                    value={field.value}
                                    onChange={field.onChange}
                                    errorMessageForce={fieldState?.invalid}
                                    errorMessage={fieldState?.error?.message}
                                  />
                                )}
                              />
                            </div>
                          </div>
                        )}

                        <div className='mb-3.5'>
                          <div className='font-light'>Trạng thái</div>
                          <div className='mt-1'>
                            <Controller
                              name='Status'
                              control={control}
                              render={({ field: { ref, ...field }, fieldState }) => (
                                <SelectStatus
                                  isClearable
                                  className='select-control'
                                  value={field.value}
                                  onChange={(val) => field.onChange(val?.value)}
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div className='mb-3.5'>
                          <div className='font-light'>Giáo viên phụ trách</div>
                          <div className='mt-1'>
                            <Controller
                              name='Teachers'
                              control={control}
                              render={({ field: { ref, ...field }, fieldState }) => (
                                <SelectStaffs
                                  isMulti
                                  isClearable
                                  className='select-control'
                                  value={field.value}
                                  onChange={(val) => field.onChange(val ? val.map((x) => x.value) : [])}
                                  StockRoles={course_co_ban.StockRoles}
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div className='mb-3.5'>
                          <div className='font-light'>Thời gian bắt đầu</div>
                          <div className='mt-1'>
                            <Controller
                              name='DateStart'
                              control={control}
                              render={({ field: { ref, ...field }, fieldState }) => (
                                <InputDatePicker
                                  placeholderText='Chọn thời gian'
                                  autoComplete='off'
                                  onChange={field.onChange}
                                  selected={field.value ? new Date(field.value) : null}
                                  {...field}
                                  dateFormat='dd/MM/yyyy'
                                  // showTimeSelect
                                  // timeFormat="HH:mm"
                                />
                              )}
                            />
                          </div>
                        </div>
                        {window?.top?.GlobalConfig?.Admin?.khoahocinfo && (
                          <div className='mb-3.5'>
                            <div className='font-light'>Tổng số ngày</div>
                            <div className='mt-1'>
                              <Controller
                                name='DayCount'
                                control={control}
                                render={({ field: { ref, ...field }, fieldState }) => (
                                  <InputNumber
                                    placeholder='Nhập số ngày'
                                    value={field.value}
                                    onChange={field.onChange}
                                    errorMessageForce={fieldState?.invalid}
                                    errorMessage={fieldState?.error?.message}
                                  />
                                )}
                              />
                            </div>
                          </div>
                        )}

                        <div>
                          <div className='font-light'>Ghi chú</div>
                          <div className='mt-1'>
                            <Controller
                              name='Desc'
                              control={control}
                              render={({ field: { ref, ...field }, fieldState }) => (
                                <InputTextarea rows={3} placeholder='Nhập ghi chú' {...field} />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      <div className='flex justify-end p-5 border-t border-light'>
                        <button
                          type='button'
                          className='relative flex items-center h-12 px-5 transition border rounded shadow-lg border-light hover:border-gray-800 focus:outline-none focus:shadow-none'
                          onClick={onHide}
                        >
                          Hủy
                        </button>
                        <Button
                          disabled={addMutation.isPending}
                          loading={addMutation.isPending}
                          type='submit'
                          className='relative flex items-center h-12 px-5 ml-2 text-white transition rounded shadow-lg bg-primary hover:bg-primaryhv focus:outline-none focus:shadow-none disabled:opacity-70'
                        >
                          {isAddMode ? 'Thêm mới' : 'Cập nhập'}
                        </Button>
                      </div>
                    </Dialog.Panel>
                  </m.div>
                </form>
              </Dialog>
            </LayoutGroup>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </>
  )
}

export default PickerCourses
