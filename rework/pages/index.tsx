import Head from 'next/head'

import React, { EventHandler, useContext, useEffect, useState } from 'react';

import faviconBlack from '../public/favicon-black.ico';
import faviconWhite from '../public/favicon-white.ico';

import { InnerMoon } from '@theme-toggles/react'

import { COOKIE_NAME_THEME, SetThemeContext, Theme, ThemeComponent, ThemeContext } from './_theme';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next/types';

import lodash from 'lodash';
import { InputGroup } from 'react-bootstrap';
import { usePrevious } from './_utils';


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

function CharacterCreator() {
  const [name, setName] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [level, setLevel] = useState<number | null>(null);
  const [description, setDescription] = useState<string>('');

  function createRecord<TKey extends string, TValue>(keys: TKey[], value: TValue): Record<TKey, TValue> {
    return lodash.chain(keys).mapKeys().mapValues(_ => value).value() as any;
  }

  const [attributes, setAttributes] = useState(createRecord<AttributeName, number | null>(ATTRIBUTE_NAMES, 10));
  const [attributeModifiers, setAttributeModifiers] = useState(createRecord<AttributeName, number | null>(ATTRIBUTE_NAMES, null));
  const [currentResistancePoints, setCurrentResistancePoints] = useState(createRecord<ResistancePointsTypeName, number | null>(RESISTANCE_POINTS_TYPE_NAMES, 0));
  const [totalResistancePoints, setTotalResistancePoints] = useState(createRecord<ResistancePointsTypeName, number | null>(RESISTANCE_POINTS_TYPE_NAMES, 0));

  useEffect(() => {
    setAttributeModifiers(lodash.chain(ATTRIBUTE_NAMES).mapKeys().mapValues(n => getAttributeModifier(attributes[n])).value() as any);
    setTotalResistancePoints(lodash.chain(RESISTANCE_POINTS_TYPE_NAMES).mapKeys().mapValues(n => getTotalResistancePoints(n, attributes)).value() as any);
  }, [attributes]);

  const prevTotalResistancePoints = usePrevious(totalResistancePoints);
  useEffect(() => {
    if (prevTotalResistancePoints === undefined)
      return;

    const namesToUpdate = RESISTANCE_POINTS_TYPE_NAMES.filter(n => prevTotalResistancePoints[n] !== totalResistancePoints[n] && currentResistancePoints[n] === prevTotalResistancePoints[n]);
    setCurrentResistancePoints({ ...currentResistancePoints, ...lodash.chain(namesToUpdate).mapKeys().mapValues(n => totalResistancePoints[n]).value() });
  }, [totalResistancePoints]);

  const getAttribute = (name: AttributeName) => <Input
    type='number'
    id={name}
    label={ATTRIBUTES[name].name}
    value={attributes[name]}
    min={0}
    max={20}
    onChange={(value) => setAttributes({ ...attributes, [name]: value })} />;

  const getAttributeDiv = (name: AttributeName) =>
    <div className={`attribute attribute-${name} attribute-resistance-${ATTRIBUTES[name].resistancePointsType} g-col-6 g-col-xs-4 g-col-sm-4 g-col-md-2`}>
      {getAttribute(name)}
    </div>;

  const getResistancePoints = (name: ResistancePointsTypeName) => <Input
    type='number'
    id={name}
    label={RESISTANCE_POINTS_TYPES[name].name}
    value={currentResistancePoints[name]}
    min={0}
    max={20}
    onChange={(value) => setCurrentResistancePoints({ ...currentResistancePoints, [name]: value })} />;

  const getResistancePointsDiv = (name: ResistancePointsTypeName) =>
    <div className={`resistance-points resistance-points-${name} g-col-12 g-col-md-4`}>
      <InputGroup>
        {getResistancePoints(name)}
        <span className="input-group-text">/</span>
        <Input type='text' className='resistance-points-total' label='Total' id={`${name}-total`} readOnly disabled value={totalResistancePoints[name]?.toString() || ''} />
      </InputGroup>
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
              value={name}
              onChange={(value) => setName(value)}
            />
          </div>
          <div className='g-col-8 g-col-sm-4 g-col-md-3'>
            <Input
              type='text'
              label='Player Name'
              id='player-name'
              value={playerName}
              onChange={(value) => setPlayerName(value)}
            />
          </div>
          <div className='g-col-4 g-col-sm-3 g-col-md-2 g-col-xl-1'>
            <Input
              type='number'
              label='Level'
              id='level'
              min={0}
              max={20}
              value={level}
              onChange={(value) => setLevel(value)}
            />
          </div>
          <div className='g-col-12'>
            <Input
              type='textarea'
              label='Description'
              id='description'
              value={description}
              onChange={(value) => setDescription(value)}
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
              value={description}
              onChange={(value) => setDescription(value)}
            />
          </div>
          <div className='g-col-12'>
            <div className="input-group">
              <span className="input-group-text">@</span>
              <div className="form-floating thin">
                <input type="text" className="form-control" id="floatingInputGroup1" placeholder='' readOnly value='█m█__█_' />
                <label htmlFor="floatingInputGroup1">█m███_Usernameeeeeeeeeeeeeeeeeeeeeeeeee█eeeeeeeeeeeeeeeeeeeeeemmmmmm█mmmmmmmmmmmmmmmmmmmmmmmmmmmm||█</label>
              </div>
            </div>
          </div>
          <div className='g-col-12'>
            <div className="input-group">
              <span className="input-group-text">@</span>
              <div className="form-floating thin">
                <input type="text" className="form-control" id="floatingInputGroup1" placeholder='' />
                <label htmlFor="floatingInputGroup1">█||Usernameeeeeeeeeeeeeeeeeeeeeeeeee█eeeeeeeeeeeeeeeeeeeeeemmmmmm█mmmmmmmmmmmmmmmmmmmmmmmmmmmm||█</label>
              </div>
            </div>
          </div>
          <div className='g-col-12'>
            <div className="input-group">
              <span className="input-group-text">@</span>
              <div className="form-floating thin">
                <input type="text" className="form-control" id="floatingInputGroup1" placeholder='' readOnly value='█m█__█_' />
                <label htmlFor="floatingInputGroup1">Username</label>
              </div>
            </div>
          </div>
          <div className='g-col-12'>
            <div className="input-group">
              <span className="input-group-text">@</span>
              <div className="form-floating thin">
                <input type="text" className="form-control" id="floatingInputGroup1" placeholder='' />
                <label htmlFor="floatingInputGroup1">Username</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

type InputProps =
  TextInputProps |
  TextAreaInputProps |
  NumberInputProps;

type CommonInputProps<T> = {
  label: string
  id: string
  className?: string
  value: T
  readOnly?: boolean
  disabled?: boolean,
  onChange?: (value: T) => void
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
    if (props.onChange === undefined)
      return;

    if (props.type === 'text' || props.type === 'textarea') {
      props.onChange(event.target.value);
    } else if (props.type === 'number') {
      // TODO
      props.onChange(event.target.value === '' ? null : +event.target.value);
    }
  }

  const inputProps = {
    className: `form-control`,
    id: props.id,
    placeholder: '',
    onChange: onChange,
    value: props.value ?? '',
    readOnly: props.readOnly,
    disabled: props.disabled,
    min: props.type === 'number' ? props.min : undefined,
    max: props.type === 'number' ? props.max : undefined
  };

  return (
    <div className={`form-floating thin ${props.className ?? ''}`}>
      {props.type === 'textarea'
        ? <textarea {...inputProps} />
        : <input type={props.type} {...inputProps} />}
      <label htmlFor={props.id}>{props.label}</label>
    </div>
  );
}

