import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navbarRef = useRef<HTMLElement>(null);

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

    // Add body class when mobile menu is open for CSS targeting
    useEffect(() => {
        if (menuOpen) {
            document.body.classList.add('mobile-menu-open');
        } else {
            document.body.classList.remove('mobile-menu-open');
        }
        return () => {
            document.body.classList.remove('mobile-menu-open');
        };
    }, [menuOpen]);

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

    // Close menu when clicking outside
    useEffect(() => {
        if (!menuOpen) return;
        
        const handleClickOutside = (event: MouseEvent) => {
            if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        const handleNavbarClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Don't close if clicking on the burger button itself
            if (target.closest('.burger')) {
                return;
            }
            // Don't close if clicking on NavLink elements (they handle their own closing)
            if (target.closest('a')) {
                return;
            }
            // Close menu when clicking on any other navbar element
            if (navbarRef.current && navbarRef.current.contains(target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('mousedown', handleNavbarClick);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('mousedown', handleNavbarClick);
        };
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
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} ref={navbarRef}>
            <div className="container navbar-inner">
                <Link className="brand" to="/">
                    <img id="brand-logo" src={`${import.meta.env.BASE_URL}favicon-black.ico`} width="24" height="24" alt="Arcus" />
                    <span className="name">Arcus RPG</span>
                </Link>
                
                {/* Desktop navigation */}
                <div className="navlinks">
                    <NavLink to="/" end className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Home</NavLink>
                    <NavLink to="/rules" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Full Rules</NavLink>
                    <NavLink to="/wiki" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Wiki</NavLink>
                    <NavLink to="/character-sheets" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Character Sheets</NavLink>
                    <NavLink to="/world" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>The World</NavLink>
                    <NavLink to="/gm" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>GM Resources</NavLink>
                    <NavLink to="/blog" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>Blog</NavLink>
                </div>

                {/* Right side controls - always visible */}
                <div className="navbar-controls">
                    <ThemeToggle />
                    {/* Burger menu - shown on mobile */}
                    <button 
                        className="burger" 
                        aria-label="Open menu" 
                        aria-expanded={menuOpen} 
                        onClick={() => setMenuOpen(v => !v)}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 2h20M1 10h20M1 18h20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {/* Mobile title - shown on mobile */}
                <div className="nav-title" aria-live="polite">
                    {currentTitle}
                </div>
            </div>
            
            {/* Mobile menu */}
            <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
                <div className="menu-inner container">
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