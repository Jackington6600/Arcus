import Head from 'next/head'

import React, { CSSProperties, EventHandler, ReactNode, useContext } from 'react';

import faviconBlack from '../public/favicon-black.ico';
import faviconWhite from '../public/favicon-white.ico';

import { InnerMoon } from '@theme-toggles/react'

import { COOKIE_NAME_THEME, SetThemeContext, Theme, ThemeComponent, ThemeContext } from './_theme';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next/types';

import lodash from 'lodash';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';


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

type AttributeName = 'strength' | 'constitution' | 'dexterity' | 'perception' | 'intelligence' | 'spirit';

const ATTRIBUTES: Record<AttributeName, { name: string, resistancePointsType: ResistancePointsTypeName }> = {
  strength: { name: 'Strength', resistancePointsType: 'fortitude' },
  constitution: { name: 'Constitution', resistancePointsType: 'fortitude' },
  dexterity: { name: 'Dexterity', resistancePointsType: 'reflex' },
  perception: { name: 'Perception', resistancePointsType: 'reflex' },
  intelligence: { name: 'Intelligence', resistancePointsType: 'will' },
  spirit: { name: 'Spirit', resistancePointsType: 'will' },
};
const ATTRIBUTE_NAMES: AttributeName[] = lodash.keys(ATTRIBUTES) as any;

type ResistancePointsTypeName = 'fortitude' | 'reflex' | 'will';

const RESISTANCE_POINTS_TYPES: Record<ResistancePointsTypeName, { name: string, attributes: [AttributeName, AttributeName] }> = {
  fortitude: { name: 'Fortitude', attributes: ['strength', 'constitution'] },
  reflex: { name: 'Reflex', attributes: ['dexterity', 'perception'] },
  will: { name: 'Will', attributes: ['intelligence', 'spirit'] },
};
const RESISTANCE_POINTS_TYPE_NAMES: ResistancePointsTypeName[] = lodash.keys(RESISTANCE_POINTS_TYPES) as any;

type Character = {
  name: string,
  playerName: string,
  level: number | null,
  description: string,
  attributes: Record<AttributeName, number | null>,
  attributeModifiers: Record<AttributeName, number | null>,
  currentResistancePoints: Record<ResistancePointsTypeName, number | null>,
  totalResistancePoints: Record<ResistancePointsTypeName, number | null>,
};

function getAttributeModifier(attribute: number | null): number | null {
  if (attribute === null)
    return null;
  return Math.floor((attribute - 10) / 2);
}

