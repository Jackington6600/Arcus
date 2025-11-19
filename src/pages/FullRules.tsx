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

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Read hash from URL on mount and scroll to that element
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove the # symbol
    if (hash) {
      // Wait for headings to be loaded before scrolling
      const checkAndScroll = () => {
        const element = document.getElementById(hash);
        if (element) {
          isScrollingFromHashRef.current = true;
          const offset = 80; // Account for sticky header
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });

          // Highlight the element briefly
          element.classList.add('animate-highlight');
          setTimeout(() => {
            element.classList.remove('animate-highlight');
            isScrollingFromHashRef.current = false;
          }, 1000);
          return true; // Element found and scrolled
        }
        return false; // Element not found yet
      };

      // Try immediately, then retry with increasing delays to handle slow content loading
      if (!checkAndScroll()) {
        const timeout1 = setTimeout(() => {
          if (!checkAndScroll()) {
            // One more retry after content should definitely be loaded
            setTimeout(checkAndScroll, 1000);
          }
        }, 500);
        return () => clearTimeout(timeout1);
      }
    }
  }, [headings]);

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
    } else if (window.location.hash) {
      // Clear hash if no heading is active
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [currentHeadingId]);

  // Handle hash changes from browser navigation (back/forward buttons, direct URL entry)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          isScrollingFromHashRef.current = true;
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });

          // Highlight the element briefly
          element.classList.add('animate-highlight');
          setTimeout(() => {
            element.classList.remove('animate-highlight');
            isScrollingFromHashRef.current = false;
          }, 1000);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

