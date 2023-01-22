import Image from 'next/image'

import { useEffect, useState } from 'react';
import { InputGroup } from 'react-bootstrap';

import { useDependentState, usePrevState } from '../common/react-utils';
import { chain as lodashChain } from 'lodash';
import { ResistancePointsTypeName, RESISTANCE_POINTS_TYPES, RESISTANCE_POINTS_TYPE_NAMES } from '../common/resistance-points';
import { AttributeName, ATTRIBUTES, ATTRIBUTE_NAMES } from '../common/attributes';
import { calculateAttributeModifier, calculateMaxHp, calculatePassivePerception, calculateTotalResistancePoints } from '../common/logic';
import ThinInput from './ThinInput';

import styles from './CharacterSheet.module.scss';

import connor1 from '../../public/static/connor1.png'
import connor2 from '../../public/static/connor2.png'
import connor3 from '../../public/static/connor3.png'
import connor4 from '../../public/static/connor4.png'
import connor5 from '../../public/static/connor5.png'
import connor6 from '../../public/static/connor6.png'
import connor7 from '../../public/static/connor7.png'
const CONNOR_IMAGES = [connor1, connor2, connor3, connor4, connor5, connor6, connor7]

import characterSheetDesignImage from '../../public/static/characterSheetDesign.png'


function formatAttributeModifier(attributeModifier: number | null): string | null {
  if (attributeModifier === null)
    return null;
  return attributeModifier >= 0 ? `+${attributeModifier}` : attributeModifier.toString()
}

