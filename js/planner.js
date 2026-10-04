/* Pathway Planner: five answers in, a personal checklist out (printable, and copied into the consultation form). */
(function () {
  const form = document.getElementById("planner-form"), out = document.getElementById("plan");
  if (!form) return;

  function plan(a) {
    const now = [], next = [], later = [];
    if (a.ece === "none") now.push(["Create your DENTPIN and order an ECE Course-by-Course evaluation ($199)", "Make sure the name matches your DENTPIN exactly. Start requesting transcripts now, because schools abroad can take months."]);
    if (a.ece === "general") now.push(["Upgrade to the ECE Course-by-Course report", "The General Report covers only the INBDE. Most advanced standing programs require Course-by-Course."]);
    if (a.inbde === "none") (a.ece === "cbc" ? now : next).push(["Register for and start studying for the INBDE", "Most programs want a passing result before you apply. Budget $890 + $435 international fee and 4–6 months of study."]);
    if (a.inbde === "studying") now.push(["Pass the INBDE before your CAAPID submission", "If you fail, you must wait 60 days to retake. Leave yourself a buffer before the June deadlines."]);
    if (a.toefl === "none") now.push(["Book the TOEFL iBT", "Typical targets are 94–100 (old scale) or about 5.0 on the new 1–6 band scale. Check whether your schools accept IELTS, since many don't."]);
    if (a.toefl === "low") now.push(["Retake the TOEFL with a targeted plan", "Focus on your weakest section. Some schools set minimum section scores as well as an overall score."]);

    if (a.stage === "planning") {
      next.push(["Build U.S. exposure", "Shadow or volunteer in a U.S. dental office. It strengthens your profile and can lead to a U.S. letter of recommendation."]);
      next.push(["Shortlist 8–15 programs", "Compare requirements, deadlines (June to October), bench test formats and cost using the ADEA CAAPID Program Finder."]);
      next.push(["Line up 3 strong evaluators", "Often a dean, a faculty member and a clinical employer or U.S. dentist. Letters should be on letterhead."]);
      later.push(["Start bench test practice early", "Hand skills take months to sharpen, and invitations can arrive with only a few weeks' notice."]);
      later.push(["Draft your personal statement", "Explain why U.S. dentistry, what shaped you and what you'll contribute. Specific beats generic."]);
    }
    if (a.stage === "applying") {
      now.push(["Submit CAAPID early (it opens in early March)", "Verification takes weeks. Aim for April or May, and complete each school's supplemental application."]);
      now.push(["Finalize your personal statement and evaluations", "Get expert feedback before you submit. You can't change it afterwards."]);
      next.push(["Start bench test and interview prep now", "Don't wait for an invitation. Practise Class II preps and restorations and crown preps, and rehearse interview answers."]);
    }
    if (a.stage === "invited") {
      now.push(["Get the exact procedure list for each bench test", "Practise those procedures under timed conditions, with critique against school-style grading criteria."]);
      now.push(["Do at least 2 mock interviews with feedback", "Prepare school-specific \"Why us?\" answers, ethical scenarios and patient-communication examples."]);
      now.push(["Plan your logistics", "Instruments, typodont, travel and timing. Arrive rested."]);
    }
    if (a.stage === "reapply") {
      now.push(["Diagnose last cycle honestly", "Was it scores, the school list, letters, the personal statement, the bench test or the interview? Fix the real weak point."]);
      now.push(["Strengthen your profile before March", "Add U.S. experience, retake the TOEFL if needed, refresh your letters and rewrite your personal statement."]);
      next.push(["Begin bench and interview training months ahead", "This is where reapplicants most often turn a rejection into an offer."]);
    }
    if (a.degree === "abroad-spec") later.push(["Consider your state options", "With specialty training, also look at specialty residencies and state routes (e.g. Texas requires 2 years in a CODA specialty program). Confirm with each state board."]);
    later.push(["Plan your finances and visa", "Program tuition is often $185k–$250k+. Talk to the school's international office about F-1 and OPT."]);
    return { now, next, later };
  }

  const LABEL = { now: "Do now", next: "Next 3–6 months", later: "Plan ahead" };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const a = Object.fromEntries(new FormData(form)), p = plan(a);
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    let html = `<div class="plan-head"><h3>Your action plan</h3><div><button class="btn btn-ghost btn-sm" id="plan-print">Print / save PDF</button> <a class="btn btn-sm" href="index.html#contact" id="plan-book">Review it with Dr. Mathew</a></div></div>`;
    for (const k of ["now", "next", "later"]) if (p[k].length) html += `<h4 class="plan-${k}">${LABEL[k]}</h4><ol>` + p[k].map(([t, d]) => `<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join("") + "</ol>";
    out.innerHTML = html; out.hidden = false; out.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("plan-print").onclick = () => print();
    const summary = Object.values(p).flat().map(([t]) => "- " + t).join("\n");
    try { sessionStorage.setItem("td_plan", `My planner results:\nECE: ${a.ece}, INBDE: ${a.inbde}, TOEFL: ${a.toefl}, Stage: ${a.stage}\n${summary}`); } catch { /* private mode */ }
  });
})();
