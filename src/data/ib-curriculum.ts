// Full IB Diploma Programme curriculum data
// Used to give the AI accurate, subject-specific knowledge

export interface SubjectCurriculum {
  name: string
  group: number | string
  code: string
  availableLevels: ('SL' | 'HL')[]
  overview: string
  coreTopics: Topic[]
  hlExtensions: Topic[]
  assessment: AssessmentComponent[]
  commandTerms: string[]
  keyConceptsAndSkills: string[]
  commonMistakes: string[]
  examTips: string[]
}

export interface Topic {
  name: string
  subtopics: string[]
  hours?: number  // recommended teaching hours
}

export interface AssessmentComponent {
  name: string
  type: 'external' | 'internal'
  weight_sl: number   // percentage
  weight_hl: number
  duration?: string
  description: string
}

export const IB_CURRICULUM: SubjectCurriculum[] = [

  // ─────────────────── GROUP 1 ───────────────────

  {
    name: 'English A: Literature',
    group: 1,
    code: 'ENGL-A-LIT',
    availableLevels: ['SL', 'HL'],
    overview: 'Develops skills of literary analysis through close reading and comparative study of works across cultures, periods, and forms. Students explore how context shapes meaning.',
    coreTopics: [
      { name: 'Readers, Writers and Texts', subtopics: ['How language, structure and form create meaning', 'Stylistic choices and their effects', 'Context of production and reception', 'Close reading of unseen texts'] },
      { name: 'Time and Space', subtopics: ['Historical, cultural and social context', 'How setting shapes meaning', 'Literature as a reflection of time period', 'Works from different cultural contexts'] },
      { name: 'Intertextuality: Connecting Texts', subtopics: ['Relationships between texts', 'Genre and convention', 'Allusion, reference and influence', 'Comparative essay skills'] },
    ],
    hlExtensions: [
      { name: 'HL Essay', subtopics: ['Independent literary analysis (1200–1500 words)', 'Student-chosen focus and works', 'Close focus on language, style or technique'] },
    ],
    assessment: [
      { name: 'Paper 1: Guided Literary Analysis', type: 'external', weight_sl: 35, weight_hl: 35, duration: '1h 15m (SL) / 2h 15m (HL)', description: 'SL: analyse one unseen text. HL: analyse two unseen texts.' },
      { name: 'Paper 2: Comparative Essay', type: 'external', weight_sl: 35, weight_hl: 25, duration: '1h 45m', description: 'Comparative essay on two works studied in relation to a given question.' },
      { name: 'Individual Oral (IO)', type: 'internal', weight_sl: 30, weight_hl: 20, duration: '15 min', description: 'Prepared analysis (10 min) + discussion (5 min) on an extract and global issue.' },
      { name: 'HL Essay', type: 'internal', weight_sl: 0, weight_hl: 20, description: 'Written analysis of 1200–1500 words on a work or works studied.' },
    ],
    commandTerms: ['Analyse', 'Compare', 'Contrast', 'Evaluate', 'Examine', 'Explore', 'Interpret', 'Discuss', 'Comment on', 'To what extent'],
    keyConceptsAndSkills: ['Close reading', 'Authorial intent vs reader response', 'Imagery and figurative language', 'Narrative voice and perspective', 'Structure and form', 'Thematic analysis', 'Contextual reading', 'Assessment criteria A-D'],
    commonMistakes: ['Retelling plot instead of analysing', 'Ignoring literary devices', 'Not connecting to global issue in IO', 'Weak thesis in Paper 2', 'Forgetting to compare in comparative essay'],
    examTips: ['Always quote textual evidence', 'Link language choices to effect on reader', 'In IO: spend 2 min on extract, then zoom out to global issue', 'Paper 2: clear argument from paragraph 1'],
  },

  {
    name: 'English A: Language and Literature',
    group: 1,
    code: 'ENGL-A-LANLIT',
    availableLevels: ['SL', 'HL'],
    overview: 'Examines the relationship between language and literature, focusing on how language is used in texts ranging from literary works to media and non-fiction.',
    coreTopics: [
      { name: 'Readers, Writers and Texts', subtopics: ['Language and meaning', 'Textual analysis techniques', 'Non-literary text types (advertisements, speeches, news articles)', 'Bias, register and tone'] },
      { name: 'Time and Space', subtopics: ['Historical and cultural contexts', 'Language change over time', 'Dialect and sociolect', 'Literature and context'] },
      { name: 'Intertextuality', subtopics: ['Genre and convention', 'Comparing literary and non-literary texts', 'Adaptation and transformation'] },
    ],
    hlExtensions: [
      { name: 'HL Essay', subtopics: ['Analysis of language use in non-literary context', '1200–1500 words', 'Language in mass communication, political discourse, etc.'] },
    ],
    assessment: [
      { name: 'Paper 1: Guided Analysis', type: 'external', weight_sl: 35, weight_hl: 35, duration: '1h 15m (SL) / 2h 15m (HL)', description: 'SL: analyse one non-literary text. HL: analyse two non-literary texts.' },
      { name: 'Paper 2: Comparative Essay', type: 'external', weight_sl: 35, weight_hl: 25, duration: '1h 45m', description: 'Comparative essay on two literary works.' },
      { name: 'Individual Oral (IO)', type: 'internal', weight_sl: 30, weight_hl: 20, duration: '15 min', description: 'Analysis of extract from non-literary body of work + connection to global issue.' },
      { name: 'HL Essay', type: 'internal', weight_sl: 0, weight_hl: 20, description: '1200–1500 word essay on language use in a non-literary context.' },
    ],
    commandTerms: ['Analyse', 'Evaluate', 'Comment on', 'Examine', 'Compare', 'Discuss', 'Interpret'],
    keyConceptsAndSkills: ['Rhetorical devices', 'Register and audience', 'Text type conventions', 'Purpose and effect', 'Media literacy', 'Semiotics', 'Discourse analysis'],
    commonMistakes: ['Confusing literary analysis with language analysis in Paper 1', 'Not identifying text type conventions', 'Forgetting audience and purpose'],
    examTips: ['Paper 1: name the text type in your opening', 'Address purpose, audience, context in every analysis', 'Use the guiding question to structure your response'],
  },

  // ─────────────────── GROUP 2 ───────────────────

  {
    name: 'English B',
    group: 2,
    code: 'ENGL-B',
    availableLevels: ['SL', 'HL'],
    overview: 'Language acquisition course for non-native speakers. Develops receptive, productive and interactive skills through five prescribed themes.',
    coreTopics: [
      { name: 'Identities', subtopics: ['Personal beliefs and values', 'Lifestyles', 'Health and well-being', 'Subcultures'] },
      { name: 'Experiences', subtopics: ['Leisure', 'Holidays and travel', 'Migration', 'Life stories'] },
      { name: 'Human Ingenuity', subtopics: ['Entertainment', 'Artistic expression', 'Language and communication', 'Technology'] },
      { name: 'Social Organisation', subtopics: ['Social relationships', 'Community', 'Education systems', 'Work'] },
      { name: 'Sharing the Planet', subtopics: ['Environment', 'Human rights', 'Peace and conflict', 'Ethics'] },
    ],
    hlExtensions: [
      { name: 'HL Literature', subtopics: ['Two literary works in English', 'Analysis of literary techniques', 'Individual oral includes literary work'] },
    ],
    assessment: [
      { name: 'Paper 1: Productive Skills — Writing', type: 'external', weight_sl: 25, weight_hl: 25, duration: '1h 15m', description: 'Two written tasks from specified text types (letter, article, blog, etc.).' },
      { name: 'Paper 2: Receptive Skills', type: 'external', weight_sl: 50, weight_hl: 50, duration: '2h', description: 'Reading and listening comprehension across multiple texts.' },
      { name: 'Individual Oral', type: 'internal', weight_sl: 25, weight_hl: 25, duration: '12–15 min', description: 'Discussion of stimulus (image, text) + conversation on themes.' },
    ],
    commandTerms: ['Describe', 'Explain', 'Discuss', 'Compare', 'Analyse', 'Evaluate'],
    keyConceptsAndSkills: ['Text type conventions', 'Register and tone', 'Communicative purpose', 'Listening strategies', 'Reading for detail and gist', 'Cultural awareness'],
    commonMistakes: ['Wrong register for text type', 'Ignoring word count limits', 'Not addressing all parts of comprehension questions'],
    examTips: ['Always state text type, audience and purpose at the start of written tasks', 'Paper 2 listening: read questions before audio plays', 'Use context clues for vocabulary'],
  },

  // ─────────────────── GROUP 3 ───────────────────

  {
    name: 'Economics',
    group: 3,
    code: 'ECON',
    availableLevels: ['SL', 'HL'],
    overview: 'Studies how individuals, firms, governments and economies allocate scarce resources. Combines theoretical models with real-world application and evaluation.',
    coreTopics: [
      { name: 'Introduction to Economics', subtopics: ['Scarcity and choice', 'Factors of production', 'Production possibility curves (PPC)', 'Economic systems', 'Positive vs normative economics'], hours: 10 },
      { name: 'Microeconomics', subtopics: ['Demand and supply analysis', 'Elasticity (PED, PES, YED, CED)', 'Government intervention (price controls, taxes, subsidies)', 'Market failure (externalities, public goods, common access resources)', 'Theory of the firm (costs, revenues, profit)', 'Market structures (perfect competition, monopoly, oligopoly, monopolistic competition)', 'Labour markets'], hours: 70 },
      { name: 'Macroeconomics', subtopics: ['Measuring national income (GDP, GNP)', 'AD/AS model', 'Unemployment (types, causes, policies)', 'Inflation (CPI, causes, consequences)', 'Economic growth', 'Fiscal policy', 'Monetary policy', 'Supply-side policies', 'Keynesian vs monetarist debate'], hours: 70 },
      { name: 'Global Economy', subtopics: ['International trade (comparative advantage, terms of trade)', 'Trade protectionism (tariffs, quotas, subsidies)', 'Balance of payments', 'Exchange rates', 'Economic integration', 'Development economics (indicators, barriers, strategies)'], hours: 60 },
    ],
    hlExtensions: [
      { name: 'HL Extension Topics', subtopics: ['Theory of the firm (all market structures in depth)', 'Labour market analysis', 'Market failure — asymmetric information, market-based vs government solutions', 'Macroeconomic models — Keynesian multiplier', 'Balance of payments in depth', 'Development — inequality, poverty traps'] },
    ],
    assessment: [
      { name: 'Paper 1: Extended Response', type: 'external', weight_sl: 30, weight_hl: 20, duration: '1h 15m', description: 'Two-part question: (a) explain/define [10 marks], (b) evaluate/discuss [15 marks]. Answer one question.' },
      { name: 'Paper 2: Data Response', type: 'external', weight_sl: 30, weight_hl: 30, duration: '1h 45m', description: 'Data-based questions using real-world articles. Answer two from four sections.' },
      { name: 'Paper 3 (HL only)', type: 'external', weight_sl: 0, weight_hl: 20, duration: '1h 45m', description: 'HL only: policy analysis question using data. Quantitative and qualitative components.' },
      { name: 'Internal Assessment (IA)', type: 'internal', weight_sl: 40, weight_hl: 30, description: 'Portfolio of 3 commentaries (800 words each) applying economic theory to current events.' },
    ],
    commandTerms: ['Define', 'Explain', 'Distinguish', 'Analyse', 'Evaluate', 'Discuss', 'Examine', 'To what extent', 'Justify', 'Suggest'],
    keyConceptsAndSkills: ['Draw and annotate diagrams accurately', 'Evaluate with both sides of argument', 'Use real-world examples', 'Link theory to data/evidence', 'Understand trade-offs between economic objectives'],
    commonMistakes: ['Diagrams without labels or shifts', 'Describing instead of analysing', 'Not evaluating in part (b) questions', 'Confusing movement along vs shift of curve', 'Not linking to real-world context in IAs'],
    examTips: ['Always draw a diagram even if not asked', 'In evaluation, use "however" to counter your own argument', 'Paper 2: read the article carefully — the answer is often in the data', 'IA: choose articles that clearly illustrate one economic concept'],
  },

  {
    name: 'History',
    group: 3,
    code: 'HIST',
    availableLevels: ['SL', 'HL'],
    overview: 'Develops understanding of historical events, processes and perspectives through analysis of primary and secondary sources, essay writing and historical investigation.',
    coreTopics: [
      { name: 'Prescribed Subjects (Paper 1)', subtopics: ['Military leaders (source analysis)', 'Conquest and its impact', 'The move to global war', 'Rights and protest', 'Conflict and intervention'] },
      { name: 'World History Topics (Paper 2)', subtopics: ['Causes and effects of 20th century wars', 'Democratic states — challenges and responses', 'Origins and development of authoritarian and single-party states', 'Independence movements (Africa, Asia)', 'Cold War: superpower tensions', 'Social and cultural change'], hours: 90 },
      { name: 'Historical Investigation (IA)', subtopics: ['Identification and evaluation of sources', 'Investigation (2200 words)', 'Research question formulation', 'Significance and impact'] },
    ],
    hlExtensions: [
      { name: 'HL Regional Options (Paper 3)', subtopics: ['History of Africa and Middle East', 'History of the Americas', 'History of Asia and Oceania', 'History of Europe', 'Selected regional topics (3 essays required)'] },
    ],
    assessment: [
      { name: 'Paper 1: Source Analysis', type: 'external', weight_sl: 30, weight_hl: 20, duration: '1h', description: 'Structured questions on 4 primary/secondary sources. Tests OPVL skills.' },
      { name: 'Paper 2: Essay', type: 'external', weight_sl: 45, weight_hl: 25, duration: '1h 30m', description: 'Two essay questions from different world history topics. Must cover 2+ regions.' },
      { name: 'Paper 3 (HL only)', type: 'external', weight_sl: 0, weight_hl: 35, duration: '2h 30m', description: 'Three essays from one HL regional option.' },
      { name: 'Historical Investigation (IA)', type: 'internal', weight_sl: 25, weight_hl: 20, description: '2200-word historical investigation using primary and secondary sources.' },
    ],
    commandTerms: ['Analyse', 'Compare and contrast', 'Evaluate', 'Examine', 'To what extent', 'Discuss', 'Explain', 'Assess'],
    keyConceptsAndSkills: ['OPVL (Origin, Purpose, Value, Limitation) for sources', 'Essay structure (argument-evidence-analysis)', 'Causation and consequence', 'Change and continuity', 'Historical significance', 'Counter-argument and evaluation'],
    commonMistakes: ['OPVL without linking to the investigation', 'Narrative essays instead of analytical essays', 'Using only one perspective', 'Weak thesis statement', 'Not responding to the specific command term'],
    examTips: ['Paper 1 Q3: discuss value AND limitation for both sources', 'Paper 2: first paragraph = clear argument answering the question', 'Use specific dates, names and events as evidence', 'IA: research question must be narrow and focused'],
  },

  {
    name: 'Geography',
    group: 3,
    code: 'GEO',
    availableLevels: ['SL', 'HL'],
    overview: 'Integrates physical and human geography through a range of scales. Students examine patterns, processes and interactions between environments and societies.',
    coreTopics: [
      { name: 'Part 1: Geographical Themes (SL+HL)', subtopics: ['Option A: Freshwater — drainage basins, floods, management', 'Option B: Oceans and coastal margins', 'Option C: Extreme environments', 'Option D: Geophysical hazards', 'Option E: Leisure, tourism and sport', 'Option F: Food and health', 'Option G: Urban environments'] },
      { name: 'Part 2: Core (SL+HL)', subtopics: ['Populations in transition', 'Disparities in wealth and development', 'Patterns in environmental quality and sustainability', 'Patterns in resource consumption'] },
      { name: 'Internal Assessment (fieldwork)', subtopics: ['Data collection methods', 'Processing and analysis', 'Evaluation of methodology'] },
    ],
    hlExtensions: [
      { name: 'Part 3: Global Interactions (HL only)', subtopics: ['Measuring global interactions', 'Changing space — shrinking world', 'Economic interactions and flows', 'Environmental change', 'Sociocultural exchanges', 'Political outcomes', 'Global interactions at the local level'] },
    ],
    assessment: [
      { name: 'Paper 1: Themes', type: 'external', weight_sl: 35, weight_hl: 25, duration: '1h 30m (SL) / 2h 30m (HL)', description: 'Structured and extended response questions on two optional themes.' },
      { name: 'Paper 2: Core', type: 'external', weight_sl: 40, weight_hl: 35, duration: '1h 15m', description: 'Structured questions on all four core topics.' },
      { name: 'Paper 3 (HL only)', type: 'external', weight_sl: 0, weight_hl: 20, duration: '1h', description: 'Extended essay on global interactions.' },
      { name: 'Internal Assessment', type: 'internal', weight_sl: 25, weight_hl: 20, description: 'Fieldwork report (2500 words) with data collection, analysis and evaluation.' },
    ],
    commandTerms: ['Describe', 'Explain', 'Suggest', 'Examine', 'Evaluate', 'Discuss', 'Compare', 'Analyse', 'To what extent'],
    keyConceptsAndSkills: ['Map skills', 'Graph interpretation', 'Statistical analysis', 'Case studies with specific place knowledge', 'Sustainability frameworks', 'Scale (local to global)'],
    commonMistakes: ['Vague answers without place-specific examples', 'Describing maps instead of explaining patterns', 'Confusing "describe" and "explain"', 'No data in IA fieldwork'],
    examTips: ['Always give a located example with a place name', 'Use GIS/map evidence when provided', 'IA: choose a local fieldwork site and clear geographical question'],
  },

  {
    name: 'Psychology',
    group: 3,
    code: 'PSY',
    availableLevels: ['SL', 'HL'],
    overview: 'Explores human behaviour and mental processes through three core approaches and optional topics. Emphasises empirical research methods and critical evaluation of studies.',
    coreTopics: [
      { name: 'Biological Approach (BLOA)', subtopics: ['Brain and behaviour (neurotransmitters, hormones, brain structure)', 'Genetics and behaviour (twin studies, genetic influences)', 'The role of animal research', 'Ethical considerations in biological research', 'Key studies: Raine et al., Caspi et al., Martinez & Kesner'] },
      { name: 'Cognitive Approach (CLOA)', subtopics: ['Cognitive processing (schemas, memory models)', 'Reliability of cognitive processes (reconstructive memory, eyewitness testimony)', 'Emotion and cognition (flashbulb memory)', 'Social cognitive theory', 'Key studies: Baddeley, Loftus & Palmer, Bartlett, Flashbulb memory studies'] },
      { name: 'Sociocultural Approach (SCOA)', subtopics: ['Social identity theory', 'Social learning theory', 'Cultural influences on behaviour', 'Acculturation', 'Key studies: Tajfel, Bandura, Berry'] },
    ],
    hlExtensions: [
      { name: 'Qualitative Research Methods (HL only)', subtopics: ['Interviews', 'Observations', 'Case studies', 'Thematic analysis', 'Credibility and reflexivity'] },
    ],
    assessment: [
      { name: 'Paper 1: Core Approaches', type: 'external', weight_sl: 50, weight_hl: 40, duration: '2h', description: 'Short answer questions on all three approaches + one essay.' },
      { name: 'Paper 2: Options', type: 'external', weight_sl: 25, weight_hl: 20, duration: '1h', description: 'Extended response on one optional topic (Abnormal, Human Relationships, Health, Development, Sport).' },
      { name: 'Paper 3 (HL only)', type: 'external', weight_sl: 0, weight_hl: 20, duration: '1h', description: 'Qualitative research methods — short answers on a research scenario.' },
      { name: 'Internal Assessment', type: 'internal', weight_sl: 25, weight_hl: 20, description: 'Experimental study replicating a cognitive study (2200 words).' },
    ],
    commandTerms: ['Describe', 'Explain', 'Outline', 'Evaluate', 'Discuss', 'Contrast', 'To what extent', 'Examine'],
    keyConceptsAndSkills: ['Study-based answers (name researcher, date, method, findings, evaluation)', 'Ethics of psychological research', 'Research methodology', 'Triangulation', 'ERQ essay structure (Introduction-body-conclusion)'],
    commonMistakes: ['Generic answers not linked to specific studies', 'Not naming researchers and dates', 'Describing a study without evaluating its relevance', 'Confusing correlation with causation'],
    examTips: ['Always structure SAQ answers: describe → explain → link to question', 'ERQ: intro states position, each paragraph = one study with evaluation', 'Use exactly the right terms (reliable, valid, ethical, generalizable)'],
  },

  {
    name: 'Business Management',
    group: 3,
    code: 'BM',
    availableLevels: ['SL', 'HL'],
    overview: 'Examines how businesses operate and make decisions in a dynamic world, covering strategy, finance, marketing, HR and operations.',
    coreTopics: [
      { name: 'Unit 1: Business Organisation and Environment', subtopics: ['Types of business (sole trader, partnership, corporation, NGO)', 'Business objectives', 'Stakeholders', 'Growth and evolution', 'Ethics and corporate social responsibility (CSR)', 'Globalisation'], hours: 40 },
      { name: 'Unit 2: Human Resource Management', subtopics: ['Motivation theory (Maslow, Herzberg, Taylor)', 'Leadership styles (autocratic, democratic, laissez-faire)', 'Organisational structure', 'Recruitment and training', 'Industrial relations'], hours: 40 },
      { name: 'Unit 3: Finance and Accounts', subtopics: ['Sources of finance', 'Costs, revenues and profit', 'Break-even analysis', 'Profitability and liquidity ratios', 'Cash flow management', 'Investment appraisal (payback, ARR, NPV)'], hours: 55 },
      { name: 'Unit 4: Marketing', subtopics: ['Market research', 'Marketing mix (7Ps)', 'Product life cycle and Boston Matrix', 'Branding and promotion', 'E-commerce and digital marketing'], hours: 40 },
      { name: 'Unit 5: Operations Management', subtopics: ['Production methods (job, batch, flow, cell)', 'Lean production and quality management', 'Location decisions', 'Supply chain management', 'Innovation and R&D'], hours: 40 },
    ],
    hlExtensions: [
      { name: 'Unit 6: Business Strategy (HL only)', subtopics: ['Strategic analysis (SWOT, PEST, Porter\'s Five Forces)', 'Ansoff Matrix', 'Strategic implementation', 'Evaluation of strategic decisions'] },
    ],
    assessment: [
      { name: 'Paper 1: Pre-released Case Study', type: 'external', weight_sl: 35, weight_hl: 30, duration: '1h 15m (SL) / 2h 15m (HL)', description: 'Structured and extended response based on a pre-released case study organisation.' },
      { name: 'Paper 2: Unseen Stimulus', type: 'external', weight_sl: 40, weight_hl: 35, duration: '1h 45m', description: 'Data response and extended essay using unseen business scenarios.' },
      { name: 'Internal Assessment', type: 'internal', weight_sl: 25, weight_hl: 25, description: 'Research project (1500 words SL / 2000 words HL) investigating a real business problem.' },
    ],
    commandTerms: ['Define', 'Outline', 'Explain', 'Analyse', 'Evaluate', 'Recommend', 'Justify', 'Distinguish'],
    keyConceptsAndSkills: ['CUEGIS concepts (Change, Uncertainty, Ethics, Globalisation, Innovation, Strategy)', 'Quantitative analysis (ratio analysis, break-even)', 'Business tools (SWOT, Boston Matrix)', 'Stakeholder analysis', 'Balanced argument and recommendation'],
    commonMistakes: ['Not applying CUEGIS concepts', 'Forgetting to use business terminology', 'Evaluating without a clear recommendation', 'Calculation errors in Unit 3'],
    examTips: ['Always link analysis to the specific business in the case study', 'For evaluation questions: argue both sides then justify your position', 'Show all workings in financial calculations'],
  },

  {
    name: 'Global Politics',
    group: 3,
    code: 'GP',
    availableLevels: ['SL', 'HL'],
    overview: 'Explores political activity at local, national, international and global levels through four key concepts: power, sovereignty, legitimacy and interdependence.',
    coreTopics: [
      { name: 'Power, Sovereignty and International Relations', subtopics: ['Types of power (hard, soft, structural)', 'State sovereignty and challenges to it', 'International organisations (UN, World Bank, IMF)', 'Non-state actors (NGOs, MNCs, terrorist organisations)', 'Theories of IR (Realism, Liberalism, Constructivism)'] },
      { name: 'Human Rights and Justice', subtopics: ['Development of international human rights law', 'Universal Declaration of Human Rights', 'Humanitarian intervention and R2P', 'Economic, social and cultural rights vs civil/political rights'] },
      { name: 'Development and Sustainability', subtopics: ['Concepts of development (HDI, MDGs, SDGs)', 'Globalisation and inequality', 'Environmental sustainability and global governance', 'Food security and access to resources'] },
      { name: 'Peace and Conflict', subtopics: ['Types of conflict (inter-state, civil, proxy wars)', 'Causes of conflict', 'Peacebuilding and conflict resolution', 'Nuclear weapons and arms control'] },
    ],
    hlExtensions: [
      { name: 'HL Extension: Global Political Challenges', subtopics: ['Engaging local and global political challenges', 'In-depth case study analysis', 'Connections between local and global'] },
    ],
    assessment: [
      { name: 'Paper 1', type: 'external', weight_sl: 30, weight_hl: 25, duration: '1h 15m', description: 'Structured questions on political activity.' },
      { name: 'Paper 2: Extended Essay', type: 'external', weight_sl: 35, weight_hl: 35, duration: '1h 45m', description: 'Extended essay on a political issue using case studies.' },
      { name: 'HL Extension (HL only)', type: 'external', weight_sl: 0, weight_hl: 15, description: 'HL extension exercise.' },
      { name: 'Engagement Activity (IA)', type: 'internal', weight_sl: 35, weight_hl: 25, description: 'Political engagement activity and reflection report (2000 words).' },
    ],
    commandTerms: ['Analyse', 'Evaluate', 'Examine', 'To what extent', 'Discuss', 'Explain', 'Compare'],
    keyConceptsAndSkills: ['Conceptual analysis (power, sovereignty, legitimacy, interdependence)', 'Case study application', 'Theoretical frameworks', 'Critical evaluation of sources', 'Balanced argument'],
    commonMistakes: ['Ignoring key concepts in answers', 'Using only one case study perspective', 'Descriptive rather than analytical responses'],
    examTips: ['Always frame answers around the four key concepts', 'Use specific current events as evidence', 'IA: the engagement must be genuine and documented'],
  },

  // ─────────────────── GROUP 4 ───────────────────

  {
    name: 'Physics',
    group: 4,
    code: 'PHYS',
    availableLevels: ['SL', 'HL'],
    overview: 'Studies the fundamental laws governing the physical universe — from mechanics and thermodynamics to quantum physics and cosmology. Emphasises experimental skills and mathematical modelling.',
    coreTopics: [
      { name: 'Topic 1: Measurements and Uncertainties', subtopics: ['SI units and fundamental/derived quantities', 'Significant figures and decimal places', 'Uncertainties: absolute, fractional, percentage', 'Error propagation in calculations', 'Graphical analysis and linearisation'], hours: 5 },
      { name: 'Topic 2: Mechanics', subtopics: ['Kinematics: displacement, velocity, acceleration', 'Equations of motion (SUVAT)', 'Projectile motion', 'Forces and Newton\'s Laws', 'Work, energy and power', 'Momentum and impulse', 'Conservation laws'], hours: 22 },
      { name: 'Topic 3: Thermal Physics', subtopics: ['Temperature and heat', 'Specific heat capacity and latent heat', 'Kinetic molecular theory and ideal gas', 'Internal energy and thermodynamics'], hours: 11 },
      { name: 'Topic 4: Waves', subtopics: ['Wave characteristics (amplitude, frequency, wavelength, speed)', 'Transverse and longitudinal waves', 'Sound waves', 'Electromagnetic spectrum', 'Superposition and interference', 'Standing waves'], hours: 15 },
      { name: 'Topic 5: Electricity and Magnetism', subtopics: ['Electric fields and Coulomb\'s law', 'Current, resistance and Ohm\'s law', 'Circuits (series and parallel)', 'Magnetic fields and forces', 'Electromagnetic induction (SL basic)', 'Power and energy in circuits'], hours: 15 },
      { name: 'Topic 6: Circular Motion and Gravitation', subtopics: ['Circular motion: centripetal force and acceleration', 'Newton\'s law of gravitation', 'Gravitational fields', 'Orbits and Kepler\'s laws'], hours: 5 },
      { name: 'Topic 7: Atomic, Nuclear and Particle Physics', subtopics: ['Discrete energy levels and spectra', 'Radioactive decay types (α, β, γ)', 'Nuclear reactions and binding energy', 'Standard model of particle physics', 'Quarks and leptons'], hours: 14 },
      { name: 'Topic 8: Energy Production', subtopics: ['Energy sources (fossil fuels, nuclear, renewable)', 'Thermal power stations', 'Sankey diagrams and efficiency', 'Solar, wind, hydroelectric and nuclear energy', 'Radiation and climate'], hours: 8 },
    ],
    hlExtensions: [
      { name: 'Topic 9: Wave Phenomena (HL)', subtopics: ['Single-slit diffraction', 'Diffraction gratings', 'Resolvance and resolution', 'Doppler effect', 'Polarisation'] },
      { name: 'Topic 10: Fields (HL)', subtopics: ['Gravitational and electric fields in depth', 'Potential energy and escape velocity', 'Orbital mechanics', 'Capacitors'] },
      { name: 'Topic 11: Electromagnetic Induction (HL)', subtopics: ['Faraday\'s and Lenz\'s law', 'Alternating current (AC)', 'Transformers', 'Rectification'] },
      { name: 'Topic 12: Quantum and Nuclear Physics (HL)', subtopics: ['Photoelectric effect', 'Compton scattering', 'Wave-particle duality', 'Schrodinger model', 'Nuclear energy levels', 'Tunnelling'] },
    ],
    assessment: [
      { name: 'Paper 1: Multiple Choice', type: 'external', weight_sl: 20, weight_hl: 20, duration: '45 min (SL) / 1h (HL)', description: 'SL: 30 MCQ. HL: 40 MCQ. Covers all core and HL topics.' },
      { name: 'Paper 2: Short and Extended Response', type: 'external', weight_sl: 40, weight_hl: 36, duration: '1h 15m (SL) / 2h 15m (HL)', description: 'Section A: data-based question. Section B: extended response. Calculations required.' },
      { name: 'Paper 3: Experimental + Options (HL)', type: 'external', weight_sl: 20, weight_hl: 24, duration: '1h (SL) / 1h 15m (HL)', description: 'Short answers on experimental analysis + one optional topic (Astrophysics, Relativity, Engineering Physics, Imaging, Quantum and Nuclear).' },
      { name: 'Internal Assessment (IA)', type: 'internal', weight_sl: 20, weight_hl: 20, description: 'Individual scientific investigation (6–12 pages). Student designs own experiment.' },
    ],
    commandTerms: ['State', 'Define', 'Describe', 'Explain', 'Outline', 'Deduce', 'Derive', 'Show that', 'Calculate', 'Estimate', 'Sketch', 'Draw', 'Determine', 'Justify', 'Evaluate'],
    keyConceptsAndSkills: ['Unit analysis', 'Error propagation', 'Graph drawing and analysis', 'Free body diagrams', 'Conservation laws (energy, momentum, charge)', 'Mathematical derivation', 'Experimental design and evaluation'],
    commonMistakes: ['Forgetting units in answers', 'Not drawing/labelling FBDs', 'Confusing scalar and vector quantities', 'Not quoting full equations before substituting', 'Rounding too early in multi-step calculations'],
    examTips: ['Show ALL working — method marks are available', '"State" needs only 1 sentence, "Explain" needs the physics reasoning', 'Paper 1: eliminate wrong answers rather than guessing', 'IA: focus on controlling variables and discussing systematic errors'],
  },

  {
    name: 'Chemistry',
    group: 4,
    code: 'CHEM',
    availableLevels: ['SL', 'HL'],
    overview: 'Explores the composition, structure and properties of matter and the transformations it undergoes. Combines quantitative problem-solving with conceptual understanding.',
    coreTopics: [
      { name: 'Topic 1: Stoichiometric Relationships', subtopics: ['Mole concept and Avogadro\'s number', 'Empirical and molecular formulae', 'Molar mass calculations', 'Limiting and excess reagents', 'Percentage yield and atom economy', 'Solutions: concentration and dilution', 'Ideal gas equation: PV = nRT'], hours: 13.5 },
      { name: 'Topic 2: Atomic Structure', subtopics: ['Atomic number, mass number, isotopes', 'Electron configuration (subshells, orbitals)', 'Absorption and emission spectra', 'Mass spectrometry and relative atomic mass', 'Successive ionisation energies'], hours: 6.5 },
      { name: 'Topic 3: Periodicity', subtopics: ['Periodic table trends (atomic radius, ionisation energy, electronegativity)', 'Properties of Period 3 elements and oxides', 'Transition metals: properties and complex ions (HL)', 'First-row d-block elements'], hours: 6 },
      { name: 'Topic 4: Chemical Bonding and Structure', subtopics: ['Ionic, covalent and metallic bonding', 'Lewis (electron dot) structures', 'VSEPR theory and molecular geometry', 'Polarity and intermolecular forces (London, dipole-dipole, hydrogen bonding)', 'Allotropes of carbon', 'Delocalisation and resonance'], hours: 13.5 },
      { name: 'Topic 5: Energetics', subtopics: ['Enthalpy changes (ΔH) — standard enthalpy of combustion, formation, neutralisation', 'Hess\'s law and energy cycles', 'Bond enthalpies', 'Experimental calorimetry', 'Entropy (ΔS) and Gibbs free energy (ΔG = ΔH − TΔS)'], hours: 9 },
      { name: 'Topic 6: Chemical Kinetics', subtopics: ['Factors affecting rate (concentration, temperature, surface area, catalyst)', 'Collision theory and activation energy', 'Rate expressions and orders of reaction (HL)', 'Reaction mechanisms (HL)', 'Arrhenius equation (HL)'], hours: 7 },
      { name: 'Topic 7: Equilibrium', subtopics: ['Dynamic equilibrium and Le Chatelier\'s principle', 'Equilibrium constant (Kc, Kp)', 'Effect of temperature, pressure and concentration on equilibrium', 'Haber process, Contact process applications'], hours: 7 },
      { name: 'Topic 8: Acids and Bases', subtopics: ['Brønsted-Lowry theory', 'pH scale and calculations', 'Strong vs weak acids and bases', 'Ka, Kb and pKa', 'Buffer solutions (HL)', 'Titrations and indicators', 'Salt hydrolysis (HL)'], hours: 10 },
      { name: 'Topic 9: Redox Processes', subtopics: ['Oxidation states and redox reactions', 'Balancing redox equations (half-equations)', 'Electrochemical cells (galvanic and electrolytic)', 'Standard electrode potentials', 'Electrolysis calculations'], hours: 8 },
      { name: 'Topic 10: Organic Chemistry', subtopics: ['Homologous series (alkanes, alkenes, alkynes, alcohols, aldehydes, ketones, carboxylic acids, esters, amines, amides)', 'Functional group reactions', 'Isomers (structural and stereoisomers)', 'Addition, substitution, elimination, oxidation reactions', 'Benzene and aromaticity (HL)', 'Nucleophilic substitution and elimination (HL)'], hours: 15 },
      { name: 'Topic 11: Measurement and Data Processing', subtopics: ['Uncertainties and errors', 'Graphical analysis', 'Spectroscopic techniques (IR, MS, NMR — HL)'], hours: 5 },
    ],
    hlExtensions: [
      { name: 'Topic 12: Atomic Structure (HL extension)', subtopics: ['Quantum numbers and orbital shapes', 'Electron configurations and exceptions'] },
      { name: 'Topic 13: Periodicity (HL extension)', subtopics: ['First-row d-block elements and transition metals', 'Complex ions and colour'] },
      { name: 'Topic 14: Chemical Bonding (HL extension)', subtopics: ['Hybridisation (sp, sp2, sp3)', 'Sigma and pi bonds', 'Formal charge'] },
      { name: 'Topic 15: Energetics (HL extension)', subtopics: ['Born-Haber cycle', 'Lattice enthalpy', 'Entropy and Gibbs free energy in depth'] },
      { name: 'Topic 20: Organic Chemistry (HL extension)', subtopics: ['Reaction mechanisms', 'Benzene chemistry', 'Stereoisomerism (optical, geometric)'] },
      { name: 'Topic 21: Measurement (HL extension)', subtopics: ['1H NMR spectroscopy', 'Mass spectrometry fragmentation', 'Infrared spectroscopy interpretation'] },
    ],
    assessment: [
      { name: 'Paper 1: Multiple Choice', type: 'external', weight_sl: 20, weight_hl: 20, duration: '45 min (SL) / 1h (HL)', description: 'SL: 30 MCQ. HL: 40 MCQ. 4 options, best answer only.' },
      { name: 'Paper 2: Short and Extended Response', type: 'external', weight_sl: 40, weight_hl: 36, duration: '1h 15m (SL) / 2h 15m (HL)', description: 'Section A: mandatory data-based question. Section B: structured questions including calculations and extended response.' },
      { name: 'Paper 3: Experimental + Options', type: 'external', weight_sl: 20, weight_hl: 24, duration: '1h (SL) / 1h 15m (HL)', description: 'Experimental design and data analysis + one optional topic (Materials, Biochemistry, Energy, Medicinal Chemistry).' },
      { name: 'Internal Assessment (IA)', type: 'internal', weight_sl: 20, weight_hl: 20, description: 'Individual scientific investigation designed and executed by student (6–12 pages).' },
    ],
    commandTerms: ['State', 'Define', 'Identify', 'Describe', 'Explain', 'Distinguish', 'Compare', 'Deduce', 'Predict', 'Determine', 'Calculate', 'Construct', 'Suggest', 'Evaluate', 'Discuss'],
    keyConceptsAndSkills: ['Mole calculations', 'Writing and balancing equations (including ionic, redox, half-equations)', 'Interpreting spectroscopic data', 'Lewis structures and VSEPR', 'Thermodynamic calculations (Hess\'s law, ΔG)', 'Equilibrium and Le Chatelier application', 'Organic reaction mechanisms (HL)'],
    commonMistakes: ['Incomplete or unbalanced equations', 'Incorrect significant figures', 'Confusing rate with extent of reaction', 'Forgetting state symbols in equations', 'Misapplying Le Chatelier\'s principle', 'Not showing equilibrium arrows ⇌'],
    examTips: ['State units in all calculations', '"Deduce" means you must show your reasoning step by step', 'For organic: always draw out structures clearly', 'Paper 1: check units in MCQ traps', 'IA: use at least 5 data points and always repeat measurements'],
  },

  {
    name: 'Biology',
    group: 4,
    code: 'BIO',
    availableLevels: ['SL', 'HL'],
    overview: 'Studies living organisms and life processes from cellular to ecological levels. Emphasises experimental methodology and the application of biological knowledge to real-world contexts.',
    coreTopics: [
      { name: 'Topic 1: Cell Biology', subtopics: ['Cell theory and evidence', 'Prokaryotic vs eukaryotic cells', 'Membrane structure (fluid mosaic model)', 'Transport across membranes (diffusion, osmosis, active transport)', 'Mitosis and cell division', 'Stem cells'], hours: 15 },
      { name: 'Topic 2: Molecular Biology', subtopics: ['Water properties and biological importance', 'Carbohydrates: structure and function', 'Lipids: structure and function', 'Proteins: structure (primary–quaternary), enzymes', 'DNA structure, replication, and transcription/translation', 'Cell respiration (aerobic and anaerobic)', 'Photosynthesis: light-dependent and Calvin cycle'], hours: 21 },
      { name: 'Topic 3: Genetics', subtopics: ['Chromosomes, genes and alleles', 'Meiosis', 'Inheritance: Mendelian genetics, monohybrid and dihybrid crosses', 'Mutations', 'Genetic engineering: PCR, gel electrophoresis, gene cloning'], hours: 15 },
      { name: 'Topic 4: Ecology', subtopics: ['Ecosystems: biotic and abiotic factors', 'Energy flow and trophic levels', 'Carbon and nitrogen cycles', 'Biodiversity and conservation', 'Population dynamics', 'Sustainability'], hours: 12 },
      { name: 'Topic 5: Evolution and Biodiversity', subtopics: ['Evidence for evolution (fossil record, comparative anatomy)', 'Natural selection and adaptation', 'Speciation', 'Phylogenetic classification (cladistics)', 'Binomial nomenclature'], hours: 12 },
      { name: 'Topic 6: Human Physiology', subtopics: ['Digestion and absorption', 'The blood system (heart, blood vessels, blood)', 'Defence against infectious disease (immune system)', 'Gas exchange', 'Neurons and synapses', 'Hormones, homeostasis and reproduction'], hours: 20 },
    ],
    hlExtensions: [
      { name: 'Topic 7: Nucleic Acids (HL)', subtopics: ['DNA structure in detail (histones, nucleosomes)', 'Replication in detail', 'Transcription and translation in detail', 'Gene expression and regulation'] },
      { name: 'Topic 8: Metabolism (HL)', subtopics: ['Metabolic pathways and enzymes', 'Cell respiration — Krebs cycle and electron transport', 'Photosynthesis — thylakoid reactions and Calvin cycle in detail'] },
      { name: 'Topic 9: Plant Biology (HL)', subtopics: ['Transport in plants (xylem, phloem)', 'Plant growth and response (tropisms, auxins)', 'Reproduction in plants'] },
      { name: 'Topic 10: Genetics and Evolution (HL)', subtopics: ['Meiosis and variation', 'Inheritance patterns (sex-linkage, polygenic)', 'Hardy-Weinberg principle', 'Speciation and isolation mechanisms'] },
      { name: 'Topic 11: Animal Physiology (HL)', subtopics: ['Antibody production and vaccination', 'Movement: muscles and joints', 'Kidney and osmoregulation', 'Sexual reproduction in detail'] },
    ],
    assessment: [
      { name: 'Paper 1: Multiple Choice', type: 'external', weight_sl: 20, weight_hl: 20, duration: '45 min (SL) / 1h (HL)', description: 'SL: 30 MCQ. HL: 40 MCQ on core and HL material.' },
      { name: 'Paper 2: Short and Extended Response', type: 'external', weight_sl: 40, weight_hl: 36, duration: '1h 15m (SL) / 2h 15m (HL)', description: 'Section A: data-based question. Section B: extended response including essay (HL).' },
      { name: 'Paper 3: Experimental + Options', type: 'external', weight_sl: 20, weight_hl: 24, duration: '1h (SL) / 1h 15m (HL)', description: 'Lab-based analysis + one optional topic (Neurobiology, Biotechnology, Ecology, Human Physiology).' },
      { name: 'Internal Assessment (IA)', type: 'internal', weight_sl: 20, weight_hl: 20, description: 'Individual investigation (6–12 pages) designed and performed by student.' },
    ],
    commandTerms: ['State', 'List', 'Define', 'Outline', 'Describe', 'Annotate', 'Draw', 'Explain', 'Discuss', 'Evaluate', 'Analyse', 'Compare', 'Distinguish'],
    keyConceptsAndSkills: ['Diagram annotation', 'Data analysis from graphs and tables', 'Experimental design (independent, dependent, controlled variables)', 'Statistical analysis', 'Application of processes (transcription, photosynthesis, mitosis)', 'Understanding feedback mechanisms'],
    commonMistakes: ['Vague descriptions ("the rate increases" without explanation)', 'Confusing mitosis and meiosis', 'Not drawing fully labelled diagrams when asked', 'Confusing gene with allele', 'Incorrectly applying Hardy-Weinberg (HL)'],
    examTips: ['"Explain" means cause AND effect', 'Draw clear, large, fully-labelled diagrams', 'In data questions: quote specific values from the graph', 'IA: a focused, measurable research question is essential'],
  },

  {
    name: 'Computer Science',
    group: 4,
    code: 'CS',
    availableLevels: ['SL', 'HL'],
    overview: 'Examines the principles of computing, programming, and computational thinking. Students develop problem-solving skills through algorithm design and programming in Java.',
    coreTopics: [
      { name: 'Topic 1: System Fundamentals', subtopics: ['System design basics', 'System lifecycle', 'Human interaction with systems', 'Networks', 'Hardware and software'], hours: 20 },
      { name: 'Topic 2: Computer Organisation', subtopics: ['CPU architecture (fetch-execute cycle, ALU, registers)', 'Primary and secondary memory', 'Cache and virtual memory', 'Binary, hexadecimal, ASCII/Unicode', 'Logic gates and Boolean algebra'], hours: 6 },
      { name: 'Topic 3: Networks', subtopics: ['Network topology', 'OSI model and protocols (TCP/IP, HTTP, FTP, SMTP)', 'Wireless networking', 'Network security (encryption, firewalls)', 'VPNs and cloud computing'], hours: 9 },
      { name: 'Topic 4: Computational Thinking, Problem Solving and Programming', subtopics: ['Algorithms (searching, sorting)', 'Pseudocode and trace tables', 'Programming concepts in Java (variables, loops, conditionals, methods)', 'Arrays and collections', 'OOP: classes, objects, inheritance, polymorphism', 'File I/O and exception handling'], hours: 45 },
    ],
    hlExtensions: [
      { name: 'Topic 5: Abstract Data Structures (HL)', subtopics: ['Linked lists (single and double)', 'Binary trees and traversal', 'Stacks and queues', 'Hash tables', 'Recursion'] },
      { name: 'Topic 6: Resource Management (HL)', subtopics: ['Operating systems: scheduling, memory management', 'Concurrency and parallel processing', 'Dedicated systems'] },
      { name: 'Topic 7: Control Systems (HL)', subtopics: ['Sensors and actuators', 'Control systems design', 'Autonomous systems'] },
    ],
    assessment: [
      { name: 'Paper 1: Core', type: 'external', weight_sl: 40, weight_hl: 40, duration: '2h 10m (SL) / 2h 40m (HL)', description: 'Structured and extended questions on core and HL topics. Includes pseudocode/algorithm questions.' },
      { name: 'Paper 2: Case Study', type: 'external', weight_sl: 35, weight_hl: 20, duration: '1h 20m', description: 'Pre-released case study with structured response questions.' },
      { name: 'Paper 3 (HL only)', type: 'external', weight_sl: 0, weight_hl: 20, duration: '1h', description: 'HL extension topics: abstract data structures, control systems.' },
      { name: 'Internal Assessment (IA)', type: 'internal', weight_sl: 25, weight_hl: 20, description: 'A product (working software solution) with documentation (2000 words) solving a real client problem.' },
    ],
    commandTerms: ['State', 'Define', 'Describe', 'Explain', 'Construct', 'Trace', 'Suggest', 'Evaluate', 'Outline', 'Compare'],
    keyConceptsAndSkills: ['Writing and tracing pseudocode', 'Java programming (syntax, OOP)', 'Algorithm analysis', 'Network protocols', 'Binary and logic operations', 'System design documentation'],
    commonMistakes: ['Pseudocode syntax errors (mixing languages)', 'Incorrectly tracing recursive algorithms', 'Confusing RAM with hard disk storage', 'Not explaining why in extended questions'],
    examTips: ['Learn IB pseudocode conventions exactly', 'Trace tables: show every step of every variable', 'IA: get a real client (friend, family member, organisation) with genuine needs'],
  },

  {
    name: 'Environmental Systems and Societies',
    group: '3/4',
    code: 'ESS',
    availableLevels: ['SL'],
    overview: 'An interdisciplinary course combining environmental science and social sciences. Students examine environmental issues through multiple value systems and scientific methods.',
    coreTopics: [
      { name: 'Topic 1: Foundations of ESS', subtopics: ['Environmental value systems', 'Systems and models', 'Energy and equilibrium in systems', 'Sustainability and carrying capacity'] },
      { name: 'Topic 2: Ecosystems and Ecology', subtopics: ['Ecosystem structure', 'Measuring biodiversity and populations', 'Flows of energy and matter', 'Biomes and aquatic systems'] },
      { name: 'Topic 3: Biodiversity and Conservation', subtopics: ['Species and speciation', 'Threats to biodiversity', 'Conservation strategies', 'Sustainability of food production'] },
      { name: 'Topic 4: Water Systems', subtopics: ['Water cycle', 'Aquatic food production', 'Water access and security'] },
      { name: 'Topic 5: Soils', subtopics: ['Soil formation and properties', 'Land degradation', 'Soil management'] },
      { name: 'Topic 6: Atmospheric Systems and Societies', subtopics: ['Atmosphere composition and climate', 'Climate change science and evidence', 'Ozone depletion', 'Acid deposition'] },
      { name: 'Topic 7: Climate Change', subtopics: ['Climate change causes and effects', 'Mitigation and adaptation strategies', 'Global frameworks (Paris Agreement)'] },
      { name: 'Topic 8: Human Systems and Resource Use', subtopics: ['Human population dynamics', 'Resource use', 'Solid waste and pollution'] },
    ],
    hlExtensions: [],
    assessment: [
      { name: 'Paper 1: Case Study', type: 'external', weight_sl: 25, weight_hl: 0, duration: '1h', description: 'Structured questions on an unseen case study.' },
      { name: 'Paper 2: Short and Extended Response', type: 'external', weight_sl: 50, weight_hl: 0, duration: '2h', description: 'Short answer and extended response questions across all topics.' },
      { name: 'Internal Assessment', type: 'internal', weight_sl: 25, weight_hl: 0, description: 'Individual investigation on a local environmental issue (2000 words).' },
    ],
    commandTerms: ['State', 'Outline', 'Describe', 'Explain', 'Evaluate', 'Discuss', 'Analyse', 'Suggest', 'Examine'],
    keyConceptsAndSkills: ['Systems diagrams', 'Data interpretation', 'Environmental value systems (ecocentric, anthropocentric, technocentric)', 'Case study knowledge', 'Sustainability evaluation'],
    commonMistakes: ['Not identifying value system in questions about perspectives', 'Describing instead of evaluating environmental strategies', 'Generic answers without specific examples'],
    examTips: ['Always identify stakeholder perspectives when evaluating solutions', 'Use specific data and case studies', 'Know the difference between mitigation and adaptation'],
  },

  // ─────────────────── GROUP 5 ───────────────────

  {
    name: 'Mathematics: Analysis and Approaches',
    group: 5,
    code: 'MATH-AA',
    availableLevels: ['SL', 'HL'],
    overview: 'For students who enjoy developing mathematics and wish to explore the connections between topics. Emphasises pure mathematics, proof, and analytical thinking.',
    coreTopics: [
      { name: 'Topic 1: Number and Algebra', subtopics: ['Sequences and series (arithmetic and geometric)', 'Sigma notation', 'Binomial theorem', 'Proof by induction (HL)', 'Complex numbers (HL)', 'Systems of equations (HL)', 'Partial fractions (HL)'], hours: 19 },
      { name: 'Topic 2: Functions', subtopics: ['Domain, range, inverse and composite functions', 'Transformations of graphs', 'Exponential and logarithmic functions', 'Rational functions (HL)', 'Odd and even functions'], hours: 21 },
      { name: 'Topic 3: Geometry and Trigonometry', subtopics: ['Radian measure and arc length', 'Trig ratios and identities', 'Solving trig equations', 'Sine and cosine rules', '3D geometry', 'Vectors (dot product, cross product HL)', 'Planes and lines (HL)'], hours: 25 },
      { name: 'Topic 4: Statistics and Probability', subtopics: ['Statistical measures and distributions', 'Normal distribution', 'Probability rules (conditional, Bayes HL)', 'Binomial distribution', 'Hypothesis testing (HL)', 'Chi-squared test'], hours: 27 },
      { name: 'Topic 5: Calculus', subtopics: ['Differentiation: product, quotient, chain rules', 'Integration: indefinite, definite, substitution', 'Areas and volumes of revolution', 'Differential equations (HL)', 'Maclaurin series (HL)', 'Related rates of change'], hours: 28 },
    ],
    hlExtensions: [
      { name: 'HL-only content', subtopics: ['Proof by induction and contradiction', 'Complex numbers (De Moivre, Euler\'s form)', 'Advanced calculus (differential equations, implicit differentiation, Maclaurin series)', 'Vectors in 3D (lines, planes, intersections)', 'Further statistics (Type I/II errors, Poisson distribution)', 'Graph theory (HL)'] },
    ],
    assessment: [
      { name: 'Paper 1: No Calculator', type: 'external', weight_sl: 40, weight_hl: 30, duration: '1h 30m (SL) / 2h (HL)', description: 'Section A: short-response. Section B: extended response. No GDC allowed.' },
      { name: 'Paper 2: Calculator', type: 'external', weight_sl: 40, weight_hl: 30, duration: '1h 30m (SL) / 2h (HL)', description: 'Section A: short-response. Section B: extended response. GDC required.' },
      { name: 'Paper 3 (HL only)', type: 'external', weight_sl: 0, weight_hl: 20, duration: '1h', description: 'HL: two open-ended, extended problem-solving questions requiring novel approaches.' },
      { name: 'Internal Assessment (IA)', type: 'internal', weight_sl: 20, weight_hl: 20, description: 'Mathematical exploration (12–20 pages) on a topic of student\'s choice showing genuine mathematical thinking.' },
    ],
    commandTerms: ['Find', 'Calculate', 'Show that', 'Prove', 'Hence', 'Hence or otherwise', 'Sketch', 'Draw', 'Write down', 'Determine', 'Solve', 'Deduce', 'Verify'],
    keyConceptsAndSkills: ['Algebraic manipulation', 'Proof techniques', 'Graph sketching', 'Calculus applications', 'Statistical interpretation', 'Use of GDC effectively', 'Communication of mathematical reasoning'],
    commonMistakes: ['Not showing working on "show that" questions', 'Rounding too early', 'Forgetting +C in integration', 'Not checking domain restrictions', 'Incorrect chain rule application', 'Forgetting to use radian mode on GDC'],
    examTips: ['"Hence" means you MUST use the previous result', 'Paper 1: exact answers expected — keep π, √ in answers', 'IA: choose something you are genuinely curious about and go deeper than syllabus', 'Show all algebraic steps — method marks available throughout'],
  },

  {
    name: 'Mathematics: Applications and Interpretation',
    group: 5,
    code: 'MATH-AI',
    availableLevels: ['SL', 'HL'],
    overview: 'For students with interests in social sciences, natural sciences, statistics and business. Emphasises technology, modelling, and applying mathematics to real-world problems.',
    coreTopics: [
      { name: 'Topic 1: Number and Algebra', subtopics: ['Approximation and significant figures', 'Standard form', 'Sequences and series', 'Financial mathematics (compound interest, loans, annuities)', 'Logarithms (HL)'], hours: 16 },
      { name: 'Topic 2: Functions', subtopics: ['Linear and piecewise functions', 'Exponential models', 'Direct and inverse variation', 'Regression (linear, quadratic, exponential)', 'Logistic models (HL)', 'Sinusoidal models'], hours: 31 },
      { name: 'Topic 3: Geometry and Trigonometry', subtopics: ['Mensuration (area, volume)', 'Trigonometry (sine/cosine rules)', 'Voronoi diagrams', 'Graph theory: minimum spanning trees, shortest paths (HL)', 'Vectors (HL)'], hours: 18 },
      { name: 'Topic 4: Statistics and Probability', subtopics: ['Collecting and analysing data', 'Linear correlation and regression', 'Chi-squared test for independence and goodness of fit', 'Normal distribution', 'Binomial distribution', 'Poisson distribution (HL)', 'Hypothesis testing (HL)', 'Confidence intervals (HL)'], hours: 36 },
      { name: 'Topic 5: Calculus', subtopics: ['Differentiation (basic rules)', 'Integration (basic rules)', 'Numerical integration (trapezoidal rule)', 'Euler\'s method (HL)', 'Phase portraits (HL)', 'Coupled systems (HL)'], hours: 19 },
    ],
    hlExtensions: [
      { name: 'HL Extension', subtopics: ['Markov chains', 'Complex applications of statistics', 'Differential equations (Euler\'s method, coupled systems)', 'Voronoi in more depth', 'Networks and graph theory'] },
    ],
    assessment: [
      { name: 'Paper 1: Calculator (Short response)', type: 'external', weight_sl: 40, weight_hl: 30, duration: '1h 30m (SL) / 2h (HL)', description: 'Short-response questions. GDC required throughout.' },
      { name: 'Paper 2: Calculator (Extended response)', type: 'external', weight_sl: 40, weight_hl: 30, duration: '1h 30m (SL) / 2h (HL)', description: 'Extended response questions involving real-world contexts. GDC required.' },
      { name: 'Paper 3 (HL only)', type: 'external', weight_sl: 0, weight_hl: 20, duration: '1h', description: 'Two open-ended questions involving mathematical modelling in context.' },
      { name: 'Internal Assessment (IA)', type: 'internal', weight_sl: 20, weight_hl: 20, description: 'Mathematical exploration connecting real-world data to mathematical models.' },
    ],
    commandTerms: ['Find', 'Calculate', 'Write down', 'Determine', 'Sketch', 'Draw', 'Solve', 'Hence', 'Interpret', 'Predict', 'Justify'],
    keyConceptsAndSkills: ['GDC proficiency (regression, distributions, numerical methods)', 'Statistical interpretation', 'Mathematical modelling', 'Real-world application', 'Data analysis skills'],
    commonMistakes: ['Not interpreting results in context', 'Using wrong distribution', 'Not checking regression correlation', 'Forgetting financial formula variables (n, r, PV, FV)'],
    examTips: ['Always write GDC commands and output clearly', 'In statistics: state H0 and H1 explicitly', 'IA: use real data and show genuine mathematical analysis beyond the syllabus'],
  },

  // ─────────────────── GROUP 6 ───────────────────

  {
    name: 'Visual Arts',
    group: 6,
    code: 'VA',
    availableLevels: ['SL', 'HL'],
    overview: 'Develops visual thinking, art-making skills and critical analysis. Students create original artworks and research historical/contemporary art across cultures.',
    coreTopics: [
      { name: 'Art Making', subtopics: ['Studio practice across media (drawing, painting, sculpture, digital, mixed media)', 'Experimentation with techniques', 'Personal artistic development', 'Contextual references in practice'] },
      { name: 'Comparative Study', subtopics: ['Formal analysis of artworks', 'Comparison across cultures and time periods', 'Connections to own work (HL)', '10–15 screens of visual material'] },
      { name: 'Process Portfolio', subtopics: ['Documentation of studio investigations', 'Process and reflection', 'HL: 13–25 screens. SL: 9–18 screens'] },
    ],
    hlExtensions: [
      { name: 'Curatorial Rationale (HL only)', subtopics: ['Exhibition curation text (700 words)', 'Justification of artwork selection and placement'] },
    ],
    assessment: [
      { name: 'Comparative Study', type: 'external', weight_sl: 20, weight_hl: 20, description: 'Analysis of 3 artworks by different artists. SL: 10–15 screens. HL: 10–15 screens + connections.' },
      { name: 'Process Portfolio', type: 'external', weight_sl: 40, weight_hl: 40, description: 'Documentation of studio practice across different media.' },
      { name: 'Exhibition', type: 'internal', weight_sl: 40, weight_hl: 40, description: 'Final exhibition of 4–7 artworks (SL) or 8–11 artworks (HL) with artist\'s statement.' },
    ],
    commandTerms: ['Analyse', 'Evaluate', 'Describe', 'Discuss', 'Explore', 'Identify', 'Justify'],
    keyConceptsAndSkills: ['Formal elements (line, tone, colour, texture, shape, space, form)', 'Compositional strategies', 'Critical vocabulary', 'Art historical context', 'Personal artistic voice'],
    commonMistakes: ['Comparative study without formal analysis', 'Process portfolio without reflection', 'Artist statement that just describes rather than explains intention'],
    examTips: ['Comparative study: start with formal analysis before interpreting meaning', 'Process portfolio: show the PROCESS — include failed experiments', 'Exhibition: artworks should form a coherent body of work with a clear concept'],
  },

]

