
export enum ArmorType {
    None = 'none',
    Light = 'light',
    Heavy = 'heavy',
}

export namespace ArmorType {
    export const values: readonly ArmorType[] = [ArmorType.None, ArmorType.Light, ArmorType.Heavy];
    export const valuesSet = new Set(values);

    export function getDisplayName(armorType: ArmorType) {
        switch (armorType) {
            case ArmorType.None:
                return 'No Armor';
            case ArmorType.Light:
                return 'Light';
            case ArmorType.Heavy:
                return 'Heavy';
        }
    }
}

export default ArmorType;
