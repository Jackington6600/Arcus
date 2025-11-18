import { Tooltip } from './Tooltip';
import { findTooltipMatches } from '@/utils/tooltipMatcher';
import type { TooltipsConfig } from '@/types';

interface TooltipTextProps {
  text: string;
  tooltips: TooltipsConfig['tooltips'];
}

/**
 * Component that processes text and wraps tooltip-able phrases with Tooltip components
 */
export function TooltipText({ text, tooltips }: TooltipTextProps) {
  // Handle edge cases
  if (!text || typeof text !== 'string') {
    return <>{text}</>;
  }
  
  if (!tooltips || !Array.isArray(tooltips) || tooltips.length === 0) {
    return <>{text}</>;
  }

  const matches = findTooltipMatches(text, tooltips);

  if (matches.length === 0) {
    return <>{text}</>;
  }

  // Sort matches by start index (ascending), then by length (descending) to prefer longer matches
  const sortedMatches = [...matches].sort((a, b) => {
    if (a.startIndex !== b.startIndex) {
      return a.startIndex - b.startIndex;
    }
    // If same start index, prefer longer match
    return b.endIndex - a.endIndex;
  });

  // Filter out overlapping matches - process in order and skip any that overlap with previous matches
  const nonOverlappingMatches: typeof matches = [];
  for (const match of sortedMatches) {
    const overlaps = nonOverlappingMatches.some(
      (existing) => match.startIndex < existing.endIndex && match.endIndex > existing.startIndex
    );
    
    if (!overlaps) {
      nonOverlappingMatches.push(match);
    }
  }

  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of nonOverlappingMatches) {
    // Add text before this match
    if (match.startIndex > lastIndex) {
      result.push(text.slice(lastIndex, match.startIndex));
    }

    // Add the tooltip-wrapped phrase
    result.push(
      <Tooltip key={match.startIndex} tooltipId={match.tooltipId}>
        {match.phrase}
      </Tooltip>
    );

    lastIndex = match.endIndex;
  }

  // Add any remaining text at the end
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return <>{result}</>;
}

