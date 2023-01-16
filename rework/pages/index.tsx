import Head from 'next/head'

import React, { CSSProperties, EventHandler, useContext } from 'react';

import faviconBlack from '../public/favicon-black.ico';
import faviconWhite from '../public/favicon-white.ico';

import { InnerMoon } from '@theme-toggles/react'

import { COOKIE_NAME_THEME, SetThemeContext, Theme, ThemeComponent, ThemeContext } from './_theme';
import { Form } from 'react-bootstrap';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next/types';


type Props = {
  initialTheme?: Theme;
}

export default function Home(props: Props) {
  return (
    <ThemeComponent initialTheme={props.initialTheme}>
      <div>
        <AppHead />
        <main>
          <ThemeToggle />
          <CharacterCreator />
        </main>
      </div>
    </ThemeComponent>
  )
}

function AppHead() {
  var theme = useContext(ThemeContext);
  return (
    <Head>
      <title>Character Creator - Arcus</title>
      <link rel='shortcut icon' href={theme == Theme.Light ? faviconBlack.src : faviconWhite.src} />
    </Head>
  )
}

export function getServerSideProps(context: GetServerSidePropsContext): GetServerSidePropsResult<Props> {
  const initialThemeName = context.req.cookies[COOKIE_NAME_THEME];
  const initialTheme: Theme | undefined = initialThemeName ? Theme[initialThemeName] : undefined;
  const props: Props = {};
  if (initialTheme) {
    props.initialTheme = initialTheme
  }
  return { props };
};


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
        className={`btn shadow rounded-circle ${theme == Theme.Light ? 'btn-dark' : 'btn-light'} inner-moon position-absolute top-0 end-0 z-1`}
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
  level: number | null,
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
      level: null,
      description: '',
    } satisfies CharacterCreatorState
  }

  render(): React.ReactNode {
    return (
      <>
        <div className='container character-creator'>
          <h1>Character Creator</h1>
          <hr />
          <div className='grid'>
            <div className='g-col-12 g-col-sm-5 g-col-md-7 g-col-xl-8 mb-3'>
              <Input
                type='text'
                label='Character Name'
                id='name'
                value={this.state.name}
                onChange={(value) => this.setState({ name: value })}
              />
            </div>
            <div className='g-col-8 g-col-sm-4 g-col-md-3 mb-3'>
              <Input
                type='text'
                label='Player Name'
                id='player-name'
                value={this.state.playerName}
                onChange={(value) => this.setState({ playerName: value })}
              />
            </div>
            <div className='g-col-4 g-col-sm-3 g-col-md-2 g-col-xl-1 mb-3'>
              <Input
                type='number'
                label='Level'
                id='level'
                min={0}
                value={this.state.level}
                onChange={(value) => this.setState({ level: value })}
              />
            </div>
          </div>
          <div className='grid'>
            <div className='g-col-12 mb-3'>
              <Input
                type='textarea'
                label='Description'
                id='description'
                value={this.state.description}
                onChange={(value) => this.setState({ description: value })}
              />
            </div>
          </div>
        </div>
      </>
    )
  }
}


type InputProps =
  TextInputProps |
  TextAreaInputProps |
  NumberInputProps;

type CommonInputProps<T> = {
  label: string
  id: string
  value: T
  disabled?: boolean,
  onChange: (value: T) => void
}

type CommonTextInputProps = {
  // TODO
} & CommonInputProps<string>;

type TextInputProps = {
  type: 'text'
} & CommonTextInputProps;

type TextAreaInputProps = {
  type: 'textarea'
} & CommonTextInputProps;

type NumberInputProps = {
  type: 'number'
  min?: number
} & CommonInputProps<number | null>;

function Input(props: InputProps) {
  switch (props.type) {
    case 'text':
      break;
    case 'textarea':
      break;
    case 'number':
      break;
    default:
      throw new Error(`Unknown type: '${props['type']}'`)
  }
  const onChange: EventHandler<React.ChangeEvent<HTMLInputElement>> = (event) => {
    if (props.type === 'text' || props.type === 'textarea') {
      props.onChange(event.target.value);
    } else if (props.type === 'number') {
      // TODO
      props.onChange(+event.target.value);
    }
  }

  return (
    <>
      <div className='form-group'>
        <input
          className={`form-control${props.value || props.value === 0 ? ' non-empty' : ''}`}
          type={props.type}
          id={props.id}
          onChange={onChange}
          value={`${props.value}`}
          disabled={props.disabled} />
        <label htmlFor={props.id}>{props.label}</label>
      </div>
    </>
  )
}
