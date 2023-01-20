import Head from 'next/head'
import Image from 'next/image'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next/types';

import React, { EventHandler, useContext, useEffect, useState } from 'react';
import { InputGroup } from 'react-bootstrap';

import { InnerMoon } from '@theme-toggles/react'

import lodash from 'lodash';

import faviconBlack from '../public/favicon-black.ico';
import faviconWhite from '../public/favicon-white.ico';

import connor1 from '../public/connor1.png'
import connor2 from '../public/connor2.png'
import connor3 from '../public/connor3.png'
import connor4 from '../public/connor4.png'
import connor5 from '../public/connor5.png'
import connor6 from '../public/connor6.png'
import connor7 from '../public/connor7.png'
const CONNOR_IMAGES = [connor1, connor2, connor3, connor4, connor5, connor6, connor7]

import { COOKIE_NAME_THEME, SetThemeContext, Theme, ThemeComponent, ThemeContext } from './_theme';
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

type AttributeName = 'str' | 'con' | 'dex' | 'per' | 'int' | 'spi';

const ATTRIBUTES: Record<AttributeName, { shortName: string, name: string, resistancePointsType: ResistancePointsTypeName }> = {
  str: { shortName: 'STR', name: 'Strength', resistancePointsType: 'fort' },
  con: { shortName: 'CON', name: 'Constitution', resistancePointsType: 'fort' },
  dex: { shortName: 'DEX', name: 'Dexterity', resistancePointsType: 'refl' },
  per: { shortName: 'PER', name: 'Perception', resistancePointsType: 'refl' },
  int: { shortName: 'INT', name: 'Intelligence', resistancePointsType: 'will' },
  spi: { shortName: 'SPI', name: 'Spirit', resistancePointsType: 'will' },
};
const ATTRIBUTE_NAMES: AttributeName[] = lodash.keys(ATTRIBUTES) as any;

type ResistancePointsTypeName = 'fort' | 'refl' | 'will';

const RESISTANCE_POINTS_TYPES: Record<ResistancePointsTypeName, { shortName: string, name: string, attributes: [AttributeName, AttributeName] }> = {
  fort: { shortName: 'FORT', name: 'Fortitude', attributes: ['str', 'con'] },
  refl: { shortName: 'REFL', name: 'Reflex', attributes: ['dex', 'per'] },
  will: { shortName: 'WILL', name: 'Will', attributes: ['int', 'spi'] },
};
const RESISTANCE_POINTS_TYPE_NAMES: ResistancePointsTypeName[] = lodash.keys(RESISTANCE_POINTS_TYPES) as any;

function calculateAttributeModifier(attribute: number | null): number | null {
  if (attribute === null)
    return null;
  return Math.floor((attribute - 10) / 2);
}

function formatAttributeModifier(attributeModifier: number | null): string | null {
  if (attributeModifier === null)
    return null;
  return attributeModifier >= 0 ? `+${attributeModifier}` : attributeModifier.toString()
}

function calculateTotalResistancePoints(resistancePointsType: ResistancePointsTypeName, attributes: Record<AttributeName, number | null>): number | null {
  return Math.max(0, lodash.sum(RESISTANCE_POINTS_TYPES[resistancePointsType].attributes.map(a => attributes[a]).filter(a => a !== null).map(a => Math.max(0, a as number - 10))));
}

function calculateMaxHp(level: number | null, constitution: number | null, constitutionModifier: number | null): number | null {
  if (constitution === null || constitutionModifier == null || level === null || level <= 0)
    return null;

  return constitution * 2 + (10 + constitutionModifier) * Math.floor((level - 1) / 2);
}

function calculatePassivePerception(perception: number | null) {
  if (perception === null)
    return null;

  return 10 + perception + perception;
}

