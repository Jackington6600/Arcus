import { Tooltip } from './Tooltip';
import { findTooltipMatches } from '@/utils/tooltipMatcher';
import type { TooltipsConfig } from '@/types';

interface TooltipTextProps {
  text: string;
  tooltips: TooltipsConfig['tooltips'];
  formats?: ('bold' | 'italic')[];
}

/**
 * Helper function to apply formatting to text content
 */
function applyFormatting(content: React.ReactNode, formats?: ('bold' | 'italic')[]): React.ReactNode {
  if (!formats || formats.length === 0) {
    return content;
  }
  
  let formatted: React.ReactNode = content;
  formats.forEach((format) => {
    if (format === 'bold') {
      formatted = <strong>{formatted}</strong>;
    } else if (format === 'italic') {
      formatted = <em className="italic" style={{ fontStyle: 'italic' }}>{formatted}</em>;
    }
  });
  
  return formatted;
}

/**
 * Component that processes text and wraps tooltip-able phrases with Tooltip components
 * Supports formatting options that are applied to text segments
 */
export function TooltipText({ text, tooltips, formats }: TooltipTextProps) {
  // Handle edge cases
  if (!text || typeof text !== 'string') {
    return <>{text}</>;
  }
  
  if (!tooltips || !Array.isArray(tooltips) || tooltips.length === 0) {
    // No tooltips, but still apply formatting if provided
    return <>{applyFormatting(text, formats)}</>;
  }

  const matches = findTooltipMatches(text, tooltips);

  // If no matches, just apply formatting and return
  if (matches.length === 0) {
    return <>{applyFormatting(text, formats)}</>;
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
    // Add text before this match (with formatting applied)
    if (match.startIndex > lastIndex) {
      const textSegment = text.slice(lastIndex, match.startIndex);
      result.push(applyFormatting(textSegment, formats));
    }

    // Add the tooltip-wrapped phrase (formatting applied to the phrase inside Tooltip)
    result.push(
      <Tooltip key={match.startIndex} tooltipId={match.tooltipId}>
        {applyFormatting(match.phrase, formats)}
      </Tooltip>
    );

    lastIndex = match.endIndex;
  }

  // Add any remaining text at the end (with formatting applied)
  if (lastIndex < text.length) {
    const textSegment = text.slice(lastIndex);
    result.push(applyFormatting(textSegment, formats));
  }

  return <>{result}</>;
}

