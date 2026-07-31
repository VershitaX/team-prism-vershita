import { Paper, Chunk, Claim, Brief, Flashcard, ProcessingEvent } from "./types";

export const MOCK_PAPER: Paper = {
  paper_id: "demo-mams-aging-2026",
  filename: "2606_17457v1.pdf",
  title: "Aging Induced Structural Alterations in SR-Mitochondria Interaction in Skeletal Muscle: Emerging Insights",
  page_count: 16,
  status: "ready",
  created_at: "2026-07-31T10:00:00.000Z",
};

export const MOCK_CHUNKS: Chunk[] = [
  {
    chunk_id: "c-abstract",
    paper_id: MOCK_PAPER.paper_id,
    page: 1,
    section: "Abstract",
    text: "The aging associated reduction of muscle mass, termed as sarcopenia, is a major factor in geriatric functional decline and frailty. In healthy young muscle tissue, the close physical proximity of SR and mitochondrial membranes shows contacts called mitochondria-associated membranes (MAMs). However, upon aging the precision of SR and mitochondria co-localization as well as crosstalk seems to be affected.",
    token_count: 60,
  },
  {
    chunk_id: "c-intro-metabolic-flexibility",
    paper_id: MOCK_PAPER.paper_id,
    page: 2,
    section: "1. Introduction",
    text: "Another crucial factor in muscle aging often under-recognized is reduction in metabolic flexibility; which is defined as the ability to rapidly switch fuel sources (glucose and fat) to meet energy demands. Since metabolic flexibility depends on coordinated Ca2+ signals between SR-mitochondria its loss marks a turning point in the progression of sarcopenia.",
    token_count: 52,
  },
  {
    chunk_id: "c-intro-self-reinforcing",
    paper_id: MOCK_PAPER.paper_id,
    page: 2,
    section: "1. Introduction",
    text: "These age-related changes create a self-reinforcing cycle: Ca2+ dysregulation amplifies mitochondrial stress that produce reactive oxygen species (ROS), elevated ROS further oxidizes SR channels, and lipid accumulation disrupts physical contacts collectively converging to impaired SR-mitochondrial crosstalk.",
    token_count: 41,
  },
  {
    chunk_id: "c-sr-caq1",
    paper_id: MOCK_PAPER.paper_id,
    page: 3,
    section: "2. SR as the Primary Regulator of Ca2+ Homeostasis",
    text: "CASQ1 is the major Ca2+-buffering protein that can undergo reversible polymerization in a Ca2+-dependent manner. CASQ1 interact with the RyR1 mainly through triadin and junctin (direct interaction also has been reported), thereby keeps high amount of Ca2+ close to the CRU.",
    token_count: 43,
  },
  {
    chunk_id: "c-sr-aging-junctophilin",
    paper_id: MOCK_PAPER.paper_id,
    page: 4,
    section: "2. SR as the Primary Regulator of Ca2+ Homeostasis",
    text: "Aging interferes with both phases of Ca2+ homeostasis as a decrease in junctophilin expression increases the SR and T-tubule gap, delaying Ca2+ release and decreasing peak tension. Also, decreased expression of SERCA isoforms with an increase in slower isoforms has been shown during aging leading to decreased relaxation and contractile efficiency.",
    token_count: 51,
  },
  {
    chunk_id: "c-mam-formation",
    paper_id: MOCK_PAPER.paper_id,
    page: 4,
    section: "2. SR as the Primary Regulator of Ca2+ Homeostasis",
    text: "MAMs are established when the SR and mitochondria membranes are closely juxtaposed at 10-30 nm range and tethered together by protein complexes especially mitofusins (MFN1 and MFN2). Other protein complexes that assist MAM formation are voltage-dependent anion channel 1 (VDAC1), glucose-regulated protein 75 (GRP75), and inositol 1,4,5-trisphosphate receptor (IP3R).",
    token_count: 53,
  },
  {
    chunk_id: "c-mitochondria-ssm-ifm",
    paper_id: MOCK_PAPER.paper_id,
    page: 5,
    section: "3. Mitochondria: A factor in muscle aging",
    text: "Spatially in myofibers, mitochondria are organized into subsarcolemmal populations (termed SSM) beneath the cell membrane that support energy demand of ion balance, and intermyofibrillar populations (termed IFM) nestled between myofibrils fueling contraction, also bear greater capacity of Ca2+-buffering.",
    token_count: 43,
  },
  {
    chunk_id: "c-mitochondria-aging-fission",
    paper_id: MOCK_PAPER.paper_id,
    page: 6,
    section: "3. Mitochondria: A factor in muscle aging",
    text: "A major change with aging is a shift in balance toward excessive fission and impaired mitophagy due to increased DRP1 activity, while fusion proteins and autophagy machinery decline. This results in the accumulation of fragmented mitochondria that produce more ROS and harbor mtDNA deletions, confirmed by proteomics and genomics studies of aged muscle.",
    token_count: 53,
  },
  {
    chunk_id: "c-mam-density-percent",
    paper_id: MOCK_PAPER.paper_id,
    page: 8,
    section: "4. SR-Mitochondrial Communication Networks",
    text: "In skeletal muscle, approximately 5-20% of the outer mitochondrial membrane bear MAMs that enables rapid, localized Ca2+ transfer without substantially elevating bulk cytosolic Ca2+ levels. Within these junctions, Ca2+-released through RyR1 and IP3Rs generates high-Ca2+ microdomains (>15 uM) sensed by mitochondria via the IP3R-Grp75-VDAC-MCU axis.",
    token_count: 52,
  },
  {
    chunk_id: "c-mam-aging-decline",
    paper_id: MOCK_PAPER.paper_id,
    page: 9,
    section: "4. SR-Mitochondrial Communication Networks",
    text: "During aging the MAM gaps widen along with decline in expression of MFN2, IP3R and MCU, which slows mitochondrial Ca2+ uptake, resulting in metabolic lag and cytosolic Ca2+ overload. These conditions in aged fibers, correlate with decreased fatigue resistance and reduced capacity for sustained or repeated contractions.",
    token_count: 47,
  },
  {
    chunk_id: "c-mfn2-overexpression",
    paper_id: MOCK_PAPER.paper_id,
    page: 9,
    section: "4. SR-Mitochondrial Communication Networks",
    text: "Atrophy models like disuse, microgravity and aging exhibit progressively decrease MFN2 levels causing loss of MAMs. On the other hand MFN2 overexpression studies showed partial restoration of MAMs structure improving mitochondrial function in aged muscle.",
    token_count: 37,
  },
  {
    chunk_id: "c-lipid-trafficking",
    paper_id: MOCK_PAPER.paper_id,
    page: 10,
    section: "4. SR-Mitochondrial Communication Networks",
    text: "MAMs serve as hubs for lipid synthesis and exchange: phosphatidylserine move from SR to mitochondria, where phosphatidylserine is converted to phosphatidylethanolamine. Further, MAMs facilitate cardiolipin and cholesterol delivery to mitochondrial membranes. These lipid trafficking are critical for mitochondrial inner membrane integrity and support mitochondrial biogenesis.",
    token_count: 47,
  },
  {
    chunk_id: "c-ros-feedforward",
    paper_id: MOCK_PAPER.paper_id,
    page: 11,
    section: "4. SR-Mitochondrial Communication Networks",
    text: "This creates a feed-forward cycle: chronic ROS oxidizes RyR1, causing SR Ca2+ leak and mitochondrial Ca2+ overload at remaining MAMs contacts, triggering further ROS production damaging more SR and MAMs proteins. In conditions where this cycle persists for long (like sarcopenia), mitochondria floods with Ca2+ causing opening the mPTP, which triggers apoptosis.",
    token_count: 54,
  },
  {
    chunk_id: "c-exercise-remodelling",
    paper_id: MOCK_PAPER.paper_id,
    page: 12,
    section: "4. SR-Mitochondrial Communication Networks",
    text: "Endurance exercise improves mitochondria-triad association stability by enhancing expression of tether proteins such as MFN2, VDAC1, and GRP75. This supports efficient mitochondrial Ca2+ uptake and aligns ATP output with repeated contractile demand and increasing functionally competent interfaces that minimize Ca2+ leak and oxidative stress.",
    token_count: 44,
  },
  {
    chunk_id: "c-nmj-denervation",
    paper_id: MOCK_PAPER.paper_id,
    page: 13,
    section: "5. Aging-Induced Disruption of Skeletal Muscle Homeostasis",
    text: "In aged muscles, surviving neurons attempt to reinnervate denervated fibers through compensatory sprouting, but failure of this result in permanent denervation that is suggested to be a cause of age-associated muscle loss. Denervation triggers secondary cascade of organellar dysfunction including SR fragmentation and disruption of mitochondrial architecture, critical for derailment of MAMs.",
    token_count: 51,
  },
  {
    chunk_id: "c-limitation-controversial",
    paper_id: MOCK_PAPER.paper_id,
    page: 13,
    section: "5. Aging-Induced Disruption of Skeletal Muscle Homeostasis",
    text: "Alterations in Ca2+ influx-efflux mechanisms have been linked to mitochondrial dysfunction; however, whether this dysfunction results from mitochondrial Ca2+ deficiency or pathological Ca2+ overload remains controversial.",
    token_count: 26,
  },
  {
    chunk_id: "c-limitation-threshold",
    paper_id: MOCK_PAPER.paper_id,
    page: 14,
    section: "5. Aging-Induced Disruption of Skeletal Muscle Homeostasis",
    text: "These muscle structural functionality is highly flexible and has been shown to be reversed by interventions like pharmacotherapy (e.g. urolithin A, cardiolipin supplementation) and exercise. Surprisingly however, the interventions become ineffective after the derailments have reached a threshold; therefore, early and sustained prevention strategies to maintain mitochondrial health in muscle have been proposed.",
    token_count: 52,
  },
  {
    chunk_id: "c-limitation-mfn2-partial",
    paper_id: MOCK_PAPER.paper_id,
    page: 14,
    section: "5. Aging-Induced Disruption of Skeletal Muscle Homeostasis",
    text: "Both aging and disuse-induced atrophy progressively decrease MFN2 levels, while MFN2 overexpression can partially rebuild MAMs structure and improve mitochondrial function in aged muscle. However, overall strength is only modestly restored and full reversal in extreme cases remained elusive.",
    token_count: 41,
  },
  {
    chunk_id: "c-targeting-mams",
    paper_id: MOCK_PAPER.paper_id,
    page: 15,
    section: "6. Targeting MAMs to treat muscle health",
    text: "Among the tethering proteins, MFN2 has been targeted by mini-peptides and small-molecule agonists to restore MAMs architecture. SR Ca2+ mediators like SERCA and RyR1 have been targeted with CDN1163 (activator) and S107 (stabilizer) respectively to effectively modulate Ca2+-microdomains homeostasis to improve muscle function.",
    token_count: 44,
  },
];

