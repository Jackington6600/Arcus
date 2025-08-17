# CSS Architecture

This directory contains the organized CSS structure for the Arcus React application, following modern CSS best practices and component-based architecture.

## File Structure

```
styles/
├── index.css                 # Main entry point - imports all CSS files
├── variables.css             # CSS custom properties and theme definitions
├── base.css                  # Base styles, resets, and global element styles
├── layout.css                # Layout and grid system styles
├── components/               # Component-specific styles
│   ├── navbar.css           # Navigation bar component
│   ├── mobile-menu.css      # Mobile navigation menu
│   ├── table-of-contents.css # Table of contents sidebar
│   ├── wiki-toc.css         # Wiki accordion TOC styles
│   ├── search.css           # Search components and results
│   ├── mobile-toc.css       # Mobile TOC and page menu
│   ├── document.css         # Document content styling
│   ├── class-table.css      # Class table component
│   ├── tooltip.css          # Tooltip component
│   ├── accordion.css        # Accordion component
│   └── disclaimer.css       # Disclaimer component
├── pages/                    # Page-specific styles
│   └── home.css             # Home page specific styles
└── utilities.css             # Utility classes and animations
```

## Import Order

The CSS files are imported in a specific order to ensure proper cascade and avoid specificity conflicts:

1. **Variables** - CSS custom properties and theme definitions
2. **Base** - Global styles and resets
3. **Layout** - Grid and layout systems
4. **Components** - Individual component styles
5. **Pages** - Page-specific overrides
6. **Utilities** - Utility classes and animations (highest specificity)

## Best Practices Followed

### 1. **Component-Based Organization**
- Each component has its own CSS file
- Styles are scoped to component classes
- Easy to find and modify component-specific styles

### 2. **CSS Custom Properties**
- Centralized theme variables in `variables.css`
- Easy theme switching and maintenance
- Consistent color palette and spacing

### 3. **Logical Separation**
- Base styles separated from component styles
- Layout concerns separated from visual styling
- Utility classes for common patterns

### 4. **Maintainability**
- Clear file naming conventions
- Logical grouping of related styles
- Easy to locate and modify specific styles

### 5. **Performance**
- CSS imports are processed at build time
- No runtime CSS loading
- Optimized for production builds

## Adding New Styles

### For New Components
1. Create a new CSS file in the `components/` directory
2. Name it following the pattern: `component-name.css`
3. Add the import to `index.css` in the components section

### For New Pages
1. Create a new CSS file in the `pages/` directory
2. Name it following the pattern: `page-name.css`
3. Add the import to `index.css` in the pages section

### For Global Styles
- **Variables**: Add to `variables.css`
- **Base styles**: Add to `base.css`
- **Layout**: Add to `layout.css`
- **Utilities**: Add to `utilities.css`

## CSS Naming Conventions

- **Component classes**: Use kebab-case (e.g., `table-of-contents`)
- **Modifier classes**: Use BEM-like syntax (e.g., `toc--active`, `toc__item`)
- **Utility classes**: Use descriptive names (e.g., `reveal`, `enter-1`)

## Responsive Design

- Mobile-first approach with `@media (max-width: ...)` queries
- Breakpoints defined in CSS custom properties
- Consistent responsive behavior across components

## Theme Support

- Light and dark theme support via CSS custom properties
- Theme switching handled through `[data-theme="dark"]` attribute
- Smooth transitions between themes

## Browser Support

- Modern CSS features with fallbacks where needed
- Progressive enhancement approach
- Tested across modern browsers
