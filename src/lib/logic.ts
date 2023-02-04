import { sum as lodashSum } from 'lodash';
import ArmorType from './armor-type';

import { Attribute } from './attribute';
import { ResistancePoint } from './resistance-point';


export function calculateAttributeModifier(attribute: number | null): number | null {
    if (attribute === null)
        return null;
    return Math.floor((attribute - 10) / 2);
}

export function calculateTotalResistancePoints(resistancePoint: ResistancePoint, attributes: Record<Attribute, number | null>): number | null {
    return Math.max(0, lodashSum(ResistancePoint.getAttributes(resistancePoint).map(a => attributes[a]).filter(a => a !== null).map(a => Math.max(0, a as number - 10))));
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

export function calculateArmorClass(armorType: ArmorType, dexterityModifier: number | null): number | null {
    switch (armorType) {
        case ArmorType.None:
            return dexterityModifier == null ? null : 11 + Math.min(5, dexterityModifier);
        case ArmorType.Light:
            return dexterityModifier == null ? null : 13 + Math.min(3, dexterityModifier);
        case ArmorType.Heavy:
            return 16;
    }
}

// Movement speed in squares/AP
export function calculateMovementSpeed(armorType: ArmorType): number {
    switch (armorType) {
        case ArmorType.None:
            return 5;
        case ArmorType.Light:
            return 4;
        case ArmorType.Heavy:
            return 3;
    }
}

export function formatMovementSpeedAsFeet(movementSpeed: number): number {
    return movementSpeed * 5
}