export const MOCK_CLAIMS: Claim[] = [
  {
    claim_id: "cl-01",
    paper_id: MOCK_PAPER.paper_id,
    category: "claim",
    text: "MAMs (mitochondria-associated membranes) are physical contact points between the SR and mitochondria that become structurally and functionally disrupted during aging.",
    citation: {
      page: 1,
      section: "Abstract",
      chunk_id: "c-abstract",
      quote: "In healthy young muscle tissue, the close physical proximity of SR and mitochondrial membranes shows contacts called mitochondria-associated membranes (MAMs)... upon aging the precision of SR and mitochondria co-localization as well as crosstalk seems to be affected.",
    },
    confidence: 0.95,
    status: "verified",
  },
  {
    claim_id: "cl-02",
    paper_id: MOCK_PAPER.paper_id,
    category: "claim",
    text: "Loss of metabolic flexibility — the ability to switch between glucose and fat as fuel sources — marks a turning point in the progression of sarcopenia, since it depends on coordinated SR-mitochondria Ca2+ signaling.",
    citation: {
      page: 2,
      section: "1. Introduction",
      chunk_id: "c-intro-metabolic-flexibility",
      quote: "Since metabolic flexibility depends on coordinated Ca2+ signals between SR-mitochondria its loss marks a turning point in the progression of sarcopenia.",
    },
    confidence: 0.9,
    status: "verified",
  },
  {
    claim_id: "cl-03",
    paper_id: MOCK_PAPER.paper_id,
    category: "claim",
    text: "Age-related muscle decline follows a self-reinforcing cycle: Ca2+ dysregulation drives mitochondrial ROS production, which oxidizes SR channels and disrupts SR-mitochondrial contacts, worsening the dysregulation further.",
    citation: {
      page: 2,
      section: "1. Introduction",
      chunk_id: "c-intro-self-reinforcing",
      quote: "Ca2+ dysregulation amplifies mitochondrial stress that produce reactive oxygen species (ROS), elevated ROS further oxidizes SR channels, and lipid accumulation disrupts physical contacts collectively converging to impaired SR-mitochondrial crosstalk.",
    },
    confidence: 0.92,
    status: "verified",
  },
  {
    claim_id: "cl-04",
    paper_id: MOCK_PAPER.paper_id,
    category: "methodology",
    text: "MAMs form when SR and mitochondrial membranes are juxtaposed at 10-30 nm and tethered mainly by mitofusins MFN1/MFN2, along with VDAC1, GRP75, and IP3R.",
    citation: {
      page: 4,
      section: "2. SR as the Primary Regulator of Ca2+ Homeostasis",
      chunk_id: "c-mam-formation",
      quote: "MAMs are established when the SR and mitochondria membranes are closely juxtaposed at 10-30 nm range and tethered together by protein complexes especially mitofusins (MFN1 and MFN2).",
    },
    confidence: 0.93,
    status: "verified",
  },
  {
    claim_id: "cl-05",
    paper_id: MOCK_PAPER.paper_id,
    category: "evidence",
    text: "Decreased junctophilin expression during aging widens the SR–T-tubule gap, delaying Ca2+ release and reducing peak muscle tension.",
    citation: {
      page: 4,
      section: "2. SR as the Primary Regulator of Ca2+ Homeostasis",
      chunk_id: "c-sr-aging-junctophilin",
      quote: "A decrease in junctophilin expression increases the SR and T-tubule gap, delaying Ca2+ release and decreasing peak tension.",
    },
    confidence: 0.89,
    status: "verified",
  },
  {
    claim_id: "cl-06",
    paper_id: MOCK_PAPER.paper_id,
    category: "evidence",
    text: "Approximately 5-20% of the outer mitochondrial membrane forms MAM contacts, enabling localized Ca2+ microdomains above 15 uM without raising bulk cytosolic Ca2+.",
    citation: {
      page: 8,
      section: "4. SR-Mitochondrial Communication Networks",
      chunk_id: "c-mam-density-percent",
      quote: "Approximately 5-20% of the outer mitochondrial membrane bear MAMs that enables rapid, localized Ca2+ transfer without substantially elevating bulk cytosolic Ca2+ levels.",
    },
    confidence: 0.88,
    status: "verified",
  },
  {
    claim_id: "cl-07",
    paper_id: MOCK_PAPER.paper_id,
    category: "evidence",
    text: "Aging widens the SR-mitochondria gap and reduces MFN2, IP3R, and MCU expression, slowing mitochondrial Ca2+ uptake and correlating with reduced fatigue resistance.",
    citation: {
      page: 9,
      section: "4. SR-Mitochondrial Communication Networks",
      chunk_id: "c-mam-aging-decline",
      quote: "During aging the MAM gaps widen along with decline in expression of MFN2, IP3R and MCU, which slows mitochondrial Ca2+ uptake, resulting in metabolic lag and cytosolic Ca2+ overload.",
    },
    confidence: 0.9,
    status: "verified",
  },
  {
    claim_id: "cl-08",
    paper_id: MOCK_PAPER.paper_id,
    category: "evidence",
    text: "MFN2 overexpression can partially restore MAM structure and mitochondrial function in aged muscle.",
    citation: {
      page: 9,
      section: "4. SR-Mitochondrial Communication Networks",
      chunk_id: "c-mfn2-overexpression",
      quote: "MFN2 overexpression studies showed partial restoration of MAMs structure improving mitochondrial function in aged muscle.",
    },
    confidence: 0.87,
    status: "verified",
  },
  {
    claim_id: "cl-09",
    paper_id: MOCK_PAPER.paper_id,
    category: "claim",
    text: "Chronic ROS elevation during aging creates a feed-forward cycle at MAMs — oxidizing RyR1, causing Ca2+ leak and mitochondrial overload, which triggers mPTP opening and apoptosis in sarcopenic muscle.",
    citation: {
      page: 11,
      section: "4. SR-Mitochondrial Communication Networks",
      chunk_id: "c-ros-feedforward",
      quote: "Chronic ROS oxidizes RyR1, causing SR Ca2+ leak and mitochondrial Ca2+ overload at remaining MAMs contacts, triggering further ROS production... mitochondria floods with Ca2+ causing opening the mPTP, which triggers apoptosis.",
    },
    confidence: 0.91,
    status: "verified",
  },
  {
    claim_id: "cl-10",
    paper_id: MOCK_PAPER.paper_id,
    category: "evidence",
    text: "Endurance exercise improves mitochondria-SR tethering by upregulating MFN2, VDAC1, and GRP75, supporting more efficient Ca2+ uptake and reduced oxidative stress.",
    citation: {
      page: 12,
      section: "4. SR-Mitochondrial Communication Networks",
      chunk_id: "c-exercise-remodelling",
      quote: "Endurance exercise improves mitochondria-triad association stability by enhancing expression of tether proteins such as MFN2, VDAC1, and GRP75.",
    },
    confidence: 0.89,
    status: "verified",
  },
  {
    claim_id: "cl-11",
    paper_id: MOCK_PAPER.paper_id,
    category: "limitation",
    text: "Whether age-related mitochondrial dysfunction stems from mitochondrial Ca2+ deficiency or pathological Ca2+ overload remains scientifically unresolved.",
    citation: {
      page: 13,
      section: "5. Aging-Induced Disruption of Skeletal Muscle Homeostasis",
      chunk_id: "c-limitation-controversial",
      quote: "Whether this dysfunction results from mitochondrial Ca2+ deficiency or pathological Ca2+ overload remains controversial.",
    },
    confidence: 0.86,
    status: "flagged",
    verification_note: "Authors explicitly describe this mechanism as unresolved/controversial in the field, not a settled finding.",
  },
  {
    claim_id: "cl-12",
    paper_id: MOCK_PAPER.paper_id,
    category: "limitation",
    text: "Interventions like urolithin A and cardiolipin supplementation can reverse MAM decline, but become ineffective once structural derailment passes a certain threshold.",
    citation: {
      page: 14,
      section: "5. Aging-Induced Disruption of Skeletal Muscle Homeostasis",
      chunk_id: "c-limitation-threshold",
      quote: "The interventions become ineffective after the derailments have reached a threshold; therefore, early and sustained prevention strategies to maintain mitochondrial health in muscle have been proposed.",
    },
    confidence: 0.84,
    status: "flagged",
    verification_note: "Authors flag this as a boundary condition on treatment efficacy — relevant caveat for any therapeutic claims drawn from this review.",
  },
  {
    claim_id: "cl-13",
    paper_id: MOCK_PAPER.paper_id,
    category: "limitation",
    text: "MFN2 overexpression only modestly restores muscle strength in aged animals, and full reversal of MAM/mitochondrial decline remains elusive in extreme cases.",
    citation: {
      page: 14,
      section: "5. Aging-Induced Disruption of Skeletal Muscle Homeostasis",
      chunk_id: "c-limitation-mfn2-partial",
      quote: "Overall strength is only modestly restored and full reversal in extreme cases remained elusive.",
    },
    confidence: 0.85,
    status: "flagged",
    verification_note: "Tempers the earlier positive claim about MFN2 overexpression (cl-08) — worth reading together.",
  },
];

