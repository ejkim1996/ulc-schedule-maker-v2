import type { NextPage } from 'next';

export const Protected: NextPage = ({username}: any) => {

    return (<div>Hello {username.data}</div>)
}

export async function getStaticProps() {
    const res = await fetch("/api/api/protected", {
        method: "GET",
    });
    const data = await res.json();

    return {
        props: {username: data}
    }
}
