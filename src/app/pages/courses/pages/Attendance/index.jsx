import React, { useState } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useMutation, useQuery } from '@tanstack/react-query'
import CourseAPI from 'src/app/_ezs/api/course.api'
import { useRoles } from 'src/app/_ezs/hooks/useRoles'
import { useNavigate, useParams } from 'react-router-dom'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import FullCalendar from '@fullcalendar/react'
import interactionPlugin from '@fullcalendar/interaction'

import moment from 'moment'

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
  const [filters, setFilters] = useState({
    pi: 1,
    ps: 100,
    filter: {
      CreateDate: '[2024-07-01,2024-09-30]',
      CourseID: id
    }
  })

  const navigate = useNavigate()

  const { course_nang_cao } = useRoles(['course_nang_cao'])

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['ListCourses', filters],
    queryFn: async () => {
      let newFilters = {
        ...filters
      }
      let { data } = await CourseAPI.studentCheck(newFilters)
      return data
    }
  })

  const { data: Clients } = useQuery({
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
      return data?.items ? data?.items.map((x) => ({ ...x, id: x.ID, title: x?.Member?.FullName })) : []
    }
  })

  return (
    <div className='h-full flex flex-col fullcalendar-grow'>
      <div className='flex justify-between items-center px-5 py-4 border-b'>
        <div className='flex items-center'>
          <div className='cursor-pointer' onClick={() => navigate(-1)}>
            <ArrowLeftIcon className='w-8' />
          </div>
          <div className='text-3xl font-bold pl-4'>Điểm danh</div>
        </div>

        <div className='flex'></div>
      </div>
      <FullCalendar
        firstDay={1}
        schedulerLicenseKey='GPL-My-Project-Is-Open-Source'
        themeSystem='unthemed'
        locale={viLocales}
        headerToolbar={false}
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        initialDate={moment().format('YYYY-MM-DD')}
        initialView={'resourceTimelineWeek'}
        handleWindowResize={true}
        aspectRatio='3'
        editable={false}
        navLinks={true}
        views={{
          resourceTimelineWeek: {
            type: 'resourceTimelineWeek',
            resourceAreaWidth: '300px',
            slotMinWidth: 200,
            resourceAreaHeaderContent: () => 'Danh sách học viên',
            nowIndicator: true,
            now: moment(new Date()).format('YYYY-MM-DD HH:mm'),
            //resourceLabelContent: () => 'A',
            slotDuration: {
              days: 1
            },
            slotLabelContent: ({ date, text }) => {
              return <>{moment(date).format('ddd, DD-MM-YYYY')}</>
            },
            dateClick: ({ date, resource, jsEvent, ...args }) => {
              if (!jsEvent.target.classList.contains('fc-no-event')) {
                console.log(resource)
                // console.log(args)
              }
            }
          }
        }}
        //ref={calendarRef}
        events={[
          {
            title: 'Rendezvous',
            start: '2024-07-11T00:00:00',
            end: '2024-07-11T00:00:00',
            resourceIds: [5],
            a: 'bb',
            className: 'abc'
          }
        ]}
        resources={Clients || []}
        eventContent={(arg) => {
          const { event, view } = arg
          const { extendedProps } = event._def
          let italicEl = document.createElement('div')
          italicEl.classList.add('fc-content')
          italicEl.innerHTML = `
            <div>Đã điểm danh</div>
          `
          let arrayOfDomNodes = [italicEl]
          return {
            domNodes: arrayOfDomNodes
          }
        }}
        eventClick={({ event, el }) => {
          const { _def } = event
          const { extendedProps } = _def
          console.log('event click')
        }}
        dayCellContent={() => "a"}
      />
    </div>
  )
}

export default Attendance
