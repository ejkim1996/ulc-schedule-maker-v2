import type { NextPage } from 'next'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ApiErrorResponse, User } from '../../@types/scheduler'
import NetworkState from '../@types/network-state'

const Landing: NextPage = () => {
  const [networkState, setNetworkState] = useState<NetworkState<User>>()

  async function fetchUser (): Promise<void> {
    setNetworkState(() => {
      return { state: 'loading' }
    })

    const res = await fetch('/api/users/me', {
      method: 'GET'
    })

    if (res.status >= 400) {
      const error = (await res.json()) as ApiErrorResponse

      setNetworkState(() => {
        return {
          state: 'failed',
          code: res.status,
          message: error.message
        }
      })
      return
    }

    const data = (await res.json()).data as User
    setNetworkState(() => {
      return {
        state: 'success',
        data
      }
    })
  }

  useEffect(() => {
    void fetchUser()
  }, [])

  switch (networkState?.state) {
    case 'success':
      return (
        <div className="grid place-items-center h-full">
          <div className="flex flex-col gap-8 max-w-lg">
            <h1 className="text-4xl text-center">
              Welcome, {networkState.data.name}
            </h1>
            {networkState.data.isAdmin && (
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
    case 'loading':
      return (
        <div className="grid content-center justify-center w-full h-full">
          <div>Loading</div>
        </div>
      )
    case 'failed':
      return (
        <div className="grid content-center justify-center">
          <p className="text-red-400">{networkState.message}</p>
        </div>
      )
    default:
      return (
        <div className="grid content-center justify-center">
          <p className="text-red-400">Unknown error occurred</p>
        </div>
      )
  }
}

export default Landing
