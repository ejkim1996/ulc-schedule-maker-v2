import type { NextPage } from 'next'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { User } from '../../@types/scheduler'

const Landing: NextPage = () => {
  const [user, setUser] = useState<User>()

  async function fetchUser (): Promise<void> {
    const res = await fetch('/api/users/me', {
      method: 'GET'
    })

    if (res.status >= 400) {
      console.log('Did not get user')
      return
    }

    const data = (await res.json()).data as User
    console.log(JSON.stringify(data, null, 2))
    setUser(data)
  }

  useEffect(() => {
    void fetchUser()
  }, [])

  return user != null
    ? (
    <div className="grid place-items-center h-full">
      <div className="flex flex-col gap-8 max-w-lg">
        <h1 className="text-4xl text-center">Welcome, {user?.name}</h1>
        {user.isAdmin && (
          <>
            <Link href="/scheduler">
              <a className="btn bg-purple-200 hover:bg-purple-300 text-purple-900 border-0 self-center w-full">
                Scheduler
              </a>
            </Link>
            <Link href="/course-dashboard">
              <a className="btn bg-purple-200 hover:bg-purple-300 text-purple-900 border-0 self-center w-full">
                Course Dashboard
              </a>
            </Link>
          </>
        )}
        <Link href="/la-dashboard">
          <a className="btn bg-purple-200 hover:bg-purple-300 text-purple-900 border-0 self-center w-full">
            LA Dashboard
          </a>
        </Link>
      </div>
    </div>
      )
    : (
    <div>Loading</div>
      )
}

export default Landing
