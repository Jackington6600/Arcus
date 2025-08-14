import { useEffect, useMemo, useRef, useState } from 'react';
import rules from '@/rules/rulesIndex';
import { TOOLTIP_MAP } from '@/rules/rulesIndex';
import Tooltip from '@/components/Tooltip';
import ClassTable, { AbilityRow } from '@/pages/components/ClassTable';
import type { ClassAbility } from '@/rules/rulesIndex';

type Heading = { id: string; level: number; text: string };

export default function FullRules() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [activeId, setActiveId] = useState<string>('');
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const menuRef = useRef<HTMLDivElement>(null);
	
	// Add layout-page class to body to prevent scrolling
	useEffect(() => {
		document.body.classList.add('layout-page');
		return () => {
			document.body.classList.remove('layout-page');
		};
	}, []);

    const headings = useMemo<Heading[]>(() => {
        const hs: Heading[] = [];
        rules.sections.forEach((section) => {
            const id = section.id;
            hs.push({ id, level: 2, text: section.title });
            section.children?.forEach((c) => hs.push({ id: c.id, level: 3, text: c.title }));
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

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const headingEls = Array.from(container.querySelectorAll('h2, h3')) as HTMLElement[];
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				});
			},
			{ root: null, rootMargin: '-70px 0px -85% 0px', threshold: [0] }
		);
		headingEls.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, []);

	// If no hash/restore present and at page top, default to first heading
	useEffect(() => {
		if (window.location.hash) return;
		if (localStorage.getItem('fullRules.lastId')) return;
		const container = containerRef.current;
		if (!container) return;
		const firstHeading = container.querySelector('h2, h3') as HTMLElement | null;
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

	return (
		<div className="container layout">
			<div className="mobile-only" style={{ margin: '12px 0' }}>
				<button className="toc-toggle" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
						<path d="M4 19.5V6.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V19.5l-3-1.5-3 1.5-3-1.5-3 1.5Z"/>
					</svg>
					{activeTitle}
				</button>
			</div>
			<aside className="toc">
				<h4>On this page</h4>
				{headings.map((h) => (
					<a
						key={h.id}
						href={`#${h.id}`}
						className={activeId === h.id ? 'active' : ''}
						style={{ paddingLeft: h.level === 3 ? 22 : 10 }}
					>
						{h.text}
					</a>
				))}
			</aside>
			<article className="doc" ref={containerRef}>
				{rules.sections.map((s) => (
					<section key={s.id}>
						<h2 id={s.id}>{s.title}</h2>
						<p style={{ color: 'var(--muted)' }}>{renderWithTooltips(s.summary)}</p>
						{renderClassTableIfAny(s)}
						{s.children?.map((c) => (
							<div key={c.id}>
								<h3 id={c.id}>{c.title}</h3>
								<p>{renderWithTooltips(c.body)}</p>
							</div>
						))}
					</section>
				))}
			</article>
			<div className={`page-menu ${menuOpen ? 'open' : ''}`}>
				<div className="menu-inner" ref={menuRef}>
					<div className="accordion-header" onClick={() => setMenuOpen(false)}>
						<strong>On this page</strong>
						<span aria-hidden>×</span>
					</div>
					{headings.map((h) => (
						<a
							key={h.id}
							href={`#${h.id}`}
							className={activeId === h.id ? 'active' : ''}
							style={{ paddingLeft: h.level === 3 ? 22 : 10 }}
							onClick={() => setMenuOpen(false)}
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
    for (const section of rules.sections) {
        if (section.id === id) return { section };
        for (const child of section.children ?? []) {
            if (child.id === id) return { section, child };
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
                        <ClassTable title={info.name} rows={rows} />
                    </div>
                );
            })}
        </div>
    );
}



