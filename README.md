# Arcus Website

A modern, responsive website for the Arcus tabletop role-playing game (TTRPG) rules.

## Features

- 📖 Full rules display with configurable content ordering
- 🔍 Fuzzy search functionality
- 🎨 Light and dark theme support
- 📱 Fully responsive design with mobile support
- 💡 Interactive tooltips for key terms
- 📊 Multiple display formats for rule tables (table, card, text)
- 🧭 Navigation menu with heading tree

## Technology Stack

- **React 18+** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **js-yaml** for parsing YAML files
- **fuse.js** for fuzzy search

## Development

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # React components
├── contexts/         # React context providers
├── pages/           # Page components
├── styles/          # CSS files
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
public/              # Static assets and YAML files
```

## Configuration

Content ordering and display is controlled by `public/contentConfig.yaml`. Tooltip phrases are configured in `public/tooltips.yaml`.

## Deployment

The site is configured to deploy to GitHub Pages via GitHub Actions. The workflow automatically builds and deploys when changes are pushed to the `main` branch.

## License

See LICENSE file for details.

