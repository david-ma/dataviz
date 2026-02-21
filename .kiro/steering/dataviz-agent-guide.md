# Dataviz Agent Guide

**Purpose:** Build data visualizations and blog posts for david-ma.net/dataviz

**Project Type:** Thalia website with D3.js visualizations, blog posts, and interactive demos

**Language:** Use Australian English.
**Date Format:** Use Australian (DD/MM/YYYY).
**Code:** Use Australian English.
**Documentation:** Use Australian English.
**Commit messages:** Use Australian English.
**Software:** Use Bun.
**Software:** Use Thalia.
**Software:** Use D3.js.
**Software:** Use Three.js.
**Software:** Use DataTables.net.
**Software:** Use Drizzle ORM.
**Software:** Use Handlebars.

## Project Structure

```
websites/dataviz/
├── config/
│   └── config.ts              # Routes, controllers, blog config
├── models/
│   └── drizzle-schema.ts      # Database schema (blog posts, etc.)
├── src/
│   ├── js/                    # TypeScript visualizations
│   │   ├── chart.ts           # Shared D3/Three.js utilities
│   │   └── *.ts               # Individual visualizations
│   ├── css/                   # SCSS stylesheets
│   │   ├── chart.scss         # Shared visualization styles
│   │   └── *.scss             # Page-specific styles
│   └── *.hbs                  # Handlebars templates
├── public/                    # Static files & compiled output
│   ├── js/                    # Compiled TypeScript (from webpack)
│   ├── css/                   # Compiled SCSS
│   └── data/                  # CSV/JSON data files
├── webpack.config.js          # Webpack bundler config
└── drizzle.config.ts          # Database config
```

## Key Technologies

- **Thalia Framework** - Progressive web framework (see Thalia steering docs)
- **D3.js v7** - Data visualization library
- **Three.js** - 3D graphics (for some visualizations)
- **DataTables.net** - Interactive tables
- **Webpack** - Bundles TypeScript/SCSS (shared chart.ts dependency pattern)
- **Drizzle ORM** - Database (MySQL)
- **Handlebars** - Templates

## Development Workflow

```bash
# Start development server (from Thalia root)
bun dev dataviz

# Build for production
cd websites/dataviz
npm run build                  # Webpack build
bun bin/build-scss.ts dataviz  # SCSS compilation

# Database migrations
npx drizzle-kit generate:mysql
npx drizzle-kit push:mysql
```

## Visualization Pattern

Most visualizations follow this pattern:

```typescript
import { Chart } from './chart'

new Chart({
  element: 'chart-container',
  width: 960,
  height: 600,
  data: myData
}).scratchpad((chart) => {
  // D3 visualization code here
  chart.svg.append('circle')
    .attr('cx', 100)
    .attr('cy', 100)
    .attr('r', 50)
})
```

### Shared Dependencies (chart.ts)

The `chart.ts` file provides:
- D3.js, Three.js, jQuery, DataTables imports
- Chart class with common setup
- Utility functions
- Shared SCSS styles

All visualizations depend on `chart.ts` via webpack's `dependOn` pattern.

## Blog Posts

Blog posts are:
- Written in Markdown
- Stored in database (via Drizzle)
- Rendered with `marked` library
- Listed at `/blog`
- Individual posts at `/blog/:slug`

## Data Files

Data can be:
1. **Static CSV/JSON** - Drop in `public/data/`
2. **Pre-compressed** - Use `.csv.gz` for large files (Thalia serves automatically)
3. **Dynamic API** - Create controller in `config/config.ts`
4. **Database** - Query via Drizzle in controllers

## Common Tasks

### Create New Visualization

1. Create `src/js/my-viz.ts`:
```typescript
import { Chart } from './chart'

new Chart({
  element: 'my-viz',
  width: 800,
  height: 600
}).scratchpad((chart) => {
  // Your D3 code
})
```

2. Create `src/my-viz.hbs` template
3. Add route in `config/config.ts` (if needed)
4. Webpack automatically bundles it

### Add New Blog Post

Use the blog controller (already configured) or add via database.

### Add Data Visualization

1. Prepare data (CSV/JSON)
2. Place in `public/data/` or create API endpoint
3. Create visualization TypeScript file
4. Create template to display it

## File Serving

Remember: Thalia serves `dist/` and `public/` at root level.

```html
<!-- ✅ Correct -->
<script src="/js/my-viz.js"></script>
<link rel="stylesheet" href="/css/chart.css">

<!-- ❌ Wrong -->
<script src="/public/js/my-viz.js"></script>
<script src="/dist/js/my-viz.js"></script>
```

## Webpack Configuration

The webpack config:
- Scans `src/js/` for all `.ts` files
- Creates entry points for each
- All depend on `chart.ts` (shared bundle)
- Outputs to `dist/js/` (dev) or `public/js/` (production)
- Compiles SCSS via sass-loader
- Uses ProvidePlugin for globals ($, jQuery, d3, datatables.net, showdown)

## Observable & D3 Resources

For visualization inspiration:
- [D3 Gallery on Observable](https://observablehq.com/@d3/gallery)
- [D3 Graph Gallery](https://d3-graph-gallery.com/)
- Observable notebooks for interactive examples

## Coding Style

Follow David's coding style (see `rules/david-coding-style.md`):
- Promise chains over async/await
- Early returns, flat chains
- Classes for stateful components
- Descriptive variable names

## Common Pitfalls

1. Don't modify `chart.ts` lightly - it's shared by all visualizations
2. Large data files should be gzipped (`.csv.gz`)
3. Webpack must run for TypeScript changes to take effect
4. SCSS changes need compilation for static hosting

## Example Projects in src/js/

- `matrix.ts` - Matrix rain effect (simple example)
- `awesome.ts` - GitHub awesome list visualization
- `hal.ts` - HAL 9000 dashboard
- `paperclips/` - Universal Paperclips game integration

These show different patterns and complexity levels.
