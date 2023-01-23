import { Attribute } from "./attribute";

export enum ResistancePoint {
    Fortitude = 'fort',
    Reflex = 'refl',
    Will = 'will',
}

export namespace ResistancePoint {
    export const values: readonly ResistancePoint[] = [ResistancePoint.Fortitude, ResistancePoint.Reflex, ResistancePoint.Will];

    export function getShortDisplayName(resistancePoint: ResistancePoint) {
        switch (resistancePoint) {
            case ResistancePoint.Fortitude:
                return 'FORT';
            case ResistancePoint.Reflex:
                return 'REFL';
            case ResistancePoint.Will:
                return 'WILL';
        }
    }

    export function getLongDisplayName(resistancePoint: ResistancePoint) {
        switch (resistancePoint) {
            case ResistancePoint.Fortitude:
                return 'Fortitude';
            case ResistancePoint.Reflex:
                return 'Reflex';
            case ResistancePoint.Will:
                return 'Will';
        }
    }

    export function getAttributes(resistancePoint: ResistancePoint) {
        switch (resistancePoint) {
            case ResistancePoint.Fortitude:
                return [Attribute.Strength, Attribute.Constitution];
            case ResistancePoint.Reflex:
                return [Attribute.Dexterity, Attribute.Perception];
            case ResistancePoint.Will:
                return [Attribute.Intelligence, Attribute.Spirit];
        }
    }
}
