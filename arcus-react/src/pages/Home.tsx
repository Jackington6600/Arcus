import React, { useEffect, useRef } from 'react';

export default function Home() {
    useEffect(() => {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        const animated = Array.from(hero.querySelectorAll('.enter')) as HTMLElement[];

        const resetAndRun = () => {
            animated.forEach((el) => {
                el.classList.remove('enter');
                // force reflow
                void el.offsetWidth;
                el.classList.add('enter');
            });
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        resetAndRun();
                    } else {
                        animated.forEach((el) => el.classList.remove('enter'));
                    }
                });
            },
            { threshold: 0.2 }
        );
        observer.observe(hero);
        return () => observer.disconnect();
    }, []);

    return (
        <>
        <section className="hero">
            <div className="container">
                <div className="hero-card">
					<h1 className="hero-title ornament enter enter-1">The Spires of Arcus</h1>
					<p className="hero-subtitle enter enter-2">
						A pen and paper tabletop role playing game focused on thrilling tactical combat and evocative role-play in a luminous fantasy setting.
					</p>
					<div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }} className="enter enter-3">
						<button className="cta" onClick={() => document.getElementById('more')?.scrollIntoView({ behavior: 'smooth' })}>
							Learn More
							<span aria-hidden>↓</span>
						</button>
						{/* Tooltip example (uncomment when needed)
						<Tooltip title="Condition: Stunned" description="Lose your next action. Attackers have advantage against you.">
							<span>Stunned?</span>
						</Tooltip>
						*/}
					</div>
				</div>
            </div>
        </section>
        <ContentBelow />
        </>
	);
}

function ContentBelow() {
	const blocks = [
		{
			title: 'Fast, Tactical Combat',
			text: 'Every choice matters. Exploit terrain, combine abilities, and outsmart foes with synergies.',
		},
		{
			title: 'Luminous Fantasy',
			text: 'Explore soaring spires and radiant storms. Uncover ancient engines humming beneath the world.',
		},
		{
			title: 'Built For Tables',
			text: 'Readable rules, class tables, and tools that run at the table—online or in person.',
		},
	];

	return (
		<div id="more" className="container" style={{ padding: '56px 0 96px' }}>
			<div style={{ display: 'grid', gap: 18 }}>
				{blocks.map((b, i) => (
					<Reveal key={i}>
						<div className="doc" style={{ padding: 22 }}>
							<h3 style={{ marginTop: 0 }}>{b.title}</h3>
							<p style={{ color: 'var(--muted)', marginBottom: 0 }}>{b.text}</p>
						</div>
					</Reveal>
				))}
			</div>
		</div>
	);
}

function Reveal({ children }: { children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						el.classList.add('visible');
					} else {
						el.classList.remove('visible');
					}
				});
			},
			{ threshold: 0.2 }
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);

	return (
		<div ref={ref} className="reveal">
			{children}
		</div>
	);
}


