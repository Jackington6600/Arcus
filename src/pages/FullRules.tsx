import { useState, useCallback, useEffect, useRef } from 'react';
import { MainMenuBar } from '@/components/MainMenuBar/MainMenuBar';
import { NavigationMenu } from '@/components/NavigationMenu/NavigationMenu';
import { MainContent } from '@/components/MainContent/MainContent';
import { NavigationMenuProvider } from '@/contexts/NavigationMenuContext';
import type { Heading, SearchResult } from '@/types';

/**
 * Full Rules page component
 */
export function FullRules() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [currentHeadingId, setCurrentHeadingId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const isScrollingFromHashRef = useRef(false);
  const isScrollingProgrammaticallyRef = useRef(false);
  const initialHashRef = useRef<string | null>(null);
  const hasProcessedInitialHashRef = useRef(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to scroll to hash element
  const scrollToHash = useCallback((hash: string, behavior: ScrollBehavior = 'smooth') => {
    const element = document.getElementById(hash);
    if (element) {
      isScrollingFromHashRef.current = true;
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior,
      });

      // Highlight the element briefly
      element.classList.add('animate-highlight');
      setTimeout(() => {
        element.classList.remove('animate-highlight');
        isScrollingFromHashRef.current = false;
      }, 1000);
      return true;
    }
    return false;
  }, []);

  // Check for hash on initial mount and scroll to it
  // This runs independently of headings loading to handle page refreshes
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      // Store the initial hash so we don't clear it prematurely
      initialHashRef.current = hash;
      
      // Try to scroll immediately (in case content is already loaded)
      if (scrollToHash(hash, 'auto')) {
        hasProcessedInitialHashRef.current = true;
      } else {
        // If element not found, wait a bit and retry
        // This handles the case where content is still loading
        const timeout1 = setTimeout(() => {
          if (scrollToHash(hash, 'smooth')) {
            hasProcessedInitialHashRef.current = true;
          } else {
            // One more retry after content should definitely be loaded
            setTimeout(() => {
              if (scrollToHash(hash, 'smooth')) {
                hasProcessedInitialHashRef.current = true;
              }
            }, 1000);
          }
        }, 100);
        return () => clearTimeout(timeout1);
      }
    } else {
      hasProcessedInitialHashRef.current = true;
    }
  }, []); // Run only on mount

  // Also check for hash when headings are loaded (in case content wasn't ready on mount)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && headings.length > 0 && !hasProcessedInitialHashRef.current) {
      // Only scroll if we haven't already scrolled from hash
      if (!isScrollingFromHashRef.current) {
        if (scrollToHash(hash, 'smooth')) {
          hasProcessedInitialHashRef.current = true;
        }
      }
    }
  }, [headings, scrollToHash]);

  // Update URL hash when currentHeadingId changes (but not when scrolling from hash)
  useEffect(() => {
    if (isScrollingFromHashRef.current || isScrollingProgrammaticallyRef.current) {
      return;
    }

    if (currentHeadingId) {
      const newHash = `#${currentHeadingId}`;
      if (window.location.hash !== newHash) {
        // Use replaceState to avoid cluttering browser history
        window.history.replaceState(null, '', newHash);
      }
      // Mark that we've processed the initial hash if it matches
      if (initialHashRef.current === currentHeadingId) {
        hasProcessedInitialHashRef.current = true;
      }
    } else if (window.location.hash && hasProcessedInitialHashRef.current && headings.length > 0) {
      // Only clear hash if:
      // 1. We've processed the initial hash navigation (content has loaded)
      // 2. Headings have been loaded (so we know there's content)
      // 3. No heading is currently active (user scrolled away from all headings)
      // This prevents clearing the hash prematurely during initial page load
      const currentHash = window.location.hash.slice(1);
      // Don't clear if this is the initial hash we're navigating to
      if (currentHash !== initialHashRef.current) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, [currentHeadingId, headings.length]);

  // Handle hash changes from browser navigation (back/forward buttons, direct URL entry)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        // Update the initial hash reference for new navigation
        initialHashRef.current = hash;
        hasProcessedInitialHashRef.current = false;
        scrollToHash(hash, 'smooth');
      } else {
        // Hash was removed
        initialHashRef.current = null;
        hasProcessedInitialHashRef.current = true;
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [scrollToHash]);

  const handleHeadingClick = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      isScrollingProgrammaticallyRef.current = true;
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Update URL hash
      window.history.replaceState(null, '', `#${id}`);

      // Highlight the section briefly
      element.classList.add('animate-highlight');
      setTimeout(() => {
        element.classList.remove('animate-highlight');
        isScrollingProgrammaticallyRef.current = false;
      }, 1000);
    }
  }, []);

  const handleSearchSelect = useCallback(
    (result: SearchResult) => {
      // For rules (table items), try to navigate to the specific row first
      if (result.type === 'rule') {
        // First, try to scroll to the specific row
        const rowElement = document.getElementById(result.id);
        if (rowElement) {
          isScrollingProgrammaticallyRef.current = true;
          const offset = 80;
          const elementPosition = rowElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });

          // Update URL hash
          window.history.replaceState(null, '', `#${result.id}`);

          // Highlight the row
          rowElement.classList.add('animate-highlight');
          setTimeout(() => {
            rowElement.classList.remove('animate-highlight');
            isScrollingProgrammaticallyRef.current = false;
          }, 2000);
          return;
        }

        // If row not found, navigate to the parent section/table
        if (result.sectionId) {
          const targetId = result.sectionId;
          const heading = headings.find((h) => h.id === targetId);
          if (heading) {
            handleHeadingClick(heading.id);
            // After scrolling to section, try to find the row again (in case it wasn't rendered yet)
            setTimeout(() => {
              const delayedRowElement = document.getElementById(result.id);
              if (delayedRowElement) {
                isScrollingProgrammaticallyRef.current = true;
                const offset = 80;
                const elementPosition = delayedRowElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                });
                // Update URL hash
                window.history.replaceState(null, '', `#${result.id}`);
                delayedRowElement.classList.add('animate-highlight');
                setTimeout(() => {
                  delayedRowElement.classList.remove('animate-highlight');
                  isScrollingProgrammaticallyRef.current = false;
                }, 2000);
              }
            }, 500);
            return;
          }

          // Fallback: scroll to section element directly
          const sectionElement = document.getElementById(targetId);
          if (sectionElement) {
            isScrollingProgrammaticallyRef.current = true;
            const offset = 80;
            const elementPosition = sectionElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });

            // Update URL hash
            window.history.replaceState(null, '', `#${targetId}`);

            sectionElement.classList.add('animate-highlight');
            setTimeout(() => {
              sectionElement.classList.remove('animate-highlight');
              isScrollingProgrammaticallyRef.current = false;
            }, 1000);
            return;
          }
        }
      }

      // For sections, navigate directly to that section
      const targetId = result.id;
      const heading = headings.find((h) => h.id === targetId);
      if (heading) {
        handleHeadingClick(heading.id);
        return;
      }

      // Fallback: scroll to the element directly
      const element = document.getElementById(targetId);
      if (element) {
        isScrollingProgrammaticallyRef.current = true;
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });

        // Update URL hash
        window.history.replaceState(null, '', `#${targetId}`);

        element.classList.add('animate-highlight');
        setTimeout(() => {
          element.classList.remove('animate-highlight');
          isScrollingProgrammaticallyRef.current = false;
        }, 1000);
      }
    },
    [headings, handleHeadingClick]
  );

  return (
    <NavigationMenuProvider>
      <div className="min-h-screen flex flex-col bg-surface">
        <MainMenuBar />
        <div className="flex flex-1">
          {!isMobile && (
            <NavigationMenu
              headings={headings}
              currentHeadingId={currentHeadingId}
              onHeadingClick={handleHeadingClick}
              onSearchSelect={handleSearchSelect}
            />
          )}
          <main
            className={`flex-1 transition-smooth min-w-0 ${
              !isMobile ? 'ml-64' : ''
            }`}
          >
            <MainContent
              onHeadingsChange={setHeadings}
              onCurrentHeadingChange={setCurrentHeadingId}
            />
          </main>
          {isMobile && (
            <NavigationMenu
              headings={headings}
              currentHeadingId={currentHeadingId}
              onHeadingClick={handleHeadingClick}
              onSearchSelect={handleSearchSelect}
            />
          )}
        </div>
      </div>
    </NavigationMenuProvider>
  );
}

