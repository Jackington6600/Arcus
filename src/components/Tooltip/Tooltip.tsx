import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '@/contexts/DataContext';
import { getTooltipSummary } from '@/utils/tooltipMatcher';

interface TooltipProps {
  tooltipId: string;
  children: React.ReactNode;
}

/**
 * Tooltip component that displays summary text on hover/tap
 */
export function Tooltip({ tooltipId, children }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false); // Track when tooltip is ready to show
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const { data } = useData();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTapped, setIsTapped] = useState(false); // Track tap state for mobile

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const summary = data ? getTooltipSummary(tooltipId, data.mainRules) : null;
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  // Function to calculate optimal tooltip width based on available space
  const calculateOptimalWidth = useCallback((triggerRect: DOMRect, isMobileDevice: boolean, naturalWidth?: number): number => {
    const viewportWidth = window.innerWidth;
    const margin = 20; // Minimum margin from viewport edges
    
    // Base max widths: wider on desktop, narrower on mobile
    const baseMaxWidth = isMobileDevice ? 280 : 400; // Mobile: ~280px, Desktop: ~400px
    const idealMaxWidth = isMobileDevice ? 320 : 500; // Mobile: ~320px, Desktop: ~500px
    
    // Calculate available horizontal space around trigger
    const spaceLeft = triggerRect.left - margin;
    const spaceRight = viewportWidth - triggerRect.right - margin;
    const maxAvailableSpace = Math.max(spaceLeft, spaceRight) * 2; // Space on both sides
    
    // Start with natural width if available, otherwise use ideal
    const preferredWidth = naturalWidth || idealMaxWidth;
    
    // Constrain to available space and ideal max width
    const optimalWidth = Math.min(
      preferredWidth,
      idealMaxWidth,
      Math.max(baseMaxWidth, maxAvailableSpace)
    );
    
    return Math.max(baseMaxWidth, optimalWidth);
  }, []);

  // Function to calculate and set tooltip position and size
  const calculatePosition = useCallback(() => {
    if (!tooltipRef.current || !triggerRef.current) return;

    // Get positions relative to viewport (not parent, since we're using portal)
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // Get natural tooltip width if already rendered
    const naturalWidth = tooltipRect.width > 0 ? tooltipRect.width : undefined;
    
    // Calculate optimal width based on available space
    const optimalWidth = calculateOptimalWidth(triggerRect, isMobile, naturalWidth);

    // Calculate available space in all directions
    const spaceAbove = triggerRect.top;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const padding = 8; // Space between trigger and tooltip
    
    // Estimate tooltip height based on current or optimal width
    // Use actual height if available, otherwise estimate based on width
    const estimatedTooltipHeight = tooltipRect.height > 0 
      ? tooltipRect.height 
      : Math.max(100, (optimalWidth / 10) * 3); // Rough estimate: ~3 lines per 10px width
    
    // Determine if tooltip should be above or below
    // Prefer below, but use above if there's significantly more space above
    // Allow overlap if necessary (when space is very limited)
    const spaceBelowWithPadding = spaceBelow - padding;
    const spaceAboveWithPadding = spaceAbove - padding;
    const canFitBelow = spaceBelowWithPadding >= estimatedTooltipHeight;
    const canFitAbove = spaceAboveWithPadding >= estimatedTooltipHeight;
    
    let shouldBeAbove = false;
    if (!canFitBelow && canFitAbove) {
      shouldBeAbove = true;
    } else if (canFitBelow && canFitAbove) {
      // Both fit, prefer below but use above if significantly more space
      shouldBeAbove = spaceAbove > spaceBelow + 100;
    } else if (!canFitBelow && !canFitAbove) {
      // Neither fits perfectly, use whichever has more space (allow overlap)
      shouldBeAbove = spaceAbove > spaceBelow;
    }

    // Calculate horizontal position relative to viewport (since we're using portal)
    // Center tooltip on trigger text
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    
    // Calculate desired tooltip center (same as trigger center)
    const desiredTooltipCenterX = triggerCenterX;
    
    // Use optimal width for calculations
    const tooltipWidthToUse = optimalWidth;
    
    // Calculate left position relative to viewport to center tooltip on trigger
    const leftRelativeToViewport = desiredTooltipCenterX - tooltipWidthToUse / 2;
    
    // Ensure tooltip stays within viewport bounds with margin
    // Allow slight overlap if necessary for readability
    const viewportMargin = 10;
    const viewportLeft = desiredTooltipCenterX - tooltipWidthToUse / 2;
    const viewportRight = desiredTooltipCenterX + tooltipWidthToUse / 2;
    const minViewportLeft = viewportMargin;
    const maxViewportRight = window.innerWidth - viewportMargin;
    
    let adjustedLeft = leftRelativeToViewport;
    
    // Adjust if tooltip would go off-screen to the left
    if (viewportLeft < minViewportLeft) {
      const adjustment = minViewportLeft - viewportLeft;
      adjustedLeft = leftRelativeToViewport + adjustment;
    }
    
    // Adjust if tooltip would go off-screen to the right
    if (viewportRight > maxViewportRight) {
      const adjustment = viewportRight - maxViewportRight;
      adjustedLeft = leftRelativeToViewport - adjustment;
    }
    
    // Final check: if tooltip still extends beyond viewport, allow minimal overlap
    // but try to keep as much visible as possible
    if (adjustedLeft < 0) {
      adjustedLeft = 5; // Keep 5px visible
    }
    if (adjustedLeft + tooltipWidthToUse > window.innerWidth) {
      adjustedLeft = window.innerWidth - tooltipWidthToUse - 5; // Keep 5px visible
    }

    // Calculate vertical position relative to viewport
    const topPosition = shouldBeAbove 
      ? triggerRect.top - estimatedTooltipHeight - padding
      : triggerRect.bottom + padding;
    
    // Set the position and max width
    // Use maxWidth instead of width to allow tooltip to be narrower if content is shorter
    // Position relative to viewport since we're using portal
    setTooltipStyle({
      position: 'fixed', // Fixed positioning relative to viewport
      left: `${adjustedLeft}px`,
      top: `${topPosition}px`,
      transform: 'none',
      maxWidth: `${tooltipWidthToUse}px`,
      minWidth: isMobile ? '280px' : '400px', // Ensure minimum readable width
      opacity: 1, // Make visible once positioned
    });
    
    // Mark as positioned so it can be shown
    setIsPositioned(true);
  }, [isMobile, calculateOptimalWidth]);

  useEffect(() => {
    if (!isOpen) {
      setIsPositioned(false);
      return;
    }

    // Reset positioning state when opening
    setIsPositioned(false);
    setTooltipStyle({ opacity: 0 }); // Start invisible

    // Wait for tooltip to be rendered in DOM, then calculate position
    // Use multiple requestAnimationFrame calls to ensure DOM is ready
    requestAnimationFrame(() => {
      if (!tooltipRef.current || !triggerRef.current) {
        // If refs aren't ready, try again
        requestAnimationFrame(() => {
          if (tooltipRef.current && triggerRef.current) {
            calculatePosition();
            // Recalculate once more after width is set to ensure accurate positioning
            requestAnimationFrame(() => {
              calculatePosition();
            });
          }
        });
        return;
      }
      
      calculatePosition();
      // Recalculate once more after width is set to ensure accurate positioning
      requestAnimationFrame(() => {
        calculatePosition();
      });
    });
  }, [isOpen, summary, calculatePosition]);

  // Recalculate position on window resize
  useEffect(() => {
    if (!isOpen) return;

    function handleResize() {
      requestAnimationFrame(() => {
        calculatePosition();
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, calculatePosition]);

  // Handle mobile tap interactions
  useEffect(() => {
    if (!isMobile || !isOpen) {
      setIsTapped(false);
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsTapped(false);
      }
    }

    function handleScroll() {
      // Only close on scroll if it was opened by tap, not hover
      if (isTapped) {
        setIsOpen(false);
        setIsTapped(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isMobile, isOpen, isTapped]);

  // Always show the underline - only show tooltip popup if summary exists
  // This ensures tooltips are visible even if the section doesn't have a summary field

  // Handle hover for both desktop and mobile (mobile devices with cursor support)
  const handleMouseEnter = () => {
    if (summary) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    // Only close on mouse leave if not tapped (tap takes precedence)
    if (!isTapped) {
      setIsOpen(false);
    }
  };

  // Handle tap/click for mobile
  const handleClick = () => {
    if (summary) {
      if (isOpen && isTapped) {
        // Close if already open from tap
        setIsOpen(false);
        setIsTapped(false);
      } else {
        // Open and mark as tapped
        setIsOpen(true);
        setIsTapped(true);
      }
    }
  };

  return (
    <span className="relative inline-block">
      <span
        ref={triggerRef}
        className="underline decoration-dotted decoration-accent cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}
      </span>
      {isOpen && summary && createPortal(
        <div
          ref={tooltipRef}
          className={`
            fixed z-[9999] px-4 py-3 bg-surface border border-border-light rounded-soft shadow-strong
            text-sm text-text-primary whitespace-normal break-words tooltip-content
            transition-opacity duration-150
          `}
          style={{
            ...tooltipStyle,
            maxHeight: isMobile ? '70vh' : '80vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            lineHeight: '1.5',
            opacity: isPositioned ? 1 : 0, // Fade in once positioned
            pointerEvents: isPositioned ? 'auto' : 'none', // Prevent interaction until positioned
          }}
        >
          {summary}
        </div>,
        document.body
      )}
    </span>
  );
}

