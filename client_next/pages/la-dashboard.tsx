import { NextPage } from 'next'
import { useState } from 'react'
import useSWR from 'swr'
import { Course } from '../../@types/scheduler'
import LaRow from '../components/la-table-row'

const LaDashboard: NextPage = () => {
  const [searchText, setSearchText] = useState('')

  const courseFetcher = async (url: string): Promise<Course[]> => {
    return await fetch(url).then(
      async (r) => (await r.json()).data as Course[]
    )
  }

  const { data } = useSWR<Course[]>(
    '/api/course-catalog/supported',
    courseFetcher
  )

  const tableRows = data
    ?.filter((course) => {
      // course.name
      return (
        (course.name?.toLowerCase().indexOf(searchText.toLowerCase()) ?? -1) >
        -1
      )
    })
    .map((course) => {
      return <LaRow course={course} key={course.uid}></LaRow>
    })

  return (
    <div className="max-w-full rounded-2xl bg-white p-2 m-4">
      <h1 className="text-4xl text-left pt-2 pl-2 pb-4 text-gray-800 font-bold">
        Blurb Maker
      </h1>
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
  )
}

export default LaDashboard
