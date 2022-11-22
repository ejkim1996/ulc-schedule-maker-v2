import type { NextPage } from 'next'
import Link from 'next/link'

const Login: NextPage = () => {
  return (
        <div className="grid place-items-center h-full">
            <div className="flex flex-col gap-8">
                <h1 className="text-4xl text-center">ULC Schedule Maker</h1>
                <Link href="/api/auth/google">
                    <a className="btn bg-purple-200 hover:bg-purple-300 text-purple-900 border-0 self-center">
                        Login with Google
                    </a>
                </Link>
            </div>
        </div>
  )
}

export default Login
