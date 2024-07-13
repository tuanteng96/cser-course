import React, { useRef, useState } from 'react'
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useMutation, useQuery } from '@tanstack/react-query'
import CourseAPI from 'src/app/_ezs/api/course.api'
import { useRoles } from 'src/app/_ezs/hooks/useRoles'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import FullCalendar from '@fullcalendar/react'
import interactionPlugin from '@fullcalendar/interaction'
import scrollGridPlugin from '@fullcalendar/scrollgrid'

import moment from 'moment'
import { toast } from 'react-toastify'
import { ModalAttendance } from './components'
import { InputDatePicker } from 'src/app/_ezs/partials/forms'
import { useWindowSize } from 'src/app/_ezs/hooks/useWindowSize'

const viLocales = {
  code: 'vi',
  week: {
    dow: 0, // Sunday is the first day of the week.
    doy: 6 // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: 'Tháng trước',
    next: 'Tháng sau',
    today: 'Hôm nay',
    month: 'Tháng',
    week: 'Tuần',
    day: 'Ngày',
    list: 'Danh sách',
    timeGridWeek: 'Tuần'
  },
  weekText: 'Sm',
  allDayText: 'Cả ngày',
  moreLinkText: 'Xem thêm',
  noEventsText: 'Không có dữ liệu'
}

