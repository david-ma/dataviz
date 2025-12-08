# Streaming Companies Stream Graph Plan

## Scope & Goals

- Build a data-backed MVP stream graph showing streaming companies over years with metric toggle (subscribers primary; revenue, originals count, awards optional metrics gathered).
- Keep within dataviz site; follow David coding style and Bun tooling rules.

## Data & Modeling

- Identify dataset format (CSV/TS/JSON) with fields: company, year, subscribers, revenue, originals_count, awards, mergers/acquisitions metadata (acquirer, acquiree, year, note, source).
- Source initial data manually from reliable public sources; note citations in comments/metadata file.
- Define a small curated starter dataset for MVP; add schema/types in `src/js/data/streaming.ts` (or new data module) with type aliases.

## Visualization Design

- Stream graph (stacked area with baseline smoothing) on X=year, Y=metric value; one series per company, merged companies combined starting at merger year.
- Metric toggle (radio/select) to switch between subscribers (default), revenue, originals count, awards; rescale Y per metric.
- Tooltip on hover: company, metric value, year, merger annotations when applicable; legend for series colors.

## Implementation Steps

- Data prep: create typed dataset module and helper to aggregate/merge series per metric; handle mergers (combine acquiree into acquirer from merger year onward; optional annotation layer).
- Chart scaffold: new view/template (likely under `src/views`/public) and entry script (e.g., `src/js/paperclips/stream-graph.ts`) using existing chart utilities; use d3 stack/area with smooth curves.
- Interactions: metric toggle UI, legend, tooltip; transition between metrics (recompute stack with new accessor), respect style guide (promise chains, early returns).
- Styles: basic CSS for chart container, legend, tooltip; keep lightweight and compatible with existing pipeline.

## Testing & Validation

- Logic tests for data helpers (merger combine, metric accessor) with vitest/happy-dom where feasible.
- Visual/manual check: run local Bun serve, verify toggle switches metrics, tooltips correct, legend matches colors; screenshot for reference.

## Deliverables

- Updated plan file (`dataviz-stream-graph.md`) with this plan.
- New data module + chart script + template updates; minimal tests for data helpers.
- Notes on data sources and assumptions in code comments/readme block.

### To-dos

- [ ] Define typed dataset and merger handling helpers
- [ ] Implement stream graph chart script with metric toggle
- [ ] Add view/template, legend, tooltip UI and CSS
- [ ] Add helper tests and do manual visual check