function getTotalResistancePoints(resistancePointsType: ResistancePointsTypeName, attributes: Record<AttributeName, number | null>): number | null {
  return Math.max(0, lodash.sum(RESISTANCE_POINTS_TYPES[resistancePointsType].attributes.map(a => attributes[a]).filter(a => a !== null).map(a => a as any - 10)));
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
      attributes: lodash.fromPairs(ATTRIBUTE_NAMES.map(a => [a, 10])) as any,
      attributeModifiers: lodash.fromPairs(ATTRIBUTE_NAMES.map(a => [a, null])) as any,
      currentResistancePoints: lodash.fromPairs(RESISTANCE_POINTS_TYPE_NAMES.map(n => [n, null])) as any,
      totalResistancePoints: lodash.fromPairs(RESISTANCE_POINTS_TYPE_NAMES.map(n => [n, null])) as any,
    } satisfies CharacterCreatorState;

    this.calculateAttributeDerivedValues(true);
  }

  private calculateAttributeDerivedValues(shouldSetStateDirectly?: boolean) {
    const attributeModifiers: Record<AttributeName, number | null> = lodash.fromPairs(ATTRIBUTE_NAMES.map(a => [a, getAttributeModifier(this.state.attributes[a])])) as any;
    const totalResistancePoints: Record<ResistancePointsTypeName, number | null> = lodash.fromPairs(RESISTANCE_POINTS_TYPE_NAMES.map(n => [n, getTotalResistancePoints(n, this.state.attributes)])) as any;
    const newState = { attributeModifiers, totalResistancePoints };
    if (shouldSetStateDirectly) {
      lodash.assign(this.state, newState)
    }
    else {
      this.setState(newState)
    }
  }

  componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<CharacterCreatorState>, snapshot?: any): void {
    if (prevState.attributes !== this.state.attributes) {
      this.calculateAttributeDerivedValues()
    }
  }

  private setStateMutable(stateModifier: (state: WritableDraft<Readonly<CharacterCreatorState>>) => void) {
    this.setState(state => produce(state, stateDraft => { stateModifier(stateDraft) }));
  }

  render(): React.ReactNode {
    const getAttribute = (name: AttributeName) => <Input
      type='number'
      id={name}
      label={ATTRIBUTES[name].name}
      value={this.state.attributes[name]}
      min={0}
      max={20}
      onChange={(value) => this.setStateMutable(state => state.attributes[name] = value)} />;

    const getAttributeDiv = (name: AttributeName) =>
      <div className='attribute g-col-6 g-col-xs-4 g-col-sm-4 g-col-md-2'>
        {getAttribute(name)}
      </div>;

    const getResistancePoints = (name: ResistancePointsTypeName) => <Input
      type='number'
      id={name}
      label={RESISTANCE_POINTS_TYPES[name].name}
      value={this.state.currentResistancePoints[name]}
      min={0}
      max={20}
      onChange={(value) => this.setStateMutable(state => state.currentResistancePoints[name] = value)}
      after={
        <>
          <span className="input-group-text">/</span>
          {/* TODO: Change so that value is the total resistance points */}
          <input className='form-control resistance-points-total' readOnly disabled value={this.state.totalResistancePoints[name]?.toString() || ''} />
        </>
      } />;

    const getResistancePointsDiv = (name: ResistancePointsTypeName) =>
      <div className='resistance-points g-col-4 g-col-md-4'>
        {getResistancePoints(name)}
      </div>;

    return (
      <>
        <div className='container character-creator'>
          <h1>Character Creator</h1>
          <hr />
          <div className='grid'>
            <div className='g-col-12 g-col-sm-5 g-col-md-7 g-col-xl-8'>
              <Input
                type='text'
                label='Character Name'
                id='name'
                value={this.state.name}
                onChange={(value) => this.setState({ name: value })}
              />
            </div>
            <div className='g-col-8 g-col-sm-4 g-col-md-3'>
              <Input
                type='text'
                label='Player Name'
                id='player-name'
                value={this.state.playerName}
                onChange={(value) => this.setState({ playerName: value })}
              />
            </div>
            <div className='g-col-4 g-col-sm-3 g-col-md-2 g-col-xl-1'>
              <Input
                type='number'
                label='Level'
                id='level'
                min={0}
                max={20}
                value={this.state.level}
                onChange={(value) => this.setState({ level: value })}
              />
            </div>
            <div className='g-col-12'>
              <Input
                type='textarea'
                label='Description'
                id='description'
                value={this.state.description}
                onChange={(value) => this.setState({ description: value })}
              />
            </div>
            {getAttributeDiv('strength')}
            {getAttributeDiv('constitution')}
            {getAttributeDiv('dexterity')}
            {getAttributeDiv('perception')}
            {getAttributeDiv('intelligence')}
            {getAttributeDiv('spirit')}
            {getResistancePointsDiv('fortitude')}
            {getResistancePointsDiv('reflex')}
            {getResistancePointsDiv('will')}
            <div className='g-col-12'>
              <Input
                type='text'
                label='Description2'
                id='description2'
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
  after?: ReactNode,
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
  max?: number
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
  const onChange: EventHandler<React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>> = (event) => {
    if (props.type === 'text' || props.type === 'textarea') {
      props.onChange(event.target.value);
    } else if (props.type === 'number') {
      // TODO
      props.onChange(event.target.value === '' ? null : +event.target.value);
    }
  }

  const inputProps = {
    className: `form-control${props.value || props.value === 0 ? ' non-empty' : ''}`,
    id: props.id,
    onChange: onChange,
    value: `${props.value}`,
    disabled: props.disabled,
    min: props.type === 'number' ? props.min : undefined,
    max: props.type === 'number' ? props.max : undefined
  }

  const inputs = <>
    {props.type === 'textarea'
      ? <textarea {...inputProps} />
      : <input type={props.type} {...inputProps} />}
    <label htmlFor={props.id}>{props.label}</label>
    {props.after}
  </>;

  const isInputGroup = typeof props.after !== 'undefined';

  return (
    <div className='form-group'>
      {isInputGroup
        ? <div className='input-group'>{inputs}</div>
        : inputs}
    </div>
  );
}
