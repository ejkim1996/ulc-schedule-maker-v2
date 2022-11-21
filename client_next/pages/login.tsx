import type { NextPage } from 'next'
import Link from 'next/link'

const Login: NextPage = () => {
  return (
        <div className="grid place-items-center h-full">
            <div className="flex flex-col gap-8">
                <h1 className="text-4xl text-center">ULC Schedule Maker</h1>
                <Link href="/api/auth/google">
                    <a className="btn btn-primary self-center">
                        Login with Google
                    </a>
                </Link>
            </div>
        </div>
  )
}

export default Login
