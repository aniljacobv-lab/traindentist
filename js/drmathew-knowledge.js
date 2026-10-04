/**
 * drmathew-knowledge.js — what Dr. Mathew knows without calling a model.
 *
 * Same idea as Roxi's FACTS catalogue: each entry has keywords (phrases people use), example questions and an
 * answer. The router scores a question against every entry and only answers on its own when one entry clearly
 * wins; anything weaker goes to the AI worker (when configured) or gets the closest guide answer plus a nudge to
 * book a consultation. A single keyword never decides a question.
 */
(function () {
  const C = window.TD_CONFIG || {};
  const contact = `Email **${C.email}** or call **${C.phone}**`;

  const FACTS = [
    {
      id: "about", label: "About Dr. Mathew",
      keywords: ["who are you", "dr mathew", "dr liji", "liji mathew", "about you", "your background", "credentials", "qualification", "experience", "dmd", "who is"],
      examples: ["Who is Dr. Mathew?", "What are your credentials?", "Tell me about yourself"],
      answer: "I'm **Dr. Liji Mathew, DMD**: a U.S.-trained, currently practicing dentist. I mentor internationally trained dentists who want to earn a DDS/DMD in the United States through advanced standing (international dentist) programs.\n\nMy coaching focuses on the two steps that most often decide an offer:\n- **The interview**: behavioral and clinical scenarios, U.S. dental ethics, and \"Why the U.S.? Why our school?\"\n- **The bench test**: cavity preps, crown preps, wax carving, and working precisely under time pressure\n\nEvery session is 1-on-1, online or in person.",
    },
    {
      id: "pathway", label: "The U.S. pathway",
      keywords: ["pathway", "process", "steps", "how do i become", "become a dentist", "practice in us", "practice dentistry", "foreign dentist", "international dentist", "roadmap", "where do i start", "get started", "how to start"],
      examples: ["How can a foreign dentist practice in the US?", "What are the steps?", "Where do I start?"],
      answer: "Here's the usual route for an internationally trained dentist who wants to practice in the U.S.:\n\n1. **Credential evaluation**: a course-by-course evaluation of your dental degree (CAAPID uses ECE).\n2. **INBDE**: pass the Integrated National Board Dental Examination.\n3. **English proficiency**: TOEFL iBT (some schools accept IELTS).\n4. **Apply through ADEA CAAPID** to advanced standing programs.\n5. **Bench test and interview**: the schools that shortlist you invite you for both.\n6. **Complete the program**: usually 2 to 3 years, ending in a U.S. DDS or DMD.\n7. **Licensure**: pass a clinical licensure exam and meet your state board's requirements.\n\nRequirements differ from school to school, so always check each program's website. I coach steps 4 and 5 most closely.",
    },
    {
      id: "caapid", label: "CAAPID application",
      keywords: ["caapid", "application", "apply", "adea", "personal statement", "letters of recommendation", "lor", "recommendation letter", "deadline", "cycle"],
      examples: ["How does CAAPID work?", "Can you review my personal statement?", "When should I apply?"],
      answer: "**ADEA CAAPID** is the centralized application for advanced standing programs for international dentists. One application goes to many schools, though most schools also ask for their own supplemental items and fees.\n\nWhat a strong application usually includes:\n- An ECE course-by-course credential evaluation\n- INBDE results, plus TOEFL scores where the school requires them\n- A focused **personal statement** that explains why you want U.S. dentistry and what you'll contribute\n- Letters of recommendation, ideally including U.S. dentists who know your work\n- Clinical experience, shadowing or volunteering in the U.S.\n\nThe application cycle opens once a year and each school sets its own deadline. Applying early helps because many schools invite applicants on a rolling basis. I can review your personal statement and application strategy in a mentoring session.",
    },
    {
      id: "interview", label: "Interview preparation",
      keywords: ["interview", "mock interview", "mmi", "multiple mini", "behavioral", "why this school", "why dentistry", "questions they ask", "ethics", "communication", "cultural"],
      examples: ["How do I prepare for the interview?", "What questions do they ask?", "Do you do mock interviews?"],
      answer: "**Comprehensive Interview Prep** covers:\n- **Behavioral and clinical scenarios**: structured answers that show judgment, not memorized speeches\n- **U.S. dental ethics and healthcare**: patient autonomy, informed consent, the ADA Code, and how U.S. practice differs\n- **Communication and cultural competence**: speaking with patients and faculty the way U.S. schools expect\n- **\"Why the U.S.?\" and \"Why us?\"**: answers that are specific to each school\n- **Mock interviews with detailed feedback**, including the MMI (multiple mini interview) format some schools use\n\nMost candidates need 3 to 6 sessions, depending on how soon the interview is.",
    },
    {
      id: "bench", label: "Bench test preparation",
      keywords: ["bench test", "bench", "psychomotor", "practical exam", "hands on", "typodont", "simulation", "preclinical", "manual dexterity", "lab test"],
      examples: ["What is the bench test?", "How do I prepare for the bench test?", "What procedures are on the bench test?"],
      answer: "The **bench test** is a timed hands-on exam, usually on a typodont (manikin) in a simulation lab. Schools use it to judge your skill, precision and ergonomics.\n\n**Intensive Bench Test Prep** covers:\n- Step-by-step guidance on each school's specific requirements\n- **Cavity preparations**: Class I, II, III and more, for amalgam and composite\n- **Crown preparation**: full-metal, PFM and all-ceramic, with correct reduction and margins\n- **Wax carving and margin tracing**\n- **Instrumentation and ergonomics**: posture, finger rests, mirror use\n- **Precision and time management**: a repeatable plan that keeps you inside the time limit\n\nTell me which schools invited you and I'll help you focus on their exact procedures.",
    },
    {
      id: "class2", label: "Class II preparation tips",
      keywords: ["class ii", "class 2", "class two", "amalgam prep", "proximal box", "cavity prep", "cavity preparation", "class iii", "class 3", "composite prep"],
      examples: ["Tips for a Class II prep?", "What do examiners look for in a cavity prep?"],
      answer: "Examiners usually grade a **Class II preparation** on:\n- **Outline form**: conservative, smooth curves, with marginal ridges and cusps preserved\n- **Depth**: consistent pulpal floor depth, appropriate for the material\n- **Proximal box**: walls that break contact, a defined gingival floor, and the adjacent tooth left untouched\n- **Retention and resistance form**: appropriate to amalgam or composite\n- **Finish**: smooth walls and no unsupported enamel\n- **Damage control**: no nicks on the adjacent tooth (use a matrix band or wedge for protection)\n\nIn practice sessions we film and critique each prep against school-style grading sheets. Every school's criteria differ a little, so we always work from your target school's rubric.",
    },
    {
      id: "crown", label: "Crown preparation tips",
      keywords: ["crown prep", "crown preparation", "crown", "pfm", "full gold", "all ceramic", "reduction", "margin", "chamfer", "shoulder", "taper"],
      examples: ["How should I prepare for a crown prep?", "What margin should I use?"],
      answer: "Common grading points for a **crown preparation**:\n- **Occlusal and axial reduction** that is uniform and suits the material (metal, PFM or ceramic)\n- **Taper**: enough for retention without over-tapering\n- **Margins**: chamfer or shoulder as the material requires, continuous and smooth, at the specified level\n- **Path of insertion**: no undercuts\n- **Adjacent teeth left undamaged**\n\nUse depth-guide grooves, check from every angle with your mirror, and set time checkpoints. We drill this on typodonts until it's consistent.",
    },
    {
      id: "wax", label: "Wax carving",
      keywords: ["wax", "wax carving", "waxing", "wax up", "margin tracing", "tooth morphology", "anatomy"],
      examples: ["Is there wax carving on the bench test?", "How do I improve wax carving?"],
      answer: "Some schools include **wax carving** or **margin tracing**. Graders look for correct tooth morphology (cusps, fossae, contacts, contours), a smooth surface and accurate margins. Practise from a strong mental picture of each tooth's anatomy, build up in layers, and carve with sharp, controlled strokes. We cover wax technique and margin tracing in Bench Test Prep.",
    },
    {
      id: "inbde", label: "INBDE",
      keywords: ["inbde", "nbde", "boards", "board exam", "national board", "part 1", "part 2", "integrated national"],
      examples: ["Do I need the INBDE?", "How should I study for the INBDE?"],
      answer: "The **INBDE** (Integrated National Board Dental Examination) replaced NBDE Parts I and II. Most advanced standing programs require a passing result, and some list it as a prerequisite before you apply.\n\nMy main focus is interview and bench test coaching, but in a mentoring session I'm happy to share study strategy and help you plan your timeline. Check the official JCNDE website for current eligibility and exam details.",
    },
    {
      id: "toefl", label: "TOEFL / English",
      keywords: ["toefl", "ielts", "english", "language test", "english proficiency", "score"],
      examples: ["What TOEFL score do I need?", "Do schools accept IELTS?"],
      answer: "Most programs ask for **TOEFL iBT**, often with a minimum overall score and sometimes minimums for each section. Some accept **IELTS**, and some waive the requirement for graduates of English-medium schools. The thresholds vary widely, so check each school's admissions page. Strong spoken English also matters at the interview, and that's something we practise in Interview Prep.",
    },
    {
      id: "ece", label: "Credential evaluation",
      keywords: ["ece", "wes", "credential evaluation", "evaluation", "transcript", "course by course", "degree evaluation"],
      examples: ["Which credential evaluation do I need?", "What is ECE?"],
      answer: "CAAPID requires a **course-by-course evaluation from ECE** (Educational Credential Evaluators). Order it early, because getting documents from your dental school can take weeks or months. Some schools that don't use CAAPID may accept other evaluators, so check each program.",
    },
    {
      id: "programs", label: "Advanced standing programs",
      keywords: ["advanced standing", "programs", "which schools", "dental schools", "dds", "dmd program", "how long", "duration", "years", "international dentist program", "idp"],
      examples: ["How long are advanced standing programs?", "Which schools accept international dentists?"],
      answer: "**Advanced standing programs** (often called International Dentist Programs) let foreign-trained dentists earn a U.S. **DDS or DMD**, usually in **2 to 3 years**. Students join the later part of the regular program after a preparatory period.\n\nDozens of U.S. dental schools offer these programs, and the seats are highly competitive. Many of them use CAAPID. Each school sets its own requirements and selection process, which usually includes a bench test and an interview. I can help you put together a school list that fits your profile.",
    },
    {
      id: "chances", label: "Improving your chances",
      keywords: ["chances", "competitive", "stand out", "strong applicant", "improve my profile", "low score", "rejected", "reapply", "acceptance rate", "get admission", "get admitted", "get in"],
      examples: ["How can I improve my chances?", "I was rejected last year. What now?"],
      answer: "What makes an applicant stronger:\n- **Strong INBDE and TOEFL results** that comfortably clear each school's minimum\n- **U.S. exposure**: shadowing, volunteering, dental assisting or research\n- **Strong letters of recommendation**, ideally from U.S. dentists\n- A **specific, honest personal statement**\n- **Bench test readiness**: this is where many strong applicants lose out\n- **Interview polish**: clear and confident answers about ethics, patient care and \"Why this school?\"\n\nIf you're reapplying, we start by working out what held you back last time. No one can guarantee admission, but focused preparation makes a real difference.",
    },
    {
      id: "services", label: "Services offered",
      keywords: ["services", "what do you offer", "programs offered", "packages", "training", "coaching", "mentorship", "mentoring", "help me with", "courses"],
      examples: ["What services do you offer?", "What does mentorship include?"],
      answer: "**What I offer:**\n- **Comprehensive Interview Prep**: scenarios, ethics, communication, mock interviews with feedback\n- **Intensive Bench Test Prep**: cavity and crown preps, wax carving, instrumentation, timing\n- **Application strategy**: school selection, CAAPID review, personal statement feedback\n- **Complete Pathway Mentorship**: guidance from planning through interview day\n\nEverything is **1-on-1**, with **flexible online or in-person sessions** and proven strategies. Want to book a free consultation?",
    },
    {
      id: "pricing", label: "Pricing",
      keywords: ["price", "pricing", "cost", "fee", "fees", "how much", "charge", "payment", "affordable", "discount"],
      examples: ["How much does it cost?", "What are your fees?"],
      answer: `Fees depend on what you need (interview prep, bench test prep, or full mentorship) and how many sessions you book. I'll recommend a plan after a short **free consultation**. ${contact}, or use the form on this page.`,
    },
    {
      id: "format", label: "Online or in person",
      keywords: ["online", "in person", "in-person", "zoom", "virtual", "location", "where are you", "schedule", "timing", "time zone", "weekend", "flexible"],
      examples: ["Are sessions online?", "Can I train in person?", "Where are you located?"],
      answer: "Sessions are **flexible: online or in person**. Interview coaching works very well over video. For bench test prep, online sessions cover technique review and feedback on photos or video of your preps, and in-person typodont sessions can be arranged. We schedule around your time zone.",
    },
    {
      id: "book", label: "Booking / contact",
      keywords: ["book", "booking", "contact", "consultation", "consult", "appointment", "call you", "email", "phone", "reach you", "sign up", "enroll", "register", "join", "spots"],
      examples: ["How do I book a consultation?", "How can I contact you?"],
      answer: `I'd be glad to talk with you. ${contact}, or fill in the **Book a Consultation** form at the bottom of this page with your graduation year, INBDE/TOEFL status and target schools. Spots are limited because every session is 1-on-1.`,
    },
    {
      id: "timeline", label: "Timeline",
      keywords: ["timeline", "how long will it take", "when should i start", "plan", "schedule my prep", "how early", "months"],
      examples: ["When should I start preparing?", "What's a realistic timeline?"],
      answer: "A realistic plan counts back from the application cycle:\n- **12 or more months before**: order your ECE evaluation and start INBDE and TOEFL prep\n- **6 to 9 months before**: finish your exams, gain U.S. exposure, line up recommenders, draft your personal statement\n- **When the cycle opens**: submit CAAPID early, plus each school's supplemental items\n- **After submitting**: train for the bench test and interview so you're ready when invitations arrive, sometimes with only a few weeks' notice\n\nStart bench and interview prep **before** you get an invitation. That's the most common mistake I see.",
    },
    {
      id: "visa", label: "Visa / immigration",
      keywords: ["visa", "immigration", "f1", "f-1", "h1b", "green card", "work permit", "opt", "status"],
      examples: ["Do I need a visa?", "Can I work after graduating?"],
      answer: "Visa and immigration questions depend on your personal situation, so please talk to the school's international student office or a qualified immigration attorney. I can't give immigration advice. What I can do is get you ready for the academic and clinical side: application, bench test and interview.",
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
  const SYN = { usa: "us", america: "us", "u.s.": "us", interviews: "interview", tests: "test", preps: "prep", preparation: "prep", prepare: "prep", preparing: "prep", schools: "school", programs: "program", fees: "fee", costs: "cost", crowns: "crown", sessions: "session" };

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
