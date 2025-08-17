import React from 'react';
import SearchBar from './SearchBar';
import SearchResults, { SearchResult } from './SearchResults';

export interface MobileTableOfContentsProps {
	isOpen: boolean;
	onClose: () => void;
	query: string;
	onQueryChange: (query: string) => void;
	searchResults: SearchResult[];
	onSearchResultClick: (id: string) => void;
	onHeadingClick: (id: string) => void;
	title: string;
	searchPlaceholder?: string;
	children: React.ReactNode;
	className?: string;
}

export default function MobileTableOfContents({
	isOpen,
	onClose,
	query,
	onQueryChange,
	searchResults,
	onSearchResultClick,
	onHeadingClick,
	title,
	searchPlaceholder = "Search...",
	children,
	className = ""
}: MobileTableOfContentsProps) {
	return (
		<div className={`page-menu ${isOpen ? 'open' : ''} ${query ? 'searching' : ''} ${className}`}>
			<div className="menu-inner">
				<div className="sticky-header">
					<div className="accordion-header" onClick={onClose}>
						<strong>{title}</strong>
						<span aria-hidden>×</span>
					</div>
					<SearchBar
						query={query}
						onQueryChange={onQueryChange}
						placeholder={searchPlaceholder}
					/>
				</div>
				
				{query && (
					<div className="search-results-overlay">
						<SearchResults 
							results={searchResults} 
							onClear={() => onQueryChange('')} 
							onItemClick={(id) => { 
								onSearchResultClick(id); 
								onClose(); 
							}} 
						/>
					</div>
				)}
				
				{children}
			</div>
		</div>
	);
}
