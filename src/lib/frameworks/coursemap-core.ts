import type { Framework } from "@/lib/types";

// CourseMap Core Framework
//
// Original, synthesized criteria inspired by — but NOT copied from — established
// ELT/TESOL materials evaluation literature. Each criterion carries source anchors
// that map into LITERATURE_SOURCES (see literature-basis.ts).

export const COURSEMAP_CORE: Framework = {
  id: "coursemap-core",
  name: "CourseMap Core Framework",
  description:
    "A literature-grounded framework for evaluating a coursebook unit against a specific teaching context and turning the result into an adaptation plan.",
  scale: [
    { value: 1, label: "Very weak" },
    { value: 2, label: "Weak" },
    { value: 3, label: "Acceptable" },
    { value: 4, label: "Strong" },
    { value: 5, label: "Very strong" },
  ],
  categories: [
    {
      id: "context-fit",
      name: "Context and Learner Fit",
      description:
        "How well the unit matches learner age, level, needs, institutional goals, course hours and the local teaching context.",
      sourceAnchors: ["Cunningsworth1995", "McGrath2002", "Graves2000", "Richards2001"],
      criteria: [
        {
          id: "context-fit-01",
          category: "Context and Learner Fit",
          criterion:
            "The unit content is relevant to the learners' stated needs and the institution's goals.",
          explanation:
            "Checks whether the topics, tasks and outcomes connect to why these learners are studying and what the course is meant to achieve.",
          sourceAnchors: ["Cunningsworth1995", "Graves2000", "Richards2001"],
          evidencePrompt:
            "Which parts of the unit connect to the learners' needs or the course goal you entered?",
          adaptationPrompt:
            "If relevance is weak, suggest re-anchoring tasks to learner needs or replacing the topic framing.",
        },
        {
          id: "context-fit-02",
          category: "Context and Learner Fit",
          criterion:
            "The amount of material is realistic for the available weekly hours and course duration.",
          explanation:
            "Considers whether the unit can be taught in the time available without rushing or padding.",
          sourceAnchors: ["Graves2000", "McGrath2002"],
          evidencePrompt:
            "Roughly how many hours would this unit need, compared with the time you have?",
          adaptationPrompt:
            "If the unit is too long or too thin, suggest cutting, condensing or extending specific sections.",
        },
        {
          id: "context-fit-03",
          category: "Context and Learner Fit",
          criterion:
            "The unit accounts for the learners' profile (background, prior knowledge, motivation).",
          explanation:
            "Looks at whether assumptions in the materials suit the actual learners rather than an idealized group.",
          sourceAnchors: ["Cunningsworth1995", "McGrath2002"],
          evidencePrompt:
            "Where do the materials assume background knowledge your learners may or may not have?",
          adaptationPrompt:
            "If assumptions mismatch the profile, suggest pre-teaching, schema-building or localized examples.",
        },
      ],
    },
    {
      id: "syllabus-alignment",
      name: "Syllabus and Curriculum Alignment",
      description:
        "Alignment with course outcomes, CEFR descriptors, exam expectations and progression.",
      sourceAnchors: ["Richards2001", "Graves2000", "CEFR2001", "CEFR2020"],
      criteria: [
        {
          id: "syllabus-alignment-01",
          category: "Syllabus and Curriculum Alignment",
          criterion:
            "The unit's learning outcomes map onto the course outcomes or syllabus you are following.",
          explanation:
            "Checks whether what the unit teaches advances the documented goals of the course.",
          sourceAnchors: ["Richards2001", "Graves2000"],
          evidencePrompt:
            "Which course outcomes does this unit move learners towards?",
          adaptationPrompt:
            "If outcomes are loosely connected, suggest re-framing aims or adding an outcome-aligned task.",
        },
        {
          id: "syllabus-alignment-02",
          category: "Syllabus and Curriculum Alignment",
          criterion:
            "The language and skills targets are consistent with the relevant CEFR level descriptors.",
          explanation:
            "Considers whether the can-do targets implied by the unit match the intended proficiency band.",
          sourceAnchors: ["CEFR2001", "CEFR2020"],
          evidencePrompt:
            "Which CEFR can-do statements does the unit appear to target?",
          adaptationPrompt:
            "If the level drifts, suggest adjusting task demands up or down to fit the descriptors.",
        },
        {
          id: "syllabus-alignment-03",
          category: "Syllabus and Curriculum Alignment",
          criterion:
            "The unit shows clear progression and recycling rather than isolated, one-off content.",
          explanation:
            "Looks at whether new language builds on earlier learning and is revisited.",
          sourceAnchors: ["Richards2001", "Graves2000"],
          evidencePrompt:
            "What earlier language does the unit build on or recycle?",
          adaptationPrompt:
            "If recycling is missing, suggest spaced review or a cumulative output task.",
        },
      ],
    },
    {
      id: "level-cognitive-load",
      name: "Language Level and Cognitive Load",
      description:
        "Vocabulary load, grammar demands, input difficulty, text density and learner manageability.",
      sourceAnchors: ["Nation2013", "CEFR2001", "Tomlinson2011", "McDonoughShawMasuhara2013"],
      criteria: [
        {
          id: "level-cognitive-load-01",
          category: "Language Level and Cognitive Load",
          criterion:
            "The vocabulary load is manageable, with new items introduced at a reasonable density.",
          explanation:
            "Checks whether the proportion of unknown words supports comprehension and learning rather than overload.",
          sourceAnchors: ["Nation2013"],
          evidencePrompt:
            "Roughly how dense is the new vocabulary in the unit's texts and tasks?",
          adaptationPrompt:
            "If the load is high, suggest pre-teaching key items, glossing, or staging the input.",
        },
        {
          id: "level-cognitive-load-02",
          category: "Language Level and Cognitive Load",
          criterion:
            "Grammar demands match the stated level and are introduced with adequate support.",
          explanation:
            "Considers whether structures are pitched appropriately and scaffolded.",
          sourceAnchors: ["CEFR2001", "McDonoughShawMasuhara2013"],
          evidencePrompt:
            "Which structures might be too demanding or too easy for your learners?",
          adaptationPrompt:
            "If grammar is mispitched, suggest added examples, simplification, or extension.",
        },
        {
          id: "level-cognitive-load-03",
          category: "Language Level and Cognitive Load",
          criterion:
            "Input texts are appropriately dense and well supported for the target level.",
          explanation:
            "Looks at sentence length, abstractness and the support available to process texts.",
          sourceAnchors: ["Nation2009", "Tomlinson2011"],
          evidencePrompt:
            "Where might text density slow your learners down?",
          adaptationPrompt:
            "If density is high, suggest pre-reading support, chunking, or a graded alternative.",
        },
      ],
    },
    {
      id: "skills-balance",
      name: "Skills Balance and Integration",
      description:
        "Balance and integration of reading, listening, speaking, writing, grammar, vocabulary and pronunciation in relation to course aims.",
      sourceAnchors: ["Brown2007", "Nation2009", "McDonoughShawMasuhara2013", "Richards2001"],
      criteria: [
        {
          id: "skills-balance-01",
          category: "Skills Balance and Integration",
          criterion:
            "The balance of skills work reflects the priorities of your course.",
          explanation:
            "Checks whether time-on-skill matches what the course actually values (e.g., speaking, academic reading).",
          sourceAnchors: ["Richards2001", "Brown2007"],
          evidencePrompt:
            "Which skills does the unit emphasize, and does that match your course focus?",
          adaptationPrompt:
            "If the balance is off, suggest trimming over-weighted sections and adding priority-skill tasks.",
        },
        {
          id: "skills-balance-02",
          category: "Skills Balance and Integration",
          criterion:
            "Skills are integrated meaningfully rather than presented in isolation.",
          explanation:
            "Considers whether, for example, reading feeds into speaking or writing.",
          sourceAnchors: ["Brown2007", "McDonoughShawMasuhara2013"],
          evidencePrompt:
            "Where does one skill feed naturally into another in the unit?",
          adaptationPrompt:
            "If skills are siloed, suggest a bridging task that links input to production.",
        },
        {
          id: "skills-balance-03",
          category: "Skills Balance and Integration",
          criterion:
            "Vocabulary and pronunciation work is connected to the surrounding skills work.",
          explanation:
            "Looks at whether language systems support the communicative aims of the unit.",
          sourceAnchors: ["Nation2009", "Nation2013"],
          evidencePrompt:
            "How is vocabulary or pronunciation work tied to the unit's tasks?",
          adaptationPrompt:
            "If disconnected, suggest folding language work into a communicative outcome.",
        },
      ],
    },
    {
      id: "communicative-value",
      name: "Communicative and Task Value",
      description:
        "Meaningful communication, interaction, task authenticity, outcome-based tasks and learner production.",
      sourceAnchors: ["Ellis2003", "Nunan2004", "Tomlinson2011", "Brown2007"],
      criteria: [
        {
          id: "communicative-value-01",
          category: "Communicative and Task Value",
          criterion:
            "The unit gives learners opportunities to use language for meaningful communication, not only controlled practice.",
          explanation:
            "Evaluates whether learners exchange meanings, solve problems, express opinions or complete communicative tasks.",
          sourceAnchors: ["Ellis2003", "Nunan2004", "McDonoughShawMasuhara2013"],
          evidencePrompt:
            "Which task allows learners to communicate meaningfully?",
          adaptationPrompt:
            "If meaningful communication is weak, suggest a freer speaking, information-gap, problem-solving or discussion task.",
        },
        {
          id: "communicative-value-02",
          category: "Communicative and Task Value",
          criterion:
            "Tasks have a clear outcome or purpose beyond producing correct forms.",
          explanation:
            "Considers whether tasks lead to an outcome (a decision, a product, a solution).",
          sourceAnchors: ["Ellis2003", "Nunan2004"],
          evidencePrompt:
            "What is the outcome learners are working towards in the main task?",
          adaptationPrompt:
            "If tasks lack outcomes, suggest reframing them around a concrete goal or product.",
        },
        {
          id: "communicative-value-03",
          category: "Communicative and Task Value",
          criterion:
            "There is a genuine move towards freer, learner-generated production.",
          explanation:
            "Looks at whether learners get to produce extended, personalized language.",
          sourceAnchors: ["Brown2007", "Tomlinson2011"],
          evidencePrompt:
            "Where do learners produce extended or personalized language?",
          adaptationPrompt:
            "If production stays controlled, suggest a freer-production stage at the end.",
        },
      ],
    },
    {
      id: "text-quality",
      name: "Reading and Listening Text Quality",
      description:
        "Text relevance, level appropriacy, authenticity, support, topic interest and comprehension scaffolding.",
      sourceAnchors: ["Nation2009", "Tomlinson2011", "McGrath2002", "Cunningsworth1995"],
      criteria: [
        {
          id: "text-quality-01",
          category: "Reading and Listening Text Quality",
          criterion:
            "Reading and listening texts are relevant and interesting for these learners.",
          explanation:
            "Checks topic relevance and likely engagement for the specific group.",
          sourceAnchors: ["Tomlinson2011", "Cunningsworth1995"],
          evidencePrompt:
            "Which texts are likely to engage your learners, and why?",
          adaptationPrompt:
            "If a text is unengaging, suggest a more relevant alternative or a stronger framing task.",
        },
        {
          id: "text-quality-02",
          category: "Reading and Listening Text Quality",
          criterion:
            "Texts are pitched at an appropriate level with adequate comprehension support.",
          explanation:
            "Considers whether pre-, while- and post-tasks support understanding.",
          sourceAnchors: ["Nation2009", "McGrath2002"],
          evidencePrompt:
            "What support helps learners understand the texts (pre-teaching, guiding questions)?",
          adaptationPrompt:
            "If support is thin, suggest adding pre-reading/listening tasks or comprehension scaffolds.",
        },
        {
          id: "text-quality-03",
          category: "Reading and Listening Text Quality",
          criterion:
            "Tasks built on the texts go beyond surface comprehension.",
          explanation:
            "Looks at whether learners infer, evaluate or use the text rather than only locating facts.",
          sourceAnchors: ["Nation2009", "Tomlinson2011"],
          evidencePrompt:
            "Do follow-up tasks ask for more than locating information?",
          adaptationPrompt:
            "If tasks are comprehension-only, suggest inference, response or text-to-task transfer activities.",
        },
      ],
    },
    {
      id: "task-sequencing",
      name: "Task Sequencing and Lesson Flow",
      description:
        "Logical movement from input to practice to freer use, with recycling, scaffolding and progression.",
      sourceAnchors: ["McDonoughShawMasuhara2013", "Richards2001", "Graves2000", "Tomlinson2011"],
      criteria: [
        {
          id: "task-sequencing-01",
          category: "Task Sequencing and Lesson Flow",
          criterion:
            "Activities move logically from input to controlled practice to freer production.",
          explanation:
            "Checks the overall arc of the unit for coherent staging.",
          sourceAnchors: ["McDonoughShawMasuhara2013", "Tomlinson2011"],
          evidencePrompt:
            "How does the unit move from presentation to practice to production?",
          adaptationPrompt:
            "If the arc breaks, suggest reordering, inserting a practice bridge, or adding a production stage.",
        },
        {
          id: "task-sequencing-02",
          category: "Task Sequencing and Lesson Flow",
          criterion:
            "Each stage is adequately scaffolded so learners are ready for the next.",
          explanation:
            "Considers whether the step-up in demand between activities is manageable.",
          sourceAnchors: ["Graves2000", "Richards2001"],
          evidencePrompt:
            "Where might the jump between two activities be too large?",
          adaptationPrompt:
            "If a jump is too steep, suggest an intermediate scaffolding step.",
        },
        {
          id: "task-sequencing-03",
          category: "Task Sequencing and Lesson Flow",
          criterion:
            "The unit recycles target language across stages rather than dropping it.",
          explanation:
            "Looks at whether new items reappear in later tasks.",
          sourceAnchors: ["Richards2001", "Nation2013"],
          evidencePrompt:
            "Where is target language reused later in the unit?",
          adaptationPrompt:
            "If recycling is weak, suggest a cumulative end task that reuses the language.",
        },
      ],
    },
    {
      id: "vocab-grammar",
      name: "Vocabulary and Grammar Treatment",
      description:
        "Recycling, contextualization, form–meaning–use balance, noticing, and practice opportunities.",
      sourceAnchors: ["Nation2013", "Brown2007", "Richards2001", "McDonoughShawMasuhara2013"],
      criteria: [
        {
          id: "vocab-grammar-01",
          category: "Vocabulary and Grammar Treatment",
          criterion:
            "Target language is presented in meaningful context rather than isolated lists or rules.",
          explanation:
            "Checks whether learners meet language in use before manipulating it.",
          sourceAnchors: ["Nation2013", "McDonoughShawMasuhara2013"],
          evidencePrompt:
            "How is target language first introduced in context?",
          adaptationPrompt:
            "If context is missing, suggest a noticing task that situates the language.",
        },
        {
          id: "vocab-grammar-02",
          category: "Vocabulary and Grammar Treatment",
          criterion:
            "Practice covers form, meaning and use rather than form alone.",
          explanation:
            "Considers whether learners work on all three dimensions of the language.",
          sourceAnchors: ["Nation2013", "Brown2007"],
          evidencePrompt:
            "Which exercises address meaning and use, not just form?",
          adaptationPrompt:
            "If practice is form-heavy, suggest a meaning- or use-focused activity.",
        },
        {
          id: "vocab-grammar-03",
          category: "Vocabulary and Grammar Treatment",
          criterion:
            "There are opportunities to recycle vocabulary and grammar productively.",
          explanation:
            "Looks at whether language is reused in output, aiding retention.",
          sourceAnchors: ["Nation2013", "Richards2001"],
          evidencePrompt:
            "Where do learners reuse target language in their own output?",
          adaptationPrompt:
            "If recycling is thin, suggest a vocabulary-recycling or scaffolded writing task.",
        },
      ],
    },
    {
      id: "engagement",
      name: "Engagement, Relevance, and Motivation",
      description:
        "Topic relevance, affective engagement, learner interest, personalization and classroom usability.",
      sourceAnchors: ["Tomlinson2011", "Cunningsworth1995", "McGrath2002", "Graves2000"],
      criteria: [
        {
          id: "engagement-01",
          category: "Engagement, Relevance, and Motivation",
          criterion:
            "The unit is likely to engage learners affectively and intellectually.",
          explanation:
            "Checks whether content invites curiosity, response or personal connection.",
          sourceAnchors: ["Tomlinson2011"],
          evidencePrompt:
            "What in the unit is likely to spark interest or personal response?",
          adaptationPrompt:
            "If engagement is low, suggest a personalization hook or a more relevant angle.",
        },
        {
          id: "engagement-02",
          category: "Engagement, Relevance, and Motivation",
          criterion:
            "Tasks invite personalization and learner voice.",
          explanation:
            "Considers whether learners bring their own experience and opinions.",
          sourceAnchors: ["Tomlinson2011", "Graves2000"],
          evidencePrompt:
            "Where can learners bring their own ideas or experience?",
          adaptationPrompt:
            "If personalization is absent, suggest a discussion or opinion stage.",
        },
        {
          id: "engagement-03",
          category: "Engagement, Relevance, and Motivation",
          criterion:
            "The unit is practical to run in your classroom conditions.",
          explanation:
            "Looks at class size, equipment and timing realities.",
          sourceAnchors: ["McGrath2002", "Cunningsworth1995"],
          evidencePrompt:
            "Which activities may be hard to run given your class size or constraints?",
          adaptationPrompt:
            "If an activity is impractical, suggest a low-resource or large-class variant.",
        },
      ],
    },
    {
      id: "cultural-inclusive",
      name: "Cultural, Social, and Inclusive Content",
      description:
        "Cultural representation, bias, inclusivity, appropriateness and local adaptability.",
      sourceAnchors: ["Cunningsworth1995", "McGrath2002", "Tomlinson2011", "MishanTimmis2015"],
      criteria: [
        {
          id: "cultural-inclusive-01",
          category: "Cultural, Social, and Inclusive Content",
          criterion:
            "Cultural content is appropriate and respectful for your learners and context.",
          explanation:
            "Checks for content that may be sensitive, alienating or inappropriate locally.",
          sourceAnchors: ["Cunningsworth1995", "MishanTimmis2015"],
          evidencePrompt:
            "Is any content potentially sensitive or inappropriate in your context?",
          adaptationPrompt:
            "If content is sensitive, suggest reframing, substituting or contextualizing it.",
        },
        {
          id: "cultural-inclusive-02",
          category: "Cultural, Social, and Inclusive Content",
          criterion:
            "Representation is balanced and avoids stereotypes or bias.",
          explanation:
            "Considers gender, role and cultural representation across the unit.",
          sourceAnchors: ["McGrath2002", "Tomlinson2011"],
          evidencePrompt:
            "How balanced is the representation of people and cultures?",
          adaptationPrompt:
            "If representation is narrow, suggest adding diverse examples or perspectives.",
        },
        {
          id: "cultural-inclusive-03",
          category: "Cultural, Social, and Inclusive Content",
          criterion:
            "Content can be localized so learners see themselves in it.",
          explanation:
            "Looks at how easily examples can be adapted to the learners' world.",
          sourceAnchors: ["MishanTimmis2015", "Tomlinson2011"],
          evidencePrompt:
            "How easily can examples be localized to your learners' lives?",
          adaptationPrompt:
            "If localization is hard, suggest a parallel local example or task.",
        },
      ],
    },
    {
      id: "assessment-alignment",
      name: "Assessment and Exam Alignment",
      description:
        "Whether tasks prepare learners for institutional assessment, proficiency exams, and skill outcomes.",
      sourceAnchors: ["Richards2001", "Graves2000", "CEFR2001", "Brown2007"],
      criteria: [
        {
          id: "assessment-alignment-01",
          category: "Assessment and Exam Alignment",
          criterion:
            "Tasks resemble the formats learners will face in their assessment or exam.",
          explanation:
            "Checks whether task types prepare learners for what is actually tested.",
          sourceAnchors: ["Brown2007", "Richards2001"],
          evidencePrompt:
            "Which tasks resemble your exam or assessment formats?",
          adaptationPrompt:
            "If formats differ, suggest one exam-style task aligned to your assessment.",
        },
        {
          id: "assessment-alignment-02",
          category: "Assessment and Exam Alignment",
          criterion:
            "The unit develops the underlying competences your assessment targets.",
          explanation:
            "Considers whether the skills practiced match the constructs assessed.",
          sourceAnchors: ["CEFR2001", "Graves2000"],
          evidencePrompt:
            "Which assessed competences does the unit build?",
          adaptationPrompt:
            "If a competence is under-served, suggest a targeted practice task.",
        },
        {
          id: "assessment-alignment-03",
          category: "Assessment and Exam Alignment",
          criterion:
            "There is some opportunity for feedback or self-assessment toward the outcomes.",
          explanation:
            "Looks at whether learners can gauge progress against goals.",
          sourceAnchors: ["Graves2000", "CEFR2020"],
          evidencePrompt:
            "Where can learners get feedback or check their own progress?",
          adaptationPrompt:
            "If feedback is missing, suggest a checklist, rubric or self-assessment step.",
        },
      ],
    },
    {
      id: "adaptability",
      name: "Adaptability and Teacher Usability",
      description:
        "Whether the unit can be supplemented, shortened, reordered, localized, simplified or extended.",
      sourceAnchors: ["McGrath2002", "Tomlinson2013", "McDonoughShawMasuhara2013", "Cunningsworth1995"],
      criteria: [
        {
          id: "adaptability-01",
          category: "Adaptability and Teacher Usability",
          criterion:
            "The unit is modular enough to shorten, reorder or supplement easily.",
          explanation:
            "Checks whether sections can be moved or cut without breaking the unit.",
          sourceAnchors: ["McGrath2002", "McDonoughShawMasuhara2013"],
          evidencePrompt:
            "Which sections could be cut or reordered without losing coherence?",
          adaptationPrompt:
            "If the unit is rigid, suggest a modular teaching route through it.",
        },
        {
          id: "adaptability-02",
          category: "Adaptability and Teacher Usability",
          criterion:
            "Teacher support and instructions are clear enough to adapt confidently.",
          explanation:
            "Considers whether aims and procedures are transparent for adaptation.",
          sourceAnchors: ["Cunningsworth1995", "Tomlinson2013"],
          evidencePrompt:
            "Are the aims of each section clear enough to adapt?",
          adaptationPrompt:
            "If aims are unclear, suggest restating the aim before adapting a task.",
        },
        {
          id: "adaptability-03",
          category: "Adaptability and Teacher Usability",
          criterion:
            "The unit can be localized or extended for your specific learners.",
          explanation:
            "Looks at headroom for extension or local tailoring.",
          sourceAnchors: ["Tomlinson2013", "McGrath2002"],
          evidencePrompt:
            "Where is there room to extend or localize the unit?",
          adaptationPrompt:
            "If extension is needed, suggest an optional extension or mini-project.",
        },
      ],
    },
  ],
};

export default COURSEMAP_CORE;
