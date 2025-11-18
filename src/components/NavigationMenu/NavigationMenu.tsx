import { useState, useEffect, useRef } from 'react';
import { SearchMenu } from '../SearchMenu/SearchMenu';
import { Overlay } from '../shared/Overlay';
import { useNavigationMenu } from '@/contexts/NavigationMenuContext';
import type { SearchResult } from '@/types';

export interface Heading {
  id: string;
  title: string;
  level: number;
  element?: HTMLElement;
}

interface NavigationMenuProps {
  headings: Heading[];
  currentHeadingId: string | null;
  onHeadingClick: (id: string) => void;
  onSearchSelect: (result: SearchResult) => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

/**
 * Navigation menu component that displays heading tree and search
 */
export function NavigationMenu({
  headings,
  currentHeadingId,
  onHeadingClick,
  onSearchSelect,
  isMobile: isMobileProp,
  onMobileClose,
}: NavigationMenuProps) {
  const [isMobileState, setIsMobileState] = useState(window.innerWidth < 768);
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileState;
  const { isOpen, openMenu, closeMenu } = useNavigationMenu();
  const [searchResetKey, setSearchResetKey] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const currentHeadingRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isMobileProp === undefined) {
      function handleResize() {
        setIsMobileState(window.innerWidth < 768);
        if (window.innerWidth >= 768) {
          closeMenu();
        }
      }

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isMobileProp, closeMenu]);

  // Scroll current heading into view when it changes
  useEffect(() => {
    if (!isMobile && currentHeadingId && currentHeadingRef.current && navRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (!currentHeadingRef.current || !navRef.current) return;
        
        const navRect = navRef.current.getBoundingClientRect();
        const headingRect = currentHeadingRef.current.getBoundingClientRect();
        const navTop = navRect.top;
        const navBottom = navRect.bottom;
        const headingTop = headingRect.top;
        const headingBottom = headingRect.bottom;
        
        // Check if heading is outside visible area
        if (headingTop < navTop || headingBottom > navBottom) {
          // Scroll to center the heading in the visible area
          const navHeight = navRect.height;
          const headingHeight = headingRect.height;
          const scrollOffset = headingTop - navTop - (navHeight / 2) + (headingHeight / 2);
          
          navRef.current.scrollBy({
            top: scrollOffset,
            behavior: 'smooth',
          });
        }
      });
    }
  }, [currentHeadingId, isMobile]);

  const getParentHeadingIds = (headingId: string): string[] => {
    const parents: string[] = [];
    const headingIndex = headings.findIndex((h) => h.id === headingId);
    if (headingIndex === -1) return parents;

    const heading = headings[headingIndex];
    let currentLevel = heading.level;

    for (let i = headingIndex - 1; i >= 0; i--) {
      if (headings[i].level < currentLevel) {
        parents.push(headings[i].id);
        currentLevel = headings[i].level;
      }
    }

    return parents;
  };

  const parentIds = currentHeadingId ? getParentHeadingIds(currentHeadingId) : [];

  const handleClose = () => {
    closeMenu();
    setSearchResetKey((prev) => prev + 1); // Reset search when closing
    onMobileClose?.();
  };

  const handleHeadingClick = (id: string) => {
    onHeadingClick(id);
    if (isMobile) {
      handleClose();
    }
  };

  const handleSearchSelect = (result: SearchResult) => {
    onSearchSelect(result);
    if (isMobile) {
      handleClose();
    }
  };

  // Desktop view
  if (!isMobile) {
    return (
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-secondary border-r border-border-light flex flex-col z-30">
        <div className="p-4 pb-2 border-b border-border-light bg-surface-secondary sticky top-0 z-10">
          <SearchMenu onSelect={handleSearchSelect} resetKey={searchResetKey} />
        </div>
        <div ref={navRef} className="flex-1 overflow-y-auto p-4 pt-2">
          <nav className="space-y-1">
            {headings.map((heading) => {
              const isCurrent = heading.id === currentHeadingId;
              const isParent = parentIds.includes(heading.id);

              return (
                <button
                  key={heading.id}
                  ref={isCurrent ? currentHeadingRef : null}
                  onClick={() => handleHeadingClick(heading.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded-soft text-sm transition-smooth
                    ${
                      isCurrent
                        ? 'bg-accent text-surface font-semibold'
                        : isParent
                        ? 'bg-surface-tertiary text-text-primary font-medium'
                        : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                    }
                  `}
                  style={{ paddingLeft: `${heading.level * 0.75 + 0.75}rem` }}
                >
                  {heading.title}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    );
  }

  // Mobile view - floating button and overlay
  return (
    <>
      {!isOpen && (
        <button
          onClick={openMenu}
          className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-accent text-surface rounded-full shadow-strong flex items-center justify-center hover:bg-opacity-90 transition-smooth"
          aria-label="Open navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {isOpen && (
        <button
          onClick={handleClose}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-accent text-surface rounded-full shadow-strong flex items-center justify-center hover:bg-opacity-90 transition-smooth"
          aria-label="Close navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <Overlay isOpen={isOpen} onClose={handleClose}>
        <div className="h-full bg-surface">
          <div className="flex items-center justify-between h-16 px-4 border-b border-border-light">
            <span className="text-xl font-semibold text-text-primary">Navigation</span>
            <button
              onClick={handleClose}
              className="p-2 rounded-soft text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-smooth"
              aria-label="Close navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <SearchMenu onSelect={handleSearchSelect} className="mb-4" resetKey={searchResetKey} />
            <nav className="space-y-1">
              {headings.map((heading) => {
                const isCurrent = heading.id === currentHeadingId;
                const isParent = parentIds.includes(heading.id);

                return (
                  <button
                    key={heading.id}
                    onClick={() => handleHeadingClick(heading.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-soft text-base transition-smooth
                      ${
                        isCurrent
                          ? 'bg-accent text-surface font-semibold'
                          : isParent
                          ? 'bg-surface-tertiary text-text-primary font-medium'
                          : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                      }
                    `}
                    style={{ paddingLeft: `${heading.level * 0.75 + 0.75}rem` }}
                  >
                    {heading.title}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </Overlay>
    </>
  );
}

