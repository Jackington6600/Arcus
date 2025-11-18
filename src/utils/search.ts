import Fuse from 'fuse.js';
import type { SearchResult, MainRules } from '@/types';
import type { LoadedData } from '@/utils/yamlLoader';

/**
 * Flattens main rules sections into a searchable array with hierarchy information
 */
function flattenSections(
  sections: MainRules['sections'],
  parentPath: string[] = [],
  depth = 0
): SearchResult[] {
  const results: SearchResult[] = [];

  for (const section of sections) {
    const content = Array.isArray(section.body)
      ? section.body.join(' ')
      : section.body || '';
    const summary = section.summary || '';

    results.push({
      id: section.id,
      title: parentPath.length > 0 
        ? `${parentPath.join(' > ')} > ${section.title}` 
        : section.title,
      shortTitle: section.title,
      content: `${summary} ${content}`.trim(),
      type: 'section',
      parentPath: [...parentPath],
      depth,
    });

    if (section.children) {
      const newParentPath = [...parentPath, section.title];
      results.push(...flattenSections(section.children, newParentPath, depth + 1));
    }
  }

  return results;
}

/**
 * Creates search index from all loaded data
 */
export function createSearchIndex(data: LoadedData): SearchResult[] {
  const results: SearchResult[] = [];

  // Add main rules sections
  results.push(...flattenSections(data.mainRules.sections));

  // Add armour table header
  results.push({
    id: 'armour-table',
    title: 'Armour Types',
    shortTitle: 'Armour Types',
    content: 'Armour equipment and protection',
    type: 'section',
    sectionId: 'armour-table',
    parentPath: ['Equipment', 'Armour'],
    depth: 2,
  });

  // Add armour items
  data.armour.armour.forEach((item: any) => {
    results.push({
      id: `armour-${item.type}`,
      title: `Armour: ${item.type}`,
      shortTitle: item.type,
      content: `${item.armour} ${item.movement} ${item.notes}`,
      type: 'rule',
      sectionId: 'armour-table',
      parentPath: ['Equipment', 'Armour'],
      depth: 2,
    });
  });

  // Add weapons table header
  results.push({
    id: 'weapons-table',
    title: 'Weapons',
    shortTitle: 'Weapons',
    content: 'Weapon equipment and combat statistics',
    type: 'section',
    sectionId: 'weapons-table',
    parentPath: ['Equipment', 'Weapons'],
    depth: 2,
  });

  // Add weapons
  data.weapons.weapons.forEach((weapon: any) => {
    results.push({
      id: `weapon-${weapon.weapon}`,
      title: `Weapon: ${weapon.weapon}`,
      shortTitle: weapon.weapon,
      content: `${weapon.notes} ${weapon.modifier} ${weapon.range}`,
      type: 'rule',
      sectionId: 'weapons-table',
      parentPath: ['Equipment', 'Weapons'],
      depth: 2,
    });
  });

  // Add trait groups as searchable entries (table headers)
  data.traits.trait_groups.forEach((group: any) => {
    // Add trait group header/metadata entry
    results.push({
      id: `trait-group-${group.id}`,
      title: `Trait Group: ${group.name}`,
      shortTitle: group.name,
      content: group.description || '',
      type: 'section',
      sectionId: `trait-group-${group.id}`,
      parentPath: ['Creating a Character', 'Traits'],
      depth: 2,
    });

    // Add individual traits
    group.traits.forEach((trait: any) => {
      results.push({
        id: `trait-${group.id}-${trait.name}`,
        title: `Trait: ${trait.name} (${group.name})`,
        shortTitle: trait.name,
        content: `${trait.desc} ${trait.type} ${trait.usage}`,
        type: 'rule',
        sectionId: `trait-group-${group.id}`,
        parentPath: ['Creating a Character', 'Traits', group.name],
        depth: 3,
      });
    });
  });

  // Add core abilities table header
  results.push({
    id: 'core-abilities-table',
    title: 'Core Abilities',
    shortTitle: 'Core Abilities',
    content: 'Core combat abilities available to all characters',
    type: 'section',
    sectionId: 'core-abilities-table',
    parentPath: ['Combat', 'Abilities'],
    depth: 2,
  });

  // Add core abilities
  data.coreAbilities.core_abilities.forEach((ability: any) => {
    results.push({
      id: `core-ability-${ability.name}`,
      title: `Core Ability: ${ability.name}`,
      shortTitle: ability.name,
      content: `${ability.description} ${ability.target} ${ability.apCost}`,
      type: 'rule',
      sectionId: 'core-abilities-table',
      parentPath: ['Combat', 'Abilities'],
      depth: 2,
    });
  });

  // Add class abilities with class metadata
  Object.entries(data.classAbilities.classes).forEach(([classId, classData]: [string, any]) => {
    // Add class header/metadata entry (high priority - table title)
    const classMetadataContent = [
      classData.type || '',
      classData.attributes || '',
      classData.summary || '',
    ].filter(Boolean).join(' ');

    results.push({
      id: `class-${classId}`,
      title: `Class: ${classData.name}`,
      shortTitle: classData.name,
      content: classMetadataContent,
      type: 'section',
      sectionId: `class-${classId}`,
      parentPath: ['Classes'],
      depth: 1,
    });

    // Add individual class abilities
    classData.abilities.forEach((ability: any) => {
      results.push({
        id: `class-ability-${classId}-${ability.name}`,
        title: `${classData.name} Ability: ${ability.name}`,
        shortTitle: ability.name,
        content: `${ability.description} ${ability.target} ${ability.apCost}`,
        type: 'rule',
        sectionId: `class-${classId}`,
        parentPath: [classData.name],
        depth: 1,
      });
    });
  });

  return results;
}

