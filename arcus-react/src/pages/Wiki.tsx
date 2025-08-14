import { useMemo, useState } from 'react';
import rules from '@/rules/rulesIndex';

type Entry = { id: string; title: string; text: string; category: string };

function flattenRules(): Entry[] {
	const entries: Entry[] = [];
	rules.sections.forEach((s) => {
		entries.push({ id: s.id, title: s.title, text: s.summary ?? '', category: 'Sections' });
		s.children?.forEach((c) => entries.push({ id: c.id, title: c.title, text: c.body ?? '', category: s.title }));
	});
	return entries;
}

export default function Wiki() {
	const [query, setQuery] = useState('');
	const entries = useMemo(() => flattenRules(), []);
	const categories = useMemo(() => Array.from(new Set(entries.map((e) => e.category))), [entries]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return entries;
		return entries.filter((e) => `${e.title} ${e.text}`.toLowerCase().includes(q));
	}, [entries, query]);

    return (
        <div className="container" style={{ padding: '22px 0 80px' }}>
			<div className="searchbar">
				<input className="input" placeholder="Search rules, conditions, items..." value={query} onChange={(e) => setQuery(e.target.value)} />
			</div>
			<div className="accordion">
				{categories.map((cat) => {
					const items = filtered.filter((e) => e.category === cat);
					if (!items.length) return null;
					return <Accordion key={cat} title={`${cat} (${items.length})`} entries={items} />;
				})}
			</div>
		</div>
	);
}

function Accordion({ title, entries }: { title: string; entries: Entry[] }) {
	const [open, setOpen] = useState(true);
	return (
		<div className="accordion-item">
			<div className="accordion-header" onClick={() => setOpen((v) => !v)}>
				<strong>{title}</strong>
				<span aria-hidden>{open ? '−' : '+'}</span>
			</div>
			{open && (
				<div className="accordion-content">
					{entries.map((e) => (
						<div key={e.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
								<a href={`/rules#${e.id}`} style={{ fontWeight: 600 }}>{e.title}</a>
								<span className="tag">Ref</span>
							</div>
							<p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>{e.text.slice(0, 160)}{e.text.length > 160 ? '…' : ''}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}