// ─────────────────── TOK & EE ───────────────────

export const TOK_CURRICULUM = {
  overview: 'Theory of Knowledge (TOK) is a compulsory IB course that explores the nature of knowledge across disciplines. It asks "How do we know what we know?" and develops critical thinking about knowledge claims.',
  coreTheme: 'Knowledge and the knower — personal knowledge, shared knowledge, knowers and communities of knowers.',
  optionalThemes: ['Knowledge and language', 'Knowledge and technology', 'Knowledge and politics', 'Knowledge and religion', 'Knowledge and indigenous societies'],
  areasOfKnowledge: ['Natural sciences', 'Human sciences', 'History', 'The arts', 'Ethics', 'Mathematics', 'Religious knowledge systems', 'Indigenous knowledge systems'],
  waysOfKnowing: ['Language', 'Sense perception', 'Emotion', 'Reason', 'Imagination', 'Faith', 'Intuition', 'Memory'],
  assessment: [
    { component: 'TOK Exhibition', weight: 33, description: '3 objects/artefacts related to a Core Theme prompt. 950-word commentary.' },
    { component: 'TOK Essay', weight: 67, description: '1600-word essay responding to one of 6 prescribed titles. Externally marked.' },
  ],
  essayTips: ['Use specific knowledge examples from at least 2 AOKs', 'Explore genuine complexity — don\'t give simple yes/no answers', 'Address counterarguments and limitations', 'Use TOK concepts: knowledge claim, knowledge question, justification, certainty', 'The essay is about the nature of knowledge, not just facts in a subject'],
  exhibitionTips: ['Choose objects with strong, direct connection to the prompt', 'Each object needs its own explanation of why it links to the prompt', 'Objects can be images, physical items, or digital artefacts'],
}

