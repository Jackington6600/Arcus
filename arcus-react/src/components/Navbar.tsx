import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    // Add scroll effect to navbar
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            setScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent background scroll when mobile menu is open
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

    // Close on Escape key
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [menuOpen]);

    const titles: Record<string, string> = {
        '/': 'Home',
        '/rules': 'Full Rules',
        '/wiki': 'Wiki',
        '/character-sheets': 'Character Sheets',
        '/world': 'The World',
        '/gm': 'GM Resources',
        '/blog': 'Blog',
    };
    const currentTitle = titles[location.pathname] ?? 'Arcus';

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-inner">
                <Link className="brand" to="/">
                    <img src={`${import.meta.env.BASE_URL}favicon-black.ico`} width="24" height="24" alt="Arcus" />
                    <span className="name">Arcus RPG</span>
                </Link>
                <div className="nav-title mobile-only" aria-live="polite">{currentTitle}</div>
                <button className="burger mobile-only" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
                    <svg width="26" height="20" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 2h24M1 10h24M1 18h24" stroke="#222" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                </button>
                <div className="navlinks desktop-only">
                    <NavLink to="/" end className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Home</NavLink>
                    <NavLink to="/rules" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Full Rules</NavLink>
                    <NavLink to="/wiki" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Wiki</NavLink>
                    <NavLink to="/character-sheets" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Character Sheets</NavLink>
                    <NavLink to="/world" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>The World</NavLink>
                    <NavLink to="/gm" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>GM Resources</NavLink>
                    <NavLink to="/blog" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Blog</NavLink>
                </div>
            </div>
            <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
                <div className="menu-inner container" onClick={(e) => e.stopPropagation()}>
                    <NavLink to="/" end className={({ isActive }) => `m-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Home</NavLink>
                    <NavLink to="/rules" className={({ isActive }) => `m-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Full Rules</NavLink>
                    <NavLink to="/wiki" className={({ isActive }) => `m-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Wiki</NavLink>
                    <NavLink to="/character-sheets" className={({ isActive }) => `m-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Character Sheets</NavLink>
                    <NavLink to="/world" className={({ isActive }) => `m-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>The World</NavLink>
                    <NavLink to="/gm" className={({ isActive }) => `m-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>GM Resources</NavLink>
                    <NavLink to="/blog" className={({ isActive }) => `m-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Blog</NavLink>
                </div>
            </div>
        </nav>
    );
}



