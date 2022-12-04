import { NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import { FaChevronDown, FaChevronUp, FaCopy, FaCheck } from 'react-icons/fa'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { Disclosure } from '@headlessui/react'

import {
  ApiErrorResponse,
  ApiScheduleRequest,
  CalendarInfo,
  CourseSchedule,
  Interval,
  Schedule
} from '../../@types/scheduler'

interface Props {
  course: CourseSchedule
}

const Group: React.FC<Props> = ({ course: schedule }) => {
  interface LocationString {
    location: string
    schedule: Array<JSX.Element | null>
    scheduleString: string
  }

  const dayMap = new Map<number, string>([
    [0, 'Sunday'],
    [1, 'Monday'],
    [2, 'Tuesday'],
    [3, 'Wednesday'],
    [4, 'Thursday'],
    [5, 'Friday'],
    [6, 'Saturday']
  ])

  const courseName = schedule.course.abbreviation

  const locationStrings: LocationString[] = schedule.locationSchedules.map(
    (ls) => {
      const scheduleBlock = ls.dailySchedules.map((ds, index) => {
        const intervalString = ds.intervals.reduce(
          (prev: string, curr: Interval) => {
            const startString = new Date(
              curr.start
            ).toLocaleTimeString()
            const endString = new Date(
              curr.end
            ).toLocaleTimeString()

            return prev + `${startString} - ${endString}; `
          },
          ''
        )

        return intervalString !== ''
          ? (
                    <li key={index}>
                        {dayMap.get(ds.weekDay)}: {intervalString}
                    </li>
            )
          : null
      })

      const scheduleString = ls.dailySchedules.reduce((prev, curr) => {
        const intervalString = curr.intervals.reduce(
          (prev: string, curr: Interval) => {
            const startString = new Date(
              curr.start
            ).toLocaleTimeString()
            const endString = new Date(
              curr.end
            ).toLocaleTimeString()

            return prev + `${startString} - ${endString}; `
          },
          ''
        )

        return intervalString !== '' && dayMap.get(curr.weekDay) !== undefined
          ? prev + `${dayMap.get(curr.weekDay)}: ${intervalString} \n`
          : prev + ''
      }, '')

      return {
        location: ls.location,
        schedule: scheduleBlock,
        scheduleString
      }
    }
  )

  const locationS = locationStrings.reduce(
    (prev: string, curr: LocationString, index) => {
      const newString = `${curr.location} \n ${curr.scheduleString}`
      if (curr.scheduleString === '') {
        return prev
      }
      return prev + newString
    }, ''
  )

  const locationJsx = locationStrings.reduce(
    (prev: JSX.Element, curr: LocationString, index) => {
      let newJsx = (
                <div key={index} className={index !== 0 ? 'mt-2 md:mt-0' : ''}>
                    <h3 className="font-bold">{curr.location}</h3>
                    <ul>{curr.schedule}</ul>
                </div>
      )

      const hasValid = curr.schedule.reduce((prev, curr) => {
        if (curr !== null) {
          return true
        }
        return prev
      }, false)

      if (!hasValid) {
        newJsx = <></>
      }

      return (
                <>
                    {prev}
                    {newJsx}
                </>
      )
    },
        <></>
  )

  return (
        <>
            <Disclosure key={courseName} as="div" defaultOpen={true}>
                {({ open }) => (
                    <>
                        <Disclosure.Button className="flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                            <span>{courseName}</span>
                            <span className="my-auto">
                                {open ? <FaChevronUp /> : <FaChevronDown />}
                            </span>
                        </Disclosure.Button>
                        <Disclosure.Panel className="px-4 pt-2 pb-2 text-sm text-gray-500 grid grid-cols-1 md:grid-cols-2 relative">
                            {locationJsx}
                            <CopyButton copyText={locationS}></CopyButton>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
        </>
  )
}

const CopyButton: React.FC<{ copyText: string }> = ({ copyText }) => {
  const [isCopied, setIsCopied] = useState(false)

  // TODO: Implement copy to clipboard functionality
  async function copyTextToClipboard (text: string): Promise<void> {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(text)
    } else {
      document.execCommand('copy', true, text)
    }
  }

  // onClick handler function for the copy button
  const handleCopyClick = (): void => {
    // Asynchronously call copyTextToClipboard
    copyTextToClipboard(copyText)
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true)
        setTimeout(() => {
          setIsCopied(false)
        }, 1500)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <div className='absolute top-2 right-0'>
      <button onClick={handleCopyClick} className="btn btn-square bg-purple-100 hover:bg-purple-200 text-purple-900 border-0">
        <span>{!isCopied ? <FaCopy /> : <FaCheck />}</span>
      </button>
    </div>
  )
}

const Scheduler: NextPage = () => {
  const [calendars, setCalendars] = useState<CalendarInfo[]>([])
  const [selectedArc, setSelectedArc] = useState<CalendarInfo>()
  const [selectedUHall, setSelectedUHall] = useState<CalendarInfo>()
  const [stagingDate, setStagingDate] = useState(new Date())

  const [schedules, setSchedules] = useState<Schedule>([])
  const [searchText, setSearchText] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    void fetchCalendars()
  }, [])

  async function fetchCalendars (): Promise<void> {
    const res = await fetch('/api/calendars', {
      method: 'GET'
    })
    const data: CalendarInfo[] = await res.json()
    setCalendars(data)
  }

  const handleArc = (cal: CalendarInfo): void => {
    setSelectedArc(cal)
  }

  const handleUHall = (cal: CalendarInfo): void => {
    setSelectedUHall(cal)
  }

  const handleGo = async (): Promise<void> => {
    if ((selectedArc == null) || (selectedUHall == null)) {
      return
    }

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
      setErrorMessage(`Error occured: ${error.message}`)
      return
    }

    const schedule = output as Schedule

    setSchedules(schedule)
  }

  const calendarList = calendars.map((cal: any) => {
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

  const calendarListUHall = calendars.map((cal: any) => {
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

  const schedulesJs = schedules
    .filter((s) => {
      if (searchText.length !== 0) {
        return s.course.abbreviation.toLowerCase().match(searchText.toLowerCase())
      }
      return true
    })
    .map((s) => {
      return isValidCourse(s) ? <Group course={s} key={s.course.abbreviation}></Group> : <></>
    })

  const form = (
        <>
            <div className="grid place-items-center h-full">
                <div className="grid gap-y-2">
                    <h1 className="text-4xl text-left pb-4">
                        ULC Schedule Maker
                    </h1>
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

                    <div className='text-red-500'>
                      {errorMessage}
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

  if (schedules.length === 0) {
    return form
  } else {
    return details
  }
}

export default Scheduler
