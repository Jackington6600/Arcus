import { useEffect, useMemo, useRef, useState } from 'react';
import rules from '@/rules/rulesIndex';

type Heading = { id: string; level: number; text: string };

export default function FullRules() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [activeId, setActiveId] = useState<string>('');
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const headings = useMemo<Heading[]>(() => {
		const hs: Heading[] = [];
		rules.sections.forEach((section) => {
			const id = section.id;
			hs.push({ id, level: 2, text: section.title });
			section.children?.forEach((c) => hs.push({ id: c.id, level: 3, text: c.title }));
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
			{ root: null, rootMargin: '-40% 0px -55% 0px', threshold: [0, 1] }
		);
		headingEls.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
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
						<p style={{ color: 'var(--muted)' }}>{s.summary}</p>
						{s.children?.map((c) => (
							<div key={c.id}>
								<h3 id={c.id}>{c.title}</h3>
								<p>{c.body}</p>
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