const CONCEPT_MAP_DEFINITION = `graph TD
  MAM["MAMs (SR-Mitochondria Contacts)"]
  TETH["Tethering Proteins (MFN1/2, VDAC1, GRP75, IP3R)"]
  CA["Ca2+ Signaling / Microdomains"]
  FLEX["Metabolic Flexibility"]
  AGING["Aging"]
  ROS["ROS Production"]
  SARC["Sarcopenia"]
  MPTP["mPTP Opening / Apoptosis"]
  EX["Endurance Exercise"]
  MFN2TX["MFN2 Overexpression Therapy"]
  OPENQ["Ca2+ Deficiency vs Overload (unresolved)"]
  THRESH["Intervention Threshold Effect"]

  TETH -->|form| MAM
  MAM -->|enables| CA
  CA -->|supports| FLEX
  AGING -->|reduces| TETH
  AGING -->|increases| ROS
  ROS -->|damages| MAM
  ROS -->|triggers| MPTP
  FLEX -->|loss drives| SARC
  MAM -->|decline contributes to| SARC
  EX -->|upregulates| TETH
  MFN2TX -->|partially restores| MAM
  MFN2TX -->|limited by| THRESH
  CA -.->|mechanism debated| OPENQ

  classDef core fill:#dff5ec,stroke:#2f7a5e,stroke-width:1.5px;
  classDef method fill:#eef2ff,stroke:#4c5fd5,stroke-width:1.5px;
  classDef result fill:#fff4e0,stroke:#b8860b,stroke-width:1.5px;
  classDef limitation fill:#fdeaea,stroke:#c0392b,stroke-width:1.5px;

  class MAM,CA,AGING,SARC core;
  class TETH,EX,MFN2TX method;
  class FLEX,ROS result;
  class MPTP,OPENQ,THRESH limitation;
`;

