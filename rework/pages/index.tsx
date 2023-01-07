import Head from 'next/head'

import React, { useContext, useEffect } from 'react';
import { useState } from 'react'

import faviconBlack from '../public/favicon-black.ico';
import faviconWhite from '../public/favicon-white.ico';

import { InnerMoon } from "@theme-toggles/react"

import { Theme, ThemeContext } from './_theme';
import { Form, ThemeProvider } from 'react-bootstrap';


export default function Home() {
  var themeContext = useContext(ThemeContext);
  var [theme, setTheme] = useState(themeContext.theme);

  useEffect(() => {
    document.documentElement.dataset['bsTheme'] = theme
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div>
        <Head>
          <title>Arcus</title>
          <link rel='shortcut icon' href={themeContext.theme == Theme.Light ? faviconWhite.src : faviconBlack.src} />
        </Head>

        <main>
          <ThemeToggle />
          <CharacterCreator />
        </main>
      </div>
    </ThemeContext.Provider>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext)

  return (
    <InnerMoon
      className={`btn shadow rounded-circle text-center ${theme == Theme.Light ? 'btn-dark' : 'btn-light'} position-fixed top-0 end-0`}
      style={{
        margin: '1rem',
        width: '45px',
        height: '45px',
        fontSize: 20,
        padding: 0,
        backgroundColor: 'var(--bs-btn-bg)',
      }}
      duration={750}
      toggled={theme == Theme.Light}
      onToggle={(toggled) => setTheme(toggled ? Theme.Light : Theme.Dark)} />
  )
}

interface Character {
  name: string
}

class CharacterCreator extends React.Component<{}, { character: Character }> {
  constructor(props: {}) {
    super(props)

    this.state = {
      character: ({
        name: ''
      } satisfies Character)
    }
  }

  render(): React.ReactNode {
    return (
      <>
        <div className='container'>
          <h1>Character Creator</h1>
          <hr />
          <div className='container'>
            <div className='row'>
              <div className='col'>
                {/* <style jsx>{`
                  input {
                    border: none;
                  }
                  input:focus {
                    outline: none;
                  }
                `}</style> */}
                <Form.Control
                  type='text'
                  placeholder='Name'
                  value={this.state.character.name}
                  onChange={(event) => this.setState({ character: { name: event.target.value } })}
                />
              </div>
              <div className='col'>Level</div>
            </div>
          </div>
        </div>
      </>
    )
  }
}

// function CharacterCreator() {
//   const [characterName, setCharacterName] = useState('')



//   return (
//     <div className='container'>
//       <div className='row'>
//         <div className='col'><input type='text' value='abc' onChange={}/><h3>Character Name</h3>Character Name: </div>
//         <div className='col'>&lt;name&gt;</div>
//         <div className='col'>Level</div>
//         <div className='col'>&lt;level&gt;</div>
//       </div>
//     </div>
//   )
// }
