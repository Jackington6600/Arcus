import { useEffect, useMemo, useRef, useState } from 'react';
import rules from '@/rules/rulesIndex';

type Heading = { id: string; level: number; text: string };

export default function FullRules() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [activeId, setActiveId] = useState<string>('');

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

    return (
        <div className="container layout">
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
		</div>
	);
}



