
import { keys as lodashKeys } from 'lodash';


export type AttributeName = 'str' | 'con' | 'dex' | 'per' | 'int' | 'spi';

export const ATTRIBUTES = {
    str: { shortName: 'STR', name: 'Strength', resistancePointsType: 'fort' },
    con: { shortName: 'CON', name: 'Constitution', resistancePointsType: 'fort' },
    dex: { shortName: 'DEX', name: 'Dexterity', resistancePointsType: 'refl' },
    per: { shortName: 'PER', name: 'Perception', resistancePointsType: 'refl' },
    int: { shortName: 'INT', name: 'Intelligence', resistancePointsType: 'will' },
    spi: { shortName: 'SPI', name: 'Spirit', resistancePointsType: 'will' },
} as const;

export const ATTRIBUTE_NAMES: AttributeName[] = lodashKeys(ATTRIBUTES) as any;
