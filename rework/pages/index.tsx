import Head from 'next/head'

import React, { useContext } from 'react';
import { useState } from 'react'

import styles from '../styles/Home.module.css';

import faviconBlack from '../public/favicon-black.ico';
import faviconWhite from '../public/favicon-white.ico';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'

import Button from 'react-bootstrap/Button';

enum Theme {
  Light = 'light',
  Dark = 'dark',
}

const ThemeContext = React.createContext({
  theme: Theme.Light,
  setTheme: (_: Theme) => { }
});

export default function Home() {
  var themeContext = useContext(ThemeContext);
  var [theme, setTheme] = useState(themeContext.theme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div>
        <Head>
          <title>Arcus</title>
          <link rel="shortcut icon" href={theme == Theme.Light ? faviconWhite.src : faviconBlack.src} />
        </Head>

        <main>
          <ThemeToggle></ThemeToggle>
          <div>
          </div>
        </main>
      </div>
    </ThemeContext.Provider>
  )
}

function ThemeToggle() {
  var { theme, setTheme } = useContext(ThemeContext)

  var newTheme = theme == Theme.Light ? Theme.Dark : Theme.Light;

  return (
    <>
      <style jsx>{`
        button {
          position: absolute;
          top: 0;
          right: 0;
          margin: 10px;
          height: 2em;
          width: 2em;
          font-size: 18pt;
        }
      `}</style>
      <Button
        className="shadow"
        onClick={() => { setTheme(newTheme) }}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          margin: "1rem",
        }}>
        <FontAwesomeIcon icon={theme == Theme.Light ? faMoon : faSun} />
      </Button>
    </>
  )
}