export const MOCK_BRIEF: Brief = {
  paper_id: MOCK_PAPER.paper_id,
  concept_map: CONCEPT_MAP_DEFINITION,
  summary:
    "This review examines how the physical and functional coupling between the sarcoplasmic reticulum (SR) and mitochondria — mediated by contact structures called mitochondria-associated membranes (MAMs) — deteriorates with age in skeletal muscle, and how this deterioration drives sarcopenia. The authors trace how declining MAM integrity disrupts Ca2+ signaling, lipid trafficking, and redox balance, and survey exercise, nutraceutical, and pharmacological strategies aimed at preserving or restoring MAM function to support healthy aging.",
  sections: [
    {
      heading: "What Are MAMs and Why They Matter",
      body: "MAMs are the 10-30 nm contact zones where SR and mitochondrial membranes juxtapose, held together primarily by mitofusins (MFN1/MFN2) along with VDAC1, GRP75, and IP3R. Roughly 5-20% of the outer mitochondrial membrane forms these contacts, enabling fast, localized Ca2+ transfer through high-concentration microdomains without disturbing bulk cytosolic Ca2+ — critical for matching ATP production to muscle contraction demands.",
      citation_ids: ["cl-04", "cl-06"],
    },
    {
      heading: "How Aging Disrupts the SR-Mitochondria Link",
      body: "Aging widens the physical gap between SR and mitochondria and reduces expression of key tethering proteins (MFN2, IP3R, MCU), slowing Ca2+ uptake and causing metabolic lag. This is compounded by declining junctophilin expression widening the SR-T-tubule gap and delaying Ca2+ release, plus a self-reinforcing cycle where Ca2+ dysregulation drives ROS production, which further damages SR channels and MAM proteins — eventually triggering mitochondrial permeability transition and apoptosis in severe cases like sarcopenia.",
      citation_ids: ["cl-03", "cl-05", "cl-07", "cl-09"],
    },
    {
      heading: "Loss of Metabolic Flexibility",
      body: "Because switching between glucose and fat as fuel sources depends on coordinated SR-mitochondria Ca2+ signaling, the breakdown of this crosstalk marks a key turning point in sarcopenia's progression — not just a downstream symptom of muscle aging.",
      citation_ids: ["cl-02"],
    },
    {
      heading: "Interventions and Their Limits",
      body: "Exercise — particularly endurance training — upregulates tethering proteins like MFN2, VDAC1, and GRP75, improving Ca2+ handling and reducing oxidative stress. Pharmacological approaches (MFN2 agonists, SERCA activators, urolithin A) show promise, but the review cautions that MFN2 overexpression only partially restores strength, interventions lose effectiveness past a certain degree of structural decline, and the precise causal direction of mitochondrial Ca2+ dysfunction (deficiency vs. overload) remains an open question.",
      citation_ids: ["cl-10", "cl-11", "cl-12", "cl-13"],
    },
  ],
};

