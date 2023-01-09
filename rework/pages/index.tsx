import Head from 'next/head'

import React, { useContext } from 'react';

import faviconBlack from '../public/favicon-black.ico';
import faviconWhite from '../public/favicon-white.ico';

import { InnerMoon } from "@theme-toggles/react"

import { COOKIE_NAME_THEME, SetThemeContext, Theme, ThemeComponent, ThemeContext } from './_theme';
import { Form } from 'react-bootstrap';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next/types';


export default function Home(props: { initialTheme?: string }) {
  return (
    <ThemeComponent initialTheme={props.initialTheme}>
      <div>
        <Head>
          <title>Arcus</title>
          <Favicon />
        </Head>

        <main>
          <ThemeToggle />
          <CharacterCreator />
        </main>
      </div>
    </ThemeComponent>
  )
}

export function getServerSideProps(context: GetServerSidePropsContext): GetServerSidePropsResult<{ [key: string]: any }> {
  return { props: { initialTheme: context.req.cookies[COOKIE_NAME_THEME] } };
};

function Favicon() {
  var theme = useContext(ThemeContext);
  return <link rel='shortcut icon' href={theme == Theme.Light ? faviconWhite.src : faviconBlack.src} />;
}

function ThemeToggle() {
  const theme = useContext(ThemeContext)
  const setTheme = useContext(SetThemeContext)

  return (
    <>
      <style jsx global>{`
        button.theme-toggle.inner-moon svg {
          position:absolute;
          left:50%;
          top:50%;
          transform:translate(-50%, -50%);
        }
        `}</style>
      <InnerMoon
        className={`btn shadow rounded-circle ${theme == Theme.Light ? 'btn-dark' : 'btn-light'} inner-moon position-fixed top-0 end-0`}
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
    </>
  )
}

interface Character {
  name: string,
  playerName: string,
  level: number,
  description: string,
}

interface CharacterCreatorState extends Character {
}


class CharacterCreator extends React.Component<{}, CharacterCreatorState> {
  constructor(props: {}) {
    super(props)

    this.state = {
      name: '',
      playerName: '',
      level: 0,
      description: '',
    } satisfies CharacterCreatorState

    this.setLevel = this.setLevel.bind(this)
  }

  setLevel(level: number) {
    // TODO: When implementing classes, update them (remove levels / add levels accordingly)
    this.setState({ level })
  }

  render(): React.ReactNode {
    return (
      <>
        <div className='container'>
          <h1>Character Creator</h1>
          <hr />
          <div className='grid'>
            <div className='g-col-8'>
              <style jsx>{`
                .container :global(.form-label) {
                  font-weight: bold;
                }
                `}</style>
              <Form.Group className='mb-3' controlId='name'>
                <Form.Label>Character Name</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Royax ThunderBlaster'
                  value={this.state.name}
                  onChange={(event) => this.setState({ name: event.target.value })}
                />
              </Form.Group>
            </div>
            <div className='g-col-3'>
              <Form.Group className='mb-3' controlId='playerName'>
                <Form.Label>Player Name</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Lucy Hall'
                  value={this.state.playerName}
                  onChange={(event) => this.setState({ playerName: event.target.value })}
                />
              </Form.Group>
            </div>
            <div className='g-col-1'>
              <Form.Group className='mb-3' controlId='level'>
                <Form.Label>Level</Form.Label>
                <Form.Control
                  type='numeric'
                  value={this.state.level}
                  onChange={(event) => this.setLevel(+event.target.value)}
                />
              </Form.Group>
            </div>
          </div>
          <div className='grid'>
            <div className='g-col-12'>
              <Form.Group className='mb-3' controlId='description'>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as='textarea'
                  value={this.state.description}
                  onChange={(event) => this.setState({ description: event.target.value })}
                />
              </Form.Group>
            </div>
          </div>
        </div>
      </>
    )
  }
}