export const EE_CURRICULUM = {
  overview: 'The Extended Essay (EE) is a 4000-word independent research essay on a student-chosen topic in one of the IB subjects. It is assessed on Criteria A–E.',
  criteria: [
    { label: 'A: Focus and Method', marks: 6, description: 'Clear research question, context, and methodology appropriate to the subject.' },
    { label: 'B: Knowledge and Understanding', marks: 6, description: 'Demonstrates subject-specific knowledge and understanding, uses correct terminology.' },
    { label: 'C: Critical Thinking', marks: 12, description: 'Quality of analysis, evaluation, argument, and evidence.' },
    { label: 'D: Presentation', marks: 4, description: 'Structure, layout, bibliography, and word count adherence.' },
    { label: 'E: Engagement', marks: 6, description: 'Reflection shown in RPPF (Reflections on Planning and Progress Form, 500 words).' },
  ],
  wordCount: 4000,
  subjects: ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'Computer Science', 'History', 'Economics', 'Geography', 'Psychology', 'English A: Literature', 'English A: Language & Literature', 'Visual Arts', 'Music', 'Business Management', 'World Studies (interdisciplinary)'],
  tips: ['Research question must be focused, specific and answerable within 4000 words', 'Methodology must match the subject (experiment for sciences, analysis for humanities)', 'Cite all sources correctly using consistent citation style', 'RPPF: write genuinely reflective entries after each supervisor meeting', 'Draft → supervisor feedback → revise. Never submit a first draft.'],
  gradeBoundaries: { A: '34–36', B: '29–33', C: '22–28', D: '14–21', E: '0–13' },
}