export const MOCK_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-01",
    question: "What are MAMs and what proteins primarily hold them together?",
    answer: "MAMs (mitochondria-associated membranes) are 10-30 nm contact zones between the SR and mitochondria, held together mainly by mitofusins MFN1 and MFN2, along with VDAC1, GRP75, and IP3R.",
    source_claim_id: "cl-04",
  },
  {
    id: "fc-02",
    question: "Why does loss of metabolic flexibility matter so much in sarcopenia?",
    answer: "Metabolic flexibility — switching between glucose and fat as fuel — depends on coordinated Ca2+ signaling between SR and mitochondria, so its loss marks a turning point in sarcopenia's progression, not just a side effect.",
    source_claim_id: "cl-02",
  },
  {
    id: "fc-03",
    question: "Describe the self-reinforcing cycle of SR-mitochondrial decline during aging.",
    answer: "Ca2+ dysregulation increases mitochondrial ROS production, which oxidizes SR channels and damages MAM proteins, further worsening Ca2+ dysregulation — a feedback loop that compounds over time.",
    source_claim_id: "cl-03",
  },
  {
    id: "fc-04",
    question: "What happens to MAM density and key tethering proteins as muscle ages?",
    answer: "The SR-mitochondria gap widens, and expression of MFN2, IP3R, and MCU declines — slowing mitochondrial Ca2+ uptake and correlating with reduced fatigue resistance.",
    source_claim_id: "cl-07",
  },
  {
    id: "fc-05",
    question: "How does endurance exercise help preserve SR-mitochondria coupling?",
    answer: "It upregulates tethering proteins MFN2, VDAC1, and GRP75, improving mitochondrial Ca2+ uptake efficiency and reducing oxidative stress at MAM contact sites.",
    source_claim_id: "cl-10",
  },
  {
    id: "fc-06",
    question: "What's a key limitation of MFN2-overexpression as a therapy for aged muscle?",
    answer: "While it partially restores MAM structure and mitochondrial function, overall muscle strength is only modestly improved, and full reversal in severe cases remains elusive.",
    source_claim_id: "cl-13",
  },
  {
    id: "fc-07",
    question: "What open question about mitochondrial Ca2+ dysfunction does the review flag as unresolved?",
    answer: "Whether age-related mitochondrial dysfunction is caused by too little mitochondrial Ca2+ uptake (deficiency) or too much (pathological overload) remains scientifically controversial.",
    source_claim_id: "cl-11",
  },
];

export const MOCK_PROCESSING_LOG: ProcessingEvent[] = [
  { ts: "2026-07-31T10:00:01.000Z", step: "uploaded", detail: "File received: 16 pages" },
  { ts: "2026-07-31T10:00:04.000Z", step: "parsing", detail: "Extracting text from PDF" },
  { ts: "2026-07-31T10:00:08.000Z", step: "chunking", detail: "Splitting into 19 section-tagged chunks" },
  { ts: "2026-07-31T10:00:12.000Z", step: "extracting", detail: "Extracting claims from each chunk" },
  { ts: "2026-07-31T10:00:19.000Z", step: "verifying", detail: "Verifying claims against source text" },
  { ts: "2026-07-31T10:00:23.000Z", step: "ready", detail: "Briefing ready" },
];