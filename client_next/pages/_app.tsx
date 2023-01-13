import '../styles/globals.css'
import type { AppProps } from 'next/app'
import NavBar from '../components/navbar'

function MyApp ({ Component, pageProps }: AppProps): React.ReactElement<{}> {
  return (
    <>
      <NavBar></NavBar>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
