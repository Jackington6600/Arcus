import { EAttribute } from "./attribute";

export enum EResistancePoint {
    Fortitude = 'fort',
    Reflex = 'refl',
    Will = 'will',
}

export namespace EResistancePoint {
    export const values: readonly EResistancePoint[] = [EResistancePoint.Fortitude, EResistancePoint.Reflex, EResistancePoint.Will];

    export function getShortDisplayName(resistancePoint: EResistancePoint) {
        switch (resistancePoint) {
            case EResistancePoint.Fortitude:
                return 'FORT';
            case EResistancePoint.Reflex:
                return 'REFL';
            case EResistancePoint.Will:
                return 'WILL';
        }
    }

    export function getLongDisplayName(resistancePoint: EResistancePoint) {
        switch (resistancePoint) {
            case EResistancePoint.Fortitude:
                return 'Fortitude';
            case EResistancePoint.Reflex:
                return 'Reflex';
            case EResistancePoint.Will:
                return 'Will';
        }
    }

    export function getAttributes(resistancePoint: EResistancePoint) {
        switch (resistancePoint) {
            case EResistancePoint.Fortitude:
                return [EAttribute.Strength, EAttribute.Constitution];
            case EResistancePoint.Reflex:
                return [EAttribute.Dexterity, EAttribute.Perception];
            case EResistancePoint.Will:
                return [EAttribute.Intelligence, EAttribute.Spirit];
        }
    }
}