function Attendance(props) {
  let { id } = useParams()
  const calendarRef = useRef('')
  const toastId = useRef(null)

  const [filters, setFilters] = useState({
    pi: 1,
    ps: 100,
    filter: {
      CreateDate: new Date(),
      CourseID: id
    }
  })

  const [visible, setVisible] = useState(false)
  const [inititalValues, setInitialValues] = useState(null)

  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  let { width } = useWindowSize()

  const { course_nang_cao } = useRoles(['course_nang_cao'])

  const { data: Clients, isLoading: isLoadingClient } = useQuery({
    queryKey: ['ListStudentAttendance'],
    queryFn: async () => {
      let newFilters = {
        pi: 1,
        ps: 500,
        filter: {
          MemberID: '',
          CourseID: id,
          Status: ''
        },
        order: {
          CreateDate: 'desc'
        }
      }
      let { data } = await CourseAPI.listStudentCourse(newFilters)

      return data?.items ? data?.items.map((x) => ({ ...x, id: x?.Member?.ID, title: x?.Member?.FullName })) : []
    }
  })

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['ListCourses', { filters, Clients }],
    queryFn: async () => {
      let From = moment(filters.filter.CreateDate)
        .clone()
        .weekday(0)
        .set({
          hour: '00',
          minute: '00',
          second: '00'
        })
        .format('YYYY-MM-DD HH:mm:ss')
      let To = moment(filters.filter.CreateDate)
        .clone()
        .weekday(6)
        .set({
          hour: '23',
          minute: '59',
          second: '59'
        })
        .format('YYYY-MM-DD HH:mm:ss')
      let newFilters = {
        ...filters,
        filter: {
          ...filters.filter,
          CreateDate: [From, To]
        }
      }
      let { data } = await CourseAPI.studentCheck(newFilters)

      let arr = []

      for (let i = 0; i <= 6; i++) {
        arr.push(moment(From, 'YYYY-MM-DD').add(i, 'days').format('YYYY-MM-DD'))
      }

      let rs = [...data?.items]
      if (data?.items && data?.items.length > 0) {
        let { items } = data
        rs = [...items]

        for (let client of Clients) {
          for (let date of arr) {
            let toCheck = items.some(
              (x) => moment(x.CreateDate).format('YYYY-MM-DD') === date && x.MemberID === client.MemberID
            )
            if (!toCheck) {
              rs.push({
                CourseID: client.CourseID,
                CourseMemberID: client.ID,
                CreateDate: moment(date, 'YYYY-MM-DD').toDate(),
                DataJSON: '',
                Desc: '',
                ID: 0,
                MemberID: client.MemberID
              })
            }
          }
        }
      }
      return rs
        ? rs.map((x) => ({
            ...x,
            Title: x.ID ? 'Đã điểm danh' : 'Chưa điểm danh',
            start: moment(x.CreateDate).toDate(),
            end: moment(x.CreateDate).add(180, 'minutes').toDate(),
            resourceIds: [x.MemberID],
            className: 'min-h-[100px] !border-0 !bg-[#fff] flex-col justify-center !p-0'
          }))
        : []
    },
    enabled: Boolean(Clients && Clients.length > 0)
  })

  const addEditMutation = useMutation({
    mutationFn: async (data) => {
      let rs = await CourseAPI.studentEditCheck(data)
      await refetch()
      return rs
    }
  })

  const onHide = () => {
    setVisible(false)
    setInitialValues(null)
  }

  return (
    <div className='h-full flex flex-col fullcalendar-grow relative'>
      <div className='flex justify-between items-center px-5 md:py-4 py-3 border-b'>
        <div className='flex items-center'>
          <div className='cursor-pointer' onClick={() => navigate(-1)}>
            <ArrowLeftIcon className='w-8' />
          </div>
          <div className='text-xl md:text-3xl font-bold pl-4 hidden md:block'>
            Điểm danh <span className='text-base text-primary'>{searchParams.get('title')}</span>
          </div>
          <div className='text-xl md:text-3xl font-bold pl-4 md:hidden w-[130px] pr-2'>
            Điểm danh <div className='text-sm text-primary truncate'>{searchParams.get('title')}</div>
          </div>
        </div>

        <div className='flex'>
          <InputDatePicker
            popperPlacement='top-end'
            placeholderText='Chọn ngày'
            autoComplete='off'
            onChange={(e) =>
              setFilters((prevState) => ({
                ...prevState,
                filter: {
                  ...prevState.filter,
                  CreateDate: e
                }
              }))
            }
            selected={filters.filter.CreateDate ? new Date(filters.filter.CreateDate) : null}
            dateFormat='dd/MM/yyyy'
          />
          <button
            type='button'
            className='text-[#B5B5C3] border border-gray-300 h-[44px] w-12 rounded-l ml-2 flex items-center justify-center hover:bg-[#F3F6F9] transition'
            onClick={() => {
              if (calendarRef?.current?.getApi()) {
                let calendarApi = calendarRef.current.getApi()
                let day = moment(filters.filter.CreateDate).subtract(6, 'days')
                calendarApi.prev()
                setFilters((prevState) => ({
                  ...prevState,
                  filter: {
                    ...prevState.filter,
                    CreateDate: day
                  }
                }))
              }
            }}
          >
            <ChevronLeftIcon className='w-5' />
          </button>
          <button
            type='button'
            className='text-[#B5B5C3] border border-gray-300 h-[44px] w-12 rounded-r -ml-[1px] flex items-center justify-center hover:bg-[#F3F6F9] transition'
            onClick={() => {
              if (calendarRef?.current?.getApi()) {
                let calendarApi = calendarRef.current.getApi()
                let day = moment(filters.filter.CreateDate).add(6, 'days')
                calendarApi.next()
                setFilters((prevState) => ({
                  ...prevState,
                  filter: {
                    ...prevState.filter,
                    CreateDate: day
                  }
                }))
              }
            }}
          >
            <ChevronRightIcon className='w-5' />
          </button>
        </div>
      </div>
      <FullCalendar
        firstDay={1}
        schedulerLicenseKey='GPL-My-Project-Is-Open-Source'
        themeSystem='unthemed'
        locale={viLocales}
        headerToolbar={false}
        plugins={[resourceTimelinePlugin, interactionPlugin, scrollGridPlugin]}
        initialDate={moment(filters.filter.CreateDate).format('YYYY-MM-DD')}
        initialView={'resourceTimelineWeek'}
        handleWindowResize={true}
        aspectRatio={4}
        editable={false}
        navLinks={true}
        views={{
          resourceTimelineWeek: {
            type: 'resourceTimelineWeek',
            resourceAreaWidth: width > 767 ? '280px' : '150px',
            slotMinWidth: width > 767 ? 200 : 150,
            resourceAreaHeaderContent: () => (width > 767 ? 'Danh sách học viên' : 'DS Học viên'),
            nowIndicator: true,
            now: moment(new Date()).format('YYYY-MM-DD HH:mm'),
            scrollTime: moment(new Date()).format('YYYY-MM-DD HH:mm'),
            //resourceLabelContent: () => 'A',
            slotDuration: {
              days: 1
            },
            slotLabelContent: ({ date, text }) => {
              return <>{moment(date).format('ddd, DD-MM-YYYY')}</>
            },
            dateClick: ({ date, resource, jsEvent, ...args }) => {
              // Date click
            }
          }
        }}
        datesSet={(dateInfo) => {
          const diffDays = Math.abs(new Date() - dateInfo.start) / (1000 * 60 * 60 * 24)
          dateInfo.view.calendar.scrollToTime({ days: diffDays })
        }}
        ref={calendarRef}
        events={data || []}
        resources={Clients || []}
        eventContent={(arg) => {
          const { event, view } = arg
          const { extendedProps } = event._def

          let italicEl = document.createElement('div')
          italicEl.classList.add('fc-content', 'h-[100px]')
          if (extendedProps.ID) {
            italicEl.innerHTML = `
            <div class="w-full h-full flex items-center justify-center flex-col cursor-pointer pt-3">
              <div class="text-success font-bold text-sm">Điểm danh lúc ${moment(extendedProps.CreateDate).format(
                'HH:mm'
              )}</div>
              <div class="text-black/70 px-4 text-center truncate w-full">${extendedProps.Desc}</div>
              <div class="w-10 h-10 flex items-center justify-center rounded-full mt-3 bg-success shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4"> <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /> </svg>
              </div>
            </div>
          `
          } else {
            italicEl.innerHTML = `
            <div class="w-full h-full flex justify-center items-center cursor-pointer pt-3">
              <div class="w-6 h-6 bg-[#EBEDF3] rounded shadow-lg"></div>
            </div>  
          `
          }

          let arrayOfDomNodes = [italicEl]
          return {
            domNodes: arrayOfDomNodes
          }
        }}
        eventClick={({ event, el, ...arg }) => {
          const { _def } = event
          const { extendedProps } = _def
          let time = moment()

          if (!extendedProps.ID) {
            let body = {
              edit: [
                {
                  ID: 0,
                  MemberID: extendedProps?.MemberID,
                  CourseID: extendedProps?.CourseID,
                  CourseMemberID: extendedProps?.CourseMemberID,
                  Desc: '',
                  CreateDate: moment(extendedProps.CreateDate)
                    .set({
                      hour: time.get('hour'),
                      minute: time.get('minute'),
                      second: time.get('second')
                    })
                    .format('YYYY-MM-DD HH:mm')
                }
              ]
            }
            toastId.current = toast.loading('Đang thực hiện...')
            addEditMutation.mutate(body, {
              onSuccess: (data) => {
                toast.update(toastId.current, {
                  type: 'success',
                  autoClose: 300,
                  render: 'Điểm danh thành công.',
                  className: 'rotateY animated',
                  isLoading: false
                })
              }
            })
          } else {
            setInitialValues({
              ID: extendedProps?.ID,
              MemberID: extendedProps?.MemberID,
              CourseID: extendedProps?.CourseID,
              CourseMemberID: extendedProps?.CourseMemberID,
              Desc: extendedProps?.Desc,
              CreateDate: extendedProps.CreateDate
            })
            setVisible(true)
          }
        }}
      />
      <ModalAttendance visible={visible} onHide={onHide} data={inititalValues} refetch={refetch} />
      {(isLoading || isLoadingClient || addEditMutation.isPending) && (
        <div className='absolute w-full h-full top-0 left-0 pt-[60.5px] z-10'>
          <div className='w-full h-full bg-black/20 flex items-center justify-center'>
            <svg
              aria-hidden='true'
              className='w-10 h-10 text-white animate-spin fill-blue-600 relative z-10'
              viewBox='0 0 100 101'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                className='fill-white/90'
                d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                fill='currentColor'
              />
              <path
                d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                fill='currentFill'
              />
            </svg>
            <span className='sr-only'>Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance
