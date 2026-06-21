# Contributing to CourseMap

Thanks for your interest in improving CourseMap! Contributions of all kinds are
welcome — bug reports, documentation, new frameworks, and features from the roadmap.

## Getting started

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

## Before opening a pull request

Please make sure the following pass locally:

```bash
npm run lint
npm run typecheck
npm run build
```

CI runs the same checks (see `.github/workflows/ci.yml`).

## Guidelines

- **Keep it typed.** This is a TypeScript project; avoid `any` where practical.
- **Match the existing style.** Reuse the UI primitives in `src/components/ui` and
  the patterns in `src/lib`.
- **No copyrighted material.** Never add real coursebook text. Use original,
  fictional sample data only (see `docs/ETHICS_AND_COPYRIGHT.md`).
- **Respect the literature basis.** New criteria should be original, synthesized
  formulations with appropriate source anchors — not copies of published checklists.
- **No absolute verdicts.** Generated language should remain decision-support in
  tone ("may need adaptation", "the available evidence suggests", etc.).

## Project structure

```
src/app/                 Next.js App Router pages + API routes
src/components/          UI components (ui/, forms/, report/)
src/lib/frameworks/      CourseMap Core Framework + literature basis
src/lib/scoring/         Scoring engine
src/lib/ai/              Anthropic prompt + generation
src/lib/report/          Fallback generator + orchestration
src/lib/export/          Markdown export
src/lib/db/              Prisma client + serialization
prisma/                  Schema + seed
```

## Reporting bugs

Open an issue with steps to reproduce, expected vs. actual behavior, and your
environment (OS, Node version).