function CharacterCreator() {
  function createRecord<TKey extends string, TValue>(keys: TKey[], value: TValue): Record<TKey, TValue> {
    return lodash.chain(keys).mapKeys().mapValues(_ => value).value() as any;
  }

  // State
  const [name, setName] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [level, setLevel] = useState<number | null>(null);
  const [description, setDescription] = useState<string>('');
  const [attributes, setAttributes] = useState(createRecord<AttributeName, number | null>(ATTRIBUTE_NAMES, 10));
  const [attributeModifiers, setAttributeModifiers] = useState(createRecord<AttributeName, number | null>(ATTRIBUTE_NAMES, null));
  const [currentResistancePoints, setCurrentResistancePoints] = useState(createRecord<ResistancePointsTypeName, number | null>(RESISTANCE_POINTS_TYPE_NAMES, 0));
  const [totalResistancePoints, setTotalResistancePoints] = useState(createRecord<ResistancePointsTypeName, number | null>(RESISTANCE_POINTS_TYPE_NAMES, 0));
  const [currentHp, setCurrentHp] = useState<number | null>(null);
  const [maxHp, setMaxHp] = useState<number | null>(null);
  const [tempHp, setTempHp] = useState<number | null>(0);
  const [passivePerception, setPassivePerception] = useState<number | null>(calculatePassivePerception(attributeModifiers['per']));

  // Calculate attribute modifiers and total resistance points
  useEffect(() => {
    setAttributeModifiers(lodash.chain(ATTRIBUTE_NAMES).mapKeys().mapValues(n => calculateAttributeModifier(attributes[n])).value() as any);
    setTotalResistancePoints(lodash.chain(RESISTANCE_POINTS_TYPE_NAMES).mapKeys().mapValues(n => calculateTotalResistancePoints(n, attributes)).value() as any);
  }, [attributes]);

  // Update resistance points if max resistance points change, and they were equal
  const prevTotalResistancePoints = usePrevious(totalResistancePoints);
  useEffect(() => {
    if (prevTotalResistancePoints === undefined)
      return;

    const namesToUpdate = RESISTANCE_POINTS_TYPE_NAMES.filter(n => prevTotalResistancePoints[n] !== totalResistancePoints[n] && currentResistancePoints[n] === prevTotalResistancePoints[n]);
    setCurrentResistancePoints({ ...currentResistancePoints, ...lodash.chain(namesToUpdate).mapKeys().mapValues(n => totalResistancePoints[n]).value() });
  }, [totalResistancePoints]);

  // Calculate max HP
  useEffect(() => {
    setMaxHp(calculateMaxHp(level, attributes['con'], attributeModifiers['con']));
  }, [level, attributes, attributeModifiers]);

  // Update HP if max HP changes, and they were equal
  const prevMaxHp = usePrevious(maxHp);
  useEffect(() => {
    if (prevMaxHp === undefined)
      return;

    if (prevMaxHp !== maxHp && currentHp === prevMaxHp) {
      setCurrentHp(maxHp);
    }
  }, [maxHp]);

  // Calculate passive perception
  useEffect(() => setPassivePerception(calculatePassivePerception(attributeModifiers['per'])), [attributeModifiers]);

  return (
    <>
      <div className='container character-creator'>
        <h1>Character Creator</h1>
        <hr />
        <div className='grid'>
          <div className='g-col-12 g-col-sm-5 g-col-md-7 g-col-xl-8'>
            <Input
              type='text' label='Character Name' id='name' value={name}
              onChange={(value) => setName(value)}
            />
          </div>
          <div className='g-col-8 g-col-sm-4 g-col-md-3'>
            <Input
              type='text' label='Player Name' id='player-name' value={playerName}
              onChange={(value) => setPlayerName(value)}
            />
          </div>
          <div className='g-col-4 g-col-sm-3 g-col-md-2 g-col-xl-1'>
            <Input
              type='number' label='Level' id='level' min={0} max={20} value={level}
              onChange={(value) => setLevel(value)}
            />
          </div>
          <div className='g-col-12'>
            <Input
              type='textarea' label='Description' id='description' value={description}
              onChange={(value) => setDescription(value)}
            />
          </div>

          {ATTRIBUTE_NAMES.map(name =>
            <div className={`attribute attribute-${name} attribute-resistance-${ATTRIBUTES[name].resistancePointsType} g-col-6 g-col-xs-4 g-col-sm-4 g-col-md-2`}>
              <InputGroup>
                <Input
                  type='number' className='overflow-label' id={name} label={ATTRIBUTES[name].shortName} min={0} max={20} value={attributes[name]}
                  onChange={(value) => setAttributes({ ...attributes, [name]: value })} />
                <Input
                  type='text' className='attribute-modifier' /* label='Modifier' */ id={`${name}-total`} readOnly disabled
                  value={formatAttributeModifier(attributeModifiers[name]) ?? ''} />
              </InputGroup>
            </div>
          )}
          {RESISTANCE_POINTS_TYPE_NAMES.map(name =>
            <div className={`resistance-points resistance-points-${name} g-col-12 g-col-md-4`}>
              <InputGroup>
                <Input
                  type='number' className='overflow-label' id={name} label={RESISTANCE_POINTS_TYPES[name].shortName}
                  min={0} max={totalResistancePoints[name] ?? undefined} value={currentResistancePoints[name]}
                  onChange={(value) => setCurrentResistancePoints({ ...currentResistancePoints, [name]: value })} />
                <span className="input-group-text">/</span>
                <Input type='number' className='resistance-points-total' /* label='Total' */ id={`${name}-total`} readOnly disabled value={totalResistancePoints[name]} />
              </InputGroup>
            </div>
          )}
          <div className='g-col-4'>
            <InputGroup>
              <Input
                type='number' className='overflow-label' label='HP' id='current-hp' min={0} max={maxHp ?? undefined} value={currentHp}
                onChange={(value) => setCurrentHp(value)} />
              <span className="input-group-text">/</span>
              <Input type='number' /* label='Max' */ id='max-hp' readOnly disabled value={maxHp} />
            </InputGroup>
          </div>
          <div className='g-col-4'>
            <Input type='number' label='Temp HP' id='temp-hp' min={0} value={tempHp}
              onChange={(value) => setTempHp(value)} />
          </div>
          <div className='g-col-4'>
            <Input type='number' label='Passive Perception' id='passive-perception' readOnly disabled value={passivePerception} />
          </div>
          <div className='g-col-12'>
            {CONNOR_IMAGES.map(img => <Image src={img} alt='' />)}
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
  label?: string
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

  const labelExcluded = props.label === undefined;

  const inputProps = {
    className: `form-control ${labelExcluded ? props.className ?? '' : ''}`,
    id: props.id,
    placeholder: '', // Required to get CSS selectors to work
    onChange: onChange,
    value: props.value ?? '',
    readOnly: props.readOnly,
    disabled: props.disabled,
    min: props.type === 'number' ? props.min : undefined,
    max: props.type === 'number' ? props.max : undefined
  };

  const input = props.type === 'textarea'
    ? <textarea {...inputProps} />
    : <input type={props.type} {...inputProps} />;

  return (
    labelExcluded
      ? input
      : <div className={`form-floating thin ${props.className ?? ''}`}>
        {input}
        <label htmlFor={props.id}>{props.label}</label>
      </div>
  );
}

