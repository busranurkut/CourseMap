# Roadmap

CourseMap is an MVP. The features below are **scaffolded or described** but not
fully implemented, and are good next steps for contributors.

## Near term

- **PDF export library** — replace browser print with a server- or client-side PDF
  generator for consistent output.
- **More frameworks** — alternative or institution-specific evaluation frameworks
  selectable at evaluation time.

## Medium term

- **Photo upload + OCR** — extract a unit summary from a photo of a page the user is
  authorized to evaluate (with strict copyright guidance).
- **Side-by-side coursebook comparison** — compare two units/coursebooks against the
  same context.
- **Syllabus map** — map units to course outcomes across a term.
- **Exam alignment map** — map unit tasks to exam task types.

## Longer term

- **Institution-wide dashboard** — aggregate evaluations across a department.
- **User accounts & multi-user team review** — collaborative evaluation and sign-off.
- **Data export for research** — anonymized, structured export for action research
  and MA/PhD work.

## Architecture notes for extenders

- Frameworks live in `src/lib/frameworks/`. A new framework is just another
  `Framework` object; the scoring engine and report generators are framework-agnostic.
- The AI and fallback generators share the `GeneratedReport` shape (`src/lib/types.ts`),
  so report rendering and export work the same regardless of source.
- Persistence is a single `Evaluation` model (`prisma/schema.prisma`) storing ratings
  and the generated report as JSON for simplicity.