// ─────────────────── DIPLOMA SCORING ───────────────────

export const DIPLOMA_SCORING = {
  maxPoints: 45,
  subjectPoints: 42,  // 6 subjects × 7 points each
  bonusPoints: 3,     // TOK + EE matrix
  gradeDescriptors: [
    { grade: 7, description: 'Excellent', percentage: '~80%+' },
    { grade: 6, description: 'Very Good', percentage: '~70–79%' },
    { grade: 5, description: 'Good', percentage: '~60–69%' },
    { grade: 4, description: 'Satisfactory', percentage: '~50–59%' },
    { grade: 3, description: 'Mediocre', percentage: '~40–49%' },
    { grade: 2, description: 'Poor', percentage: '~30–39%' },
    { grade: 1, description: 'Very Poor', percentage: '~0–29%' },
  ],
  tokEeMatrix: [
    ['', 'EE A', 'EE B', 'EE C', 'EE D', 'EE E'],
    ['TOK A', '3', '3', '2', '2', 'n'],
    ['TOK B', '3', '2', '2', '1', 'n'],
    ['TOK C', '2', '2', '1', '1', 'n'],
    ['TOK D', '2', '1', '1', '0', 'n'],
    ['TOK E', 'n', 'n', 'n', 'n', 'n'],
  ],
  failConditions: ['Grade 1 in any subject', 'Grade 2 in three or more subjects', 'Grade E in EE or TOK', 'CAS requirements not completed', 'Malpractice', 'Minimum 12 points from HL subjects not met'],
  minimumRequirements: { total: 24, hlMinimum: 12, conditionsToAvoid: 'See failConditions' },
}

// ─────────────────── COMMAND TERMS (UNIVERSAL) ───────────────────

export const IB_COMMAND_TERMS = {
  knowledge: ['Define', 'Label', 'List', 'Measure', 'Recall', 'State', 'Draw', 'Identify', 'Outline', 'Write'],
  comprehension: ['Annotate', 'Classify', 'Compare', 'Describe', 'Distinguish', 'Explain', 'Interpret', 'Outline', 'Summarise'],
  application: ['Apply', 'Calculate', 'Complete', 'Construct', 'Determine', 'Draw', 'Estimate', 'Predict', 'Solve', 'Use'],
  analysis: ['Analyse', 'Deduce', 'Derive', 'Design', 'Examine', 'Formulate', 'Investigate', 'Show', 'Suggest'],
  synthesis: ['Compose', 'Create', 'Design', 'Devise', 'Formulate', 'Modify', 'Plan', 'Produce'],
  evaluation: ['Assess', 'Comment', 'Compare and contrast', 'Criticise', 'Evaluate', 'Justify', 'Recommend', 'To what extent'],
}
