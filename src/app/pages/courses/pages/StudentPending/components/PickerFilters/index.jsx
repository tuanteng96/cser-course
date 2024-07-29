import React, { useEffect, useState } from 'react'
import { FloatingPortal } from '@floating-ui/react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { AnimatePresence, LayoutGroup, m } from 'framer-motion'
import { Controller, useForm } from 'react-hook-form'
import { Button } from 'src/app/_ezs/partials/button'
import { useRoles } from 'src/app/_ezs/hooks/useRoles'
import { SelectStocks } from 'src/app/_ezs/partials/select'

function PickerFilters({ children, filters, onChange, isLoading }) {
  const [visible, setVisible] = useState(false)
  const { course_nang_cao, course_co_ban } = useRoles(['course_nang_cao', 'course_co_ban'])

  let defaultValues = {
    filter: {
      StockID: '',
    }
  }

  const onHide = () => setVisible(false)

  const { control, handleSubmit, reset } = useForm({
    defaultValues
  })

  useEffect(() => {
    if (visible) {
      reset(filters)
    }
  }, [visible])

  const onSubmit = (values) => {
    onChange(values)
    onHide()
  }

  const onReset = () => reset(defaultValues)

  return (
    <>
      {children({
        open: () => setVisible(true),
        close: () => setVisible(false)
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
                    className='absolute flex flex-col justify-center h-full py-10 max-w-[400px] w-full px-5 md:px-0'
                    initial={{ opacity: 0, top: '60%' }}
                    animate={{ opacity: 1, top: 'auto' }}
                    exit={{ opacity: 0, top: '60%' }}
                  >
                    <Dialog.Panel tabIndex={0} className='flex flex-col w-full max-h-full bg-white rounded shadow-lg'>
                      <Dialog.Title className='relative flex justify-between px-5 py-4 border-b md:py-5 border-light'>
                        <div className='text-lg font-bold md:text-2xl'>Bộ lọc</div>
                        <div
                          className='absolute flex items-center justify-center w-12 h-12 cursor-pointer right-2 top-2/4 -translate-y-2/4'
                          onClick={onHide}
                        >
                          <XMarkIcon className='w-6 md:w-8' />
                        </div>
                      </Dialog.Title>
                      <div className='p-5 overflow-auto grow'>
                        <div>
                          <div className='font-light'>Cơ sở</div>
                          <div className='mt-1'>
                            <Controller
                              name='filter.StockID'
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
                      </div>
                      <div className='flex justify-between p-5 border-t border-light'>
                        <div>
                          <button
                            type='button'
                            className='relative flex items-center h-12 px-5 font-medium transition border rounded shadow-lg border-light hover:border-gray-800 focus:outline-none focus:shadow-none'
                            onClick={onReset}
                          >
                            Reset
                          </button>
                        </div>
                        <div className='flex'>
                          <button
                            type='button'
                            className='relative flex items-center h-12 px-5 transition border rounded shadow-lg border-light hover:border-gray-800 focus:outline-none focus:shadow-none'
                            onClick={onHide}
                          >
                            Đóng
                          </button>
                          <Button
                            loading={isLoading}
                            disabled={isLoading}
                            type='submit'
                            className='relative flex items-center h-12 px-5 ml-2 text-white transition rounded shadow-lg bg-primary hover:bg-primaryhv focus:outline-none focus:shadow-none disabled:opacity-70'
                          >
                            Tìm kiếm
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

export default PickerFilters
