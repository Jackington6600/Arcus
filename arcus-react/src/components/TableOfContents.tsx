import React from 'react';
import SearchBar from './SearchBar';
import SearchResults, { SearchResult } from './SearchResults';

export interface Heading {
	id: string;
	level: number;
	text: string;
	sectionId?: string;
}

export interface TableOfContentsProps {
	headings: Heading[];
	query: string;
	onQueryChange: (query: string) => void;
	searchResults: SearchResult[];
	onSearchResultClick: (id: string) => void;
	onHeadingClick: (id: string) => void;
	className?: string;
	title?: string;
	showSearch?: boolean;
	searchPlaceholder?: string;
	getItemClasses?: (itemId: string) => string;
}

export default React.forwardRef<HTMLDivElement, TableOfContentsProps>(
	function TableOfContents({
		headings,
		query,
		onQueryChange,
		searchResults,
		onSearchResultClick,
		onHeadingClick,
		className = "",
		title = "On this page",
		showSearch = true,
		searchPlaceholder = "Search...",
		getItemClasses
	}, ref) {
	return (
		<aside className={`toc ${query ? 'searching' : ''} ${className}`} ref={ref}>
			{showSearch && (
				<SearchBar
					query={query}
					onQueryChange={onQueryChange}
					placeholder={searchPlaceholder}
				/>
			)}
			
			{/* Floating search results container */}
			{query && (
				<div className="search-results-overlay">
					<SearchResults 
						results={searchResults} 
						onClear={() => onQueryChange('')} 
						onItemClick={onSearchResultClick} 
					/>
				</div>
			)}
			
			<h4>{title}</h4>
			{headings.map((h) => (
				<a
					key={h.id}
					href={`#${h.id}`}
					className={getItemClasses ? getItemClasses(h.id) : ''}
					style={{ paddingLeft: Math.max(10, (h.level - 2) * 12 + 10) }}
					onClick={(e) => {
						e.preventDefault();
						onHeadingClick(h.id);
					}}
				>
					{h.text}
				</a>
			))}
		</aside>
	);
	}
);
