import { EResistancePoint } from "./resistance-point";

export enum EAttribute {
    Strength = 'str',
    Constitution = 'con',
    Dexterity = 'dex',
    Perception = 'per',
    Intelligence = 'int',
    Spirit = 'spi',
}

export namespace EAttribute {
    export const values: readonly EAttribute[] = [EAttribute.Strength, EAttribute.Constitution, EAttribute.Dexterity, EAttribute.Perception, EAttribute.Intelligence, EAttribute.Spirit];

    export function getShortDisplayName(attribute: EAttribute) {
        switch (attribute) {
            case EAttribute.Strength:
                return 'STR';
            case EAttribute.Constitution:
                return 'CON';
            case EAttribute.Dexterity:
                return 'DEX';
            case EAttribute.Perception:
                return 'PER';
            case EAttribute.Intelligence:
                return 'INT';
            case EAttribute.Spirit:
                return 'SPI';
        }
    }

    export function getLongDisplayName(attribute: EAttribute) {
        switch (attribute) {
            case EAttribute.Strength:
                return 'Strength';
            case EAttribute.Constitution:
                return 'Constitution';
            case EAttribute.Dexterity:
                return 'Dexterity';
            case EAttribute.Perception:
                return 'Perception';
            case EAttribute.Intelligence:
                return 'Intelligence';
            case EAttribute.Spirit:
                return 'Spirit';
        }
    }

    export function getResistancePoint(attribute: EAttribute) {
        switch (attribute) {
            case EAttribute.Strength:
            case EAttribute.Constitution:
                return EResistancePoint.Fortitude;
            case EAttribute.Dexterity:
            case EAttribute.Perception:
                return EResistancePoint.Reflex;
            case EAttribute.Intelligence:
            case EAttribute.Spirit:
                return EResistancePoint.Will;
        }
    }
}
