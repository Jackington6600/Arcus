import '../styles/globals.scss'
import 'bootstrap/dist/css/bootstrap.css'

import "@theme-toggles/react/css/InnerMoon.css"

import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
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
