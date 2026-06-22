# Ethics and copyright

CourseMap is a decision-support tool for professional materials evaluation and
adaptation. Using it responsibly is part of using it well.

## Copyright

- **Do not upload or paste entire copyrighted coursebooks or units.** Provide a
  short summary or the specific excerpt you are authorized to evaluate.
- **CourseMap does not redistribute coursebook content.** There is no feature that
  shares uploaded or pasted material publicly.
- The AI generator is instructed **not to reproduce coursebook text** and **not to
  generate large replacements** for copyrighted material. Supplementary tasks are
  original and inspired by your stated aims and the unit topic.

> This repository does not include copyrighted coursebook content. Users are
> responsible for ensuring that any uploaded or pasted material is used lawfully
> within their institutional and professional context.

## Sample data

All sample/demo data in this repository is **fictional**. For example:

- Coursebook: **Sample English B1** (fictional)
- Unit: **Unit 4: Urban Life**
- Text: a short fictional summary written for demonstration — **not** a real textbook passage.

## Professional judgment

- CourseMap **does not** give an objective final verdict on a coursebook.
- The framework and reports use careful wording such as "suggests", "indicates",
  "appears suitable", and "may need adaptation".
- Reports — whether AI-supported or template-based — are **decision-support
  documents** and should be reviewed by a qualified teacher or coordinator before
  acting on them.

## Data and privacy

- For the MVP, only user-created evaluation data is stored, and it is stored
  in the configured database (PostgreSQL/Neon in production; see `DATABASE_URL`).
- When AI generation is enabled, the evaluation inputs are sent to the Anthropic API
  solely to generate the report. Review Anthropic's terms and your institution's data
  policies before enabling it with sensitive content.
- Your API key lives in `.env` (git-ignored) and is never committed.
