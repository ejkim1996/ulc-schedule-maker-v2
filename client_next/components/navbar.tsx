import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ApiErrorResponse, User } from '../../@types/scheduler'
import NetworkState from '../@types/network-state'

const NavBar: React.FC<{}> = () => {
  const [user, setUser] = useState<NetworkState<User>>({ state: 'loading' })
  const router = useRouter()

  async function fetchUser (): Promise<void> {
    setUser(() => {
      return { state: 'loading' }
    })

    const res = await fetch('/api/users/me', {
      method: 'GET'
    })

    if (res.status >= 400) {
      const error = (await res.json()) as ApiErrorResponse

      setUser(() => {
        return {
          state: 'failed',
          code: res.status,
          message: error.message
        }
      })
      return
    }

    const data = (await res.json()).data as User
    setUser(() => {
      return {
        state: 'success',
        data
      }
    })
  }

  async function logout (): Promise<void> {
    const res = await fetch('/api/auth/logout', {
      method: 'POST'
    })

    if (res.status >= 400) {
      return
    }

    await fetchUser()
    await router.replace('/login')
  }

  useEffect(() => {
    void fetchUser()
  }, [])

  let right
  switch (user.state) {
    case 'success':
      if (user.data.isAdmin) {
        right = (
          <>
            <Link href="/scheduler"><a className="btn btn-ghost mx-1">Scheduler</a></Link>
            <Link href="/course-dashboard"><a className="btn btn-ghost mx-1">Course Dashboard</a></Link>
            <Link href="/la-dashboard"><a className="btn btn-ghost mx-1">LA Dashboard</a></Link>
            <button className="btn" onClick={() => { void logout() }}>Logout</button>
          </>
        )
      } else {
        right = <Link href="/la-dashboard"><a className="btn btn-ghost mx-1">LA Dashboard</a></Link>
      }
  }

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link href={user.state === 'success' ? '/landing-page' : '/login'}>
          <a className="btn btn-ghost text-xl">USM</a>
        </Link>
      </div>
      <div className="flex-none">
        <div className="menu menu-horizontal">{right}</div>
      </div>
    </div>
  )
}

export default NavBar
