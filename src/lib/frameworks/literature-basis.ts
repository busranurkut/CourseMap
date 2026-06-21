// Literature basis for the CourseMap Core Framework.
//
// CourseMap does NOT copy any copyrighted checklist. The evaluation criteria are
// original, synthesized formulations inspired by established ELT / TESOL materials
// evaluation, materials development, curriculum design, task-based learning,
// vocabulary learning, reading/listening pedagogy and CEFR-related literature.
//
// Each source below is referenced from criteria via a short "anchor" key.

export interface LiteratureSource {
  key: string;
  /** Short label used in compact "Literature basis" report chips. */
  short: string;
  /** Full APA-style reference. */
  apa: string;
}

export const LITERATURE_SOURCES: Record<string, LiteratureSource> = {
  Cunningsworth1995: {
    key: "Cunningsworth1995",
    short: "Cunningsworth",
    apa: "Cunningsworth, A. (1995). Choosing your coursebook. Heinemann.",
  },
  McGrath2002: {
    key: "McGrath2002",
    short: "McGrath",
    apa: "McGrath, I. (2002). Materials evaluation and design for language teaching. Edinburgh University Press.",
  },
  Tomlinson2011: {
    key: "Tomlinson2011",
    short: "Tomlinson",
    apa: "Tomlinson, B. (Ed.). (2011). Materials development in language teaching (2nd ed.). Cambridge University Press.",
  },
  Tomlinson2013: {
    key: "Tomlinson2013",
    short: "Tomlinson",
    apa: "Tomlinson, B. (2013). Developing materials for language teaching (2nd ed.). Bloomsbury.",
  },
  McDonoughShawMasuhara2013: {
    key: "McDonoughShawMasuhara2013",
    short: "McDonough, Shaw & Masuhara",
    apa: "McDonough, J., Shaw, C., & Masuhara, H. (2013). Materials and methods in ELT: A teacher's guide (3rd ed.). Wiley-Blackwell.",
  },
  Richards2001: {
    key: "Richards2001",
    short: "Richards",
    apa: "Richards, J. C. (2001). Curriculum development in language teaching. Cambridge University Press.",
  },
  Graves2000: {
    key: "Graves2000",
    short: "Graves",
    apa: "Graves, K. (2000). Designing language courses: A guide for teachers. Heinle & Heinle.",
  },
  Nation2009: {
    key: "Nation2009",
    short: "Nation",
    apa: "Nation, I. S. P. (2009). Teaching ESL/EFL reading and writing. Routledge.",
  },
  Nation2013: {
    key: "Nation2013",
    short: "Nation",
    apa: "Nation, I. S. P. (2013). Learning vocabulary in another language (2nd ed.). Cambridge University Press.",
  },
  Ellis2003: {
    key: "Ellis2003",
    short: "Ellis",
    apa: "Ellis, R. (2003). Task-based language learning and teaching. Oxford University Press.",
  },
  Nunan2004: {
    key: "Nunan2004",
    short: "Nunan",
    apa: "Nunan, D. (2004). Task-based language teaching. Cambridge University Press.",
  },
  Brown2007: {
    key: "Brown2007",
    short: "Brown",
    apa: "Brown, H. D. (2007). Teaching by principles: An interactive approach to language pedagogy (3rd ed.). Pearson Longman.",
  },
  CEFR2001: {
    key: "CEFR2001",
    short: "CEFR (2001)",
    apa: "Council of Europe. (2001). Common European Framework of Reference for Languages: Learning, teaching, assessment. Cambridge University Press.",
  },
  CEFR2020: {
    key: "CEFR2020",
    short: "CEFR Companion (2020)",
    apa: "Council of Europe. (2020). Common European Framework of Reference for Languages: Learning, teaching, assessment – Companion volume. Council of Europe Publishing.",
  },
  Littlejohn2011: {
    key: "Littlejohn2011",
    short: "Littlejohn",
    apa: "Littlejohn, A. (2011). The analysis of language teaching materials: Inside the Trojan Horse. In B. Tomlinson (Ed.), Materials development in language teaching (2nd ed., pp. 179–211). Cambridge University Press.",
  },
  MishanTimmis2015: {
    key: "MishanTimmis2015",
    short: "Mishan & Timmis",
    apa: "Mishan, F., & Timmis, I. (2015). Materials development for TESOL. Edinburgh University Press.",
  },
};

/** Resolve anchor keys to compact short labels (deduplicated, order-preserving). */
export function sourceLabels(anchors: string[]): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const a of anchors) {
    const src = LITERATURE_SOURCES[a];
    const label = src ? src.short : a;
    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }
  return labels;
}

export const REPORT_FRAMEWORK_NOTE =
  "Evaluation framework based on synthesized principles from ELT materials evaluation, materials development, curriculum design, task-based language teaching, vocabulary learning, and CEFR-related literature. The report should be interpreted as professional decision support, not as an absolute judgment.";
