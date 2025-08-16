import { useEffect, useMemo, useRef, useState } from 'react';
import rules from '@/rules/rulesIndex';
import { TOOLTIP_MAP } from '@/rules/rulesIndex';
import Tooltip from '@/components/Tooltip';
import ClassTable, { AbilityRow } from '@/pages/components/ClassTable';
import type { ClassAbility } from '@/rules/rulesIndex';

type Heading = { id: string; level: number; text: string };

export default function FullRules() {
	const containerRef = useRef<HTMLDivElement>(null);
	const tocRef = useRef<HTMLDivElement>(null);
	const [activeId, setActiveId] = useState<string>('');
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const [query, setQuery] = useState('');
	const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
	const observerRef = useRef<IntersectionObserver | null>(null);
	const isScrollingRef = useRef<boolean>(false);
	const isUserScrollingTocRef = useRef<boolean>(false);
	const tocScrollTimeoutRef = useRef<number | null>(null);
	
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

    const headings = useMemo<Heading[]>(() => {
        const hs: Heading[] = [];
        
        // Helper function to recursively add headings
        const addHeadings = (items: any[], level: number) => {
            items.forEach((item) => {
                hs.push({ id: item.id, level, text: item.title });
                if (item.children && Array.isArray(item.children)) {
                    addHeadings(item.children, level + 1);
                }
            });
        };
        
        rules.sections.forEach((section) => {
            const id = section.id;
            hs.push({ id, level: 2, text: section.title });
            if (section.children && Array.isArray(section.children)) {
                addHeadings(section.children, 3);
            }
            // Add class headings under the Character Classes section
            const isClassSection = /character classes/i.test(section.title) || section.id === 'classes';
            if (isClassSection) {
                const classKeys = Object.keys((rules as any).classes || {});
                classKeys.forEach((key) => {
                    const info = (rules as any).classes[key] as { name: string };
                    hs.push({ id: `class-${key}`, level: 3, text: info?.name || key });
                });
            }
        });
        return hs;
    }, []);

	// Helper function to determine TOC item highlighting classes
	const getTocItemClasses = (itemId: string) => {
		if (!activeId) return '';
		if (activeId === itemId) return 'active';
		
		// Helper function to recursively check if an item contains the active heading
		const hasActiveDescendant = (section: any): boolean => {
			// Check direct children
			if (section.children && Array.isArray(section.children)) {
				for (const child of section.children) {
					if (child.id === activeId) return true;
					// Recursively check nested children
					if (hasActiveDescendant(child)) return true;
				}
			}
			
			// Check for class headings if this is the classes section
			if (/character classes/i.test(section.title) || section.id === 'classes') {
				const classKeys = Object.keys((rules as any).classes || {});
				const hasActiveClass = classKeys.some(key => `class-${key}` === activeId);
				if (hasActiveClass) return true;
			}
			
			return false;
		};
		
		// Check if this TOC item is a section that contains the active heading
		const section = rules.sections.find(s => s.id === itemId);
		if (section && hasActiveDescendant(section)) {
			return 'parent-active';
		}
		
		// Check if this TOC item is a child that contains the active heading
		const findParentSection = (children: any[]): any | null => {
			for (const child of children) {
				if (child.id === itemId) return child;
				if (child.children && Array.isArray(child.children)) {
					const found = findParentSection(child.children);
					if (found) return found;
				}
			}
			return null;
		};
		
		for (const section of rules.sections) {
			if (section.children && Array.isArray(section.children)) {
				const child = findParentSection(section.children);
				if (child && child.id === itemId && hasActiveDescendant(child)) {
					return 'parent-active';
				}
			}
		}
		
		return '';
	};

	// Helper function to determine section header highlighting classes
	const getSectionHeaderClasses = (sectionId: string) => {
		const baseClasses = expandedSections.has(sectionId) ? 'expanded' : '';
		
		if (activeId === sectionId) return `${baseClasses} active`;
		
		// Check if this section contains the active heading
		const section = rules.sections.find(s => s.id === sectionId);
		if (!section) return baseClasses;
		
		// Helper function to recursively check if an item contains the active heading
		const hasActiveDescendant = (section: any): boolean => {
			if (section.children && Array.isArray(section.children)) {
				for (const child of section.children) {
					if (child.id === activeId) return true;
					if (hasActiveDescendant(child)) return true;
				}
			}
			
			// Check for class headings if this is the classes section
			if (/character classes/i.test(section.title) || section.id === 'classes') {
				const classKeys = Object.keys((rules as any).classes || {});
				const hasActiveClass = classKeys.some(key => `class-${key}` === activeId);
				if (hasActiveClass) return true;
			}
			
			return false;
		};
		
		if (hasActiveDescendant(section)) return `${baseClasses} parent-active`;
		
		return baseClasses;
	};

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
									handleTocClick(child.id);
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

	// Auto-center TOC on active heading change
	useEffect(() => {
		if (!activeId || !tocRef.current || isUserScrollingTocRef.current) return;
		
		// Find the active TOC item
		const activeTocItem = tocRef.current.querySelector(`[href="#${activeId}"]`) as HTMLElement;
		if (!activeTocItem) return;
		
		// Calculate the scroll position to center the active item
		const tocContainer = tocRef.current;
		const tocRect = tocContainer.getBoundingClientRect();
		const itemRect = activeTocItem.getBoundingClientRect();
		
		// Calculate the target scroll position to center the item
		const targetScrollTop = tocContainer.scrollTop + (itemRect.top - tocRect.top) - (tocRect.height / 2) + (itemRect.height / 2);
		
		// Smooth scroll to center the active item
		tocContainer.scrollTo({
			top: targetScrollTop,
			behavior: 'smooth'
		});
	}, [activeId]);

	// Handle TOC scroll events to detect user scrolling
	useEffect(() => {
		const tocContainer = tocRef.current;
		if (!tocContainer) return;
		
		const handleTocScroll = () => {
			// Mark that user is scrolling the TOC
			isUserScrollingTocRef.current = true;
			
			// Clear any existing timeout
			if (tocScrollTimeoutRef.current) {
				clearTimeout(tocScrollTimeoutRef.current);
			}
			
			// Reset the flag after user stops scrolling
			tocScrollTimeoutRef.current = window.setTimeout(() => {
				isUserScrollingTocRef.current = false;
			}, 150);
		};
		
		tocContainer.addEventListener('scroll', handleTocScroll, { passive: true });
		
		return () => {
			tocContainer.removeEventListener('scroll', handleTocScroll);
			if (tocScrollTimeoutRef.current) {
				window.clearTimeout(tocScrollTimeoutRef.current);
			}
		};
	}, []);

	// Set up intersection observer for scroll tracking
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Clean up previous observer
		if (observerRef.current) {
			observerRef.current.disconnect();
		}

		const headingEls = container.querySelectorAll('h2, h3, h4, h5, h6');
		const observer = new IntersectionObserver(
			(entries) => {
				// Only update if we're not in the middle of a programmatic scroll
				if (isScrollingRef.current) return;
				
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				});
			},
			{ root: null, rootMargin: '-70px 0px -85% 0px', threshold: [0] }
		);
		
		observerRef.current = observer;
		headingEls.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, []); // Only run once on mount, observer will be updated when content changes

	// Update observer when headings change (e.g., after content renders)
	useEffect(() => {
		if (!observerRef.current || !containerRef.current) return;
		
		// Disconnect and reconnect observer to pick up new headings
		observerRef.current.disconnect();
		
		const headingEls = containerRef.current.querySelectorAll('h2, h3, h4, h5, h6');
		headingEls.forEach((el) => observerRef.current?.observe(el));
	}, [headings]); // Re-run when headings array changes

	// Handle TOC item clicks
	const handleTocClick = (id: string) => {
		setActiveId(id);
		isScrollingRef.current = true;
		
		// Close mobile menu if open
		if (menuOpen) {
			setMenuOpen(false);
		}
		
		// Scroll to the clicked heading with smooth behavior
		const el = document.getElementById(id);
		if (el) {
			// Use a more reliable smooth scroll approach
			const container = containerRef.current;
			if (container) {
				const containerRect = container.getBoundingClientRect();
				const elementRect = el.getBoundingClientRect();
				const scrollTop = container.scrollTop + (elementRect.top - containerRect.top) - 80; // 80px offset for header
				
				container.scrollTo({
					top: scrollTop,
					behavior: 'smooth'
				});
			} else {
				// Fallback to native scrollIntoView
				el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}
		
		// Re-enable observer after scroll settles
		setTimeout(() => {
			isScrollingRef.current = false;
		}, 100);
	};

	// If no hash/restore present and at page top, default to first heading
	useEffect(() => {
		if (window.location.hash) return;
		if (localStorage.getItem('fullRules.lastId')) return;
		const container = containerRef.current;
		if (!container) return;
		const firstHeading = container.querySelector('h2, h3, h4, h5, h6') as HTMLElement | null;
		if (firstHeading) setActiveId(firstHeading.id);
	}, []);

	// On initial load, restore position from hash or last read section
	useEffect(() => {
		const hashId = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
		const lastId = localStorage.getItem('fullRules.lastId') || '';
		const targetId = hashId || lastId;
		if (!targetId) return;
		const el = document.getElementById(targetId);
		if (el) {
			el.scrollIntoView();
			setActiveId(targetId);
		}
	}, []);

	// Keep URL hash and localStorage in sync with the visible heading
	useEffect(() => {
		if (!activeId) return;
		const url = `${window.location.pathname}${window.location.search}#${activeId}`;
		window.history.replaceState(null, '', url);
		localStorage.setItem('fullRules.lastId', activeId);
	}, [activeId]);

	// No custom hook needed - using native IntersectionObserver

	// Lock background scroll by disabling overflow (preserves current scroll and sticky navbar)
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

	// Close menu on outside clicks while letting underlying click proceed
	useEffect(() => {
		if (!menuOpen) return;
		const handlePointerDown = (e: MouseEvent) => {
			const target = e.target as Node;
			// If the toggle button itself was clicked, let its own handler manage toggling
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

	const activeTitle = useMemo(() => {
		return headings.find((h) => h.id === activeId)?.text || 'Contents';
	}, [headings, activeId]);

	// Search functionality
	const searchIndex = useMemo(() => {
		const entries: { id: string; title: string; preview: string; category: string; haystack: string }[] = [];
		
		// Helper function to recursively add search entries
		const addSearchEntries = (items: any[], category: string) => {
			items.forEach((item) => {
				const title = item.title;
				const body = item.body || '';
				const haystack = `${title} ${body} ${category}`.toLowerCase();
				entries.push({ id: item.id, title, preview: body, category, haystack });
				
				// Recursively add nested children
				if (item.children && Array.isArray(item.children)) {
					addSearchEntries(item.children, category);
				}
			});
		};
		
		rules.sections.forEach((section) => {
			// Add section title and summary
			const title = section.title;
			const preview = section.summary || '';
			const haystack = `${title} ${preview}`.toLowerCase();
			entries.push({ id: section.id, title, preview, category: section.title, haystack });
			
			// Add section children (including nested ones)
			if (section.children && Array.isArray(section.children)) {
				addSearchEntries(section.children, title);
			}
			
			// Add class information if this is the classes section
			const isClassSection = /character classes/i.test(section.title) || section.id === 'classes';
			if (isClassSection) {
				const classKeys = Object.keys((rules as any).classes || {});
				classKeys.forEach((key) => {
					const info = (rules as any).classes[key] as { name: string; abilities?: any[] };
					const classId = `class-${key}`;
					const classTitle = info?.name || key;
					const classAbilities = info?.abilities || [];
					
					// Add class itself
					entries.push({ 
						id: classId, 
						title: classTitle, 
						preview: `Character class`, 
						category: 'Character Classes', 
						haystack: `${classTitle} character class`.toLowerCase() 
					});
					
					// Add class abilities
					classAbilities.forEach((ability) => {
						const aTitle = ability.name;
						const aDesc = Array.isArray(ability.description) ? ability.description.join(' ') : (ability.description || '');
						const aHaystack = `${aTitle} ${aDesc} ${classTitle}`.toLowerCase();
						entries.push({ 
							id: `ability-${key}-${aTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, 
							title: aTitle, 
							preview: aDesc, 
							category: classTitle, 
							haystack: aHaystack 
						});
					});
				});
			}
		});
		return entries;
	}, []);

	const results = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		// Simple token AND search for better precision
		const tokens = q.split(/\s+/).filter(Boolean);
		return searchIndex.filter((e) => tokens.every((t) => e.haystack.includes(t)));
	}, [query, searchIndex]);

	return (
		<div className="container layout">
			<aside className={`toc ${query ? 'searching' : ''}`} ref={tocRef}>
				<div className="searchbar">
					<input
						className="input"
						placeholder="Search rules..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
					{query && (
						<button 
							className="search-clear" 
							onClick={() => setQuery('')}
							aria-label="Clear search"
						>
							×
						</button>
					)}
				</div>
				{/* Floating search results container */}
				{query && (
					<div className="search-results-overlay">
						<SearchResults results={results} onClear={() => setQuery('')} onItemClick={handleTocClick} />
					</div>
				)}
				<h4>On this page</h4>
				{headings.map((h) => (
					<a
						key={h.id}
						href={`#${h.id}`}
						className={getTocItemClasses(h.id)}
						style={{ paddingLeft: Math.max(10, (h.level - 2) * 12 + 10) }}
						onClick={(e) => {
							e.preventDefault();
							handleTocClick(h.id);
						}}
					>
						{h.text}
					</a>
				))}
			</aside>
			<article className="doc" ref={containerRef}>
				{rules.sections.map((s) => (
					<section key={s.id}>
						<h2 id={s.id}>{s.title}</h2>
						<p>{renderWithTooltips(s.summary)}</p>
						{renderClassTableIfAny(s)}
						{renderChildren(s.children, 3)}
					</section>
				))}
			</article>
			{/* Floating TOC toggle button for mobile */}
			<button className="toc-toggle" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
					<path d="M4 19.5V6.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V19.5l-3-1.5-3 1.5-3-1.5-3 1.5Z"/>
				</svg>
				Navigate Rules
			</button>
			<div className={`page-menu ${menuOpen ? 'open' : ''} ${query ? 'searching' : ''}`}>
				<div className="menu-inner" ref={menuRef}>
					<div className="sticky-header">
						<div className="accordion-header" onClick={() => setMenuOpen(false)}>
							<strong>Browse Rules</strong>
							<span aria-hidden>×</span>
						</div>
						<div className="searchbar">
							<input
								className="input"
								placeholder="Search rules..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
							/>
							{query && (
								<button 
									className="search-clear" 
									onClick={() => setQuery('')}
									aria-label="Clear search"
								>
									×
								</button>
							)}
						</div>
					</div>
					{query && (
						<div className="search-results-overlay">
							<SearchResults results={results} onClear={() => setQuery('')} onItemClick={(id) => { handleTocClick(id); setMenuOpen(false); }} />
						</div>
					)}
					{/* Simple TOC list for mobile - no accordion structure */}
					{headings.map((h) => (
						<a
							key={h.id}
							href={`#${h.id}`}
							className={getTocItemClasses(h.id)}
							style={{ paddingLeft: Math.max(10, (h.level - 2) * 12 + 10) }}
							onClick={(e) => { e.preventDefault(); handleTocClick(h.id); setMenuOpen(false); }}
						>
							{h.text}
						</a>
					))}
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

function renderClassTableIfAny(section: { id: string; title: string }) {
	const isClassSection = /character classes/i.test(section.title) || section.id === 'classes';
	if (!isClassSection) return null;
	// Map each class in rules.classes to its own table
	const classKeys = Object.keys(rules.classes || {});
	if (!classKeys.length) return null;
	return (
		<div style={{ display: 'grid', gap: 16 }}>
			{classKeys.map((key) => {
				const info = (rules as any).classes[key] as { name: string; abilities: ClassAbility[] };
				const rows: AbilityRow[] = (info.abilities || []).map((a) => ({
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
						<h3 id={`class-${key}`} style={{ marginTop: 0 }}>{info.name}</h3>
						<ClassTable 
							title={info.name} 
							rows={rows} 
							getNameHref={(row) => `#ability-${key}-${row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
						/>
					</div>
				);
			})}
		</div>
	);
}

function renderChildren(children: any[] | undefined, level: number) {
	if (!children || !children.length) return null;
	
	const HeadingTag = level === 3 ? 'h3' : level === 4 ? 'h4' : level === 5 ? 'h5' : 'h6';
	
	return (
		<>
			{children.map((child) => (
				<div key={child.id} style={{ marginLeft: (level - 3) * 24 }}>
					<HeadingTag id={child.id}>{child.title}</HeadingTag>
					<p>{renderWithTooltips(child.body)}</p>
					{renderClassTableIfAny(child)}
					{renderChildren(child.children, level + 1)}
				</div>
			))}
		</>
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
					<div 
						key={e.id} 
						className="search-result-item"
						style={{ 
							padding: '8px 0', 
							borderBottom: '1px solid var(--border)',
							cursor: 'pointer'
						}}
						onClick={onItemClick ? () => onItemClick(e.id) : undefined}
					>
						<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
							<span style={{ fontWeight: 600 }}>
								{e.title}
							</span>
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



