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
    const toggle = () => setOpen((v) => !v);
    useAutoPosition(open, containerRef, bubbleRef, setPos);
    return (
        <span
            className="tooltip"
            ref={containerRef}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onClick={toggle}
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
                    {description && <div className="tooltip-desc" style={{ marginTop: 6 }}>{description}</div>}
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
            const placeAbove = spaceAbove >= bRect.height + 8 || spaceAbove >= spaceBelow;
            const top = placeAbove ? (tRect.top - bRect.height - 8) : (tRect.bottom + 8);
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



