import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import rules from '@/rules/rulesIndex';

type Child = { id: string; title: string; body?: string };
type SearchEntry = { id: string; title: string; preview: string; category: string; haystack: string };

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

    const [query, setQuery] = useState('');
    const searchIndex = useMemo<SearchEntry[]>(() => {
        const entries: SearchEntry[] = [];
        for (const s of sections) {
            const title = s.title ?? '';
            const preview = s.summary ?? '';
            const haystack = `${s.title ?? ''} ${s.summary ?? ''}`.toLowerCase();
            entries.push({ id: s.id, title, preview, category: s.title, haystack });
            for (const c of s.children ?? []) {
                const cTitle = c.title ?? '';
                const cBody = c.body ?? '';
                const cHaystack = `${c.title ?? ''} ${c.body ?? ''} ${s.title ?? ''}`.toLowerCase();
                entries.push({ id: c.id, title: cTitle, preview: cBody, category: s.title, haystack: cHaystack });
            }
        }
        return entries;
    }, [sections]);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [] as SearchEntry[];
        // Simple token AND search for better precision on small datasets
        const tokens = q.split(/\s+/).filter(Boolean);
        return searchIndex.filter((e) => tokens.every((t) => e.haystack.includes(t)));
    }, [query, searchIndex]);

	return (
		<div className="container layout">
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
