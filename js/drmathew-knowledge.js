/**
 * drmathew-knowledge.js: what Dr. Mathew knows without calling a model.
 *
 * Same idea as Roxi's FACTS catalogue: each entry has keywords (phrases people use), example questions and an
 * answer. The router scores a question against every entry and only answers on its own when one entry clearly
 * wins. Anything weaker goes to the AI worker (when configured) or gets the closest guide answer plus a nudge to
 * book a consultation. A single keyword never decides a question.
 * Facts verified against official sources in October 2026 (see pathway.html#sources). Keep them in sync.
 */
(function () {
  const C = window.TD_CONFIG || {};
  const contact = `Email **${C.email}** or use the **Book a Consultation** form on the home page`;
  const guide = (anchor, label) => `\n\nMore detail: **Pathway Guide → ${label}** (traindentist.com/pathway.html#${anchor}).`;

  const FACTS = [
    {
      id: "about", label: "About Dr. Mathew",
      keywords: ["who are you", "dr mathew", "dr liji", "liji mathew", "about you", "your background", "credentials", "qualification", "qualifications", "experience", "dmd", "who is", "your story", "temple"],
      examples: ["Who is Dr. Mathew?", "What are your credentials?", "Tell me about yourself"],
      answer: "I'm **Dr. Liji Mathew, DMD, MDS**. I've walked the path you're on.\n\n- **BDS with distinction**: Christian Medical College, Ludhiana, India\n- **MDS in Prosthodontics and Implantology**: Amrita School of Dentistry, Kochi, with the **Gold Medal** for top academic and clinical skills\n- Former dental faculty in India (restorative, prosthodontics, endodontics)\n- **DMD from Temple University** (Class of 2019), **summa cum laude**, with the **Dean's Award** for providing the most clinical care in my clinic cluster\n- Fellow of the ICOI and member of the ADA, TDA and Greater Houston Dental Society\n\nToday I practice in the Houston / Katy, Texas area and mentor international dentists 1-on-1 through the bench test, interview and application.",
    },
    {
      id: "pathway", label: "The U.S. pathway",
      keywords: ["pathway", "process", "steps", "how do i become", "become a dentist", "practice in us", "practise in us", "practice dentistry", "foreign dentist", "foreign trained", "international dentist", "roadmap", "where do i start", "get started", "how to start", "work as a dentist"],
      examples: ["How can a foreign dentist practice in the US?", "What are the steps?", "Where do I start?"],
      answer: "The usual route for an internationally trained dentist:\n\n1. **DENTPIN + ECE Course-by-Course evaluation** ($199). The INBDE requires ECE.\n2. **Pass the INBDE**. Most programs want a passing result before you apply.\n3. **TOEFL iBT**. Minimums range from about 80 to 100 (4.0–5.0 on the new scale).\n4. **Apply through ADEA CAAPID**. It opens in early March, with deadlines from about June to October.\n5. **Bench test and interview** at the schools that invite you.\n6. **Complete a 2–3 year advanced standing program**, ending in a U.S. DDS/DMD.\n7. **Licensure**: the ADEX clinical exam, a jurisprudence exam and state requirements.\n\nFrom first step to license usually takes 3.5 to 5+ years. I coach steps 4 and 5 most closely." + guide("steps", "The core steps"),
    },
    {
      id: "need-degree", label: "Do I need a U.S. degree?",
      keywords: ["need a us degree", "us degree", "without a us degree", "without dds", "without going back", "repeat dental school", "go back to school", "license without", "directly practice", "quickest way", "fastest way", "shortcut"],
      examples: ["Do I need a US dental degree?", "Can I practice without going back to dental school?", "What is the quickest way to practice?"],
      answer: "For a **full license in most states, yes**. You need a degree from a CODA-accredited program, so most international dentists complete a 2–3 year advanced standing DDS/DMD.\n\nA few states have alternatives, usually limited to that one state:\n- **Minnesota**: a Limited General License (INBDE, English test, jurisprudence and clinical exam), then 3 years of supervised practice\n- **Texas**: 2 years in a CODA-accredited **specialty** program (GPR/AEGD don't count)\n- **Florida**: 2 consecutive years in a CODA supplemental general dentistry program\n- **Washington**: 2 or more academic years in a CODA program with clinical training\n\nBe careful with old blogs that claim some states need \"no extra training\". That's outdated. Always confirm with the state board." + guide("routes", "Choose your route"),
    },
    {
      id: "states", label: "State alternative pathways",
      keywords: ["minnesota", "texas", "florida", "washington", "massachusetts", "california", "new york", "which state", "which states", "state board", "limited license", "residency license", "aegd", "gpr", "state pathway", "states license foreign", "license foreign dentist", "license in texas", "licensed in texas", "license texas residency"],
      examples: ["Which states license foreign dentists?", "Can I get licensed in Texas with a residency?", "What is the Minnesota limited license?"],
      answer: "State routes that don't require a U.S. DDS (verify each one with the board, since rules change):\n- **Minnesota**: Limited General License after credential review, INBDE, TOEFL/OET, jurisprudence and a clinical exam, then 3 years of supervised practice before you can petition for a full license\n- **Texas**: at least 2 years in a CODA-accredited ADA **specialty** program, plus INBDE, a clinical exam and jurisprudence. GPR/AEGD don't qualify.\n- **Florida**: 2 consecutive years in a CODA \"supplemental general dentistry\" program (for example UF's 2-year AEGD in Hialeah, which leads to Florida eligibility only)\n- **Washington**: 2 or more extra academic years in a CODA program with clinical training\n- **Massachusetts**: a limited \"dental intern\" license, for example at community health centers\n- **California**: requires a 2-year program at a board-approved school ending in a DDS/DMD\n- **New York**: accepts a 1-year CODA residency in place of a clinical exam, but you still need the education requirement\n\nA license from these routes often won't transfer to other states." + guide("routes", "Choose your route"),
    },
    {
      id: "caapid", label: "CAAPID application",
      keywords: ["caapid", "application", "apply", "adea", "deadline", "deadlines", "cycle", "when does caapid open", "application fee"],
      examples: ["How does CAAPID work?", "When does CAAPID open?", "What are the deadlines?"],
      answer: "**ADEA CAAPID** is the centralized application most advanced standing programs use.\n- **Opens:** early March (March 5 in 2026)\n- **Deadlines:** from about **June 1** (Penn, UW, NYU, UMKC), through **July 31** (USC, Howard) and **October 1** (UF), to **October 15** (BU). Many schools review on a rolling basis, so apply early.\n- **Fees:** $264 for the first program and $115 for each additional one, plus most schools' own supplemental fee (about $75–$200)\n- **Evaluations:** up to 3 through CAAPID\n- **Verification:** submit 6–8 weeks before deadlines\n\nNot every program uses CAAPID, so check each school." + guide("caapid", "CAAPID"),
    },
    {
      id: "statement", label: "Personal statement & letters",
      keywords: ["personal statement", "statement", "essay", "letters of recommendation", "lor", "recommendation letter", "letters", "evaluator", "evaluations", "cv", "resume"],
      examples: ["Can you review my personal statement?", "Who should write my letters of recommendation?"],
      answer: "**Personal statement:** explain why U.S. dentistry, what shaped you, and what you'll contribute, with specific moments rather than general claims. Have it reviewed before you submit, because you can't change it afterwards.\n\n**Letters:** schools commonly want 3, often from your **dean**, a **faculty member**, and a **clinical employer or U.S. dentist**, preferably recent and on letterhead. A letter from a U.S. dentist you've shadowed or volunteered with carries real weight.\n\nI review personal statements and application strategy in mentoring sessions.",
    },
    {
      id: "interview", label: "Interview preparation",
      keywords: ["interview", "mock interview", "mmi", "casper", "behavioral", "why this school", "why dentistry", "questions they ask", "ethics", "ethical", "communication", "cultural"],
      examples: ["How do I prepare for the interview?", "What questions do they ask?", "Do you do mock interviews?"],
      answer: "Interviews are usually with faculty, in person or virtual, sometimes as a panel, and some schools also use **Casper**. They test communication, professionalism, ethics, motivation and fit.\n\n**Interview Prep** covers:\n- Structured answers to **behavioral and clinical scenarios**\n- **U.S. dental ethics**: autonomy, informed consent, the ADA Code\n- **\"Why the U.S.?\" and \"Why our school?\"** answers that are specific to each program\n- **Recorded mock interviews** with line-by-line feedback\n\nGeneric, memorized or overly long answers are the most common reason strong clinicians lose offers.",
    },
    {
      id: "bench", label: "Bench test preparation",
      keywords: ["bench test", "bench", "psychomotor", "practical exam", "practical", "hands on", "typodont", "manikin", "simulation", "preclinical", "manual dexterity", "lab test"],
      examples: ["What is the bench test?", "How do I prepare for the bench test?", "What procedures are on the bench test?"],
      answer: "The **bench test** is a timed, hands-on exam on a typodont. **Formats vary by school.** Some hold none. **USC** tests fixed prosthodontics and operative dentistry. **UMKC** runs a multi-day visit with instrument check-out, lectures, practice time, a bench exam and an interview.\n\nCommon procedures: **Class II amalgam and composite preps and restorations**, **crown preps** (all-ceramic, PFM, full metal), and sometimes wax-ups or a rubber dam.\n\n**Bench Test Prep** includes training on your school's exact list, weekly prep assignments with fast photo and video critique, ergonomics, and timed mock exams against school-style criteria. In-person typodont sessions are available in Houston/Katy. Start **before** your invitation arrives.",
    },
    {
      id: "class2", label: "Class II preparation tips",
      keywords: ["class ii", "class 2", "class two", "amalgam prep", "proximal box", "cavity prep", "cavity preparation", "class iii", "class 3", "composite prep", "restoration"],
      examples: ["Tips for a Class II prep?", "What do examiners look for in a cavity prep?"],
      answer: "Examiners usually grade a **Class II preparation** on:\n- **Outline form**: conservative, smooth curves, marginal ridges and cusps preserved\n- **Depth**: a consistent pulpal floor, right for the material\n- **Proximal box**: contact broken, a defined gingival floor, the adjacent tooth untouched\n- **Retention and resistance form** appropriate to amalgam or composite\n- **Finish**: smooth walls, no unsupported enamel\n- **Damage control**: protect the neighbouring tooth with a matrix band or wedge, because a nick can cost more than an imperfect outline\n\nWe film and critique preps against school-style grading sheets.",
    },
    {
      id: "crown", label: "Crown preparation tips",
      keywords: ["crown prep", "crown preparation", "crown", "pfm", "full gold", "all ceramic", "zirconia", "reduction", "margin", "chamfer", "shoulder", "taper", "fixed prosthodontics"],
      examples: ["How should I prepare for a crown prep?", "What margin should I use?"],
      answer: "Common grading points for a **crown preparation**:\n- **Occlusal and axial reduction** that is uniform and right for the material (metal, PFM or ceramic)\n- **Taper**: retentive, not over-tapered\n- **Margins**: chamfer or shoulder as the material requires, continuous and smooth, at the specified level\n- **Path of insertion**: no undercuts\n- **Adjacent teeth left undamaged**\n\nUse depth-guide grooves, check from every angle with your mirror, and set time checkpoints. As a prosthodontist, this is my home ground.",
    },
    {
      id: "inbde", label: "INBDE",
      keywords: ["inbde", "nbde", "boards", "board exam", "national board", "part 1", "part 2", "integrated national", "jcnde", "prometric"],
      examples: ["Do I need the INBDE?", "How hard is the INBDE?", "What is the INBDE format?"],
      answer: "The **INBDE** replaced NBDE Parts I and II (Part II ended July 31, 2022).\n- **500 items over 2 days** (Day 1 about 8¼ hours, Day 2 about 4¼ hours), at the same Prometric center within 7 days\n- **Pass/fail** (a scale score of 75 passes). Failing candidates receive diagnostics.\n- **Fees:** $890 plus a $435 processing fee for non-CODA candidates\n- **Retakes:** wait at least 60 days, at most 4 attempts in 12 months\n- **Order of steps:** DENTPIN, then ECE verification, then JCNDE eligibility, then schedule\n\nMost programs want a **passed** result before you apply. Check the current JCNDE Candidate Guide for details." + guide("exams", "ECE, INBDE & TOEFL"),
    },
    {
      id: "toefl", label: "TOEFL / English",
      keywords: ["toefl", "ielts", "english", "language test", "english proficiency", "toefl score", "duolingo", "oet"],
      examples: ["What TOEFL score do I need?", "Do schools accept IELTS?"],
      answer: "**TOEFL iBT** is required almost everywhere, and waivers are rare.\n- **New scoring since January 21, 2026:** a 1–6 band scale, with a comparable 0–120 score shown for about 2 years\n- **Published minimums vary:** UF 80, UMKC 90, CU Anschutz 94, UCLA 95, NYU/UW/Columbia/Howard 100 (old scale), or about 4.0–5.0 on the new scale. Competitive applicants aim for 100+.\n- **IELTS is often not accepted** (NYU, Penn, UB), and some schools reject MyBest or Home Edition scores\n- Scores are usually valid for 2 years\n\nCheck each school's page for overall and section minimums.",
    },
    {
      id: "ece", label: "Credential evaluation",
      keywords: ["ece", "wes", "credential evaluation", "evaluation", "transcript", "course by course", "degree evaluation", "dentpin", "translation"],
      examples: ["Which credential evaluation do I need?", "What is ECE?", "ECE or WES?"],
      answer: "Get an **ECE Course-by-Course** report ($199):\n- The **JCNDE accepts only ECE** for INBDE eligibility. The cheaper General Report ($110) covers the exam only.\n- CAAPID accepts ECE or WES, but many schools take **ECE only** (for example Penn, BU, Columbia)\n- The name on your ECE report must **exactly match your DENTPIN**\n- Request transcripts early, since schools abroad can take months. Translations must be certified and literal, and you can't do them yourself." + guide("exams", "ECE, INBDE & TOEFL"),
    },
    {
      id: "programs", label: "Advanced standing programs",
      keywords: ["advanced standing", "programs", "which schools", "dental schools", "dds program", "dmd program", "how long", "duration", "international dentist program", "idp", "itdp", "aspid", "how many schools", "class size", "michigan", "howard", "umkc", "usc", "ucla", "nyu", "penn"],
      examples: ["How long are advanced standing programs?", "Which schools accept international dentists?", "How many programs are there?"],
      answer: "About **47 U.S. dental schools** offer advanced standing programs (see the ADEA CAAPID Program Finder). You earn a U.S. **DDS/DMD**, usually in **2–3 years**. Examples:\n- **Howard**: 24 months, up to 10 students, deadline July 31, TOEFL 100\n- **Michigan ITDP**: 28 months, about 20 students, January start\n- **UMKC**: 29 months, up to 9 students, U.S. citizens or permanent residents only\n- **USC**: about 2 years, class of 34, practical exam in fixed prosthodontics and operative dentistry\n- **UCLA**: 25 months · **NYU**: 28 months · **Columbia**: 30 months\n\nRequirements change every cycle, so confirm on each school's site. I can help you build a list that fits your profile.",
    },
    {
      id: "eligibility", label: "Citizenship / eligibility",
      keywords: ["citizen", "citizenship", "green card", "permanent resident", "international student", "eligible", "eligibility", "visa holder", "h4", "dependent visa"],
      examples: ["Can I apply without a green card?", "Do I need to be a US citizen?"],
      answer: "Many programs accept international applicants, typically on an **F-1 student visa**. But some only accept **U.S. citizens or permanent residents**: for example **UMKC** and both of the **University of Florida**'s international tracks. Check each program's eligibility before paying application fees. For visa questions, talk to the school's international office or an immigration attorney.",
    },
    {
      id: "chances", label: "Improving your chances",
      keywords: ["chances", "competitive", "stand out", "strong applicant", "improve my profile", "low score", "rejected", "reapply", "reapplying", "acceptance rate", "get admission", "get admitted", "get in", "us experience", "shadowing", "volunteer"],
      examples: ["How can I improve my chances?", "I was rejected last year. What now?"],
      answer: "What strengthens an application:\n- A **passed INBDE** and **TOEFL scores comfortably above** each school's minimum\n- **U.S. exposure**: shadowing, volunteering, dental assisting, research, or a U.S. master's degree\n- **Strong letters**, ideally including a U.S. dentist\n- A **specific, honest personal statement** and a realistic school list\n- **Bench test readiness**, where many strong applicants lose out\n- **Interview polish**: clear, confident and patient-centred\n\nIf you're reapplying, start by working out what really held you back. No one can guarantee admission, but focused preparation makes a real difference.",
    },
    {
      id: "costs", label: "Costs of the pathway",
      keywords: ["tuition", "cost of program", "how expensive", "program cost", "total cost", "loans", "loan", "financing", "scholarship", "afford", "money", "advanced standing program cost", "much program cost", "whole pathway cost", "pathway cost", "cost to become"],
      examples: ["How much does an advanced standing program cost?", "How much does the whole pathway cost?", "Can I get a loan?"],
      answer: "Typical costs (2026, check current figures):\n- ECE Course-by-Course: **$199** · INBDE: **$890 + $435**\n- CAAPID: **$264 + $115** per extra school, plus school fees (about $75–$200)\n- Some schools charge selection or workshop fees (UMKC $2,500, UF Hialeah $1,200)\n- **Program tuition and fees:** about **$185k** (Oklahoma) to **$250k+** (UMKC tuition is about $249k). Total cost of attendance can approach **$400k** (Pacific, 2 years).\n- ADEX licensure exam: **$2,995 + facility fee**\n\n**Loans:** federal loans are generally for citizens and permanent residents only. Private loans usually need a U.S. co-signer." + guide("costs", "Costs"),
    },
    {
      id: "salary", label: "Dentist salary",
      keywords: ["salary", "earn", "income", "how much do dentists make", "pay", "worth it", "return on investment", "roi"],
      examples: ["How much do dentists earn in the US?", "Is it worth it?"],
      answer: "According to the U.S. Bureau of Labor Statistics (May 2022 data), the **median general dentist** earned about **$163,000** a year, and the top 10% earned over $237,000. Specialists such as oral surgeons and orthodontists typically earn more. Pay varies a lot by state and practice type. It's a major investment of time and money, so plan carefully, but the long-term outlook is strong.",
    },
    {
      id: "licensure", label: "Licensure after graduation",
      keywords: ["licensure", "license", "licence", "adex", "dlosce", "wreb", "cdca", "clinical exam", "jurisprudence", "after graduation", "state license"],
      examples: ["How do I get licensed after graduating?", "What is the ADEX exam?"],
      answer: "After your U.S. DDS/DMD:\n- **ADEX dental exam**: manikin-based periodontal, endodontic, prosthodontic and restorative parts, plus the **DLOSCE** (part of ADEX since June 2026). Accepted in 48 states. Fee $2,995 plus a facility fee.\n- Some states (for example **New York** and **California**) accept a **PGY-1 residency** in place of a clinical exam\n- A **state jurisprudence exam**, BLS/CPR, a background check and fingerprints\n- **Licensure by credentials** in many states once you've practised for a while\n\nSee the ADA's licensure-by-state map for each state's rules." + guide("licensure", "Licensure"),
    },
    {
      id: "alt-careers", label: "Bridge roles while preparing",
      keywords: ["while waiting", "meanwhile", "dental assistant", "assistant", "hygienist", "hygiene", "job while", "work while", "research job", "mph", "masters", "bridge"],
      examples: ["What can I do while I prepare?", "Can I work as a dental hygienist?"],
      answer: "Good bridge options while you prepare:\n- **Dental hygiene**: some states now let foreign-trained dentists qualify for hygiene licensure, including **Indiana and Virginia** (from July 2026)\n- **Dental assisting** (state rules vary): great U.S. exposure and a source of letters\n- **Research or lab roles**, or a U.S. **MPH/MS**\n- **Volunteering or shadowing** in U.S. offices\n\nAll of these strengthen your application and help you adjust to U.S. patient care.",
    },
    {
      id: "specialty", label: "Specialty / residency programs",
      keywords: ["specialty", "specialist", "orthodontics", "ortho", "endodontics", "periodontics", "prosthodontics", "oral surgery", "residency", "postdoctoral", "adat", "pass application"],
      examples: ["Can I do a specialty program in the US?", "What is the ADAT?"],
      answer: "International dentists can apply to many **specialty, GPR and AEGD** programs, usually through **ADEA PASS** or directly. Many require the **ADAT** (200 items, 4.5 hours; applications from March 1 to August 31). Some, like Rochester's Eastman Institute, charge tuition and pay no stipend.\n\nImportant: in most states a specialty certificate **alone doesn't give you a general license**. Texas is the main exception, with 2 years in a CODA specialty program. Many people complete a DDS/DMD first and specialize afterwards.",
    },
    {
      id: "visa", label: "Visa / immigration",
      keywords: ["visa", "immigration", "f1", "f-1", "h1b", "h-1b", "work permit", "opt", "stem opt", "status", "sponsorship"],
      examples: ["Do I need a visa?", "Can I work after graduating?"],
      answer: "General information only:\n- **F-1** student visa for DDS/DMD programs (the school issues the I-20)\n- **OPT**: 12 months after graduation, and you still need a state license to practise\n- Dentistry is **not** on the DHS STEM list, so the 24-month STEM OPT extension generally doesn't apply\n- **H-1B** is subject to the lottery unless the employer is cap-exempt\n\nImmigration rules change, so please talk to the school's international office or a qualified immigration attorney. I can't give immigration advice.",
    },
    {
      id: "timeline", label: "Timeline",
      keywords: ["timeline", "how long will it take", "when should i start", "plan", "schedule my prep", "how early", "months", "years to"],
      examples: ["When should I start preparing?", "What's a realistic timeline?"],
      answer: "A realistic plan:\n- **Months 0–6**: DENTPIN, ECE, TOEFL, start INBDE study\n- **Months 6–12**: pass the INBDE, gather letters, get U.S. experience, start bench practice\n- **March of the application year**: CAAPID opens. Submit by April or May.\n- **Summer to fall**: bench tests and interviews, sometimes with only a few weeks' notice\n- **Next year**: start your 2–3 year program\n- **Final year**: ADEX and jurisprudence exams\n\nUsually **3.5 to 5+ years** to a license. Try the **Pathway Planner** for a personal checklist." + guide("planner", "Pathway Planner"),
    },
    {
      id: "mistakes", label: "Common mistakes",
      keywords: ["mistakes", "avoid", "common errors", "pitfalls", "what not to do", "tips"],
      examples: ["What mistakes should I avoid?", "Any tips?"],
      answer: "The most common (and costly) mistakes:\n- Getting a **WES evaluation** when your schools and the INBDE need ECE, or a name that doesn't match your DENTPIN\n- **Applying before passing the INBDE**\n- **Assuming IELTS is accepted**, or letting TOEFL scores expire\n- **Submitting CAAPID late**\n- **Weak letters**: the wrong evaluator type, or not on letterhead\n- **Waiting for an invitation** before practising the bench test and interview\n- Trusting **outdated \"no extra training\" blogs**\n- **Underestimating cost** and visa limits" + guide("mistakes", "Common mistakes"),
    },
    {
      id: "services", label: "Services offered",
      keywords: ["services", "what do you offer", "programs offered", "packages", "package", "training", "coaching", "mentorship", "mentoring", "help me with", "courses", "course"],
      examples: ["What services do you offer?", "What does mentorship include?"],
      answer: "**What I offer (all 1-on-1):**\n- **Interview Mastery**: strategy, school-specific answers, recorded mock interviews\n- **Bench + Interview Intensive**: weekly prep assignments with fast reviews, technique sessions, timed mock bench exams and mock interviews\n- **Complete Pathway Mentorship**: everything above plus school selection, CAAPID review and personal statement feedback\n- **Application Strategy** sessions on their own\n\nOnline worldwide, or in person in **Houston / Katy, Texas**. Want to book a free consultation?",
    },
    {
      id: "pricing", label: "Pricing",
      keywords: ["price", "pricing", "fee for coaching", "your fees", "how much do you charge", "charge", "payment", "affordable", "discount", "rates", "coaching cost", "mentorship cost", "much coaching", "cost of coaching", "cost of mentorship"],
      examples: ["How much does your coaching cost?", "What are your rates?"],
      answer: `Fees depend on the program (interview, bench test, or full mentorship) and the number of sessions. I'll recommend a plan after a short **free consultation**. ${contact}.`,
    },
    {
      id: "format", label: "Online or in person",
      keywords: ["online", "in person", "in-person", "zoom", "virtual", "location", "where are you", "houston", "katy", "texas", "schedule", "time zone", "weekend", "flexible"],
      examples: ["Are sessions online?", "Can I train in person?", "Where are you located?"],
      answer: "Both. **Online worldwide**: interview and application coaching, plus bench technique reviews with photo and video feedback on your preps. **In person in the Houston / Katy, Texas area**: hands-on typodont sessions. We schedule around your time zone.",
    },
    {
      id: "book", label: "Booking / contact",
      keywords: ["book", "booking", "contact", "consultation", "consult", "appointment", "email", "reach you", "sign up", "enroll", "register", "join", "spots", "talk to you"],
      examples: ["How do I book a consultation?", "How can I contact you?"],
      answer: `I'd be glad to talk with you. ${contact}. Include your graduation year, INBDE and TOEFL status, and target schools. If you've used the **Pathway Planner**, your results fill into the form automatically. Spots are limited because every session is 1-on-1.`,
    },
    {
      id: "planner", label: "Pathway Planner",
      keywords: ["planner", "checklist", "action plan", "my plan", "personal plan", "what should i do next", "next step", "next steps"],
      examples: ["What should I do next?", "Can you make me a plan?"],
      answer: "Try the **Pathway Planner**: answer 5 quick questions (degree, ECE, INBDE, TOEFL, application stage) and get a printable checklist of what to do now, in the next 3–6 months, and later. It's at traindentist.com/pathway.html#planner. Bring it to your free consultation and we'll refine it together.",
    },
    {
      id: "greeting", label: "Hello",
      keywords: ["hello", "hi", "hey", "good morning", "good evening", "namaste", "thanks", "thank you"],
      match: (q) => /^\s*(hi|hello|hey|thanks|thank you|good (morning|afternoon|evening)|namaste)\b[\s!.]*$/i.test(q),
      examples: [],
      answer: "Hello, and welcome! I'm happy to help. Tell me where you are in the process (exams, applying, or invited to interview) and I'll point you to the right next step.",
    },
  ];

  const STOP = new Set(["a", "an", "the", "of", "to", "in", "on", "for", "and", "or", "is", "are", "was", "be", "do", "does", "did", "i", "my", "me", "you", "your", "it", "this", "that", "have", "has", "with", "at", "by", "from", "as", "any", "some", "what", "which", "how", "when", "where", "can", "could", "would", "should", "please", "tell", "give", "about", "if", "so", "will", "am", "need", "want", "get", "we", "us"]);
  const SYN = { usa: "us", america: "us", "u.s.": "us", interviews: "interview", tests: "test", preps: "prep", preparation: "prep", prepare: "prep", preparing: "prep", schools: "school", programs: "program", fees: "fee", costs: "cost", crowns: "crown", sessions: "session", licence: "license", licensed: "license", licensing: "license", practise: "practice", salaries: "salary" };

  function tokens(text) {
    return String(text || "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9.\-\s]/g, " ").split(/\s+/).filter(Boolean)
      .map((w) => w.replace(/\.$/, "")).map((w) => SYN[w] || (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w))
      .filter((w) => w && !STOP.has(w));
  }
  const hasPhrase = (toks, phrase) => { const p = tokens(phrase); if (!p.length) return false; for (let i = 0; i + p.length <= toks.length; i++) { let ok = true; for (let j = 0; j < p.length; j++) if (toks[i + j] !== p[j]) { ok = false; break; } if (ok) return true; } return false; };
  const jaccard = (a, b) => { const A = new Set(a), B = new Set(b); if (!A.size || !B.size) return 0; let n = 0; for (const x of A) if (B.has(x)) n++; return n / (A.size + B.size - n); };

  function scoreFact(question, fact) {
    const toks = tokens(question); let score = 0; const hits = [];
    for (const k of fact.keywords || []) { const p = tokens(k); if (p.length && hasPhrase(toks, k)) { score += p.length > 1 ? 3 : 2; hits.push(k); } }
    let best = 0; for (const ex of fact.examples || []) { const et = tokens(ex); best = Math.max(best, jaccard(toks, et) * Math.min(1, et.length / 2)); }
    score += best * 3;
    if (typeof fact.match === "function" && fact.match(question)) { score += 5; hits.push("pattern"); }
    return { score: Math.round(score * 100) / 100, hits };
  }

  /** Best entry, and whether it's clear enough to answer without the model (clear score, clear margin, a real phrase hit). */
  function route(question, { threshold = 3, margin = 1.25 } = {}) {
    const scored = FACTS.map((fact) => ({ fact, ...scoreFact(question, fact) })).filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
    const best = scored[0] || null, next = scored[1] || null;
    const confident = !!best && best.score >= threshold && best.hits.length > 0 && (!next || best.score - next.score >= margin);
    return { fact: best?.fact || null, score: best?.score || 0, confident, candidates: scored.slice(0, 3) };
  }

  window.DrMathewKB = { FACTS, route, tokens, scoreFact };
})();
