import React from 'react';
import SearchBar from './SearchBar';
import SearchResults, { SearchResult } from './SearchResults';
import { RuleSection, ClassesIndex } from '@/rules/rulesIndex';

export interface WikiHeading {
	id: string;
	level: number;
	text: string;
	sectionId: string;
}

export interface WikiTableOfContentsProps {
	headings: WikiHeading[];
	sections: RuleSection[];
	classes: ClassesIndex;
	activePageId: string;
	query: string;
	onQueryChange: (query: string) => void;
	searchResults: SearchResult[];
	onSearchResultClick: (id: string) => void;
	onHeadingClick: (id: string) => void;
	expandedSections: Set<string>;
	onToggleSection: (sectionId: string) => void;
	className?: string;
	title?: string;
	showSearch?: boolean;
	searchPlaceholder?: string;
}

export default function WikiTableOfContents({
	headings,
	sections,
	classes,
	activePageId,
	query,
	onQueryChange,
	searchResults,
	onSearchResultClick,
	onHeadingClick,
	expandedSections,
	onToggleSection,
	className = "",
	title = "Browse Wiki",
	showSearch = true,
	searchPlaceholder = "Search wiki..."
}: WikiTableOfContentsProps) {
	// Helper function to determine TOC item highlighting classes
	const getTocItemClasses = (itemId: string) => {
		if (activePageId === itemId) return 'active';
		
		// Check if this is a parent of the active page
		const activeHeading = headings.find(h => h.id === activePageId);
		if (!activeHeading) return '';
		
		// Check if this item is the section containing the active page
		if (itemId === activeHeading.sectionId) return 'parent-active';
		
		// Check if this is a grandparent (section containing the active page's section)
		const activeSection = sections.find(s => s.id === activeHeading.sectionId);
		if (activeSection && itemId === activeSection.id) return 'grandparent-active';
		
		return '';
	};

	// Helper function to determine section header highlighting classes
	const getSectionHeaderClasses = (sectionId: string) => {
		const baseClasses = expandedSections.has(sectionId) ? 'expanded' : '';
		
		if (activePageId === sectionId) return `${baseClasses} active`;
		
		// Check if this section contains the active page
		const activeHeading = headings.find(h => h.id === activePageId);
		if (!activeHeading) return baseClasses;
		
		if (activeHeading.sectionId === sectionId) return `${baseClasses} parent-active`;
		
		// Check if this section contains the active page's section
		const activeSection = sections.find(s => s.id === activeHeading.sectionId);
		if (activeSection && activeSection.id === sectionId) return `${baseClasses} grandparent-active`;
		
		return baseClasses;
	};

	// Helper function to render TOC children recursively
	const renderTocChildren = (children: any[] | undefined, level: number, onItemClick?: (id: string) => void) => {
		if (!children || !children.length) return null;
		return (
			<>
				{children.map((child) => (
					<div key={child.id}>
						<a
							href={`#${child.id}`}
							className={getTocItemClasses(child.id)}
							onClick={(e) => { 
								e.preventDefault(); 
								if (onItemClick) {
									onItemClick(child.id);
								} else {
									onHeadingClick(child.id);
								}
							}}
							style={{ paddingLeft: level * 10 }}
						>
							{child.title}
						</a>
						{/* Recursively render nested children */}
						{child.children && Array.isArray(child.children) && renderTocChildren(child.children, level + 1, onItemClick)}
					</div>
				))}
			</>
		);
	};

	return (
		<aside className={`toc ${query ? 'searching' : ''} ${className}`}>
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
			<div className="wiki-toc">
				{sections.map((section) => (
					<div key={section.id} className="toc-section">
						<div 
							className={`toc-section-header ${getSectionHeaderClasses(section.id)}`}
							onClick={() => onToggleSection(section.id)}
						>
							<span className="toc-section-title">{section.title}</span>
							<span className="toc-section-toggle">{expandedSections.has(section.id) ? '−' : '+'}</span>
						</div>
						{expandedSections.has(section.id) && (
							<div className="toc-section-content">
								<a
									href={`#${section.id}`}
									className={getTocItemClasses(section.id)}
									onClick={(e) => { e.preventDefault(); onHeadingClick(section.id); }}
								>
									{section.title}
								</a>
								{renderTocChildren(section.children, 3)}
								{/* Add class links if this is the classes section */}
								{/character classes/i.test(section.title) || section.id === 'classes' ? (
									Object.keys(classes || {}).map((key) => {
										const info = classes[key] as { name: string };
										return (
											<a
												key={`class-${key}`}
												href={`#class-${key}`}
												className={getTocItemClasses(`class-${key}`)}
												onClick={(e) => { e.preventDefault(); onHeadingClick(`class-${key}`); }}
												style={{ paddingLeft: 22 }}
											>
												{info?.name || key}
											</a>
										);
									})
								) : null}
							</div>
						)}
					</div>
				))}
			</div>
		</aside>
	);
}
