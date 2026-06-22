# Example workflow

A walkthrough using the fictional sample data shipped with CourseMap.

## Scenario

- **Institution:** University prep school
- **Level:** B1
- **Weekly hours:** 6
- **Course goal:** Academic English
- **Focus:** speaking and academic reading
- **Constraints:** large classes (28), exam pressure, mixed levels
- **Coursebook:** _Sample English B1_ (fictional)
- **Unit:** Unit 4: Urban Life — _City problems and solutions_

## Steps

1. **Start the app** and open **New evaluation**.

2. **Teaching context.** Enter the scenario above. The context drives every
   judgment — e.g., an academic-English, exam-oriented prep class will weight
   communicative value and assessment alignment differently from a general-English
   class.

3. **Coursebook unit.** Enter the coursebook name, unit, topic, and a **short,
   original summary** of the unit's sections and tasks. Select the skills the unit
   covers. Do **not** paste the actual unit text.

4. **Rate the framework.** Work through the 12 categories, rating each criterion 1–5.
   In the sample, _Communicative and Task Value_ and _Assessment and Exam Alignment_
   score low (the reading is relevant but follow-up tasks stay comprehension-based and
   there is no exam-style writing), while _Context and Learner Fit_ and _Reading and
   Listening Text Quality_ score higher. Add evidence and adaptation notes where useful.

5. **Generate report.** With no API key, you get the deterministic fallback report.
   With `ANTHROPIC_API_KEY` set and AI enabled, you get an AI-supported report in the
   same structure.

6. **Read the report.** You will see:
   - an overall fit score and label (e.g., "Usable with adaptation"),
   - a radar + bar chart of category scores,
   - a context-fit judgment,
   - strengths and weaknesses,
   - per-category evidence-based comments with compact "Literature basis" labels,
   - an adaptation plan (keep / cut / simplify / supplement / reorder),
   - two original supplementary task drafts (e.g., an information-gap discussion and a
     scaffolded exam-style writing task),
   - implementation notes and limitations.

7. **Export.** Download as **Markdown**, **Print / Save as PDF**, or **copy** the
   adaptation plan for your scheme of work.

8. **History.** The evaluation is saved in the configured database and appears under **History**, where
   you can re-open or delete it.

## Try it quickly

```bash
npm run db:seed   # inserts this exact sample evaluation
npm run dev       # then open History → View
```
