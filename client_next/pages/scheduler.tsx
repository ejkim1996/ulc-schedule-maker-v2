import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import {
  ApiErrorResponse,
  ApiScheduleRequest,
  CalendarInfo,
  CourseSchedule,
  Schedule
} from '../../@types/scheduler'
import { useRouter } from 'next/router'
import Group from '../components/group'
import NetworkState from '../@types/network-state'

const Scheduler: NextPage = () => {
  const [calendars, setCalendars] = useState<NetworkState<CalendarInfo[]>>({
    state: 'loading'
  })
  const [selectedArc, setSelectedArc] = useState<CalendarInfo>()
  const [selectedUHall, setSelectedUHall] = useState<CalendarInfo>()
  const [stagingDate, setStagingDate] = useState(new Date())

  const [schedules, setSchedules] = useState<NetworkState<Schedule>>()
  const [searchText, setSearchText] = useState<string>('')

  const router = useRouter()

  useEffect(() => {
    void fetchCalendars()
  }, [])

  async function fetchCalendars (): Promise<void> {
    setCalendars(() => {
      return {
        state: 'loading'
      }
    })

    const res = await fetch('/api/calendars', {
      method: 'GET'
    })

    if (res.status === 401) {
      await router.push('/login')
    }

    if (res.status >= 400) {
      const error = (await res.json()) as ApiErrorResponse

      setCalendars(() => {
        return {
          state: 'failed',
          code: res.status,
          message: error.message
        }
      })

      return
    }

    // TODO: HANDLE THE ERROR CASE

    const data = (await res.json()) as CalendarInfo[]
    setCalendars(() => {
      return {
        state: 'success',
        data
      }
    })
  }

  const handleArc = (cal: CalendarInfo): void => {
    setSelectedArc(cal)
  }

  const handleUHall = (cal: CalendarInfo): void => {
    setSelectedUHall(cal)
  }

  const handleGo = async (): Promise<void> => {
    if (selectedArc == null || selectedUHall == null) {
      return
    }

    setSchedules(() => {
      return {
        state: 'loading'
      }
    })

    const calList: CalendarInfo[] = [
      {
        id: selectedArc.id,
        name: 'ARC'
      },
      {
        id: selectedUHall.id,
        name: 'UHall'
      }
    ]

    const reqBody: ApiScheduleRequest = {
      calendars: calList,
      stagingWeek: stagingDate
    }

    console.log(JSON.stringify(reqBody))

    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reqBody)
    })

    const output = await res.json()

    if (res.status >= 400) {
      const error = output as ApiErrorResponse
      setSchedules(() => {
        return {
          state: 'failed',
          code: res.status,
          message: error.message
        }
      })
      return
    }

    const schedule = output as Schedule

    setSchedules(() => {
      return {
        state: 'success',
        data: schedule
      }
    })
  }

  const calendarList =
    calendars?.state === 'success'
      ? calendars.data.map((cal: any) => {
        return (
            <li key={cal.id}>
              <button
                className="text-left"
                onClick={() => {
                  handleArc(cal)
                }}
              >
                {cal.name}
              </button>
            </li>
        )
      })
      : []

  const calendarListUHall =
    calendars?.state === 'success'
      ? calendars.data.map((cal: any) => {
        return (
            <li key={cal.id}>
              <button
                className="text-left"
                onClick={() => {
                  handleUHall(cal)
                }}
              >
                {cal.name}
              </button>
            </li>
        )
      })
      : []

  const isValidCourse = (course: CourseSchedule): boolean => {
    let isValid = false
    course.locationSchedules.forEach((ls) => {
      ls.dailySchedules.forEach((ds) => {
        if (ds.intervals.length !== 0) {
          isValid = true
        }
      })
    })
    return isValid
  }

  const schedulesJs =
    schedules?.state === 'success'
      ? schedules.data
        .filter((s) => {
          if (searchText.length !== 0) {
            return (
              (s.course.abbreviation
                ?.toLowerCase()
                .indexOf(searchText.toLowerCase()) ?? -1) > -1
            )
          }
          return true
        })
        .filter((s) => isValidCourse(s))
        .sort((s1, s2) => {
          if (s1.course.department === s2.course.department) {
            return (
              parseInt(s1.course.courseId) - parseInt(s2.course.courseId)
            )
          }

          return s1.course.department.localeCompare(s2.course.department)
        })
        .map((s) => {
          return <Group course={s} key={s.course.abbreviation}></Group>
        })
      : []

  const form = (
    <>
      <div className="grid place-items-center h-full">
        <div className="grid gap-y-2">
          <h1 className="text-4xl text-left pb-4">ULC Schedule Maker</h1>
          <div className="flex flex-row items-center">
            <div>ARC</div>
            <div className="grow"></div>
            <div className="dropdown dropdown-hover">
              <label tabIndex={0} className="btn">
                {selectedArc?.name ?? 'Choose ARC'}
                <span className="pl-3">
                  <FaChevronDown />
                </span>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-52"
              >
                {calendarList}
              </ul>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <div>UHall</div>
            <div className="grow"></div>
            <div className="dropdown dropdown-hover">
              <label tabIndex={0} className="btn">
                {selectedUHall?.name ?? 'Choose UHall'}
                <span className="pl-3">
                  <FaChevronDown />
                </span>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-52"
              >
                {calendarListUHall}
              </ul>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <div>Staging Week</div>
            <div className="grow"></div>
            <div>
              <DatePicker
                selected={stagingDate}
                onChange={(date: Date) => setStagingDate(date)}
              />
            </div>
          </div>
          <button
            className="btn bg-purple-200 hover:bg-purple-300 text-purple-900 border-0 self-center"
            onClick={() => {
              void handleGo()
            }}
          >
            Go
          </button>

          <div className="text-red-500">
            {schedules?.state === 'failed' ? schedules.message : ''}
          </div>
        </div>
      </div>
    </>
  )

  const handleSearch = (text: string): void => {
    setSearchText(text)
  }

  const details = (
    <>
      <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-2 m-4">
        <h1 className="text-4xl text-left pt-2 pb-4 pl-2 text-gray-800 font-bold">
          Week of{' '}
          {stagingDate.toLocaleString('default', {
            month: 'long'
          })}{' '}
          {stagingDate.getDate()}
        </h1>
        <input
          type="text"
          placeholder="Search"
          className="input input-sm w-full bg-gray-100 mb-2 text-gray-800"
          onChange={(e) => {
            handleSearch(e.target.value)
          }}
          value={searchText}
        />
        <div className="flex flex-col space-y-2">{schedulesJs}</div>
      </div>
    </>
  )

  if (schedules === undefined) {
    switch (calendars?.state) {
      case 'success':
        return form
      case 'failed':
        return (
          <>
            {form} <div className="text-red-500">{calendars.message}</div>
          </>
        )
      case 'loading':
        return (
          <div className="grid content-center justify-center w-full h-full">
            <div>Loading</div>
          </div>
        )
      default:
        <></>
    }
  } else {
    switch (schedules.state) {
      case 'success':
        return details
      case 'failed':
        return form
      case 'loading':
        return (
          <div className="grid content-center justify-center w-full h-full">
            <div>Loading</div>
          </div>
        )
    }
  }
}

export default Scheduler
