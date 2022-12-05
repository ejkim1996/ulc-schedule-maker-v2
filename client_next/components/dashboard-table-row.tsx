import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa'
import { Course } from '../../@types/scheduler'

const TableRow: React.FC<{
  course: Course
  updateFn: (c: Course) => Promise<void>
  showButtons: boolean
}> = ({ course, updateFn, showButtons }) => {
  const handleCheck = async (): Promise<void> => {
    course.supported = !course.supported

    await updateFn(course)
  }

  const buttons = showButtons
    ? (
    <th className="flex gap-2 flex-row-reverse">
      <button className="btn btn-ghost text-lg btn-square text-red-500">
        <FaRegTrashAlt></FaRegTrashAlt>
      </button>
      <button className="btn btn-ghost text-lg btn-square">
        <FaRegEdit></FaRegEdit>
      </button>
    </th>
      )
    : (
    <></>
      )

  return (
    <tr key={course.uid}>
      <th>{course.department}</th>
      <td>{course.courseId}</td>
      <td>{course.abbreviation}</td>
      <td>{course.name}</td>
      <th>
        <label>
          <input
            type="checkbox"
            className="checkbox"
            checked={course.supported}
            onChange={async (e) => {
              await handleCheck()
            }}
          />
        </label>
      </th>
      {buttons}
    </tr>
  )
}

export default TableRow
