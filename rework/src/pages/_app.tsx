import '../styles/libraries.scss'
import '../styles/globals.scss'
import '../styles/thinInput.scss'

import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core'
fontAwesomeConfig.autoAddCss = false

import SSRProvider from 'react-bootstrap/SSRProvider';

import { useEffect, StrictMode } from 'react'


export default function App({ Component, pageProps }) {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, [])

  return (
    <StrictMode>
      <SSRProvider>
        <Component {...pageProps} />
      </SSRProvider>
    </StrictMode>
  )
}
