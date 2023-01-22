import { keys as lodashKeys } from 'lodash';


export type ResistancePointsTypeName = 'fort' | 'refl' | 'will';

export const RESISTANCE_POINTS_TYPES = {
    fort: { shortName: 'FORT', name: 'Fortitude', attributes: ['str', 'con'] },
    refl: { shortName: 'REFL', name: 'Reflex', attributes: ['dex', 'per'] },
    will: { shortName: 'WILL', name: 'Will', attributes: ['int', 'spi'] },
} as const;

export const RESISTANCE_POINTS_TYPE_NAMES: ResistancePointsTypeName[] = lodashKeys(RESISTANCE_POINTS_TYPES) as any;
