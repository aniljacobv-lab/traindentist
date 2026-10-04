/**
 * Dr. Mathew — the site's guide, modelled on Roxi (p360intel/src/RoxiWidget.jsx), in plain JS for GitHub Pages.
 *
 * - Floating "Ask Dr. Mathew" button that waves once per session, can be dragged anywhere or hidden to a small
 *   edge tab, and remembers both.
 * - 1. A question that clearly matches the built-in guide (drmathew-knowledge.js) is answered from it directly.
 *   2. Otherwise the AI worker (TD_CONFIG.chatApi) answers with the last few turns as history.
 *   3. No worker configured or it fails: the closest guide answer, or a nudge to book a consultation.
 * - If the visitor goes quiet, Dr. Mathew offers the next curated tip (client-side, free).
 * Any page element can open the chat with a question: <button data-ask="What is the bench test?">.
 */
(function () {
  const CFG = window.TD_CONFIG || {};
  const KB = window.DrMathewKB;
  const AVATAR = "assets/dr-mathew.jpg";
  const POS_KEY = "td_drm_pos", HIDE_KEY = "td_drm_hidden", WAVE_KEY = "td_drm_waved";

  const GREETING = "Hello, I'm **Dr. Liji Mathew**. I trained as a dentist and prosthodontist in India, then earned my DMD at Temple University. Now I help internationally trained dentists get into U.S. dental schools.\n\nWhere are you in the process? Preparing for exams, applying through CAAPID, or already invited to a bench test or interview?";
  const STARTERS = ["What are the steps to practice in the US?", "Do I need a US dental degree?", "What is the bench test?", "How much does the whole pathway cost?", "What should I do next?"];
  const NUDGES = [
    "A tip while you look around: the most common mistake I see is waiting for an interview invitation before starting bench test practice. Invitations can come with only a few weeks' notice. Have you started hands-on practice yet?",
    "Something many applicants underestimate is the \"Why our school?\" question. Interviewers can tell a generic answer from one built on their own program. Which schools are on your list?",
    "On the bench test, examiners grade the adjacent tooth as carefully as your prep. A nicked neighbour can cost more points than an imperfect outline. Want my checklist for a clean Class II?",
    "Every session I offer is 1-on-1, online worldwide or in person in Houston/Katy. Tell me your graduation year and INBDE/TOEFL status and I'll suggest where to focus first. Or try the Pathway Planner for a printable checklist.",
  ];

  const $ = (tag, attrs = {}, kids = []) => { const el = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === "class") el.className = v; else if (k === "text") el.textContent = v; else if (k.startsWith("on")) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v); } for (const c of [].concat(kids)) if (c) el.append(c); return el; };
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function md(t) {
    const out = []; let list = null;
    for (const L of esc(String(t)).split(/\n/)) {
      let m = L.match(/^\s*#{1,4}\s+(.*)$/);
      if (m) { if (list) { out.push(`</${list}>`); list = null; } out.push(`<div class="drm-h">${m[1]}</div>`); continue; }
      m = L.match(/^\s*[*-]\s+(.*)$/); const n = L.match(/^\s*\d+\.\s+(.*)$/);
      if (m || n) { const want = m ? "ul" : "ol"; if (list !== want) { if (list) out.push(`</${list}>`); out.push(`<${want}>`); list = want; } out.push(`<li>${(m || n)[1]}</li>`); continue; }
      if (list) { out.push(`</${list}>`); list = null; }
      if (L.trim()) out.push(`<p>${L}</p>`);
    }
    if (list) out.push(`</${list}>`);
    return out.join("").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/\[([^\]]+)\]\((https:\/\/[^\s)"'<]+)\)/g, '<a href="$2" target="_blank" rel="noopener nofollow">$1</a>')   // [label](url)
      .replace(/(?<!["'>])(https:\/\/[^\s<"']+[^\s<"'.,;:)])/g, '<a href="$1" target="_blank" rel="noopener nofollow">$1</a>');   // bare urls; text was escaped above
  }
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* private mode */ } } };
  const readPos = () => { try { const v = JSON.parse(store.get(POS_KEY) || "null"); return v && Number.isFinite(v.x) && Number.isFinite(v.y) ? v : null; } catch { return null; } };
  const clampPos = (p, w, h) => ({ x: Math.min(Math.max(8, p.x), Math.max(8, innerWidth - w - 8)), y: Math.min(Math.max(8, p.y), Math.max(8, innerHeight - h - 8)) });

  const state = { open: false, hidden: store.get(HIDE_KEY) === "1", pos: readPos(), busy: false, history: [], nudge: 0, idle: null, greeted: false };
  const root = $("div", { class: "drm-root", "aria-live": "polite" });
  document.body.append(root);

  /* ── views ── */
  const img = (cls) => { const i = $("img", { src: AVATAR, alt: "", class: cls, draggable: "false" }); i.addEventListener("error", () => { i.replaceWith($("span", { class: cls + " drm-initials", text: "LM" })); }); return i; };

  const fab = $("div", { class: "drm-fab", role: "button", tabindex: "0", title: "Ask Dr. Mathew · drag to move", "aria-label": "Open chat with Dr. Mathew" }, [
    img("drm-avatar"), $("span", { class: "drm-fab-text" }, [$("b", { text: "Ask Dr. Mathew" }), $("small", { text: "Admissions guide" })]),
    $("button", { class: "drm-fab-x", title: "Hide (a small tab on the right edge brings Dr. Mathew back)", "aria-label": "Hide chat button", onpointerdown: (e) => e.stopPropagation(), onclick: (e) => { e.stopPropagation(); setHidden(true); } }, "✕"),
  ]);
  const tab = $("button", { class: "drm-tab", title: "Bring Dr. Mathew back", onclick: () => setHidden(false) }, [img("drm-tab-img"), $("span", { text: "Dr. Mathew" })]);

  const log = $("div", { class: "drm-log" });
  const input = $("input", { class: "drm-input", placeholder: "Ask about interviews, bench tests, CAAPID…", "aria-label": "Your question", maxlength: "600" });
  const send = $("button", { class: "drm-send", text: "Ask" });
  const homeBtn = $("button", { class: "drm-icon", title: "Snap back to the corner", text: "⌂", onclick: resetPos });
  const head = $("div", { class: "drm-head", title: "Drag to move" }, [
    img("drm-head-img"),
    $("div", {}, [$("div", { class: "drm-name", text: "Dr. Liji Mathew, DMD" }), $("div", { class: "drm-sub", text: "YOUR U.S. DENTAL ADMISSIONS GUIDE" })]),
    $("div", { class: "drm-head-btns" }, [
      homeBtn,
      $("button", { class: "drm-icon", title: "Minimize", text: "—", onclick: () => setOpen(false) }),
      $("button", { class: "drm-icon", title: "Hide", text: "✕", onclick: () => { setOpen(false); setHidden(true); } }),
    ]),
  ]);
  const panel = $("div", { class: "drm-panel", role: "dialog", "aria-label": "Chat with Dr. Mathew" }, [
    head, log,
    $("div", { class: "drm-bar" }, [input, send]),
    $("div", { class: "drm-foot", text: "General guidance only, not a guarantee of admission. Requirements vary by school." }),
  ]);

  function render() {
    root.replaceChildren();
    if (state.hidden) { root.append(tab); return; }
    const el = state.open ? panel : fab;
    root.append(el);
    homeBtn.style.display = state.pos ? "" : "none";
    if (state.pos) { const p = clampPos(state.pos, el.offsetWidth || 300, el.offsetHeight || 60); Object.assign(el.style, { left: p.x + "px", top: p.y + "px", right: "auto", bottom: "auto" }); }
    else Object.assign(el.style, { left: "", top: "", right: "", bottom: "" });
    if (state.open) setTimeout(() => input.focus(), 30);
  }
  function setHidden(v) { state.hidden = v; store.set(HIDE_KEY, v ? "1" : null); render(); }
  function setOpen(v) { state.open = v; if (!v) clearTimeout(state.idle); if (v && !state.greeted) greet(); render(); }
  function resetPos() { state.pos = null; store.set(POS_KEY, null); render(); }

  /* ── dragging (pointer events: mouse, touch, pen) ── */
  function draggable(handle, box, onClick) {
    let d = null;
    handle.addEventListener("pointerdown", (e) => { if (e.button !== 0 || e.target.closest("button,input,a")) return; const r = box.getBoundingClientRect(); d = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, w: r.width, h: r.height, moved: false }; try { handle.setPointerCapture(e.pointerId); } catch { /* */ } });
    handle.addEventListener("pointermove", (e) => { if (!d) return; const dx = e.clientX - d.sx, dy = e.clientY - d.sy; if (!d.moved && Math.abs(dx) + Math.abs(dy) < 5) return; d.moved = true; state.pos = clampPos({ x: d.ox + dx, y: d.oy + dy }, d.w, d.h); Object.assign(box.style, { left: state.pos.x + "px", top: state.pos.y + "px", right: "auto", bottom: "auto" }); });
    handle.addEventListener("pointerup", () => { if (!d) return; const moved = d.moved; d = null; if (moved) { store.set(POS_KEY, JSON.stringify(state.pos)); homeBtn.style.display = ""; } else if (onClick) onClick(); });
    handle.addEventListener("pointercancel", () => { d = null; });
  }
  draggable(fab, fab, () => setOpen(true));
  draggable(head, panel, null);
  fab.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } });
  addEventListener("resize", () => { if (state.pos) render(); });

  /* ── messages ── */
  function addMsg(role, text, extra = {}) {
    if (!extra.keepChips) log.querySelectorAll(".drm-chips").forEach((c) => c.remove());   // only the latest suggestions stay clickable
    const wrap = $("div", { class: "drm-row drm-" + role });
    const bubble = $("div", { class: "drm-bubble" });
    bubble.innerHTML = role === "user" ? esc(text) : md(text);
    wrap.append(bubble);
    if (extra.examples?.length) {
      const chips = $("div", { class: "drm-chips" });
      for (const ex of extra.examples.slice(0, 5)) chips.append($("button", { class: "drm-chip", text: ex, onclick: () => ask(ex) }));
      bubble.append(chips);
    }
    if (extra.badge) wrap.append($("span", { class: "drm-badge", text: extra.badge }));
    log.append(wrap); log.scrollTop = log.scrollHeight;
    return wrap;
  }
  function greet() { state.greeted = true; state.history.push({ role: "assistant", text: GREETING }); addMsg("bot", GREETING, { examples: STARTERS }); armIdle(); }

  function armIdle() {
    clearTimeout(state.idle);
    if (state.nudge >= NUDGES.length) return;
    state.idle = setTimeout(() => { if (!state.open || state.busy) return; const t = NUDGES[state.nudge++]; state.history.push({ role: "assistant", text: t }); addMsg("bot", t); armIdle(); }, 45000);
  }

  async function callModel(question) {
    const r = await fetch(CFG.chatApi, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, history: state.history.slice(-8), page: location.pathname }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.text) throw new Error(d.error || "HTTP " + r.status);
    const src = (d.sources || []).filter((s) => /^https:\/\//.test(s.url)).map((s) => `- [${String(s.title || "source").replace(/[\[\]]/g, "")}](${s.url})`).join("\n");
    return src ? `${d.text}\n\n**Sources:**\n${src}` : d.text;
  }
  /* with the AI connected, the built-in guide answers only the simple practical questions; everything else gets a
     context-aware answer from the model (which remembers what the visitor said earlier) */
  const GUIDE_ONLY = new Set(["greeting", "book", "pricing", "format", "services", "planner"]);

  async function ask(given) {
    const text = String(typeof given === "string" ? given : input.value).trim();
    if (!text || state.busy) return;
    if (!state.open) setOpen(true);
    clearTimeout(state.idle);
    input.value = ""; state.busy = true; send.disabled = true;
    addMsg("user", text);
    const pending = addMsg("bot", "…", { keepChips: true }); pending.classList.add("drm-typing");
    const finish = (answer, badge, examples) => {
      pending.remove();
      state.history.push({ role: "user", text }, { role: "assistant", text: answer });
      addMsg("bot", answer, { badge, examples });
      state.busy = false; send.disabled = false; armIdle();
    };
    const routed = KB.route(text);
    const related = (fact) => routed.candidates.filter((c) => c.fact !== fact).map((c) => c.fact.examples[0]).filter(Boolean).slice(0, 3);
    const guideFirst = routed.confident && (!CFG.chatApi || GUIDE_ONLY.has(routed.fact.id));
    if (guideFirst) { setTimeout(() => finish(routed.fact.answer, "FROM DR. MATHEW'S GUIDE", related(routed.fact)), 350); return; }
    if (CFG.chatApi) {
      pending.querySelector(".drm-bubble").textContent = "Thinking it through…";
      try { finish(await callModel(text), "DR. MATHEW · AI ASSISTANT"); return; } catch (e) { console.warn("Dr. Mathew AI unavailable:", e.message); }
    }
    if (routed.confident) { finish(routed.fact.answer, "FROM DR. MATHEW'S GUIDE", related(routed.fact)); return; }
    if (routed.fact && routed.score >= 2) { finish(routed.fact.answer, "FROM DR. MATHEW'S GUIDE", related(routed.fact)); return; }
    finish(`I don't have a ready answer for that here. If it's about your own application, a short **free consultation** is the best next step, so I can hear your background. Email **${CFG.email}**, or use the **Book a Consultation** form on the home page.\n\nI can already help with these:`, null, STARTERS.slice(0, 4));
  }
  send.addEventListener("click", () => ask());
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") ask(); });

  /* page buttons open Dr. Mathew with a question */
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-ask]"); if (!b) return; e.preventDefault(); if (state.hidden) setHidden(false); setOpen(true); const q = b.getAttribute("data-ask"); if (q) setTimeout(() => ask(q), 120); });

  /* wave once per session instead of popping open over the page */
  let waved = false; try { waved = !!sessionStorage.getItem(WAVE_KEY); } catch { /* */ }
  if (!waved) setTimeout(() => { try { sessionStorage.setItem(WAVE_KEY, "1"); } catch { /* */ } if (!state.open && !state.hidden) { fab.classList.add("drm-wave"); setTimeout(() => fab.classList.remove("drm-wave"), 4500); } }, 4500);
  render();
})();
