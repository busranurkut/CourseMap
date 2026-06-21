# CourseMap: Coursebook Evaluation and Adaptation Dashboard

> From coursebook evaluation to actionable adaptation.

CourseMap helps English teachers, materials developers, and prep-school
coordinators evaluate coursebook units and turn evaluation results into concrete
adaptation plans.

## Why this project matters

Materials evaluation and adaptation are core TEFL/TESOL practices. In day-to-day
teaching they are often done through static PDF checklists, and the resulting
decisions — what to supplement, cut, simplify, reorder, or replace — tend to be
informal, ad hoc, and undocumented. CourseMap makes the process systematic, fast,
evidence-based, and exportable, while keeping the teacher firmly in control of the
final judgment.

## Key features

- **Literature-grounded evaluation framework** — 12 source-anchored categories (the
  _CourseMap Core Framework_), each criterion linked to ELT/TESOL sources.
- **Teaching context form** — context is the primary basis for judging fit.
- **Unit evaluation checklist** — manual 1–5 ratings with evidence and adaptation notes.
- **Score visualization** — overall fit, per-category scores, radar and bar charts.
- **AI-supported adaptation report** — uses the Anthropic API when a key is configured.
- **Deterministic fallback report** — works fully offline with no API key.
- **Supplementary task generation** — at least two ready-made, original task drafts.
- **Exportable report** — download as Markdown or print to PDF.
- **Evaluation history** — saved locally in SQLite via Prisma.
- **Ethical copyright guidance** — built into the UI and docs.

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** with shadcn/ui-style components (Radix primitives)
- **React Hook Form** + **Zod** for forms and validation
- **Recharts** for score visualization
- **Prisma** + **SQLite** for local persistence
- **@anthropic-ai/sdk** for AI report generation (optional)

## Screenshots

_Screenshots coming soon._

## Installation

This project uses **npm** and a **PostgreSQL** database (a free [Neon](https://neon.tech)
database works for both local development and production).

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Create your environment file, then paste your Postgres URL into DATABASE_URL
cp .env.example .env

# 3. Create the database table
npm run db:push

# 4. (Optional) Seed one fictional sample evaluation
npm run db:seed

# 5. Start the dev server
npm run dev
```

Then open http://localhost:3000.

> **Requires Node.js 18.18+ (Node 20 LTS recommended)** and a `DATABASE_URL`
> pointing at a PostgreSQL database.

## Deploy a public website (free)

CourseMap can be hosted publicly for free with **GitHub + Vercel + Neon Postgres**.
See the step-by-step guide in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). In short:
push the code to GitHub, create a free Neon database, import the repo on Vercel, add
`DATABASE_URL` as an environment variable, and deploy. No AI key is required — the
built-in fallback generator works for everyone.

### Useful scripts

| Script             | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start the development server             |
| `npm run build`    | Generate Prisma client + production build |
| `npm start`        | Run the production build                  |
| `npm run lint`     | ESLint                                    |
| `npm run typecheck`| TypeScript type checking                 |
| `npm run db:push`  | Create/update the SQLite schema          |
| `npm run db:seed`  | Insert a fictional sample evaluation     |

## Environment variables

See [`.env.example`](.env.example).

| Variable            | Required | Description                                                                 |
| ------------------- | -------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`      | Yes      | SQLite connection string, e.g. `file:./dev.db`.                             |
| `ANTHROPIC_API_KEY` | No       | If set, reports are generated with the Anthropic API. If empty, the fallback generator is used. |
| `ANTHROPIC_MODEL`   | No       | Override the Claude model (defaults to a current Claude model).             |

## Usage

1. Go to **New evaluation**.
2. Fill in your **teaching context** (institution, level, goal, hours, needs, constraints).
3. Add the **coursebook unit** details and a **unit summary** (do not paste entire copyrighted units).
4. Rate the **CourseMap Core Framework** criteria from 1 (very weak) to 5 (very strong),
   adding evidence and adaptation notes per category.
5. Click **Generate report**.
6. Review the score profile, context-fit judgment, adaptation plan, and supplementary tasks.
7. **Export** as Markdown, **Print / Save as PDF**, or **copy** the adaptation plan.

### How AI generation works

When `ANTHROPIC_API_KEY` is set and the "Use AI-supported generation" box is checked,
CourseMap sends the teaching context, unit information, ratings, evidence/adaptation
notes, and a synthesized framework prompt to the Anthropic API and requests a
structured JSON report. The system prompt instructs the model to base judgments on
the teacher's context, connect comments to criteria, reference source anchors by
author/year **without inventing quotations or page numbers**, avoid absolute
verdicts, and keep all supplementary tasks original.

### How fallback generation works

When no API key is configured (or the user opts out, or the API call fails),
CourseMap uses a deterministic, template-based generator. It derives the overview,
context-fit judgment, strengths/weaknesses, per-category interpretation, an
adaptation plan, and two original supplementary tasks directly from the computed
scores and the notes you entered. The fallback never produces an absolute verdict.

## Literature basis

The criteria synthesize principles from established ELT/TESOL literature, including
Cunningsworth, McGrath, Tomlinson, Richards, Graves, Nation, Ellis, Nunan, Brown,
McDonough/Shaw/Masuhara, Littlejohn, Mishan & Timmis, and the CEFR (2001 & 2020).
The criteria are **original and synthesized — not copied** from any copyrighted
checklist. See [`docs/LITERATURE_BASIS.md`](docs/LITERATURE_BASIS.md) and the in-app
**Literature basis** page for the full reference list.

## Ethics and copyright

- Do **not** upload entire copyrighted books.
- Use only materials you are allowed to evaluate.
- Do **not** redistribute copyrighted coursebook content.
- Reports are **decision-support documents**, not absolute verdicts, and should be
  reviewed by a qualified teacher or coordinator.

See [`docs/ETHICS_AND_COPYRIGHT.md`](docs/ETHICS_AND_COPYRIGHT.md).

## Roadmap

- Photo upload + OCR for unit content
- Side-by-side coursebook comparison
- Syllabus map and exam alignment map
- Institution-wide dashboard
- Multi-user team review
- Additional frameworks
- Data export for research

See [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Academic use

CourseMap can support:

- Teacher professional development
- Coursebook selection
- Materials adaptation documentation
- Prep-school curriculum review
- MA thesis or action-research projects

## License

[MIT](LICENSE).

## Disclaimer

CourseMap supports professional decision-making. **It does not replace teacher
expertise.** Generated reports — whether AI-supported or template-based — should
always be reviewed by a qualified teacher or coordinator.
