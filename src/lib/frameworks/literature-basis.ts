// Literature basis for the CourseMap Core Framework.
//
// CourseMap does NOT copy any copyrighted checklist. The evaluation criteria are
// original, synthesized formulations inspired by established ELT / TESOL materials
// evaluation, materials development, curriculum design, task-based learning,
// vocabulary learning, reading/listening pedagogy, CEFR-related literature, and
// guidance on responsible, human-in-the-loop use of AI in education.
//
// Sources are referenced from criteria via a short "anchor" key. CourseMap uses
// these anchors as *principles*, never as direct quotations. No quotations, page
// numbers, or DOIs are stored or generated.

export type SourceType = "core" | "supporting" | "ethics";

export type SourceCategory =
  | "Coursebook evaluation"
  | "Materials development & adaptation"
  | "Curriculum & syllabus"
  | "Reading & writing"
  | "Vocabulary"
  | "Listening"
  | "Task-based & communicative"
  | "Proficiency (CEFR)"
  | "Materials analysis"
  | "AI ethics & human-in-the-loop";

export const SOURCE_CATEGORY_ORDER: SourceCategory[] = [
  "Coursebook evaluation",
  "Materials development & adaptation",
  "Materials analysis",
  "Curriculum & syllabus",
  "Reading & writing",
  "Vocabulary",
  "Listening",
  "Task-based & communicative",
  "Proficiency (CEFR)",
  "AI ethics & human-in-the-loop",
];

export interface LiteratureSource {
  key: string;
  /** Short label used in compact "Literature basis" report chips. */
  short: string;
  /** Author/organization label. */
  authorLabel: string;
  year: string;
  /** Full APA-style reference. */
  apa: string;
  category: SourceCategory;
  /** Short, cautious note on what the source informs. */
  shortUse: string;
  sourceType: SourceType;
  /** Optional caution about how to read/cite the source. */
  caution?: string;
}

/** Backwards-compatible builder so existing call sites keep `key/short/apa`. */
function src(s: LiteratureSource): LiteratureSource {
  return s;
}