export default function CharacterSheet() {
  function createRecord<TKey extends string, TValue>(keys: TKey[], value: TValue): Record<TKey, TValue> {
    return lodashChain(keys).mapKeys().mapValues(_ => value).value() as any;
  }

  // State
  const [name, setName] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [level, setLevel] = useState<number | null>(1);

  const [description, setDescription] = useState<string>('');

  const [attributes, setAttributes] = useState(createRecord<AttributeName, number | null>(ATTRIBUTE_NAMES, 10));
  const attributeModifiers = useDependentState(() =>
    lodashChain(ATTRIBUTE_NAMES).mapKeys().mapValues(n => calculateAttributeModifier(attributes[n])).value() as any, [attributes]);

  const totalResistancePoints = useDependentState(() =>
    lodashChain(RESISTANCE_POINTS_TYPE_NAMES).mapKeys().mapValues(n => calculateTotalResistancePoints(n, attributes)).value() as any, [attributes]);
  const [currentResistancePoints, setCurrentResistancePoints] = useState(createRecord<ResistancePointsTypeName, number | null>(RESISTANCE_POINTS_TYPE_NAMES, 0));

  const [currentHp, setCurrentHp] = useState<number | null>(null);
  const maxHp = useDependentState(() => calculateMaxHp(level, attributes['con'], attributeModifiers['con']), [level, attributes, attributeModifiers]);
  const [tempHp, setTempHp] = useState<number | null>(0);

  const passivePerception = useDependentState(() => calculatePassivePerception(attributeModifiers['per']), [attributeModifiers]);

  // Update resistance points if max resistance points change, and they were equal
  const prevTotalResistancePoints = usePrevState(totalResistancePoints);
  useEffect(() => {
    if (prevTotalResistancePoints === undefined)
      return;

    const namesToUpdate = RESISTANCE_POINTS_TYPE_NAMES.filter(n => prevTotalResistancePoints[n] !== totalResistancePoints[n] && currentResistancePoints[n] === prevTotalResistancePoints[n]);
    setCurrentResistancePoints({ ...currentResistancePoints, ...lodashChain(namesToUpdate).mapKeys().mapValues(n => totalResistancePoints[n]).value() });
  }, [totalResistancePoints]);

  // Update HP if max HP changes, and they were equal
  const prevMaxHp = usePrevState(maxHp);
  useEffect(() => {
    if (prevMaxHp === undefined)
      return;

    if (prevMaxHp !== maxHp && currentHp === prevMaxHp) {
      setCurrentHp(maxHp);
    }
  }, [maxHp]);

  return (
    <>
      <div className={`container ${styles.sheet}`}>
        <h1>{name ? name : 'Character Sheet'}</h1>
        <hr />
        <div className='grid'>
          <div className='g-col-12 g-col-sm-5 g-col-md-7 g-col-xl-8'>
            <ThinInput
              type='text' label='Character Name' id='name' value={name}
              onChange={(value) => setName(value)}
            />
          </div>
          <div className='g-col-8 g-col-sm-4 g-col-md-3'>
            <ThinInput
              type='text' label='Player Name' id='player-name' value={playerName}
              onChange={(value) => setPlayerName(value)}
            />
          </div>
          <div className='g-col-4 g-col-sm-3 g-col-md-2 g-col-xl-1'>
            <ThinInput
              type='number' label='Level' id='level' min={1} max={20} value={level}
              onChange={(value) => setLevel(value)}
            />
          </div>
          <div className='g-col-12'>
            <ThinInput
              type='textarea' label='Description' id='description' rows={3} value={description}
              onChange={(value) => setDescription(value)}
            />
          </div>

          {ATTRIBUTE_NAMES.map(name =>
            <div key={name} className={`attribute attribute-${name} attribute-resistance-${ATTRIBUTES[name].resistancePointsType} g-col-6 g-col-xs-4 g-col-sm-4 g-col-md-2`}>
              <InputGroup>
                <ThinInput
                  type='number' className='overflow-label' id={name} label={ATTRIBUTES[name].shortName} min={0} max={20} value={attributes[name]}
                  onChange={(value) => setAttributes({ ...attributes, [name]: value })} />
                <ThinInput
                  type='text' className='attribute-modifier' /* label='Modifier' */ id={`${name}-total`} readOnly disabled
                  value={formatAttributeModifier(attributeModifiers[name]) ?? ''} />
              </InputGroup>
            </div>
          )}
          {RESISTANCE_POINTS_TYPE_NAMES.map(name =>
            <div key={name} className={`resistance-points resistance-points-${name} g-col-12 g-col-md-4`}>
              <InputGroup>
                <ThinInput
                  type='number' className='overflow-label' id={name} label={RESISTANCE_POINTS_TYPES[name].shortName}
                  min={0} max={totalResistancePoints[name] ?? undefined} value={currentResistancePoints[name]}
                  onChange={(value) => setCurrentResistancePoints({ ...currentResistancePoints, [name]: value })} />
                <span className="input-group-text">/</span>
                <ThinInput type='number' className='resistance-points-total' /* label='Total' */ id={`${name}-total`} readOnly disabled value={totalResistancePoints[name]} />
              </InputGroup>
            </div>
          )}
          <div className='g-col-4'>
            <InputGroup>
              <ThinInput
                type='number' className='overflow-label' label='HP' id='current-hp' min={0} max={maxHp ?? undefined} value={currentHp}
                onChange={(value) => setCurrentHp(value)} />
              <span className="input-group-text">/</span>
              <ThinInput type='number' /* label='Max' */ id='max-hp' readOnly disabled value={maxHp} />
            </InputGroup>
          </div>
          <div className='g-col-4'>
            <ThinInput type='number' label='Temp HP' id='temp-hp' min={0} value={tempHp}
              onChange={(value) => setTempHp(value)} />
          </div>
          <div className='g-col-4'>
            <ThinInput type='number' label='Passive Perception' id='passive-perception' readOnly disabled value={passivePerception} />
          </div>
          <div className='g-col-12'>
            <Image src={characterSheetDesignImage} alt=''/>
          </div>
          <div className='g-col-12'>
            {CONNOR_IMAGES.map(img => <Image key={img.src} src={img} alt='' />)}
          </div>
        </div>
      </div>
    </>
  )
}
