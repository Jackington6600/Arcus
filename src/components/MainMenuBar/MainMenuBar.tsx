import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigationMenu } from '@/contexts/NavigationMenuContext';
import { DropdownMenu } from '../shared/DropdownMenu';
import { Overlay } from '../shared/Overlay';

const baseUrl = import.meta.env.BASE_URL;
const LogoDark = `${baseUrl}Arcus Logo Dark.svg`;
const LogoLight = `${baseUrl}Arcus Logo Light.svg`;

const PAGES = [
  { path: '/', label: 'Home' },
  { path: '/full-rules', label: 'Full Rules' },
  { path: '/wiki', label: 'Wiki' },
  { path: '/character-sheets', label: 'Character Sheets' },
  { path: '/the-world', label: 'The World' },
  { path: '/gm-resources', label: 'GM Resources' },
  { path: '/blog', label: 'Blog' },
];

/**
 * Main navigation menu bar component
 */
export function MainMenuBar() {
  const location = useLocation();
  const { theme, preferences, setTheme, setDisplayFormat } = useTheme();
  const { closeMenu: closeNavigationMenu } = useNavigationMenu();
  const [burgerMenuOpen, setBurgerMenuOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setBurgerMenuOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // LogoDark is for light theme (dark logo on light background)
  // LogoLight is for dark theme (light logo on dark background)
  const Logo = theme === 'dark' ? LogoLight : LogoDark;

  const handleMenuBarClick = (e: React.MouseEvent) => {
    // Only close navigation menu if clicking on the nav bar itself, not on buttons/links
    const target = e.target as HTMLElement;
    // Check if click is on a button, link, or their children
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="button"]')
    ) {
      // If it's the burger menu or preferences button, close navigation menu
      if (
        target.closest('button[aria-label="Menu"]') ||
        target.closest('button[aria-label="Preferences"]')
      ) {
        closeNavigationMenu();
      }
      // Otherwise, let the button/link handle its own click
      return;
    }
    // Click on the nav bar itself (not on interactive elements)
    closeNavigationMenu();
  };

  return (
    <nav 
      className="sticky top-0 z-50 bg-surface border-b border-border-light shadow-soft"
      onClick={isMobile ? handleMenuBarClick : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={Logo} alt="Arcus Logo" className="h-10 w-auto" />
            <span className="text-xl font-semibold text-text-primary">Arcus RPG</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center space-x-6">
              {PAGES.map((page) => (
                <Link
                  key={page.path}
                  to={page.path}
                  className={`
                    text-sm font-medium transition-smooth
                    ${
                      location.pathname === page.path
                        ? 'text-accent'
                        : 'text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  {page.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side: Preferences and Burger Menu */}
          <div className="flex items-center space-x-4">
            {/* Preferences Button */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreferencesOpen(!preferencesOpen);
                  if (isMobile) {
                    closeNavigationMenu();
                  }
                }}
                className="p-2 rounded-soft text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-smooth"
                aria-label="Preferences"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              <DropdownMenu
                isOpen={preferencesOpen}
                onClose={() => setPreferencesOpen(false)}
                align="right"
              >
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Theme
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setTheme('light');
                          setPreferencesOpen(false);
                        }}
                        className={`
                          flex-1 px-3 py-2 rounded-soft text-sm transition-smooth
                          ${
                            theme === 'light'
                              ? 'bg-accent text-surface'
                              : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                          }
                        `}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => {
                          setTheme('dark');
                          setPreferencesOpen(false);
                        }}
                        className={`
                          flex-1 px-3 py-2 rounded-soft text-sm transition-smooth
                          ${
                            theme === 'dark'
                              ? 'bg-accent text-surface'
                              : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                          }
                        `}
                      >
                        Dark
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Display Format
                    </label>
                    <div className="space-y-1">
                      {(['table', 'card', 'text'] as const).map((format) => (
                        <button
                          key={format}
                          onClick={() => {
                            setDisplayFormat(format);
                            setPreferencesOpen(false);
                          }}
                          className={`
                            w-full text-left px-3 py-2 rounded-soft text-sm transition-smooth
                            ${
                              preferences.displayFormat === format
                                ? 'bg-accent text-surface'
                                : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                            }
                          `}
                        >
                          {format.charAt(0).toUpperCase() + format.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DropdownMenu>
            </div>

            {/* Burger Menu Button (Mobile) */}
            {isMobile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBurgerMenuOpen(true);
                  closeNavigationMenu();
                }}
                className="p-2 rounded-soft text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-smooth"
                aria-label="Menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Burger Menu Overlay */}
      <Overlay isOpen={burgerMenuOpen && isMobile} onClose={() => setBurgerMenuOpen(false)}>
        <div className="h-full bg-surface">
          <div className="flex items-center justify-between h-16 px-4 border-b border-border-light">
            <span className="text-xl font-semibold text-text-primary">Menu</span>
            <button
              onClick={() => setBurgerMenuOpen(false)}
              className="p-2 rounded-soft text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-smooth"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav className="px-4 py-6 space-y-2">
            {PAGES.map((page) => (
              <Link
                key={page.path}
                to={page.path}
                onClick={() => setBurgerMenuOpen(false)}
                className={`
                  block px-4 py-3 rounded-medium text-base font-medium transition-smooth
                  ${
                    location.pathname === page.path
                      ? 'bg-accent text-surface'
                      : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                  }
                `}
              >
                {page.label}
              </Link>
            ))}
          </nav>
        </div>
      </Overlay>
    </nav>
  );
}

