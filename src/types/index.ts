// YAML Data Structure Types

export interface MainRuleSection {
  id: string;
  title: string;
  summary?: string;
  body?: string | string[];
  children?: MainRuleSection[];
}

export interface MainRules {
  sections: MainRuleSection[];
}

export interface ArmourItem {
  type: string;
  armour: string;
  movement: string;
  notes: string;
  requirements?: string;
}

export interface ArmourData {
  armour: ArmourItem[];
}

export interface WeaponItem {
  weapon: string;
  notes: string;
  modifier: string;
  range: string;
}

export interface WeaponsData {
  weapons: WeaponItem[];
}

export interface Trait {
  name: string;
  desc: string;
  type: string;
  usage: string;
  useLimit: string;
  requirements?: string;
}

export interface TraitGroup {
  name: string;
  id: string;
  description: string;
  traits: Trait[];
}

export interface TraitsData {
  trait_groups: TraitGroup[];
}

export interface CoreAbility {
  level: string;
  name: string;
  description: string;
  target: string;
  apCost: string | number;
}

export interface CoreAbilitiesData {
  core_abilities: CoreAbility[];
}

export interface ClassAbility {
  level: string | number;
  name: string;
  apCost: string | number;
  otherCost?: string;
  flavourText?: string;
  description: string;
  range?: string;
  target: string;
  type: string;
  tags?: string[];
  extraEffectCost?: string;
  extraEffectDescription?: string;
}

export interface Class {
  name: string;
  type: string;
  attributes: string;
  summary: string;
  abilities: ClassAbility[];
}

export interface ClassesData {
  sections: MainRuleSection[];
  classes: Record<string, Class>;
}

// Configuration Types

export type DisplayFormat = 'table' | 'card' | 'text';

export interface TableFilter {
  // For class_abilities.yaml: filter by class IDs
  classIds?: string[];
  // For traits.yaml: filter by trait group IDs
  groupIds?: string[];
  // For other tables: filter by field values
  field?: string;
  values?: string[];
}

export interface ContentSection {
  id: string;
  displayFormat?: DisplayFormat;
  visible: boolean;
  sourceFile?: string;
  visibleFields?: string[];
  showInNavigation?: boolean;
  filter?: TableFilter;
  splitBy?: string; // Field name to group by (e.g., "classId", "groupId")
  groupTitleField?: string; // Field name to use as the group title/heading (e.g., "className", "group")
  metadataFields?: string[]; // Fields to display as metadata before each table (e.g., ["type", "attributes", "summary"])
  children?: ContentSection[];
}

export interface ContentConfig {
  sections: ContentSection[];
}

export interface TooltipConfig {
  phrases: string[];
  id: string;
}

export interface TooltipsConfig {
  tooltips: TooltipConfig[];
}

// Component Types

export type Theme = 'light' | 'dark';

export interface Preferences {
  theme: Theme;
  displayFormat: DisplayFormat;
}

export type SortDirection = 'asc' | 'desc' | 'default';

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'section' | 'rule';
  sectionId?: string;
  // Hierarchy information for better display and navigation
  parentPath?: string[]; // Array of parent section titles from root to immediate parent
  depth?: number; // Depth in hierarchy (0 = root level)
  shortTitle?: string; // Just the section/item name without parent path
}

export interface Heading {
  id: string;
  title: string;
  level: number;
  element?: HTMLElement;
}

