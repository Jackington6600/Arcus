import { useState, useEffect, useMemo } from 'react';
import { createSearchEngine, performSearch, createSearchIndex } from '@/utils/search';
import type { SearchResult } from '@/types';
import { useData } from '@/contexts/DataContext';

interface SearchMenuProps {
  onSelect: (result: SearchResult) => void;
  className?: string;
  resetKey?: number; // When this changes, reset the search
}

/**
 * Search menu component with fuzzy search functionality
 */
export function SearchMenu({ onSelect, className = '', resetKey }: SearchMenuProps) {
  const { data } = useData();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  // Reset search when resetKey changes
  useEffect(() => {
    if (resetKey !== undefined) {
      setQuery('');
      setResults([]);
    }
  }, [resetKey]);

  // Create search engine when data is loaded
  const searchEngine = useMemo(() => {
    if (!data) return null;
    const searchIndex = createSearchIndex(data);
    return createSearchEngine(searchIndex);
  }, [data]);

  // Perform search when query changes
  useEffect(() => {
    if (!searchEngine || !query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = performSearch(query, searchEngine);
    setResults(searchResults.slice(0, 20)); // Limit to 20 results
  }, [query, searchEngine]);

  const handleSelect = (result: SearchResult) => {
    setQuery('');
    setResults([]);
    onSelect(result);
  };

  return (
    <div className={className}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search rules..."
          className="w-full px-4 py-2 bg-surface-secondary border border-border-light rounded-soft text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-text-tertiary hover:text-text-primary transition-smooth"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-2 max-h-96 overflow-y-auto bg-surface border border-border-light rounded-soft shadow-medium">
          {results.map((result, index) => {
            const displayTitle = result.shortTitle || result.title;
            const parentPath = result.parentPath || [];
            
            return (
              <button
                key={`${result.id}-${index}`}
                onClick={() => handleSelect(result)}
                className="w-full text-left px-4 py-3 hover:bg-surface-secondary border-b border-border-light last:border-b-0 transition-smooth"
              >
                {/* Main title */}
                <div className="text-sm font-semibold text-text-primary">
                  {displayTitle}
                </div>
                
                {/* Parent path breadcrumb */}
                {parentPath.length > 0 && (
                  <div className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{parentPath.join(' › ')}</span>
                  </div>
                )}
                
                {/* Content preview */}
                {result.content && (
                  <div className="text-xs text-text-tertiary mt-1 line-clamp-2">
                    {result.content}
                  </div>
                )}
                
                {/* Type indicator */}
                {result.type === 'rule' && (
                  <div className="text-xs text-text-tertiary mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Table item</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

