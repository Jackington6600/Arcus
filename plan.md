# Arcus Website Implementation Plan

## Project Setup

### Technology Stack

- **React 18+** with TypeScript
- **Vite** as build tool
- **Tailwind CSS** for styling
- **js-yaml** for parsing YAML files
- **fuse.js** for fuzzy search functionality
- **React Router** for navigation

### Project Structure

```
src/
├── components/
│   ├── MainMenuBar/
│   ├── NavigationMenu/
│   ├── SearchMenu/
│   ├── TabledRule/
│   ├── Tooltip/
│   └── shared/
├── pages/
│   ├── Home.tsx
│   ├── FullRules.tsx
│   └── ComingSoon.tsx
├── config/
│   ├── contentConfig.yaml
│   └── tooltips.yaml
├── styles/
│   ├── themes.css
│   ├── components.css
│   └── animations.css
├── utils/
│   ├── yamlLoader.ts
│   ├── search.ts
│   └── tooltipMatcher.ts
├── types/
│   └── index.ts
└── App.tsx
```

## Implementation Phases

### Phase 1: Project Foundation

1. Initialize Vite + React + TypeScript project
2. Install dependencies (Tailwind, js-yaml, fuse.js, react-router-dom)
3. Configure Tailwind with custom theme colors
4. Set up CSS architecture (themes.css, components.css, animations.css)
5. Create TypeScript type definitions for all YAML data structures
6. Implement YAML loader utility to parse all rules files

### Phase 2: Theme System

1. Create CSS custom properties for light/dark themes
2. Implement theme context/provider
3. Add theme persistence (localStorage)
4. Create theme toggle component

### Phase 3: Core Components

#### MainMenuBar

- Logo (switches based on theme)
- Page navigation links
- Burger menu for mobile (<768px breakpoint)
- Preferences button with dropdown menu
- Sticky positioning (always at top)
- Close-on-outside-click functionality

#### Preferences Menu

- Light/Dark mode toggle
- Display format selector (table/card/text) for tabled rules
- Persist preferences to localStorage
- Reusable dropdown component for burger menu and preferences

### Phase 4: Home Page

1. Background image component (arcus_spire_square.png)

    - Full viewport coverage
    - Centered, maintains aspect ratio
    - Responsive sizing

2. Text sections with flavor content

    - Main title: "The Spires of Arcus" (Cinzel font)
    - Summary and feature descriptions
    - Subtle shadows/blur for readability
    - Links to other pages

3. Main Menu Bar integration

### Phase 5: Configuration System

#### contentConfig.yaml Structure

```yaml
sections:
 - id: "introduction"
    displayFormat: "text"  # Always text, not changeable
    visible: true
 - id: "resolution-mechanics"
    displayFormat: "text"
    visible: true
    children:
   - id: "dice-system"
        displayFormat: "text"
        visible: true
 - id: "armour"
    sourceFile: "armour.yaml"
    displayFormat: "table"  # Changeable via preferences
    visibleFields: ["type", "armour", "movement", "notes"]
    visible: true
```

#### Tooltip Config (tooltips.yaml)

```yaml
tooltips:
 - phrases: ["blind", "blinded"]
    id: "blind"
 - phrases: ["fear", "frightened", "scared"]
    id: "fear"
```

### Phase 6: Full Rules Page

#### Main Content Component

- Parse contentConfig.yaml to determine what to render
- Render main_rules.yaml sections as text (split by "-" into paragraphs)
- Render tabled rules (armour, weapons, traits, core_abilities, class_abilities) using TabledRule component
- Support nested sections with proper heading hierarchy
- Add IDs to all headings for navigation

#### TabledRule Component

- Three display modes: table, card, text
- Table mode:
    - Sortable columns (ascending/descending/default)
    - Sticky header (below Main Menu Bar)
    - Horizontal scroll on mobile
    - Alternating row colors
    - Field visibility controlled by config
- Card mode:
    - Grid layout of printable cards
    - Responsive columns (1 on mobile, 2-3 on desktop)
- Text mode:
    - Structured text with fields on separate lines
- Respect user preferences for display format
- Always use text format for sections marked as non-changeable

#### Navigation Menu

- Desktop: Fixed sidebar with heading tree
- Auto-scroll to keep current heading centered
- Highlight current heading (strong) and parent headings (faint)
- Mobile: Floating button (bottom-left)
- Mobile overlay: Full-screen menu with close button
- Close on heading click or outside click (mobile)
- Generate heading tree from rendered content

#### Search Menu

- Integrated into Navigation Menu
- Search bar with clear button (X icon)
- Fuzzy search using fuse.js on:
    - Section headers
    - Rule content (from all YAML files)
- Display results in Navigation Menu area
- Hide heading tree when search has text
- Smooth scroll to selected result
- Flash highlight on target section
- Mobile: Works within mobile Navigation Menu overlay

### Phase 7: Tooltip System

1. Parse tooltips.yaml
2. Scan rendered text (excluding headers) for tooltip phrases
3. Wrap matching text with tooltip component
4. Tooltip component:

      - Subtle underline styling
      - Hover: Show tooltip box with summary from main_rules.yaml
      - Position intelligently (above/below based on space)
      - Ensure tooltip stays within viewport
      - Mobile: Tap to open, remains until tap elsewhere or scroll

5. Match phrases to rule IDs and display corresponding summaries

### Phase 8: Responsive Design & Polish

1. Mobile breakpoints (<768px)
2. Burger menu animations
3. Smooth transitions for theme switching
4. Loading states for YAML parsing
5. Error handling for missing files
6. Accessibility (ARIA labels, keyboard navigation)
7. Performance optimization (lazy loading, memoization)

### Phase 9: Coming Soon Pages

- Wiki, Character Sheets, The World, GM Resources, Blog
- Simple "Coming soon..." message
- Main Menu Bar present

## Key Technical Decisions

1. **YAML Parsing**: Load all YAML files at app start, cache in context
2. **State Management**: React Context for theme, preferences, and YAML data
3. **Routing**: React Router for page navigation
4. **Search**: Index all content on load, use fuse.js for fuzzy matching
5. **Tooltips**: Process text after render, inject tooltip components
6. **Config-driven**: All content ordering and display controlled by YAML config

## File Organization

- **Components**: One folder per major component with sub-components
- **Styles**: Separate files for themes, components, animations
- **Utils**: Pure functions for data processing
- **Types**: Centralized TypeScript definitions
- **Config**: YAML files in public or src/config (loaded at runtime)