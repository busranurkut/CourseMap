# Security Policy

## Supported versions

CourseMap is an MVP. Security fixes are applied to the `main` branch.

## Reporting a vulnerability

If you discover a security vulnerability, please **do not open a public issue**.
Instead, report it privately to the maintainers (e.g., via a GitHub security
advisory or direct contact). Include:

- A description of the vulnerability and its impact
- Steps to reproduce
- Any suggested remediation

We will acknowledge your report and aim to provide a remediation timeline.

## Handling secrets and data

- **Never commit secrets.** `ANTHROPIC_API_KEY` belongs in `.env`, which is
  git-ignored. Use `.env.example` as the committed template.
- **Local data only.** Evaluation data is stored in a local SQLite database
  (`prisma/dev.db`), which is git-ignored. CourseMap does not transmit evaluation
  data anywhere except, when explicitly enabled, the Anthropic API for report
  generation.
- **Coursebook content.** Do not paste entire copyrighted units. See
  `docs/ETHICS_AND_COPYRIGHT.md`.
