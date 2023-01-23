import { sum as lodashSum } from 'lodash';

import { EAttribute } from './attribute';
import { EResistancePoint } from './resistance-point';


export function calculateAttributeModifier(attribute: number | null): number | null {
    if (attribute === null)
        return null;
    return Math.floor((attribute - 10) / 2);
}

export function calculateTotalResistancePoints(resistancePoint: EResistancePoint, attributes: Record<EAttribute, number | null>): number | null {
    return Math.max(0, lodashSum(EResistancePoint.getAttributes(resistancePoint).map(a => attributes[a]).filter(a => a !== null).map(a => Math.max(0, a as number - 10))));
}

export function calculateMaxHp(level: number | null, constitution: number | null, constitutionModifier: number | null): number | null {
    if (constitution === null || constitutionModifier == null || level === null || level <= 0)
        return null;

    return constitution * 2 + (10 + constitutionModifier) * Math.floor((level - 1) / 2);
}

export function calculatePassivePerception(perception: number | null) {
    if (perception === null)
        return null;

    return 10 + perception + perception;
}
