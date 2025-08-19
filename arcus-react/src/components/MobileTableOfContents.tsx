import React, { useEffect, useRef } from 'react';
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
	const menuRef = useRef<HTMLDivElement>(null);

	// Close on Escape key
	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen, onClose]);

	// Close when clicking outside
	useEffect(() => {
		if (!isOpen) return;
		
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, onClose]);

	return (
		<div className={`page-menu ${isOpen ? 'open' : ''} ${query ? 'searching' : ''} ${className}`} ref={menuRef}>
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