/**
 * Creates a Fuse.js instance for fuzzy searching with weighted fields
 */
export function createSearchEngine(searchIndex: SearchResult[]): Fuse<SearchResult> {
  return new Fuse(searchIndex, {
    keys: [
      { name: 'shortTitle', weight: 0.5 }, // Exact item/section name matches are most important
      { name: 'title', weight: 0.3 }, // Full title with path
      { name: 'content', weight: 0.2 }, // Content is least important
    ],
    threshold: 0.4, // Lower = more strict matching
    includeScore: true,
    minMatchCharLength: 2,
    ignoreLocation: true, // Don't penalize matches at different positions
    findAllMatches: true,
    // Boost exact matches in shortTitle
    shouldSort: true,
  });
}

/**
 * Calculates a custom relevance score for better prioritization
 */
function calculateRelevanceScore(
  result: SearchResult,
  query: string,
  fuseScore: number
): number {
  const queryLower = query.toLowerCase().trim();
  const shortTitleLower = (result.shortTitle || result.title).toLowerCase();
  const titleLower = result.title.toLowerCase();
  
  let score = fuseScore;
  
  // Boost exact title matches
  if (shortTitleLower === queryLower) {
    score *= 0.1; // Much better score
  } else if (shortTitleLower.startsWith(queryLower)) {
    score *= 0.3; // Good score for prefix matches
  } else if (shortTitleLower.includes(queryLower)) {
    score *= 0.5; // Decent score for substring matches
  }
  
  // Boost title matches over content matches
  if (titleLower.includes(queryLower)) {
    score *= 0.7;
  }
  
  // Prioritize table headers and class/group names (sections with type 'section')
  // These should appear before individual items
  if (result.type === 'section') {
    // Check if it's a table header (class, trait group, or table title)
    const isTableHeader = 
      result.id.startsWith('class-') ||
      result.id.startsWith('trait-group-') ||
      result.id.includes('-table') ||
      result.sectionId === result.id; // Section ID matches its own ID
    
    if (isTableHeader) {
      score *= 0.6; // Strong boost for table headers
    } else {
      score *= 0.8; // Moderate boost for other sections
    }
  }
  
  // Prefer more specific (deeper) results over parent sections
  // But don't penalize table headers too much
  if (result.depth !== undefined && result.depth > 0 && result.type !== 'section') {
    score *= (1 - result.depth * 0.05); // Small boost for depth
  }
  
  // Prefer shorter titles (more specific) over longer ones
  const titleLength = result.shortTitle?.length || result.title.length;
  if (titleLength < 30) {
    score *= 0.9; // Slight boost for concise titles
  }
  
  return score;
}

/**
 * Performs a search query with improved prioritization
 */
export function performSearch(
  query: string,
  searchEngine: Fuse<SearchResult>
): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const fuseResults = searchEngine.search(query);
  
  // Calculate custom relevance scores and sort
  const scoredResults = fuseResults.map((result) => ({
    item: result.item,
    relevanceScore: calculateRelevanceScore(result.item, query, result.score || 1),
  }));
  
  // Sort by relevance score (lower is better)
  scoredResults.sort((a, b) => a.relevanceScore - b.relevanceScore);
  
  return scoredResults.map((result) => result.item);
}

