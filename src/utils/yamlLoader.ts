import yaml from 'js-yaml';
import type {
  MainRules,
  ArmourData,
  WeaponsData,
  TraitsData,
  CoreAbilitiesData,
  ClassesData,
  ContentConfig,
  TooltipsConfig,
} from '@/types';

/**
 * Loads and parses a YAML file from the public directory
 */
async function loadYaml<T>(filename: string): Promise<T> {
  try {
    // Use import.meta.env.BASE_URL to handle base path in production
    const baseUrl = import.meta.env.BASE_URL;
    const url = `${baseUrl}${filename}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }
    const text = await response.text();
    return yaml.load(text) as T;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw error;
  }
}

/**
 * Loads all YAML rule files and configuration files
 */
export async function loadAllData() {
  const [
    mainRules,
    armour,
    weapons,
    traits,
    coreAbilities,
    classAbilities,
    contentConfig,
    tooltips,
  ] = await Promise.all([
    loadYaml<MainRules>('main_rules.yaml'),
    loadYaml<ArmourData>('armour.yaml'),
    loadYaml<WeaponsData>('weapons.yaml'),
    loadYaml<TraitsData>('traits.yaml'),
    loadYaml<CoreAbilitiesData>('core_abilities.yaml'),
    loadYaml<ClassesData>('class_abilities.yaml'),
    loadYaml<ContentConfig>('contentConfig.yaml'),
    loadYaml<TooltipsConfig>('tooltips.yaml'),
  ]);

  return {
    mainRules,
    armour,
    weapons,
    traits,
    coreAbilities,
    classAbilities,
    contentConfig,
    tooltips,
  };
}

/**
 * Type for the loaded data structure
 */
export type LoadedData = Awaited<ReturnType<typeof loadAllData>>;

