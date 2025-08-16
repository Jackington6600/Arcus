import { PropsWithChildren, useEffect, useLayoutEffect, useRef, useState } from 'react';

type TooltipProps = PropsWithChildren<{
    title: string;
    description?: string;
    variant?: 'inline' | 'tag';
}>;

type BubblePosition = { top: number; left: number; placement: 'above' | 'below' } | null;

export default function Tooltip({ title, description, children, variant = 'inline' }: TooltipProps) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState<BubblePosition>(null);
    const containerRef = useRef<HTMLSpanElement>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const touchStartTime = useRef(0);
    const isTouchInteraction = useRef(false);
    
    const handleMouseEnter = () => {
        // Only open on mouse enter if we haven't been touching
        if (!isTouchInteraction.current) {
            setOpen(true);
        }
    };
    
    const handleMouseLeave = () => {
        // Only close on mouse leave if we haven't been touching
        if (!isTouchInteraction.current) {
            setOpen(false);
        }
    };
    
    const handleTouchStart = () => {
        touchStartTime.current = Date.now();
        isTouchInteraction.current = true;
    };
    
    const handleTouchEnd = () => {
        const touchDuration = Date.now() - touchStartTime.current;
        // Only toggle if it's a quick tap (less than 300ms) to avoid conflicts with long press
        if (touchDuration < 300) {
            setOpen(prev => !prev);
        }
        // Reset touch interaction flag after a short delay to allow mouse events to work
        setTimeout(() => {
            isTouchInteraction.current = false;
        }, 100);
    };
    
    const handleClick = (e: React.MouseEvent) => {
        // Prevent click from interfering with touch events
        e.preventDefault();
        e.stopPropagation();
    };
    
    // Close tooltip when clicking outside or scrolling
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        
        const handleTouchStartOutside = (event: TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        
        const handleScroll = () => {
            setOpen(false);
        };
        
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleTouchStartOutside);
            window.addEventListener('scroll', handleScroll, true);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleTouchStartOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [open]);
    
    useAutoPosition(open, containerRef, bubbleRef, setPos);
    
    return (
        <span
            className="tooltip"
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
            aria-haspopup="true"
            aria-expanded={open}
        >
            <span className={variant === 'tag' ? 'tag' : 'hint'}>{children}</span>
            {open && (
                <div
                    role="tooltip"
                    className={`tooltip-bubble tooltip-bubble-fixed ${pos?.placement === 'above' ? 'tooltip-in-up' : 'tooltip-in-down'}`}
                    ref={bubbleRef}
                    style={pos ? { position: 'fixed', top: pos.top, left: pos.left, bottom: 'auto', maxWidth: 'min(320px, calc(100vw - 16px))' } : undefined}
                >
                    <strong>{title}</strong>
                    {description && <span className="tooltip-desc" style={{ display: 'block', marginTop: 6 }}>{description}</span>}
                </div>
            )}
        </span>
    );
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

function useAutoPosition(open: boolean, containerRef: React.RefObject<HTMLElement>, bubbleRef: React.RefObject<HTMLElement>, setPos: (p: BubblePosition) => void) {
    useLayoutEffect(() => {
        if (!open) { setPos(null); return; }
        const update = () => {
            const container = containerRef.current;
            const bubble = bubbleRef.current;
            if (!container || !bubble) return;
            const tRect = container.getBoundingClientRect();
            // Measure bubble in its natural layout to get size
            const prevVis = bubble.style.visibility;
            bubble.style.visibility = 'hidden';
            const bRect = bubble.getBoundingClientRect();
            bubble.style.visibility = prevVis;

            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const spaceAbove = tRect.top;
            const spaceBelow = vh - tRect.bottom;
            const placeAbove = spaceAbove >= bRect.height + 2 || spaceAbove >= spaceBelow;
            const top = placeAbove ? (tRect.top - bRect.height - 2) : (tRect.bottom + 2);
            const left = clamp(tRect.left + tRect.width / 2 - bRect.width / 2, 8, vw - bRect.width - 8);
            setPos({ top, left, placement: placeAbove ? 'above' : 'below' });
        };
        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [open, containerRef, bubbleRef, setPos]);
}

// Hook usage inside component
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _useHookExample(open: boolean) {
    // no-op placeholder to satisfy lints if needed
}



