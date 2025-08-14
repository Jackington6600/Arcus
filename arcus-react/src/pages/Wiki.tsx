import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import rules from '@/rules/rulesIndex';
import { TOOLTIP_MAP, WIKI_LINK_MAP } from '@/rules/rulesIndex';
import Tooltip from '@/components/Tooltip';
import ClassTable from '@/pages/components/ClassTable';

type Child = { id: string; title: string; body?: string };
type SearchEntry = { id: string; title: string; preview: string; category: string; haystack: string };
type NodeWithChildren = Child & { children?: Child[] };

export default function Wiki() {
	const location = useLocation();
    const sections = rules.sections;
    const classKeys = Object.keys((rules as any).classes || {});
    
    // Add layout-page class to body to prevent scrolling
    useEffect(() => {
        document.body.classList.add('layout-page');
        return () => {
            document.body.classList.remove('layout-page');
        };
    }, []);
    
    // Build wiki sections with classes nested under Character Classes
    const wikiSections = useMemo(() => {
        return sections.map((s) => {
            const isClassSection = /character classes/i.test(s.title) || s.id === 'classes';
            if (!isClassSection) return s;
            const classChildren = classKeys.map((key) => {
                const info = (rules as any).classes[key] as { name: string; type?: string; attributes?: string; summary?: string; abilities?: { name: string; description?: string[]; target?: string; apCost?: any; tags?: string[] }[] };
                const classId = `class-${key}`;
                const summaryParts: string[] = [];
                if (info.type) summaryParts.push(`Type: ${info.type}`);
                if (info.attributes) summaryParts.push(`Attributes: ${info.attributes}`);
                if (info.summary) summaryParts.push(info.summary);
                const abilityChildren = (info.abilities || []).map((a) => ({
                    id: `ability-${key}-${slugify(a.name)}`,
                    title: a.name,
                    body: buildAbilityBody(a),
                }));
                return { id: classId, title: info.name, body: summaryParts.join('\n'), children: abilityChildren } as any;
            });
            return { ...s, children: [...(s.children ?? []), ...classChildren] } as any;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sections, classKeys.join('|')]);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const idToSection = useMemo(() => {
        const map = new Map<string, { section: typeof sections[number]; child?: Child }>();
        for (const s of wikiSections) {
            map.set(s.id, { section: s });
            for (const c of s.children ?? []) {
                map.set(c.id, { section: s, child: c });
                const nested: any[] = (c as any).children ?? [];
                nested.forEach((gc) => map.set(gc.id, { section: s, child: gc }));
            }
        }
        return map;
    }, [wikiSections]);

    const firstId = wikiSections[0]?.id ?? '';
	const getHash = () => (location.hash ? location.hash.replace(/^#/, '') : firstId);
	const [activeId, setActiveId] = useState<string>(getHash());

	useEffect(() => {
		setActiveId(getHash());
	}, [location.hash]);

	useEffect(() => {
		const article = document.getElementById('wiki-article');
		article?.scrollTo({ top: 0 });
	}, [activeId]);

	const active = idToSection.get(activeId) ?? (firstId ? { section: sections[0] } : undefined);

    const [query, setQuery] = useState('');
    const searchIndex = useMemo<SearchEntry[]>(() => {
        const entries: SearchEntry[] = [];
        for (const s of wikiSections) {
            const title = s.title ?? '';
            const preview = s.summary ?? '';
            const haystack = `${s.title ?? ''} ${s.summary ?? ''}`.toLowerCase();
            entries.push({ id: s.id, title, preview, category: s.title, haystack });
            for (const c of s.children ?? []) {
                const cTitle = c.title ?? '';
                const cBody = c.body ?? '';
                const cHaystack = `${c.title ?? ''} ${c.body ?? ''} ${s.title ?? ''}`.toLowerCase();
                entries.push({ id: c.id, title: cTitle, preview: cBody, category: s.title, haystack: cHaystack });
                const nested: any[] = (c as any).children ?? [];
                nested.forEach((gc) => {
                    const gTitle = gc.title ?? '';
                    const gBody = gc.body ?? '';
                    const gHay = `${gTitle} ${gBody} ${cTitle} ${s.title}`.toLowerCase();
                    entries.push({ id: gc.id, title: gTitle, preview: gBody, category: cTitle, haystack: gHay });
                });
            }
        }
        return entries;
    }, [wikiSections]);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [] as SearchEntry[];
        // Simple token AND search for better precision on small datasets
        const tokens = q.split(/\s+/).filter(Boolean);
        return searchIndex.filter((e) => tokens.every((t) => e.haystack.includes(t)));
    }, [query, searchIndex]);

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

    // Desktop-only: Expand and highlight active link with a brief animation and ensure visibility
    useEffect(() => {
        if (!activeId) return;
        const isDesktop = window.matchMedia('(min-width: 961px)').matches;
        if (!isDesktop) return;
        const aside = document.querySelector('aside.toc');
        if (!aside) return;
        const link = aside.querySelector(`a[href="#${activeId}"]`) as HTMLElement | null;
        if (!link) return;
        link.classList.add('pulse');
        link.scrollIntoView({ block: 'center', behavior: 'smooth' });
        const t = setTimeout(() => link.classList.remove('pulse'), 650);
        return () => clearTimeout(t);
    }, [activeId]);

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

	return (
		<div className="container layout">
			<div className="mobile-only" style={{ margin: '12px 0' }}>
				<button className="toc-toggle" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
						<path d="M4 19.5V6.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V19.5l-3-1.5-3 1.5-3-1.5-3 1.5Z"/>
					</svg>
					{active?.child?.title || active?.section.title || 'Browse Wiki'}
				</button>
			</div>
            <aside className="toc">
                <div className="searchbar">
                    <input
                        className="input"
                        placeholder="Search titles and content..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                {query && (
                    <SearchResults results={results} onClear={() => setQuery('')} />
                )}
                <h4>Browse Wiki</h4>
				{wikiSections.map((s) => (
					<SidebarAccordion
						key={s.id}
						section={s}
						activeId={activeId}
						shouldOpen={s.id === activeId || (s.children ?? []).some((c: any) => c.id === activeId || (c.children ?? []).some((gc: any) => gc.id === activeId))}
					/>
				))}
			</aside>
			<article className="doc" id="wiki-article">
				{active ? (
                    <WikiContent section={active.section} child={active.child} />
				) : (
					<p style={{ color: 'var(--muted)' }}>No content available.</p>
				)}
			</article>
            <div className={`page-menu ${menuOpen ? 'open' : ''}`}>
                <div className="menu-inner" ref={menuRef}>
                    <div className="accordion-header" onClick={() => setMenuOpen(false)}>
                        <strong>Browse Wiki</strong>
                        <span aria-hidden>×</span>
                    </div>
                    <div className="searchbar">
                        <input
                            className="input"
                            placeholder="Search titles and content..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    {query && (
                        <SearchResults results={results} onClear={() => setQuery('')} />
                    )}
                    {wikiSections.map((s) => (
                        <SidebarAccordion key={s.id} section={s} activeId={activeId} shouldOpen={false} />
                    ))}
                </div>
            </div>
		</div>
	);
}

