(async function () {
  const $ = (id) => document.getElementById(id);
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const sourceLink = (url, text) =>
    `<a href="${escape(url)}" target="_blank" rel="noopener">${text} ↗</a>`;
  const names = {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    DC: "Washington, DC",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
    PR: "Puerto Rico",
  };
  const eligibility = {
    "citizen-pr": "U.S. citizen / green card required",
    international: "Other applicants considered",
    conditional: "Conditional · confirm status",
  };
  const status = {
    open: "Within published application dates",
    upcoming: "Next published cycle upcoming",
    closed: "Listed application deadline passed",
    confirm: "Confirm the published timeline",
  };
  let programs;
  try {
    const response = await fetch("data/programs.json?v=20261004-costs2");
    if (!response.ok) throw new Error("Directory unavailable");
    const data = await response.json();
    programs = data.programs;
    if (!Array.isArray(programs) || !programs.length)
      throw new Error("Empty directory");
  } catch {
    $("directory-error").textContent =
      "Interactive search could not load. All school summaries and official links remain available below. Refresh to try again.";
    $("saved-only").disabled = true;
    $("school-sort").disabled = true;
    return;
  }
  // Include full state names in searches, even if the state has no current program.
  programs.forEach((p) => {
    p.name += "";
    p.searchName = names[p.state];
  });
  const byId = new Map(programs.map((p) => [p.id, p]));
  let saved = [],
    visible = 12,
    mapIds = null,
    restoreHash = "";
  try {
    const s = JSON.parse(
      localStorage.getItem("td-school-shortlist-v1") || "[]",
    );
    if (Array.isArray(s))
      saved = [...new Set(s)].filter((id) => byId.has(id)).slice(0, 3);
  } catch {
    /* Optional local persistence. */
  }
  for (const [abbr, name] of Object.entries(names).sort((a, b) =>
    a[1].localeCompare(b[1]),
  )) {
    const count = programs.filter((p) => p.state === abbr).length;
    $("filter-state").add(new Option(`${name} (${count})`, abbr));
  }
  $("directory-controls").disabled = false;
  const criteria = [
    "state",
    "eligibility",
    "duration",
    "cycle",
    "bench",
    "cost",
  ];
  const localDay = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  function filters() {
    const f = { search: $("school-search").value };
    criteria.forEach((k) => (f[k] = $("filter-" + k).value));
    if ($("saved-only").checked) f.saved = saved;
    return f;
  }
  function filtered() {
    const f = filters(),
      today = localDay();
    // The core matcher also receives state names for text matching.
    return programs.filter((p) =>
      TDPrograms.matches({ ...p, name: p.name + " " + p.searchName }, f, today),
    );
  }
  function persist() {
    try {
      localStorage.setItem("td-school-shortlist-v1", JSON.stringify(saved));
    } catch {
      $("shortlist-feedback").textContent =
        "Saved for this visit. Browser storage is unavailable, so this shortlist may not persist.";
    }
  }
  function save(id) {
    const had = saved.includes(id);
    if (!had && saved.length === 3) {
      $("shortlist-feedback").textContent =
        "Your comparison has three schools. Remove one before adding another.";
      $("shortlist-feedback").scrollIntoView({ block: "nearest" });
      return;
    }
    saved = had ? saved.filter((s) => s !== id) : [...saved, id];
    $("shortlist-feedback").textContent =
      `${byId.get(id).short} ${had ? "removed from" : "added to"} your shortlist.`;
    persist();
    render();
    const btn = document.querySelector(`[data-save="${id}"]`);
    if (btn) btn.focus({ preventScroll: true });
  }
  function card(p) {
    const selected = saved.includes(p.id);
    return `<article class="program-card"><div class="card-top"><span class="tag">${escape(p.city)}, ${p.state}</span><span class="micro">${escape(p.degree)}</span></div><h3>${escape(p.short)}</h3><p class="school-full">${escape(p.name)}</p><div class="school-facts"><span>${escape(p.length)}</span><span aria-hidden="true">·</span><span>Bench test: ${escape(p.bench)}</span></div><span class="tag ${p.eligibility === "conditional" ? "amber" : ""}">${eligibility[p.eligibility]}</span>${TDCosts.summary(p.cost)}<p class="micro">Listed deadline: <strong>${escape(p.deadline)}</strong></p><p class="status">${status[TDPrograms.cycle(p, localDay())]}</p><div class="card-actions"><button class="btn btn-sm" data-detail="${escape(p.id)}" aria-label="View ${escape(p.short)} details">View details ↗</button><button class="plain-button" data-save="${escape(p.id)}" aria-pressed="${selected}" aria-label="${selected ? "Remove" : "Save"} ${escape(p.short)}">${selected ? "✓ Saved" : "+ Shortlist"}</button></div></article>`;
  }
  function render() {
    const all = filtered();
    let result = mapIds ? all.filter((p) => mapIds.includes(p.id)) : all;
    const sort = $("school-sort").value;
    result.sort((a, b) =>
      sort === "duration"
        ? a.months - b.months || a.short.localeCompare(b.short)
        : sort === "deadline"
          ? deadlineSort(a) - deadlineSort(b) || a.short.localeCompare(b.short)
          : a.short.localeCompare(b.short),
    );
    $("results-count").textContent =
      `${result.length} ${result.length === 1 ? "program" : "programs"}${mapIds ? " in map selection" : ""}`;
    $("program-results").innerHTML = result.length
      ? result.slice(0, visible).map(card).join("")
      : `<div class="empty"><h3>No schools match these filters.</h3><p>Try a broader location or eligibility policy. States without a listed CAAPID program still appear in the location filter.</p><button class="plain-button" data-reset>Reset search & filters</button></div>`;
    $("load-more").hidden = result.length <= visible;
    $("load-more").textContent =
      `Show ${Math.min(12, result.length - visible)} more schools (${Math.min(visible, result.length)} of ${result.length})`;
    $("shortlist-bar").hidden = saved.length === 0;
    $("saved-count").textContent = saved.length;
    const f = filters(),
      n = criteria.filter((k) => f[k]).length;
    $("filter-count").textContent = n ? `· ${n} active` : "";
    renderMap(all);
  }
  function deadlineSort(p) {
    const d = TDPrograms.day(p.deadline);
    if (!d || TDPrograms.cycle(p, localDay()) === "confirm") return 9e15;
    return Date.parse(d) + (d < localDay() ? 1e14 : 0);
  }
  function reset() {
    criteria.forEach((k) => ($("filter-" + k).value = ""));
    $("school-search").value = "";
    $("saved-only").checked = false;
    mapIds = null;
    visible = 12;
    render();
  }
  function renderMap(list) {
    const groups = [];
    for (const p of list) {
      const g = groups.find(
        (g) => Math.hypot(g.x - p.point[0], g.y - p.point[1]) < 28,
      );
      if (g) g.programs.push(p);
      else groups.push({ x: p.point[0], y: p.point[1], programs: [p] });
    }
    $("map-pins").replaceChildren();
    for (const g of groups) {
      const ns = "http://www.w3.org/2000/svg",
        pin = document.createElementNS(ns, "g");
      pin.classList.add("map-pin");
      pin.setAttribute("transform", `translate(${g.x},${g.y})`);
      pin.setAttribute(
        "tabindex",
        matchMedia("(max-width:540px)").matches ? "-1" : "0",
      );
      pin.setAttribute("role", "button");
      const label = g.programs.map((p) => p.short).join(", ");
      pin.setAttribute(
        "aria-label",
        `Show ${g.programs.length} program${g.programs.length === 1 ? "" : "s"}: ${label}`,
      );
      const circle = document.createElementNS(ns, "circle");
      circle.setAttribute("r", g.programs.length > 1 ? "17" : "10");
      const title = document.createElementNS(ns, "title");
      title.textContent = label;
      pin.append(circle, title);
      if (g.programs.length > 1) {
        const text = document.createElementNS(ns, "text");
        text.textContent = g.programs.length;
        pin.append(text);
      }
      if (mapIds && !g.programs.some((p) => mapIds.includes(p.id)))
        pin.classList.add("dim");
      const showTip = () => {
        $("map-tooltip").hidden = false;
        $("map-tooltip").textContent = label;
      };
      const hideTip = () => {
        $("map-tooltip").hidden = true;
      };
      pin.addEventListener("pointerenter", showTip);
      pin.addEventListener("pointerleave", hideTip);
      pin.addEventListener("focus", showTip);
      pin.addEventListener("blur", hideTip);
      const select = () => {
        mapIds = g.programs.map((p) => p.id);
        visible = 12;
        render();
        $("results-count").scrollIntoView({ block: "center" });
        $("results-count").setAttribute("tabindex", "-1");
        $("results-count").focus({ preventScroll: true });
      };
      pin.addEventListener("click", select);
      pin.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select();
        }
      });
      $("map-pins").append(pin);
    }
    let clear = $("clear-map-selection");
    if (!clear) {
      clear = document.createElement("button");
      clear.id = "clear-map-selection";
      clear.className = "plain-button";
      clear.textContent = "Clear map selection";
      clear.addEventListener("click", () => {
        mapIds = null;
        render();
      });
      $("map-panel").append(clear);
    }
    clear.hidden = !mapIds;
  }
  function detail(id) {
    const p = byId.get(id);
    if (!p) return;
    $("school-dialog-body").innerHTML =
      `<span class="tag">${escape(p.city)}, ${names[p.state]}</span><h2 id="school-dialog-title">${escape(p.name)}</h2><dl><div><dt>Degree / duration</dt><dd>${escape(p.degree)} · ${escape(p.length)}</dd></div><div><dt>Listed class size</dt><dd>${escape(p.seats)}</dd></div><div><dt>Applications open</dt><dd>${escape(p.opens)}</dd></div><div><dt>Deadline</dt><dd>${escape(p.deadline)}</dd></div><div><dt>Program starts</dt><dd>${escape(p.starts)}</dd></div><div><dt>Bench / supplemental application</dt><dd>${escape(p.bench)} / ${escape(p.supplemental)}</dd></div></dl>${p.dateNote ? `<p class="resource-note">${escape(p.dateNote)}</p>` : ""}<h3>Citizenship & permission to study</h3><p><span class="tag">${eligibility[p.eligibility]}</span></p><p>${escape(p.visa)}</p><h3>Your complete cost picture</h3>${TDCosts.summary(p.cost)}${TDCosts.breakdown(p.cost)}<p class="micro">All amounts are USD. Estimates use published rates and living allowances, not guaranteed future prices. Add any uncovered months, dependents, relocation, rate increases and loan interest. Confirm deposit credits and billing dates before paying.</p><h3>Before adding this school to your plan</h3><p>Confirm current TOEFL and board-exam rules, credential evaluation, application documents, interview format, visa evidence and the full cost of attendance for your intake.</p><div class="source-links">${sourceLink(p.source, "ADEA requirements")}${sourceLink(p.website, "School website")}${sourceLink(p.cost.source, "Official cost source")}${p.cost.additionalSources.map((s) => sourceLink(s.url, escape(s.label))).join("")}<a href="finances.html#calculator">Plan financing ↗</a></div><p class="micro" style="margin-top:20px">Reviewed October 4, 2026. Dates and eligibility can change. No admission, visa or financing outcome is guaranteed.</p>`;
    if (!$("school-dialog").open) {
      restoreHash = location.hash;
      document.body.classList.add("dialog-open");
      $("school-dialog").showModal();
    }
    history.replaceState(null, "", `#program=${encodeURIComponent(id)}`);
  }
  function compare() {
    $("comparison-content").innerHTML = saved
      .map((id) => {
        const p = byId.get(id);
        return `<article><h3>${escape(p.short)}</h3><p>${escape(p.city)}, ${p.state}</p><h4>Degree & duration</h4><p>${escape(p.degree)} · ${escape(p.length)}</p><h4>Citizenship & visa conditions</h4><p>${escape(p.visa)}</p><h4>Program cost & coverage</h4>${TDCosts.summary(p.cost)}${TDCosts.breakdown(p.cost)}<h4>Application deadline</h4><p>${escape(p.deadline)}</p>${p.dateNote ? `<p>${escape(p.dateNote)}</p>` : ""}<h4>Bench test / seats</h4><p>${escape(p.bench)} / ${escape(p.seats)}</p><div class="source-links">${sourceLink(p.source, "Requirements")}${sourceLink(p.cost.source, "Cost source")}${p.cost.additionalSources.map((s) => sourceLink(s.url, escape(s.label))).join("")}</div></article>`;
      })
      .join("");
    document.body.classList.add("dialog-open");
    $("compare-dialog").showModal();
  }
  document.querySelectorAll("dialog").forEach((d) => {
    d.querySelector("[data-close]").addEventListener("click", () => d.close());
    d.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      if (d.id === "school-dialog")
        history.replaceState(
          null,
          "",
          location.pathname + location.search + restoreHash,
        );
    });
    d.addEventListener("click", (e) => {
      if (e.target === d) {
        const rect = d.getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        )
          d.close();
      }
    });
  });
  $("program-results").addEventListener("click", (e) => {
    const s = e.target.closest("[data-save]"),
      d = e.target.closest("[data-detail]");
    if (s) save(s.dataset.save);
    if (d) detail(d.dataset.detail);
    if (e.target.closest("[data-reset]")) reset();
  });
  const changed = () => {
    mapIds = null;
    visible = 12;
    render();
  };
  criteria.forEach((k) => $("filter-" + k).addEventListener("change", changed));
  $("school-search").addEventListener("input", changed);
  $("saved-only").addEventListener("change", changed);
  $("school-sort").addEventListener("change", render);
  $("reset-filters").addEventListener("click", reset);
  $("clear-saved").addEventListener("click", () => {
    saved = [];
    persist();
    render();
    $("shortlist-feedback").textContent = "Shortlist cleared.";
  });
  $("compare-schools").addEventListener("click", compare);
  $("load-more").addEventListener("click", () => {
    const previous = visible;
    visible += 12;
    render();
    document
      .querySelectorAll("[data-detail]")
      [previous]?.focus({ preventScroll: true });
  });
  function toggleMap(open) {
    $("map-panel").hidden = !open;
    $("show-map").setAttribute("aria-expanded", String(open));
    $("show-map").textContent = open ? "Hide U.S. map" : "Show U.S. map";
  }
  $("show-map").addEventListener("click", () =>
    toggleMap($("map-panel").hidden),
  );
  toggleMap(matchMedia("(min-width:821px)").matches);
  $("school-filters").open = matchMedia("(min-width:821px)").matches;
  render();
  if (location.hash.startsWith("#program=")) {
    const id = decodeURIComponent(location.hash.slice(9));
    if (byId.has(id)) {
      restoreHash = "";
      detail(id);
      restoreHash = "";
    }
  }
})();
