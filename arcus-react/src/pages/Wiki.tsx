import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import rules from '@/rules/rulesIndex';
import { TOOLTIP_MAP, WIKI_LINK_MAP } from '@/rules/rulesIndex';
import Tooltip from '@/components/Tooltip';
import ClassTable from '@/pages/components/ClassTable';

type Heading = { id: string; level: number; text: string; sectionId: string };

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

	// Handle page navigation
	const navigateToPage = (pageId: string) => {
		setActivePageId(pageId);
		expandSectionForPage(pageId);
	};

	// Expand section for a given page
	const expandSectionForPage = (pageId: string) => {
		const heading = headings.find(h => h.id === pageId);
		if (heading) {
			setExpandedSections(prev => new Set([...prev, heading.sectionId]));
		}
	};

	// Build headings for TOC
	const headings = useMemo<Heading[]>(() => {
		const hs: Heading[] = [];
		rules.sections.forEach((section) => {
			hs.push({ id: section.id, level: 2, text: section.title, sectionId: section.id });
			section.children?.forEach((c) => hs.push({ id: c.id, level: 3, text: c.title, sectionId: section.id }));
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

	// Helper function to determine TOC item highlighting classes
	const getTocItemClasses = (itemId: string) => {
		if (activePageId === itemId) return 'active';
		
		// Check if this is a parent of the active page
		const activeHeading = headings.find(h => h.id === activePageId);
		if (!activeHeading) return '';
		
		// Check if this item is the section containing the active page
		if (itemId === activeHeading.sectionId) return 'parent-active';
		
		// Check if this is a grandparent (section containing the active page's section)
		const activeSection = rules.sections.find(s => s.id === activeHeading.sectionId);
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
		const activeSection = rules.sections.find(s => s.id === activeHeading.sectionId);
		if (activeSection && activeSection.id === sectionId) return `${baseClasses} grandparent-active`;
		
		return baseClasses;
	};

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

		// Check if it's a main section
		const section = rules.sections.find(s => s.id === activePageId);
		if (section) {
			return (
				<div>
					<h1>{section.title}</h1>
					<p style={{ color: 'var(--muted)' }}>{renderWithWikiLinks(section.summary, navigateToPage)}</p>
					{section.children?.map((child) => (
						<div key={child.id}>
							<h2 id={child.id}>{child.title}</h2>
							<p>{renderWithWikiLinks(child.body, navigateToPage)}</p>
						</div>
					))}
					{/* Special handling for Character Classes section */}
					{section.id === 'classes' ? renderClassesList(navigateToPage) : renderClassTableIfAny(section)}
				</div>
			);
		}

		// Check if it's a child page
		for (const s of rules.sections) {
			const child = s.children?.find(c => c.id === activePageId);
			if (child) {
				return (
					<div>
						<h1>{child.title}</h1>
						<p>{renderWithWikiLinks(child.body, navigateToPage)}</p>
						<div style={{ marginTop: 20, padding: 16, backgroundColor: 'var(--bg-secondary)', borderRadius: 8 }}>
							<strong>Part of:</strong> <a href={`#${s.id}`} onClick={(e) => { e.preventDefault(); navigateToPage(s.id); }}>{s.title}</a>
						</div>
					</div>
				);
			}
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
		
		// Add sections
		rules.sections.forEach((section) => {
			entries.push({ 
				id: section.id, 
				title: section.title, 
				preview: section.summary || '', 
				category: 'Section', 
				haystack: `${section.title} ${section.summary || ''}`.toLowerCase() 
			});
			
			// Add children
			section.children?.forEach((child) => {
				entries.push({ 
					id: child.id, 
					title: child.title, 
					preview: child.body || '', 
					category: section.title, 
					haystack: `${child.title} ${child.body || ''} ${section.title}`.toLowerCase() 
				});
			});
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

	return (
		<div className="container layout">
			<aside className="toc">
				<div className="searchbar">
					<input
						className="input"
						placeholder="Search wiki..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
				</div>
				{query && (
					<SearchResults results={results} onClear={() => setQuery('')} onItemClick={navigateToPage} />
				)}
				<h4>Browse Wiki</h4>
				<div className="wiki-toc">
					{rules.sections.map((section) => (
						<div key={section.id} className="toc-section">
							<div 
								className={`toc-section-header ${getSectionHeaderClasses(section.id)}`}
								onClick={() => toggleSection(section.id)}
							>
								<span className="toc-section-title">{section.title}</span>
								<span className="toc-section-toggle">{expandedSections.has(section.id) ? '−' : '+'}</span>
							</div>
							{expandedSections.has(section.id) && (
								<div className="toc-section-content">
									<a
										href={`#${section.id}`}
										className={getTocItemClasses(section.id)}
										onClick={(e) => { e.preventDefault(); navigateToPage(section.id); }}
									>
										{section.title}
									</a>
									{section.children?.map((child) => (
										<a
											key={child.id}
											href={`#${child.id}`}
											className={getTocItemClasses(child.id)}
											onClick={(e) => { e.preventDefault(); navigateToPage(child.id); }}
											style={{ paddingLeft: 22 }}
										>
											{child.title}
										</a>
									))}
									{/* Add class links if this is the classes section */}
									{/character classes/i.test(section.title) || section.id === 'classes' ? (
										Object.keys((rules as any).classes || {}).map((key) => {
											const info = (rules as any).classes[key] as { name: string };
											return (
												<a
													key={`class-${key}`}
													href={`#class-${key}`}
													className={getTocItemClasses(`class-${key}`)}
													onClick={(e) => { e.preventDefault(); navigateToPage(`class-${key}`); }}
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
			<article className="doc" ref={containerRef}>
				{renderPageContent()}
			</article>
			{/* Floating TOC toggle button for mobile */}
			<button className="toc-toggle" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
					<path d="M4 19.5V6.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V19.5l-3-1.5-3 1.5-3-1.5-3 1.5Z"/>
				</svg>
				Navigate Wiki
			</button>
			<div className={`page-menu ${menuOpen ? 'open' : ''}`}>
				<div className="menu-inner" ref={menuRef}>
					<div className="accordion-header" onClick={() => setMenuOpen(false)}>
						<strong>Browse Wiki</strong>
						<span aria-hidden>×</span>
					</div>
					<div className="searchbar">
						<input
							className="input"
							placeholder="Search wiki..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
						/>
					</div>
					{query && (
						<SearchResults results={results} onClear={() => setQuery('')} onItemClick={(id) => { navigateToPage(id); setMenuOpen(false); }} />
					)}
					<div className="wiki-toc">
						{rules.sections.map((section) => (
							<div key={section.id} className="toc-section">
								<div 
									className={`toc-section-header ${getSectionHeaderClasses(section.id)}`}
									onClick={() => toggleSection(section.id)}
								>
									<span className="toc-section-title">{section.title}</span>
									<span className="toc-section-toggle">{expandedSections.has(section.id) ? '−' : '+'}</span>
								</div>
								{expandedSections.has(section.id) && (
									<div className="toc-section-content">
										<a
											href={`#${section.id}`}
											className={getTocItemClasses(section.id)}
											onClick={(e) => { e.preventDefault(); navigateToPage(section.id); setMenuOpen(false); }}
										>
											{section.title}
										</a>
										{section.children?.map((child) => (
											<a
												key={child.id}
												href={`#${child.id}`}
												className={getTocItemClasses(child.id)}
												onClick={(e) => { e.preventDefault(); navigateToPage(child.id); setMenuOpen(false); }}
												style={{ paddingLeft: 22 }}
											>
												{child.title}
											</a>
										))}
										{/* Add class links if this is the classes section */}
										{/character classes/i.test(section.title) || section.id === 'classes' ? (
											Object.keys((rules as any).classes || {}).map((key) => {
												const info = (rules as any).classes[key] as { name: string };
												return (
													<a
														key={`class-${key}`}
														href={`#class-${key}`}
														className={getTocItemClasses(`class-${key}`)}
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
				</div>
			</div>
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
					const desc = rule?.child?.body || rule?.section?.summary || '';
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
	for (const section of rules.sections) {
		if (section.id === id) return { section };
		for (const child of section.children ?? []) {
			if (child.id === id) return { section, child };
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

function SearchResults({ results, onClear, onItemClick }: { results: { id: string; title: string; preview: string; category: string }[]; onClear: () => void; onItemClick?: (id: string) => void }) {
	if (!results.length) {
		return (
			<div className="accordion-item" style={{ marginBottom: 10 }}>
				<div className="accordion-header" style={{ cursor: 'default' }}>
					<strong>Search Results</strong>
					<span aria-hidden>0</span>
				</div>
				<div className="accordion-content">
					<p style={{ color: 'var(--muted)', margin: '6px 0 0' }}>No matches. Try different terms.</p>
				</div>
			</div>
		);
	}
	return (
		<div className="accordion-item" style={{ marginBottom: 10 }}>
			<div className="accordion-header" onClick={onClear}>
				<strong>Search Results ({results.length})</strong>
				<span aria-hidden>×</span>
			</div>
			<div className="accordion-content">
				{results.map((e) => (
					<div key={e.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
							<a 
								href={`#${e.id}`} 
								style={{ fontWeight: 600 }}
								onClick={onItemClick ? () => onItemClick(e.id) : undefined}
							>
								{e.title}
							</a>
							<span className="tag">{e.category}</span>
						</div>
						{e.preview && (
							<p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>
								{e.preview.slice(0, 160)}{e.preview.length > 160 ? '…' : ''}
							</p>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
