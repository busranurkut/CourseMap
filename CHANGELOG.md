# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-21

### Added

- Initial CourseMap MVP.
- Literature-grounded **CourseMap Core Framework**: 12 source-anchored categories,
  each with 3+ original criteria.
- **Literature basis** module with APA reference list and an in-app `/literature` page.
- Teaching-context and coursebook-unit evaluation form (React Hook Form + Zod).
- Manual 1–5 rating engine with per-category evidence and adaptation notes.
- Scoring engine (category averages, overall score, fit labels).
- **AI-supported report generation** via the Anthropic API (optional).
- **Deterministic fallback report generator** (no API key required).
- Two original, ready-made supplementary task drafts per report.
- Report page with overall score card, radar + bar charts, strengths/weaknesses,
  context-fit judgment, adaptation plan, supplementary tasks, and compact
  "Literature basis" labels.
- Export as Markdown and print-friendly "Save as PDF" report.
- Copy adaptation plan to clipboard.
- Evaluation history (Prisma + SQLite) with view, edit, and delete.
- Edit an existing evaluation (`/evaluations/[id]/edit`) and save to regenerate the report (PUT API).
- One fictional sample evaluation (`npm run db:seed`).
- Ethics and copyright guidance in the UI and docs.
- GitHub-readiness files: README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY,
  docs, and a CI workflow (lint + typecheck + build).
