import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import rules from '@/rules/rulesIndex';

type Child = { id: string; title: string; body?: string };

export default function Wiki() {
	const location = useLocation();
	const sections = rules.sections;

	const idToSection = useMemo(() => {
		const map = new Map<string, { section: typeof sections[number]; child?: Child }>();
		for (const s of sections) {
			map.set(s.id, { section: s });
			for (const c of s.children ?? []) {
				map.set(c.id, { section: s, child: c });
			}
		}
		return map;
	}, [sections]);

	const firstId = sections[0]?.id ?? '';
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

	return (
		<div className="container layout">
			<aside className="toc">
				<h4>Browse Wiki</h4>
				{sections.map((s) => (
					<SidebarAccordion key={s.id} section={s} activeId={activeId} />
				))}
			</aside>
			<article className="doc" id="wiki-article" style={{ maxHeight: 'calc(100dvh - 100px)', overflow: 'auto' }}>
				{active ? (
					<WikiContent section={active.section} child={active.child} />
				) : (
					<p style={{ color: 'var(--muted)' }}>No content available.</p>
				)}
			</article>
		</div>
	);
}

function SidebarAccordion({ section, activeId }: { section: { id: string; title: string; summary?: string; children?: Child[] }; activeId: string }) {
	const [open, setOpen] = useState(true);
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
					{section.children?.map((c) => (
						<div key={c.id} style={{ padding: '6px 0' }}>
							<a href={`#${c.id}`} className={activeId === c.id ? 'active' : ''} style={{ paddingLeft: 12 }}>{c.title}</a>
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
				<p style={{ color: 'var(--muted)' }}>{child.body}</p>
			</div>
		);
	}
	return (
		<div>
			<h2 id={section.id}>{section.title}</h2>
			{section.summary && <p style={{ color: 'var(--muted)' }}>{section.summary}</p>}
			{section.children && section.children.length > 0 && (
				<div style={{ display: 'grid', gap: 12 }}>
					{section.children.map((c) => (
						<div key={c.id} className="doc" style={{ padding: 16 }}>
							<h3 id={c.id} style={{ marginTop: 0 }}>
								<a href={`#${c.id}`}>{c.title}</a>
							</h3>
							{c.body && <p style={{ color: 'var(--muted)', marginBottom: 0 }}>{c.body}</p>}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