function SidebarAccordion({ section, activeId, shouldOpen }: { section: { id: string; title: string; summary?: string; children?: Child[] }; activeId: string; shouldOpen: boolean }) {
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (shouldOpen) setOpen(true);
    }, [shouldOpen]);
	return (
		<div className="accordion-item">
			<div className="accordion-header" onClick={() => setOpen((v) => !v)}>
				<strong>{section.title}</strong>
				<span aria-hidden>{open ? '−' : '+'}</span>
			</div>
			{open && (
				<div className="accordion-content">
					<div style={{ padding: '6px 0' }}>
						<a href={`#${section.id}`} className={activeId === section.id ? 'active' : ''} style={{ fontWeight: 600 }}>Overview</a>
					</div>
					{section.children?.map((c) => {
						const withKids = c as NodeWithChildren;
						if (withKids.children && withKids.children.length) {
							return <ChildAccordion key={withKids.id} item={withKids} activeId={activeId} />;
						}
						return (
							<div key={c.id} style={{ padding: '6px 0' }}>
								<a href={`#${c.id}`} className={activeId === c.id ? 'active' : ''} style={{ paddingLeft: 12 }}>{c.title}</a>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

function ChildAccordion({ item, activeId }: { item: NodeWithChildren; activeId: string }) {
	const [open, setOpen] = useState(false);
	useEffect(() => {
		if (activeId === item.id || (item.children ?? []).some((gc) => gc.id === activeId)) setOpen(true);
	}, [activeId, item]);
	return (
		<div style={{ padding: '6px 0' }}>
			<div className="accordion-header" onClick={() => setOpen((v) => !v)}>
				<a href={`#${item.id}`} className={activeId === item.id ? 'active' : ''} style={{ paddingLeft: 12, fontWeight: 600 }}>{item.title}</a>
				<span aria-hidden>{open ? '−' : '+'}</span>
			</div>
			{open && (
				<div className="accordion-content" style={{ paddingLeft: 6 }}>
					{item.children?.map((gc) => (
						<div key={gc.id} style={{ padding: '4px 0' }}>
							<a href={`#${gc.id}`} className={activeId === gc.id ? 'active' : ''} style={{ paddingLeft: 18 }}>{gc.title}</a>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function WikiContent({ section, child }: { section: { id: string; title: string; summary?: string; children?: Child[] }; child?: Child }) {
	if (child) {
		return (
			<div>
				<a href={`#${section.id}`} className="tag">{section.title}</a>
				<h2 id={child.id} style={{ marginTop: 10 }}>{child.title}</h2>
                <p style={{ color: 'var(--muted)' }}>{renderWithTooltips(child.body)}</p>
                {renderClassTableIfClass({ id: child.id, title: child.title })}
			</div>
		);
	}
	return (
		<div>
			<h2 id={section.id}>{section.title}</h2>
            {section.summary && <p style={{ color: 'var(--muted)' }}>{renderWithLinks(renderWithTooltips(section.summary))}</p>}
            {renderClassTableIfClass(section)}
			{section.children && section.children.length > 0 && (
				<div style={{ display: 'grid', gap: 12 }}>
					{section.children.map((c) => {
						const withKids = c as NodeWithChildren;
						return (
							<div key={c.id} className="doc" style={{ padding: 16 }}>
								<h3 id={c.id} style={{ marginTop: 0 }}>
									<a href={`#${c.id}`}>{c.title}</a>
								</h3>
								{c.body && <p style={{ color: 'var(--muted)', marginBottom: 0 }}>{renderWithLinks(renderWithTooltips(c.body))}</p>}
								{withKids.children && withKids.children.length > 0 && (
									<div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
										{withKids.children.map((gc) => (
											<div key={gc.id} className="doc" style={{ padding: 12 }}>
												<h4 id={gc.id} style={{ marginTop: 0 }}>
													<a href={`#${gc.id}`}>{gc.title}</a>
												</h4>
												{gc.body && <p style={{ color: 'var(--muted)', marginBottom: 0 }}>{renderWithLinks(renderWithTooltips(gc.body))}</p>}
											</div>
										))}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

function SearchResults({ results, onClear }: { results: SearchEntry[]; onClear: () => void }) {
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
                            <a href={`#${e.id}`} style={{ fontWeight: 600 }}>{e.title}</a>
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

function renderWithTooltips(text?: string) {
    if (!text) return null;
    const parts: (string | JSX.Element)[] = [text];
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
    for (const section of rules.sections) {
        if (section.id === id) return { section };
        for (const child of section.children ?? []) {
            if (child.id === id) return { section, child };
        }
    }
    return undefined;
}

function renderWithLinks(node: React.ReactNode) {
    const queue: React.ReactNode[] = [node];
    const out: React.ReactNode[] = [];
    while (queue.length) {
        const current = queue.shift();
        if (current === null || current === undefined) continue;
        if (typeof current === 'string') {
            out.push(applyLinkMapToString(current));
        } else if (Array.isArray(current)) {
            queue.push(...current);
        } else if (typeof current === 'object' && 'props' in (current as any)) {
            const el = current as any;
            if (typeof el.props?.children !== 'undefined') {
                out.push({ ...el, props: { ...el.props, children: renderWithLinks(el.props.children) } });
            } else {
                out.push(current);
            }
        } else {
            out.push(current);
        }
    }
    return <>{out}</>;
}

function applyLinkMapToString(text: string): React.ReactNode {
    let parts: (string | JSX.Element)[] = [text];
    Object.entries(WIKI_LINK_MAP).forEach(([phrase, id]) => {
        const regex = new RegExp(`(\\b${escapeRegex(phrase)}\\b)`, 'gi');
        const next: (string | JSX.Element)[] = [];
        parts.forEach((p) => {
            if (typeof p !== 'string') { next.push(p); return; }
            const split = p.split(regex);
            for (let i = 0; i < split.length; i++) {
                const segment = split[i];
                if (!segment) continue;
                if (regex.test(segment)) {
                    next.push(<a key={`${id}-${i}-${segment}`} href={`#${id}`}>{segment}</a>);
                } else {
                    next.push(segment);
                }
            }
        });
        parts = next;
    });
    return <>{parts}</>;
}

function slugify(name: string | undefined): string {
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildAbilityBody(a: { description?: string[]; target?: string; apCost?: any; tags?: string[] }): string {
    const parts: string[] = [];
    if (a.description && a.description.length) parts.push(a.description.join('\n'));
    if (a.target) parts.push(`Target: ${a.target}`);
    if (typeof a.apCost !== 'undefined') parts.push(`AP: ${a.apCost}`);
    if (a.tags && a.tags.length) parts.push(`Tags: ${a.tags.join(', ')}`);
    return parts.join('\n\n');
}

function renderClassTableIfClass(section: { id: string; title: string }) {
    if (!section.id.startsWith('class-')) return null;
    const key = section.id.replace(/^class-/, '');
    const info = (rules as any).classes?.[key] as { abilities?: { level: string | number; name: string; description?: string[]; target?: string; apCost?: any; tags?: string[] }[] } | undefined;
    if (!info || !info.abilities || !info.abilities.length) return null;
    const rows = info.abilities.map((a) => ({
        level: a.level,
        name: a.name,
        description: a.description ?? [],
        target: a.target ?? '',
        apCost: a.apCost ?? '',
        tags: a.tags,
    }));
    const getNameHref = (row: any) => `#ability-${key}-${slugify(row.name)}`;
    return <div style={{ margin: '12px 0' }}><ClassTable title={`${section.title} Abilities`} rows={rows} getNameHref={getNameHref as any} /></div>;
}
