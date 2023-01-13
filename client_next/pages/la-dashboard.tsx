import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { Course } from '../../@types/scheduler'
import CopyButton from '../components/copy-button'
import LaRow from '../components/la-table-row'
import { FaPlus, FaCheck } from 'react-icons/fa'

const LaDashboard: NextPage = () => {
  const [searchText, setSearchText] = useState('')
  const [data, setData] = useState<Course[]>([])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const [courseName, setCourseName] = useState('')
  const [addCourseShowing, setAddCourseShowing] = useState(false)

  const courseFetcher = async (url: string): Promise<Course[]> => {
    return await fetch(url).then(
      async (r) => (await r.json()).data as Course[]
    )
  }

  const fetchCourses = async (): Promise<void> => {
    const courses = await courseFetcher('/api/course-catalog/supported')

    const inverted = courses.map((c) => {
      c.supported = !c.supported
      return c
    })

    setData(inverted)
  }

  useEffect(() => {
    void fetchCourses()
  }, [])

  const updateFn = (c: Course): Course[] => {
    const indexToUpdate = data.findIndex((course) => {
      return c.uid === course.uid
    })

    const copy = [...data]
    copy[indexToUpdate] = c

    return copy
  }

  const editCallback = async (c: Course): Promise<void> => {
    setData(updateFn(c))
  }

  const tableRows = data
    ?.filter((course) => {
      // course.name
      let nameFound = false
      let abbFound = false
      let deptFound = false
      let idFound = false

      if (course.name != null) {
        nameFound = course.name
          .toLowerCase()
          .includes(searchText.toLowerCase())
        console.log(nameFound)
      }

      if (course.abbreviation != null) {
        abbFound = course.abbreviation
          .toLowerCase()
          .includes(searchText.toLowerCase())
        console.log(abbFound)
      }

      if (course.department != null) {
        deptFound = course.department
          .toLowerCase()
          .includes(searchText.toLowerCase())
        console.log(deptFound)
      }

      if (course.courseId != null) {
        idFound = course.courseId
          .toLowerCase()
          .includes(searchText.toLowerCase())
        console.log(idFound)
      }

      return nameFound || abbFound || deptFound || idFound
    })
    .sort((a, b) => {
      if (a.department === b.department) {
        return parseInt(a.courseId) - parseInt(b.courseId)
      }

      return a.department.localeCompare(b.department)
    })
    .map((course) => {
      return (
        <LaRow
          course={course}
          key={course.uid}
          updateCallback={editCallback}
        ></LaRow>
      )
    })

  const laName = `${firstName} ${lastName.charAt(0)}.`

  const laCourses = data
    .filter((c) => c.supported)
    .map((c) => c.abbreviation ?? c.name)
    .join(', ')

  const laText =
    firstName !== '' && lastName !== '' && laCourses !== ''
      ? `${laName} - Available - ${laCourses}`
      : ''

  const rightPane = (
    <div className="flex flex-col gap-4 mt-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="First Name"
            className="input min-w-0 flex-auto input-bordered"
            onChange={(e) => {
              setFirstName(() => e.target.value)
            }}
          />
          <input
            type="text"
            placeholder="Last Name"
            className="input min-w-0 flex-auto input-bordered"
            onChange={(e) => {
              setLastName(() => e.target.value)
            }}
          />
        </div>
        {addCourseShowing && (
          <input
            type="text"
            placeholder="Course Name"
            className="input input-bordered"
            value={courseName}
            onChange={(e) => {
              setCourseName(() => e.target.value)
            }}
          />
        )}
        <button
          className="btn bg-purple-200 hover:bg-purple-300 text-purple-900 border-0"
          onClick={() => {
            if (!addCourseShowing) {
              setAddCourseShowing(true)
            } else {
              const newCourse: Course = {
                name: courseName,
                school: '',
                courseId: '',
                department: '',
                supported: true,
                abbreviation: undefined,
                uid: crypto.randomUUID(),
                matchScore: () => {
                  return 1
                }
              }
              // const newCourse = new Course(courseName, '', '', '', true, '')
              setData(() => [...data, newCourse])
              setCourseName(() => '')
            }
          }}
        >
          <span className="pr-2">
            {addCourseShowing ? <FaCheck /> : <FaPlus />}
          </span>
          {addCourseShowing ? 'Save' : 'Add Course'}
        </button>
      </div>
      <div className="alert bg-blue-300 shadow-lg">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current flex-shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>You can search by name and department.</span>
        </div>
      </div>
      <div className="alert bg-yellow-300 shadow-lg">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>
            Be sure to copy this blurb into your Google Calendar before sharing
            it.
          </span>
        </div>
      </div>
      <div className="col-span-1 rounded-lg p-2 bg-gray-100 relative flex-grow">
        <h2 className="text-3xl mt-2 mb-2 font-bold text-slate-800">Blurb</h2>
        <p className="text-slate-500">
          {laText === '' ? 'Make a selection to get blurb...' : laText}
        </p>
        <div className="absolute top-2 right-2">
          <CopyButton copyText={laText}></CopyButton>
        </div>
      </div>
    </div>
  )

  return (
    <div
      className="max-w-full rounded-2xl bg-white p-2 m-4 flex flex-col"
      data-theme="emerald"
    >
      <h1 className="text-4xl text-left pt-2 pl-2 pb-4 text-gray-800 font-bold">
        Blurb Maker
      </h1>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Search"
            className="input input-sm w-full mb-2 bg-gray-100 text-gray-800"
            onChange={(e) => {
              setSearchText(e.target.value)
            }}
          />
          <div className="overflow-x-auto w-full" data-theme="emerald">
            <table className="table w-full">
              <thead>
                <tr>
                  <th></th>
                  <th>Department</th>
                  <th>ID</th>
                  <th>ULC Name</th>
                  <th>Official Name</th>
                </tr>
              </thead>
              <tbody>{tableRows}</tbody>
            </table>
          </div>
        </div>
        {rightPane}
      </div>
    </div>
  )
}

export default LaDashboard
