import Image from 'next/image'

import { useEffect, useState } from 'react';
import { InputGroup } from 'react-bootstrap';

import { useDependentState, usePrevState } from '../common/react-utils';
import { chain as lodashChain } from 'lodash';
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
import { Attribute } from '../common/attribute';
import { ResistancePoint } from '../common/resistance-point';


function formatAttributeModifier(attributeModifier: number | null): string | null {
  if (attributeModifier === null)
    return null;
  return attributeModifier >= 0 ? `+${attributeModifier}` : attributeModifier.toString()
}

export default function CharacterSheet() {
  function createRecord<TKey extends string, TValue>(keys: readonly TKey[], value: TValue): Record<TKey, TValue> {
    return lodashChain(keys).mapKeys().mapValues(_ => value).value() as any;
  }

  // State
  const [name, setName] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [level, setLevel] = useState<number | null>(1);

  const [description, setDescription] = useState<string>('');

  const [attributes, setAttributes] = useState(createRecord<Attribute, number | null>(Attribute.values, 10));
  const attributeModifiers = useDependentState<Record<Attribute, number | null>>(() =>
    lodashChain(Attribute.values).mapKeys().mapValues(a => calculateAttributeModifier(attributes[a])).value() as any, [attributes]);

  const totalResistancePoints = useDependentState<Record<ResistancePoint, number | null>>(() =>
    lodashChain(ResistancePoint.values).mapKeys().mapValues(rp => calculateTotalResistancePoints(rp, attributes)).value() as any, [attributes]);
  const [currentResistancePoints, setCurrentResistancePoints] = useState(createRecord<ResistancePoint, number | null>(ResistancePoint.values, 0));

  const [currentHp, setCurrentHp] = useState<number | null>(null);
  const maxHp = useDependentState(() => calculateMaxHp(level, attributes['con'], attributeModifiers['con']), [level, attributes, attributeModifiers]);
  const [tempHp, setTempHp] = useState<number | null>(0);

  const passivePerception = useDependentState(() => calculatePassivePerception(attributeModifiers['per']), [attributeModifiers]);

  // Update resistance points if max resistance points change, and they were equal
  const prevTotalResistancePoints = usePrevState(totalResistancePoints);
  useEffect(() => {
    if (prevTotalResistancePoints === undefined)
      return;

    const namesToUpdate = ResistancePoint.values.filter(n => prevTotalResistancePoints[n] !== totalResistancePoints[n] && currentResistancePoints[n] === prevTotalResistancePoints[n]);
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
      <div className={`container ${styles['character-sheet']}`}>
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

          {Attribute.values.map(attribute =>
            <div key={attribute} className={`attribute attribute-${attribute} attribute-resistance-${Attribute.getResistancePoint(attribute)} g-col-6 g-col-xs-4 g-col-sm-4 g-col-md-2`}>
              <InputGroup>
                <ThinInput
                  type='number' className='overflow-label' id={attribute} label={Attribute.getShortDisplayName(attribute)} min={0} max={20} value={attributes[attribute]}
                  onChange={(value) => setAttributes({ ...attributes, [attribute]: value })} />
                <ThinInput
                  type='text' className='attribute-modifier' /* label='Modifier' */ id={`${attribute}-total`} readOnly disabled
                  value={formatAttributeModifier(attributeModifiers[attribute]) ?? ''} />
              </InputGroup>
            </div>
          )}
          {ResistancePoint.values.map(rp =>
            <div key={rp} className={`resistance-points resistance-points-${rp} g-col-12 g-col-md-4`}>
              <InputGroup>
                <ThinInput
                  type='number' className='overflow-label' id={rp} label={ResistancePoint.getShortDisplayName(rp)}
                  min={0} max={totalResistancePoints[rp] ?? undefined} value={currentResistancePoints[rp]}
                  onChange={(value) => setCurrentResistancePoints({ ...currentResistancePoints, [rp]: value })} />
                <span className="input-group-text">/</span>
                <ThinInput type='number' className='resistance-points-total' /* label='Total' */ id={`${rp}-total`} readOnly disabled value={totalResistancePoints[rp]} />
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
