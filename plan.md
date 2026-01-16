# Frontier Pulse — Execution Plan (Signal-First)

## North Star
Make frontier‑relevant signals obvious and actionable. Every chart or widget must answer:
- **What changed?** (Breakouts / cooling / new arrivals)
- **Why it matters?** (Benchmarks, deployability, research linkage)
- **What should I do?** (Which models to try, which papers to read)

## Data Sources (Concrete)
- **Hugging Face Models API**: model metadata, downloads (30d), likes, trending score, tags, created/updated, downloadsAllTime, inferenceProviderMapping, model-index, evalResults, gguf/safetensors.
- **Hugging Face Daily Papers**: title/summary/thumbnail/keywords, GitHub repo + stars.
- **HF arXiv → repos**: link papers to models/datasets/spaces.
- **OpenAlex**: citations, venue, publication date for paper impact.

## Signal Definitions (Not on HF)
- **Momentum Ratio** = 30d downloads / all‑time downloads (hotness now)
- **Baseline Velocity** = all‑time downloads / model age
- **Lift** = current velocity / baseline velocity (breakout vs cooling)
- **Deployability** = provider availability + formats (gguf/safetensors)
- **Research Bridge** = paper → linked models + citations

## Homepage (Signal‑First Layout)
1. **Frontier Signals**
   - Breakouts (highest lift)
   - Cooling (lowest lift)
   - New arrivals (age ≤ 7d with strong velocity)

2. **Featured Models (Curated + Visual)**
   - Visual card per model (task icon, trend badge, momentum %)
   - Shows: momentum ratio, 30d downloads, likes, last update

3. **Insight Charts (Meaningful)**
   - **Lift Ladder** (breakouts vs baseline)
   - **Momentum Share** (30d vs all‑time)
   - **Category Velocity** (aggregate daily velocity by task)
   - **Daily Deltas** (only if history snapshots exist)

4. **Research → Model Bridge**
   - Paper card with thumbnail + abstract
   - Linked HF repos from arXiv
   - OpenAlex citations shown

5. **Deployability & Formats**
   - “Ready to Ship” list (inference providers + gguf/safetensors)

6. **Benchmark Highlights**
   - Extract from model-index / evalResults
   - Display top metrics with dataset/task context

## Model Detail (Depth)
- Core stats + momentum + deployability
- Paper section embedded (summary, citations)
- Benchmarks section (model-index results)
- Files/formats listing

## Visual System
- **Shadcn UI** for consistency (cards, badges, tables, tabs)
- **Recharts** for charts (bar, scatter, line)
- Typography + spacing aligned to Notion‑style clarity

## Execution Steps
1. Integrate shadcn UI + Recharts
2. Build data layer: model detail fetch w/ expands, benchmark parsing, deployability signals
3. Implement signal widgets and charts with real metrics
4. Replace list‑only UI with signal‑first homepage
5. Embed paper + benchmark insights on model detail page
6. Validate with lint, verify UI readability

## Success Criteria
- Homepage answers “what’s changing + why it matters” in < 10 seconds.
- Each chart shows real, interpretable signals (no filler data).
- Model page is deeper than HF: benchmarks, deployability, linked papers.
