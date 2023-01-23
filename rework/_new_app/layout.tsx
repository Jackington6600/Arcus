
import '../styles/globals.scss'
import 'bootstrap/dist/css/bootstrap.css'

import "@theme-toggles/react/css/InnerMoon.css"

import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
fontAwesomeConfig.autoAddCss = false

import SSRProvider from 'react-bootstrap/SSRProvider';

import { useEffect, StrictMode } from 'react'


type RootLayoutProps = {
  // theme: Theme,
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">/* TODO: add data-theme tag */
      <body>
        {children}
      </body>
    </html>
  );
}