export const LITERATURE_SOURCES: Record<string, LiteratureSource> = {
  // ---- Coursebook evaluation ----
  Cunningsworth1995: src({
    key: "Cunningsworth1995",
    short: "Cunningsworth",
    authorLabel: "Cunningsworth, A.",
    year: "1995",
    apa: "Cunningsworth, A. (1995). Choosing your coursebook. Heinemann.",
    category: "Coursebook evaluation",
    shortUse: "Coursebook selection and context-fit criteria.",
    sourceType: "core",
  }),
  McGrath2002: src({
    key: "McGrath2002",
    short: "McGrath",
    authorLabel: "McGrath, I.",
    year: "2002",
    apa: "McGrath, I. (2002). Materials evaluation and design for language teaching. Edinburgh University Press.",
    category: "Coursebook evaluation",
    shortUse: "Materials evaluation and adaptation decisions.",
    sourceType: "core",
  }),
  Sheldon1988: src({
    key: "Sheldon1988",
    short: "Sheldon",
    authorLabel: "Sheldon, L. E.",
    year: "1988",
    apa: "Sheldon, L. E. (1988). Evaluating ELT textbooks and materials. ELT Journal, 42(4), 237–246.",
    category: "Coursebook evaluation",
    shortUse: "Practical textbook judgment, strengths and weaknesses.",
    sourceType: "core",
  }),
  Mukundan2011: src({
    key: "Mukundan2011",
    short: "Mukundan et al.",
    authorLabel: "Mukundan, J., Nimehchisalem, V., & Hajimohammadi, R.",
    year: "2011",
    apa: "Mukundan, J., Nimehchisalem, V., & Hajimohammadi, R. (2011). Developing an English language textbook evaluation checklist: A focus group study. International Journal of Humanities and Social Science, 1(12), 100–106.",
    category: "Coursebook evaluation",
    shortUse: "Checklist and criteria design for textbook evaluation.",
    sourceType: "core",
  }),
  BritishCouncil1987: src({
    key: "BritishCouncil1987",
    short: "British Council",
    authorLabel: "British Council",
    year: "1987",
    apa: "British Council. (1987). ELT textbooks and materials: Problems in evaluation and development. Modern English Publications / British Council.",
    category: "Coursebook evaluation",
    shortUse: "Evaluation history and stakeholder perspectives.",
    sourceType: "supporting",
    caution: "Older collection; use for background perspectives, not current data.",
  }),

  // ---- Materials development & adaptation ----
  Tomlinson2011: src({
    key: "Tomlinson2011",
    short: "Tomlinson",
    authorLabel: "Tomlinson, B. (Ed.)",
    year: "2011",
    apa: "Tomlinson, B. (Ed.). (2011). Materials development in language teaching (2nd ed.). Cambridge University Press.",
    category: "Materials development & adaptation",
    shortUse: "Materials-development principles and learner engagement.",
    sourceType: "core",
  }),
  Tomlinson2013: src({
    key: "Tomlinson2013",
    short: "Tomlinson",
    authorLabel: "Tomlinson, B.",
    year: "2013",
    apa: "Tomlinson, B. (2013). Developing materials for language teaching (2nd ed.). Bloomsbury.",
    category: "Materials development & adaptation",
    shortUse: "Adaptation and teacher-created materials.",
    sourceType: "core",
  }),
  TomlinsonMasuhara2017: src({
    key: "TomlinsonMasuhara2017",
    short: "Tomlinson & Masuhara",
    authorLabel: "Tomlinson, B., & Masuhara, H.",
    year: "2017",
    apa: "Tomlinson, B., & Masuhara, H. (2017). The complete guide to the theory and practice of materials development for language learning. Wiley-Blackwell.",
    category: "Materials development & adaptation",
    shortUse: "Principled evaluation-to-adaptation logic.",
    sourceType: "core",
  }),
  Harwood2010: src({
    key: "Harwood2010",
    short: "Harwood",
    authorLabel: "Harwood, N. (Ed.)",
    year: "2010",
    apa: "Harwood, N. (Ed.). (2010). English language teaching materials: Theory and practice. Cambridge University Press.",
    category: "Materials development & adaptation",
    shortUse: "Materials design, implementation, and evaluation.",
    sourceType: "core",
  }),
  McDonoughShawMasuhara2013: src({
    key: "McDonoughShawMasuhara2013",
    short: "McDonough, Shaw & Masuhara",
    authorLabel: "McDonough, J., Shaw, C., & Masuhara, H.",
    year: "2013",
    apa: "McDonough, J., Shaw, C., & Masuhara, H. (2013). Materials and methods in ELT: A teacher's guide (3rd ed.). Wiley-Blackwell.",
    category: "Materials development & adaptation",
    shortUse: "Adaptation decisions and lesson methods.",
    sourceType: "core",
  }),
  MishanTimmis2015: src({
    key: "MishanTimmis2015",
    short: "Mishan & Timmis",
    authorLabel: "Mishan, F., & Timmis, I.",
    year: "2015",
    apa: "Mishan, F., & Timmis, I. (2015). Materials development for TESOL. Edinburgh University Press.",
    category: "Materials development & adaptation",
    shortUse: "TESOL materials-development perspectives.",
    sourceType: "supporting",
  }),

  // ---- Materials analysis ----
  Littlejohn2011: src({
    key: "Littlejohn2011",
    short: "Littlejohn",
    authorLabel: "Littlejohn, A.",
    year: "2011",
    apa: "Littlejohn, A. (2011). The analysis of language teaching materials: Inside the Trojan Horse. In B. Tomlinson (Ed.), Materials development in language teaching (2nd ed., pp. 179–211). Cambridge University Press.",
    category: "Materials analysis",
    shortUse: "Principled analysis of what materials ask of learners.",
    sourceType: "supporting",
  }),

  // ---- Curriculum & syllabus ----
  Richards2001: src({
    key: "Richards2001",
    short: "Richards",
    authorLabel: "Richards, J. C.",
    year: "2001",
    apa: "Richards, J. C. (2001). Curriculum development in language teaching. Cambridge University Press.",
    category: "Curriculum & syllabus",
    shortUse: "Curriculum and syllabus alignment.",
    sourceType: "core",
  }),
  Graves2000: src({
    key: "Graves2000",
    short: "Graves",
    authorLabel: "Graves, K.",
    year: "2000",
    apa: "Graves, K. (2000). Designing language courses: A guide for teachers. Heinle & Heinle.",
    category: "Curriculum & syllabus",
    shortUse: "Course design and needs-based planning.",
    sourceType: "core",
  }),

  // ---- Reading & writing ----
  Grabe2009: src({
    key: "Grabe2009",
    short: "Grabe",
    authorLabel: "Grabe, W.",
    year: "2009",
    apa: "Grabe, W. (2009). Reading in a second language: Moving from theory to practice. Cambridge University Press.",
    category: "Reading & writing",
    shortUse: "L2 reading processes and academic reading support.",
    sourceType: "supporting",
  }),
  Nation2009: src({
    key: "Nation2009",
    short: "Nation",
    authorLabel: "Nation, I. S. P.",
    year: "2009",
    apa: "Nation, I. S. P. (2009). Teaching ESL/EFL reading and writing. Routledge.",
    category: "Reading & writing",
    shortUse: "Balanced skills work and meaning-focused input/output.",
    sourceType: "supporting",
  }),

  // ---- Vocabulary ----
  Nation2013: src({
    key: "Nation2013",
    short: "Nation",
    authorLabel: "Nation, I. S. P.",
    year: "2013",
    apa: "Nation, I. S. P. (2013). Learning vocabulary in another language (2nd ed.). Cambridge University Press.",
    category: "Vocabulary",
    shortUse: "Vocabulary load, recycling, and learning principles.",
    sourceType: "supporting",
  }),

  // ---- Listening ----
  Field2008: src({
    key: "Field2008",
    short: "Field",
    authorLabel: "Field, J.",
    year: "2008",
    apa: "Field, J. (2008). Listening in the language classroom. Cambridge University Press.",
    category: "Listening",
    shortUse: "Listening process and avoiding comprehension-only tasks.",
    sourceType: "supporting",
  }),
  VandergriftGoh2012: src({
    key: "VandergriftGoh2012",
    short: "Vandergrift & Goh",
    authorLabel: "Vandergrift, L., & Goh, C. C. M.",
    year: "2012",
    apa: "Vandergrift, L., & Goh, C. C. M. (2012). Teaching and learning second language listening: Metacognition in action. Routledge.",
    category: "Listening",
    shortUse: "Listening strategy and metacognitive support.",
    sourceType: "supporting",
  }),

  // ---- Task-based & communicative ----
  Ellis2003: src({
    key: "Ellis2003",
    short: "Ellis",
    authorLabel: "Ellis, R.",
    year: "2003",
    apa: "Ellis, R. (2003). Task-based language learning and teaching. Oxford University Press.",
    category: "Task-based & communicative",
    shortUse: "Task quality and communicative value.",
    sourceType: "supporting",
  }),
  Nunan2004: src({
    key: "Nunan2004",
    short: "Nunan",
    authorLabel: "Nunan, D.",
    year: "2004",
    apa: "Nunan, D. (2004). Task-based language teaching. Cambridge University Press.",
    category: "Task-based & communicative",
    shortUse: "Task design and outcomes.",
    sourceType: "supporting",
  }),
  Brown2007: src({
    key: "Brown2007",
    short: "Brown",
    authorLabel: "Brown, H. D.",
    year: "2007",
    apa: "Brown, H. D. (2007). Teaching by principles: An interactive approach to language pedagogy (3rd ed.). Pearson Longman.",
    category: "Task-based & communicative",
    shortUse: "Interactive, communicative teaching principles.",
    sourceType: "supporting",
  }),
  Long2015: src({
    key: "Long2015",
    short: "Long",
    authorLabel: "Long, M. H.",
    year: "2015",
    apa: "Long, M. H. (2015). Second language acquisition and task-based language teaching. Wiley-Blackwell.",
    category: "Task-based & communicative",
    shortUse: "TBLT and needs-based task design.",
    sourceType: "supporting",
  }),
  Skehan1998: src({
    key: "Skehan1998",
    short: "Skehan",
    authorLabel: "Skehan, P.",
    year: "1998",
    apa: "Skehan, P. (1998). A cognitive approach to language learning. Oxford University Press.",
    category: "Task-based & communicative",
    shortUse: "Task difficulty and cognitive/processing load.",
    sourceType: "supporting",
  }),

  // ---- Proficiency (CEFR) ----
  CEFR2001: src({
    key: "CEFR2001",
    short: "CEFR (2001)",
    authorLabel: "Council of Europe",
    year: "2001",
    apa: "Council of Europe. (2001). Common European Framework of Reference for Languages: Learning, teaching, assessment. Cambridge University Press.",
    category: "Proficiency (CEFR)",
    shortUse: "Proficiency-level alignment.",
    sourceType: "supporting",
  }),
  CEFR2020: src({
    key: "CEFR2020",
    short: "CEFR Companion (2020)",
    authorLabel: "Council of Europe",
    year: "2020",
    apa: "Council of Europe. (2020). Common European Framework of Reference for Languages: Learning, teaching, assessment – Companion volume. Council of Europe Publishing.",
    category: "Proficiency (CEFR)",
    shortUse: "Updated descriptors for proficiency alignment.",
    sourceType: "supporting",
  }),

  // ---- AI ethics & human-in-the-loop ----
  UNESCO2023: src({
    key: "UNESCO2023",
    short: "UNESCO",
    authorLabel: "UNESCO",
    year: "2023",
    apa: "UNESCO. (2023). Guidance for generative AI in education and research. UNESCO.",
    category: "AI ethics & human-in-the-loop",
    shortUse: "Human-centred, responsible AI use and teacher oversight.",
    sourceType: "ethics",
    caution: "Policy guidance; cite as general principle, not empirical evidence.",
  }),
  EuropeanCommission2022: src({
    key: "EuropeanCommission2022",
    short: "European Commission",
    authorLabel: "European Commission",
    year: "2022",
    apa: "European Commission. (2022). Ethical guidelines on the use of artificial intelligence (AI) and data in teaching and learning for educators. Publications Office of the European Union.",
    category: "AI ethics & human-in-the-loop",
    shortUse: "Educator-facing AI ethics and human oversight.",
    sourceType: "ethics",
    caution: "Policy guidance; cite as general principle, not empirical evidence.",
  }),
  USDeptEd2023: src({
    key: "USDeptEd2023",
    short: "US Dept of Education (OET)",
    authorLabel: "U.S. Department of Education, Office of Educational Technology",
    year: "2023",
    apa: "U.S. Department of Education, Office of Educational Technology. (2023). Artificial intelligence and the future of teaching and learning: Insights and recommendations.",
    category: "AI ethics & human-in-the-loop",
    shortUse: "Human-in-the-loop, safe and effective educational AI.",
    sourceType: "ethics",
    caution: "Policy guidance; cite as general principle, not empirical evidence.",
  }),
};

/** Resolve anchor keys to compact short labels (deduplicated, order-preserving). */
export function sourceLabels(anchors: string[]): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const a of anchors) {
    const source = LITERATURE_SOURCES[a];
    const label = source ? source.short : a;
    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }
  return labels;
}

/** Group all sources by category, in display order. */
export function sourcesByCategory(): {
  category: SourceCategory;
  sources: LiteratureSource[];
}[] {
  const all = Object.values(LITERATURE_SOURCES);
  return SOURCE_CATEGORY_ORDER.map((category) => ({
    category,
    sources: all
      .filter((s) => s.category === category)
      .sort((a, b) => a.authorLabel.localeCompare(b.authorLabel)),
  })).filter((g) => g.sources.length > 0);
}

export const REPORT_FRAMEWORK_NOTE =
  "Evaluation framework based on synthesized principles from ELT materials evaluation, materials development, curriculum design, task-based language teaching, vocabulary learning, and CEFR-related literature. The report should be interpreted as professional decision support, not as an absolute judgment.";
