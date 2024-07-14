import React, { useEffect, useState } from 'react'
import { FloatingPortal } from '@floating-ui/react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { AnimatePresence, LayoutGroup, m } from 'framer-motion'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Button } from 'src/app/_ezs/partials/button'
import { InputNumber, InputTextarea } from 'src/app/_ezs/partials/forms'
import { SelectClient, SelectDormitory, SelectOrderClient, SelectOrderItemsClient } from 'src/app/_ezs/partials/select'
import moment from 'moment'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import CourseAPI from 'src/app/_ezs/api/course.api'
import { toast } from 'react-toastify'
import { useRoles } from 'src/app/_ezs/hooks/useRoles'
import { SelectStatusStudent } from 'src/app/_ezs/partials/select/SelectStatusStudent'
import { useParams } from 'react-router-dom'
import { useAuth } from 'src/app/_ezs/core/Auth'

const schemaAddEdit = yup.object().shape({
  MemberID: yup.string().required('Vui lòng chọn học viên'),
  OrderID: yup.string().required('Vui lòng chọn đơn hàng'),
  OrderItemID: yup.string().required('Vui lòng chọn đơn hàng')
})

function PickerClient({ children, data }) {
  const queryClient = useQueryClient()
  const [visible, setVisible] = useState(false)
  let { id } = useParams()
  let { CrStocks } = useAuth()
  let isAddMode = Boolean(!(data?.ID > 0))

  const { course_nang_cao, course_co_ban } = useRoles(['course_nang_cao', 'course_co_ban'])

  const onHide = () => {
    setVisible(false)
    reset()
  }

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      ID: 0,
      MemberID: '',
      CourseID: id,
      Desc: '',
      Status: '',
      OrderID: '',
      OrderItemID: '',
      Places: '',
      TotalBefore: 0
    },
    resolver: yupResolver(schemaAddEdit)
  })

  let { MemberID, OrderID } = watch()

  useEffect(() => {
    if (visible && data) {
      let { ID, MemberID, CourseID, Desc, Status, OrderID, OrderItemID, TotalBefore, Places } = data
      reset({
        ID,
        MemberID,
        CourseID,
        Desc,
        Status,
        OrderID,
        OrderItemID,
        TotalBefore,
        Places: Places ? { label: Places, value: Places } : ''
      })
    }
  }, [data, visible])

  const addMutation = useMutation({
    mutationFn: (data) => CourseAPI.addEditStudentCourse(data)
  })

  const onSubmit = (values) => {
    let newValues = {
      ...values,
      Places: values?.Places ? values?.Places?.value : ''
    }

    addMutation.mutate(
      { edit: [newValues] },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ['ListStudentCourses'] }).then(() => {
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
                          {isAddMode ? 'Thêm mới học viên' : 'Chỉnh sửa học viên'}
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
                          <div className='font-light'>Học viên</div>
                          <div className='mt-1'>
                            <Controller
                              name='MemberID'
                              control={control}
                              render={({ field: { ref, ...field }, fieldState }) => (
                                <SelectClient
                                  isClearable
                                  className='select-control'
                                  value={field.value}
                                  onChange={(val) => {
                                    field.onChange(val?.value || '')
                                    if (!val?.value) {
                                      setValue('OrderItemID', '')
                                      setValue('OrderID', '')
                                    }
                                  }}
                                  StockRoles={course_co_ban.StockRoles}
                                  errorMessageForce={fieldState?.invalid}
                                  errorMessage={fieldState?.error?.message}
                                  StockID={CrStocks?.ID}
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div className='mb-3.5'>
                          <div className='font-light'>Ký túc xá</div>
                          <div className='mt-1'>
                            <Controller
                              name='Places'
                              control={control}
                              render={({ field: { ref, ...field }, fieldState }) => (
                                <SelectDormitory
                                  isClearable
                                  className='select-control'
                                  value={field.value}
                                  onChange={(val) => {
                                    field.onChange(val)
                                  }}
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div className='mb-3.5'>
                          <div className='font-light'>Trạng thái</div>
                          <div className='mt-1'>
                            <Controller
                              name='Status'
                              control={control}
                              render={({ field: { ref, ...field }, fieldState }) => (
                                <SelectStatusStudent
                                  isClearable
                                  className='select-control'
                                  value={field.value}
                                  onChange={(val) => field.onChange(val?.value || '')}
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div className='mb-3.5'>
                          <div className='font-light'>Số buổi đã học</div>
                          <div className='mt-1'>
                            <Controller
                              name='TotalBefore'
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
                        <div className='mb-3.5'>
                          <div className='font-light'>Đơn hàng</div>
                          <div className='mt-1'>
                            <Controller
                              name='OrderID'
                              control={control}
                              render={({ field: { ref, ...field }, fieldState }) => (
                                <SelectOrderClient
                                  MemberID={MemberID}
                                  key={MemberID}
                                  isClearable
                                  className='select-control'
                                  value={field.value}
                                  onChange={(val) => {
                                    field.onChange(val?.value || '')
                                    if (!val?.value) {
                                      setValue('OrderItemID', '')
                                    }
                                  }}
                                  errorMessageForce={fieldState?.invalid}
                                  errorMessage={fieldState?.error?.message}
                                />
                              )}
                            />
                          </div>
                          <div className='mt-2'>
                            <Controller
                              name='OrderItemID'
                              control={control}
                              render={({ field: { ref, ...field }, fieldState }) => (
                                <SelectOrderItemsClient
                                  OrderID={OrderID}
                                  MemberID={MemberID}
                                  key={MemberID || OrderID}
                                  isClearable
                                  className='select-control'
                                  value={field.value}
                                  onChange={(val) => field.onChange(val?.value || '')}
                                  errorMessageForce={fieldState?.invalid}
                                />
                              )}
                            />
                          </div>
                        </div>
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

export default PickerClient
