import type { NextPage } from 'next'
import Link from 'next/link';

const Login: NextPage = () => {
    return (
        <Link href={"/api/auth/google"}>Login through google.</Link>
    )
}

export default Login;
