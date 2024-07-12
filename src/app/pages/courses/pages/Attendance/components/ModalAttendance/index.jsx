import React, { useEffect } from 'react'
import { FloatingPortal } from '@floating-ui/react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { AnimatePresence, LayoutGroup, m } from 'framer-motion'
import { Controller, useForm } from 'react-hook-form'
import { Button } from 'src/app/_ezs/partials/button'
import { InputTextarea } from 'src/app/_ezs/partials/forms'
import moment from 'moment'
import { useMutation } from '@tanstack/react-query'
import CourseAPI from 'src/app/_ezs/api/course.api'
import { toast } from 'react-toastify'

function ModalAttendance({ data, visible, onHide, refetch }) {

  let isAddMode = Boolean(!(data?.ID > 0))

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      ID: '',
      MemberID: '',
      CourseID: '',
      CourseMemberID: '',
      Desc: '',
      CreateDate: ''
    }
  })

  useEffect(() => {
    if (visible && data) {
      let { ID, MemberID, CourseID, CourseMemberID, Desc, CreateDate } = data
      reset({
        ID,
        MemberID,
        CourseID,
        CourseMemberID,
        Desc,
        CreateDate
      })
    }
  }, [data, visible])

  let { CreateDate } = watch()

  const editMutation = useMutation({
    mutationFn: async (data) => {
      let rs = await CourseAPI.studentEditCheck(data)
      await refetch()
      return rs
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (data) => {
      let rs = await CourseAPI.studentDeleteCheck(data)
      await refetch()
      return rs
    }
  })

  const onSubmit = (values) => {
    let newValues = {
      ...values,
      CreateDate: moment(values.CreateDate).format("YYYY-MM-DD HH:mm:ss")
    }

    editMutation.mutate(
      { edit: [newValues] },
      {
        onSuccess: (data) => {
          toast.success('Cập nhập thành công.')
          onHide()
        }
      }
    )
  }

  const onDelete = () => {
    deleteMutation.mutate(
      { delete: [data?.ID] },
      {
        onSuccess: (data) => {
          toast.success('Đã hủy điểm danh.')
          onHide()
        }
      }
    )
  }
  return (
    <>
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
                      <Dialog.Title className='relative flex justify-between px-5 md:py-5 py-4 border-b border-light'>
                        <div className='text-lg font-bold md:text-2xl'>
                          {moment(CreateDate).format('HH:mm DD-MM-YYYY')}
                        </div>
                        <div
                          className='absolute flex items-center justify-center w-12 h-12 cursor-pointer right-2 top-2/4 -translate-y-2/4'
                          onClick={onHide}
                        >
                          <XMarkIcon className='md:w-8 w-6' />
                        </div>
                      </Dialog.Title>
                      <div className='p-5 overflow-auto grow'>
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
                      <div className='flex justify-between p-5 border-t border-light'>
                        <Button
                          disabled={deleteMutation.isPending}
                          loading={deleteMutation.isPending}
                          type='button'
                          className='relative flex items-center h-12 px-5 text-white transition rounded shadow-lg bg-danger hover:bg-dangerhv focus:outline-none focus:shadow-none disabled:opacity-70'
                          onClick={onDelete}
                        >
                          Hủy điểm danh
                        </Button>
                        <div className='flex'>
                          <button
                            type='button'
                            className='relative items-center h-12 px-5 transition border rounded shadow-lg border-light hover:border-gray-800 focus:outline-none focus:shadow-none hidden md:flex'
                            onClick={onHide}
                          >
                            Đóng
                          </button>
                          <Button
                            disabled={editMutation.isPending}
                            loading={editMutation.isPending}
                            type='submit'
                            className='relative flex items-center h-12 px-5 ml-2 text-white transition rounded shadow-lg bg-primary hover:bg-primaryhv focus:outline-none focus:shadow-none disabled:opacity-70'
                          >
                            {isAddMode ? 'Thêm mới' : 'Cập nhập'}
                          </Button>
                        </div>
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

export default ModalAttendance
