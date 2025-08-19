import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import rules from '@/rules/rulesIndex';
import { TOOLTIP_MAP, WIKI_LINK_MAP } from '@/rules/rulesIndex';
import Tooltip from '@/components/Tooltip';
import ClassTable from '@/pages/components/ClassTable';
import WikiTableOfContents, { WikiHeading } from '@/components/WikiTableOfContents';
import MobileTableOfContents from '@/components/MobileTableOfContents';
import DocumentContent from '@/components/DocumentContent';
import TocToggleButton from '@/components/TocToggleButton';
import { SearchResult } from '@/components/SearchResults';
import { renderBodyContent } from '@/utils/contentRenderer';

export default function Wiki() {
	const location = useLocation();
	const containerRef = useRef<HTMLDivElement>(null);
	const [activePageId, setActivePageId] = useState<string>('');
	const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const [query, setQuery] = useState('');
	
	// Add layout-page class to body to prevent scrolling
	useEffect(() => {
		document.body.classList.add('layout-page');
		return () => {
			document.body.classList.remove('layout-page');
		};
	}, []);

	// Add body class when mobile menu is open for CSS targeting
	useEffect(() => {
		if (menuOpen) {
			document.body.classList.add('mobile-toc-open');
		} else {
			document.body.classList.remove('mobile-toc-open');
		}
		return () => {
			document.body.classList.remove('mobile-toc-open');
		};
	}, [menuOpen]);

	// Handle page navigation
	const navigateToPage = (pageId: string) => {
		setActivePageId(pageId);
		expandSectionForPage(pageId);
		
		// Close mobile menu if open
		if (menuOpen) {
			setMenuOpen(false);
		}
	};

	// Expand section for a given page
	const expandSectionForPage = (pageId: string) => {
		const heading = headings.find(h => h.id === pageId);
		if (heading) {
			setExpandedSections(prev => new Set([...prev, heading.sectionId]));
		}
	};

	// Build headings for TOC
	const headings = useMemo<WikiHeading[]>(() => {
		const hs: WikiHeading[] = [];
		
		// Helper function to recursively add headings
		const addHeadings = (items: any[], level: number, sectionId: string) => {
			items.forEach((item) => {
				hs.push({ id: item.id, level, text: item.title, sectionId });
				if (item.children && Array.isArray(item.children)) {
					addHeadings(item.children, level + 1, sectionId);
				}
			});
		};
		
		rules.sections.forEach((section) => {
			hs.push({ id: section.id, level: 2, text: section.title, sectionId: section.id });
			if (section.children && Array.isArray(section.children)) {
				addHeadings(section.children, 3, section.id);
			}
			// Add class headings under the Character Classes section
			const isClassSection = /character classes/i.test(section.title) || section.id === 'classes';
			if (isClassSection) {
				const classKeys = Object.keys((rules as any).classes || {});
				classKeys.forEach((key) => {
					const info = (rules as any).classes[key] as { name: string };
					hs.push({ id: `class-${key}`, level: 3, text: info?.name || key, sectionId: section.id });
				});
			}
		});
		return hs;
	}, []);

	// Set initial page
	useEffect(() => {
		if (activePageId) return;
		
		// Try to restore from hash
		const hashId = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
		if (hashId && headings.find(h => h.id === hashId)) {
			setActivePageId(hashId);
			expandSectionForPage(hashId);
			return;
		}
		
		// Try to restore from localStorage
		const lastId = localStorage.getItem('wiki.lastPageId');
		if (lastId && headings.find(h => h.id === lastId)) {
			setActivePageId(lastId);
			expandSectionForPage(lastId);
			return;
		}
		
		// Default to first page
		if (headings.length > 0) {
			setActivePageId(headings[0].id);
			expandSectionForPage(headings[0].id);
		}
	}, [headings, activePageId]);

	// Update URL and localStorage when page changes
	useEffect(() => {
		if (!activePageId) return;
		const url = `${window.location.pathname}${window.location.search}#${activePageId}`;
		window.history.replaceState(null, '', url);
		localStorage.setItem('wiki.lastPageId', activePageId);
	}, [activePageId]);

	// Toggle section expansion
	const toggleSection = (sectionId: string) => {
		setExpandedSections(prev => {
			const newSet = new Set(prev);
			if (newSet.has(sectionId)) {
				newSet.delete(sectionId);
			} else {
				newSet.add(sectionId);
			}
			return newSet;
		});
	};

	// Lock background scroll by disabling overflow
	useEffect(() => {
		if (!menuOpen) return;
		const prevHtmlOverflow = document.documentElement.style.overflow;
		const prevBodyOverflow = document.body.style.overflow;
		document.documentElement.style.overflow = 'hidden';
		document.body.style.overflow = 'hidden';
		return () => {
			document.documentElement.style.overflow = prevHtmlOverflow;
			document.body.style.overflow = prevBodyOverflow;
		};
	}, [menuOpen]);

	// Close menu on outside clicks
	useEffect(() => {
		if (!menuOpen) return;
		const handlePointerDown = (e: MouseEvent) => {
			const target = e.target as Node;
			if (target instanceof Element && target.closest('.toc-toggle')) {
				return;
			}
			if (menuRef.current && !menuRef.current.contains(target)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener('pointerdown', handlePointerDown, true);
		return () => document.removeEventListener('pointerdown', handlePointerDown, true);
	}, [menuOpen]);

	// Render content for the active page
	const renderPageContent = () => {
		if (!activePageId) {
			return (
				<div style={{ textAlign: 'center', padding: '40px 20px' }}>
					<h1>Welcome to the Arcus Wiki</h1>
					<p>Select a topic from the table of contents to get started.</p>
				</div>
			);
		}

		// Helper function to recursively render children
		const renderChildren = (children: any[] | undefined, level: number) => {
			if (!children || !children.length) return null;
			const HeadingTag = level === 2 ? 'h2' : level === 3 ? 'h3' : level === 4 ? 'h4' : level === 5 ? 'h5' : 'h6';
			
			return (
				<>
					{children.map((child) => (
						<div key={child.id} style={{ marginLeft: (level - 2) * 24 }}>
							<HeadingTag id={child.id}>{child.title}</HeadingTag>
							{renderBodyContent(child.body, (text) => renderWithWikiLinks(text, navigateToPage))}
							{/* Recursively render nested children */}
							{renderChildren(child.children, level + 1)}
						</div>
					))}
				</>
			);
		};

		// Check if it's a main section
		const section = rules.sections.find(s => s.id === activePageId);
		if (section) {
			return (
				<div>
					<h1>{section.title}</h1>
					{section.summary && (
						<p style={{ color: 'var(--muted)' }}>{renderWithWikiLinks(section.summary, navigateToPage)}</p>
					)}
					{renderChildren(section.children, 2)}
					{/* Special handling for Character Classes section */}
					{section.id === 'classes' ? renderClassesList(navigateToPage) : renderClassTableIfAny(section)}
				</div>
			);
		}

		// Check if it's a child page (including nested children)
		const findChildPage = (sections: any[], targetId: string): { section: any; child: any; level: number } | null => {
			for (const section of sections) {
				if (section.children) {
					for (const child of section.children) {
						if (child.id === targetId) {
							return { section, child, level: 2 };
						}
						// Check nested children
						if (child.children) {
							const result = findNestedChild(child.children, targetId, 3);
							if (result) {
								return { section, child: result.child, level: result.level };
							}
						}
					}
				}
			}
			return null;
		};

		const findNestedChild = (children: any[], targetId: string, level: number): { child: any; level: number } | null => {
			for (const child of children) {
				if (child.id === targetId) {
					return { child, level };
				}
				if (child.children) {
					const result = findNestedChild(child.children, targetId, level + 1);
					if (result) return result;
				}
			}
			return null;
		};

		const childResult = findChildPage(rules.sections, activePageId);
		if (childResult) {
			const { section, child, level } = childResult;
			const HeadingTag = level === 2 ? 'h1' : level === 3 ? 'h2' : level === 4 ? 'h3' : level === 5 ? 'h4' : 'h5';
			
			return (
				<div>
					<HeadingTag>{child.title}</HeadingTag>
					{renderBodyContent(child.body, (text) => renderWithWikiLinks(text, navigateToPage))}
					{/* Show breadcrumb navigation */}
					<div style={{ marginTop: 20, padding: 16, backgroundColor: 'var(--bg-secondary)', borderRadius: 8 }}>
						<strong>Part of:</strong> <a href={`#${section.id}`} onClick={(e) => { e.preventDefault(); navigateToPage(section.id); }}>{section.title}</a>
					</div>
				</div>
			);
		}

		// Check if it's a class page
		if (activePageId.startsWith('class-')) {
			const classKey = activePageId.replace('class-', '');
			const info = (rules as any).classes[classKey] as { name: string; abilities: any[] };
			if (info) {
				return (
					<div>
						<h1>{info.name}</h1>
						<div style={{ marginBottom: 20, padding: 16, backgroundColor: 'var(--bg-secondary)', borderRadius: 8 }}>
							<strong>Character Class</strong>
						</div>
						{/* Show only this class's table */}
						<ClassTable title={info.name} rows={(info.abilities || []).map((a) => ({
							level: a.level,
							name: a.name,
							description: a.description || [],
							target: a.target,
							apCost: a.apCost,
							tags: a.tags,
						}))} />
						{/* Add navigation back to classes section */}
						<div style={{ marginTop: 20, padding: 16, backgroundColor: 'var(--bg-secondary)', borderRadius: 8 }}>
							<strong>Back to:</strong> <a href={`#classes`} onClick={(e) => { e.preventDefault(); navigateToPage('classes'); }}>Character Classes</a>
						</div>
					</div>
				);
			}
		}

		return (
			<div style={{ textAlign: 'center', padding: '40px 20px' }}>
				<h1>Page Not Found</h1>
				<p>The requested page could not be found.</p>
			</div>
		);
	};

	const activeTitle = headings.find(h => h.id === activePageId)?.text || 'Browse Wiki';

	// Search functionality
	const searchIndex = useMemo(() => {
		const entries: { id: string; title: string; preview: string; category: string; haystack: string }[] = [];
		
		// Helper function to recursively add search entries
		const addSearchEntries = (items: any[], category: string) => {
			items.forEach((item) => {
				const title = item.title;
				let body = item.body || '';
				// If body is an array, join the items for search indexing
				if (Array.isArray(body)) {
					body = body.join(' ');
				}
				const haystack = `${title} ${body} ${category}`.toLowerCase();
				entries.push({ id: item.id, title, preview: body, category, haystack });
				
				// Recursively add nested children
				if (item.children && Array.isArray(item.children)) {
					addSearchEntries(item.children, category);
				}
			});
		};
		
		// Add sections
		rules.sections.forEach((section) => {
			entries.push({ 
				id: section.id, 
				title: section.title, 
				preview: section.summary || '', 
				category: 'Section', 
				haystack: `${section.title} ${section.summary || ''}`.toLowerCase() 
			});
			
			// Add children (including nested ones)
			if (section.children && Array.isArray(section.children)) {
				addSearchEntries(section.children, section.title);
			}
		});
		
		// Add classes
		const classKeys = Object.keys((rules as any).classes || {});
		classKeys.forEach((key) => {
			const info = (rules as any).classes[key] as { name: string };
			entries.push({ 
				id: `class-${key}`, 
				title: info?.name || key, 
				preview: 'Character class', 
				category: 'Character Classes', 
				haystack: `${info?.name || key} character class`.toLowerCase() 
			});
		});
		
		return entries;
	}, []);

	const results = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		const tokens = q.split(/\s+/).filter(Boolean);
		return searchIndex.filter((e) => tokens.every((t) => e.haystack.includes(t)));
	}, [query, searchIndex]);

	// Convert search results to SearchResult format
	const searchResults: SearchResult[] = results.map(result => ({
		id: result.id,
		title: result.title,
		preview: result.preview,
		category: result.category
	}));

	return (
		<div className="container layout">
			<WikiTableOfContents
				headings={headings}
				sections={rules.sections}
				classes={rules.classes}
				activePageId={activePageId}
				query={query}
				onQueryChange={setQuery}
				searchResults={searchResults}
				onSearchResultClick={navigateToPage}
				onHeadingClick={navigateToPage}
				expandedSections={expandedSections}
				onToggleSection={toggleSection}
				title="Browse Wiki"
				searchPlaceholder="Search wiki..."
			/>
			
			<DocumentContent ref={containerRef}>
				{renderPageContent()}
			</DocumentContent>
			
			{/* Floating TOC toggle button for mobile */}
			<TocToggleButton
				isOpen={menuOpen}
				onToggle={() => setMenuOpen((v) => !v)}
				label="Navigate Wiki"
			/>
			
			{/* Mobile TOC */}
			<MobileTableOfContents
				isOpen={menuOpen}
				onClose={() => setMenuOpen(false)}
				query={query}
				onQueryChange={setQuery}
				searchResults={searchResults}
				onSearchResultClick={(id) => { navigateToPage(id); setMenuOpen(false); }}
				onHeadingClick={(id) => { navigateToPage(id); setMenuOpen(false); }}
				title="Browse Wiki"
				searchPlaceholder="Search wiki..."
			>
				<div className="wiki-toc">
					{rules.sections.map((section) => (
						<div key={section.id} className="toc-section">
							<div 
								className={`toc-section-header ${expandedSections.has(section.id) ? 'expanded' : ''}`}
								onClick={() => toggleSection(section.id)}
							>
								<span className="toc-section-title">{section.title}</span>
								<span className="toc-section-toggle">{expandedSections.has(section.id) ? '−' : '+'}</span>
							</div>
							{expandedSections.has(section.id) && (
								<div className="toc-section-content">
									<a
										href={`#${section.id}`}
										onClick={(e) => { e.preventDefault(); navigateToPage(section.id); setMenuOpen(false); }}
									>
										{section.title}
									</a>
									{/* Add child headings recursively with support for unlimited nesting */}
									{section.children && (() => {
										const renderNestedChildren = (children: any[], level: number) => {
											return children.map((child) => (
												<div key={child.id}>
													<a
														href={`#${child.id}`}
														onClick={(e) => { e.preventDefault(); navigateToPage(child.id); setMenuOpen(false); }}
														style={{ paddingLeft: 22 * level }}
													>
														{child.title}
													</a>
													{/* Recursively render nested children */}
													{child.children && child.children.length > 0 && renderNestedChildren(child.children, level + 1)}
												</div>
											));
										};
										return renderNestedChildren(section.children, 1);
									})()}
									{/* Add class links if this is the classes section */}
									{/character classes/i.test(section.title) || section.id === 'classes' ? (
										Object.keys(rules.classes || {}).map((key) => {
											const info = rules.classes[key] as { name: string };
											return (
												<a
													key={`class-${key}`}
													href={`#class-${key}`}
													onClick={(e) => { e.preventDefault(); navigateToPage(`class-${key}`); setMenuOpen(false); }}
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
			</MobileTableOfContents>
		</div>
	);
}

function renderWithTooltips(text?: string) {
	if (!text) return null;
	const parts: (string | JSX.Element)[] = [text];
	// For each phrase, split and inject Tooltip components
	Object.entries(TOOLTIP_MAP).forEach(([phrase, id]) => {
		const regex = new RegExp(`(\\b${escapeRegex(phrase)}\\b)`, 'gi');
		const next: (string | JSX.Element)[] = [];
		parts.forEach((p) => {
			if (typeof p !== 'string') { next.push(p); return; }
			const split = p.split(regex);
			for (let i = 0; i < split.length; i++) {
				const segment = split[i];
				if (!segment) continue;
				if (regex.test(segment)) {
					                    // Lookup summary/body by id for description
                    const rule = findRuleById(id);
                    let desc = rule?.child?.body || rule?.section?.summary || '';
                    // If body is an array, join the items for tooltip display
                    if (Array.isArray(desc)) {
                        desc = desc.join(' ');
                    }
                    next.push(
                        <Tooltip key={`${id}-${i}-${segment}`} title={phrase} description={desc}>
                            {segment}
                        </Tooltip>
                    );
				} else {
					next.push(segment);
				}
			}
		});
		parts.splice(0, parts.length, ...next);
	});
	return <>{parts}</>;
}

function renderWithWikiLinks(text?: string, navigateToPage?: (pageId: string) => void) {
	if (!text) return null;
	const parts: (string | JSX.Element)[] = [text];
	
	// For each phrase in WIKI_LINK_MAP, split and inject clickable links
	Object.entries(WIKI_LINK_MAP).forEach(([phrase, targetId]) => {
		const regex = new RegExp(`(\\b${escapeRegex(phrase)}\\b)`, 'gi');
		const next: (string | JSX.Element)[] = [];
		
		parts.forEach((p) => {
			if (typeof p !== 'string') { 
				next.push(p); 
				return; 
			}
			
			const split = p.split(regex);
			for (let i = 0; i < split.length; i++) {
				const segment = split[i];
				if (!segment) continue;
				
				if (regex.test(segment)) {
					// Create a clickable link that navigates to the target page
					next.push(
						<a 
							key={`wiki-link-${targetId}-${i}-${segment}`} 
							href={`#${targetId}`}
							onClick={(e) => { 
								e.preventDefault(); 
								if (navigateToPage) {
									navigateToPage(targetId); 
								}
							}}
							style={{ 
								color: 'var(--accent-2)', 
								textDecoration: 'underline',
								cursor: 'pointer'
							}}
						>
							{segment}
						</a>
					);
				} else {
					next.push(segment);
				}
			}
		});
		
		parts.splice(0, parts.length, ...next);
	});
	
	return <>{parts}</>;
}

function escapeRegex(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findRuleById(id: string) {
	// Helper function to recursively search through children
	const searchChildren = (children: any[]): { section: any; child: any } | undefined => {
		for (const child of children) {
			if (child.id === id) {
				return { section: null, child };
			}
			if (child.children && Array.isArray(child.children)) {
				const result = searchChildren(child.children);
				if (result) return result;
			}
		}
		return undefined;
	};
	
	for (const section of rules.sections) {
		if (section.id === id) return { section };
		
		// Search through children and nested children
		if (section.children && Array.isArray(section.children)) {
			const result = searchChildren(section.children);
			if (result) {
				return { section, child: result.child };
			}
		}
	}
	return undefined;
}

function renderClassesList(navigateToPage: (pageId: string) => void) {
	const classKeys = Object.keys((rules as any).classes || {});
	if (!classKeys.length) return null;
	
	return (
		<div style={{ marginTop: 24 }}>
			<h2>Available Classes</h2>
			<div style={{ display: 'grid', gap: 16 }}>
				{classKeys.map((key) => {
					const info = (rules as any).classes[key] as { name: string; type: string; attributes: string; summary: string };
					return (
						<div key={key} style={{ 
							border: '1px solid var(--border-light)', 
							borderRadius: 8, 
							padding: 16,
							background: 'var(--surface-secondary)'
						}}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
								<h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
									<a 
										href={`#class-${key}`}
										onClick={(e) => { 
											e.preventDefault(); 
											navigateToPage(`class-${key}`); 
										}}
										style={{ 
											color: 'var(--accent-2)', 
											textDecoration: 'none'
										}}
									>
										{info?.name || key}
									</a>
								</h3>
								<span style={{ 
									fontSize: '12px', 
									padding: '4px 8px', 
									background: 'var(--accent-2)', 
									color: 'white', 
									borderRadius: 4,
									fontWeight: '600'
								}}>
									{info?.type || 'Unknown'}
								</span>
							</div>
							{info?.attributes && (
								<p style={{ 
									margin: '8px 0', 
									fontSize: '14px', 
									color: 'var(--text-secondary)',
									fontStyle: 'italic'
								}}>
									<strong>Attributes:</strong> {info.attributes}
								</p>
							)}
							{info?.summary && (
								<p style={{ 
									margin: '8px 0 0', 
									color: 'var(--text-primary)',
									lineHeight: 1.5
								}}>
									{info.summary}
								</p>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function renderClassTableIfAny(section: { id: string; title: string }) {
	const isClassSection = /character classes/i.test(section.title) || section.id === 'classes';
	if (!isClassSection) return null;
	// Map each class in rules.classes to its own table
	const classKeys = Object.keys((rules as any).classes || {});
	if (!classKeys.length) return null;
	return (
		<div style={{ display: 'grid', gap: 16 }}>
			{classKeys.map((key) => {
				const info = (rules as any).classes[key] as { name: string; abilities: any[] };
				const rows = (info.abilities || []).map((a) => ({
					level: a.level,
					name: a.name,
					description: a.description || [],
					target: a.target,
					apCost: a.apCost,
					tags: a.tags,
				}));
				if (!rows.length) return null;
				
				return (
					<div key={key}>
						<h2 id={`class-${key}`} style={{ marginTop: 0 }}>{info.name}</h2>
						<ClassTable title={info.name} rows={rows} />
					</div>
				);
			})}
		</div>
	);
}


