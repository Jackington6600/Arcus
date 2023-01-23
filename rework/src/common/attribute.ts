import { ResistancePoint } from "./resistance-point";

export enum Attribute {
    Strength = 'str',
    Constitution = 'con',
    Dexterity = 'dex',
    Perception = 'per',
    Intelligence = 'int',
    Spirit = 'spi',
}

export namespace Attribute {
    export const values: readonly Attribute[] = [Attribute.Strength, Attribute.Constitution, Attribute.Dexterity, Attribute.Perception, Attribute.Intelligence, Attribute.Spirit];

    export function getShortDisplayName(attribute: Attribute) {
        switch (attribute) {
            case Attribute.Strength:
                return 'STR';
            case Attribute.Constitution:
                return 'CON';
            case Attribute.Dexterity:
                return 'DEX';
            case Attribute.Perception:
                return 'PER';
            case Attribute.Intelligence:
                return 'INT';
            case Attribute.Spirit:
                return 'SPI';
        }
    }

    export function getLongDisplayName(attribute: Attribute) {
        switch (attribute) {
            case Attribute.Strength:
                return 'Strength';
            case Attribute.Constitution:
                return 'Constitution';
            case Attribute.Dexterity:
                return 'Dexterity';
            case Attribute.Perception:
                return 'Perception';
            case Attribute.Intelligence:
                return 'Intelligence';
            case Attribute.Spirit:
                return 'Spirit';
        }
    }

    export function getResistancePoint(attribute: Attribute) {
        switch (attribute) {
            case Attribute.Strength:
            case Attribute.Constitution:
                return ResistancePoint.Fortitude;
            case Attribute.Dexterity:
            case Attribute.Perception:
                return ResistancePoint.Reflex;
            case Attribute.Intelligence:
            case Attribute.Spirit:
                return ResistancePoint.Will;
        }
    }
}
