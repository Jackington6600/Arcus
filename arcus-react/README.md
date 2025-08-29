# Arcus React

A modern React-based web application for the Arcus tabletop role-playing game (TTRPG) system, featuring comprehensive rules documentation, character sheets, and GM resources.

## Features

- **📚 Complete Rules System** - Full rules documentation with searchable content
- **🔍 Advanced Search** - Token-based search across all game content
- **📱 Responsive Design** - Mobile-first design with dark/light theme support
- **⚡ Fast Performance** - Built with Vite and optimized for quick loading
- **🎯 Type Safety** - Full TypeScript implementation with strict typing
- **📖 Wiki-Style Navigation** - Organized content with table of contents and cross-references

## Tech Stack

- **React 18.2.0** + **TypeScript 5.5.4**
- **Vite 5.4.0** for fast development and building
- **React Router 6.26.1** for client-side routing
- **js-yaml 4.1.0** for YAML content management
- **CSS Custom Properties** for theming

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview --port 5173
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/               # Route-level page components
├── rules/yaml/          # Game content in YAML format
├── styles/              # Organized CSS architecture
└── utils/               # Utility functions and helpers
```

## Content Management

Game content is managed through structured YAML files in `src/rules/yaml/`:
- `basic.yaml` - Core game mechanics and rules
- `classes.yaml` - Character classes and abilities
- `traits.yaml` - Character traits and features

All content is automatically indexed for search and cross-referenced throughout the application.

## Deployment

The project is configured for automated deployment to GitHub Pages with proper SPA routing support. The build process automatically handles base path configuration based on repository type.

## Development

See the comprehensive development guidelines in `.cursor/rules/sitestructure.mdc` for detailed architecture documentation, coding standards, and best practices.
