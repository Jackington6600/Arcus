import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Function to update favicon based on theme
    const updateFavicon = (theme: 'light' | 'dark') => {
        try {
            // Remove any existing favicon links
            const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
            existingFavicons.forEach(favicon => favicon.remove());
            
            // Use light icon for dark theme, dark icon for light theme (for better contrast)
            const faviconPath = theme === 'light' ? '/favicon-white.ico' : '/favicon-black.ico';
            
            // Create favicon link
            const favicon = document.createElement('link');
            favicon.rel = 'icon';
            favicon.type = 'image/x-icon';
            favicon.href = faviconPath;
            document.head.appendChild(favicon);
            
            // Also create a shortcut icon link for older browsers
            const shortcutIcon = document.createElement('link');
            shortcutIcon.rel = 'shortcut icon';
            shortcutIcon.type = 'image/x-icon';
            shortcutIcon.href = faviconPath;
            document.head.appendChild(shortcutIcon);
            
        } catch (error) {
            console.warn('Failed to update favicon:', error);
        }
    };

    // Function to update logo based on theme
    const updateLogo = (theme: 'light' | 'dark') => {
        try {
            // Find the logo element by ID
            const logoElement = document.getElementById('brand-logo');
            if (logoElement) {
                // Use the actual Arcus logo SVGs - light logo for dark theme, dark logo for light theme
                const logoSrc = theme === 'light' ? '/images/Arcus Logo Dark.svg' : '/images/Arcus Logo Light.svg';
                
                // Create new img element with the appropriate logo
                const newLogo = document.createElement('img');
                newLogo.id = 'brand-logo';
                newLogo.src = logoSrc;
                newLogo.width = 24;
                newLogo.height = 24;
                newLogo.alt = 'Arcus';
                
                // Replace the existing logo
                logoElement.outerHTML = newLogo.outerHTML;
            }
        } catch (error) {
            console.warn('Failed to update logo:', error);
        }
    };

    useEffect(() => {
        // Get theme from localStorage or default to light
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        // Update favicon and logo on initial load
        updateFavicon(savedTheme);
        updateLogo(savedTheme);
        setIsLoaded(true);
    }, []);

    const toggleTheme = () => {
        if (!theme) return; // Prevent toggle if theme isn't loaded yet
        
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        // Update favicon and logo when theme changes
        updateFavicon(newTheme);
        updateLogo(newTheme);
    };

    // Don't render until theme is loaded to prevent flash of incorrect icon
    if (!isLoaded || theme === null) {
        return (
            <button
                className="theme-toggle"
                aria-label="Loading theme toggle"
                disabled
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
            {theme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )}
        </button>
    );
}
