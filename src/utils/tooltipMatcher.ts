import type { TooltipsConfig, MainRules } from '@/types';

/**
 * Finds all tooltip phrases in text and returns matches with their positions
 */
export interface TooltipMatch {
  phrase: string;
  tooltipId: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Creates a regex pattern from tooltip phrases (case-insensitive, word boundaries)
 */
function createTooltipRegex(tooltips: TooltipsConfig['tooltips']): RegExp {
  const patterns = tooltips.flatMap((tooltip) =>
    tooltip.phrases.map((phrase) => `\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
  );
  return new RegExp(`(${patterns.join('|')})`, 'gi');
}

/**
 * Finds tooltip matches in text
 */
export function findTooltipMatches(
  text: string,
  tooltips: TooltipsConfig['tooltips']
): TooltipMatch[] {
  const matches: TooltipMatch[] = [];
  const regex = createTooltipRegex(tooltips);

  let match;
  while ((match = regex.exec(text)) !== null) {
    const matchedPhrase = match[0];
    // Find which tooltip config this phrase belongs to
    const tooltipConfig = tooltips.find((t) =>
      t.phrases.some((p) => p.toLowerCase() === matchedPhrase.toLowerCase())
    );

    if (tooltipConfig) {
      matches.push({
        phrase: matchedPhrase,
        tooltipId: tooltipConfig.id,
        startIndex: match.index,
        endIndex: match.index + matchedPhrase.length,
      });
    }
  }

  return matches;
}

/**
 * Gets the summary text for a tooltip ID from main rules
 */
export function getTooltipSummary(
  tooltipId: string,
  mainRules: MainRules
): string | null {
  function findSectionById(sections: MainRules['sections'], id: string): MainRules['sections'][0] | null {
    for (const section of sections) {
      if (section.id === id) {
        return section;
      }
      if (section.children) {
        const found = findSectionById(section.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  const section = findSectionById(mainRules.sections, tooltipId);
  if (!section) return null;
  
  // Return summary if available (preferred for tooltips as it's concise)
  if (section.summary) return section.summary;
  
  // Otherwise, use body text (first paragraph if array, or the string itself)
  // Truncate if too long for tooltip display
  if (section.body) {
    let bodyText: string;
    if (Array.isArray(section.body)) {
      bodyText = section.body[0] || '';
    } else {
      bodyText = section.body;
    }
    
    // Truncate to reasonable length for tooltip (max ~200 characters)
    if (bodyText.length > 200) {
      return bodyText.substring(0, 197) + '...';
    }
    return bodyText;
  }
  
  // Fallback to title
  return section.title || null;
}

