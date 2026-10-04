/* Pure directory rules, shared with the validation tests. */
(function (root) {
  function day(value) {
    const n = Date.parse(value);
    return Number.isFinite(n) ? new Date(n).toISOString().slice(0, 10) : null;
  }
  function cycle(p, today = new Date().toLocaleDateString("en-CA")) {
    const opens = day(p.opens),
      closes = day(p.deadline),
      starts = day(p.starts);
    if (!opens || !closes || (starts && starts < closes)) return "confirm";
    if (today < opens) return "upcoming";
    return today <= closes ? "open" : "closed";
  }
  function matches(p, f, today) {
    const words = (f.search || "").trim().toLowerCase().split(/\s+/);
    const haystack = [p.name, p.short, p.city, p.state, p.degree]
      .join(" ")
      .toLowerCase();
    return (
      words.every((w) => haystack.includes(w)) &&
      (!f.state || p.state === f.state) &&
      (!f.eligibility || p.eligibility === f.eligibility) &&
      (!f.duration ||
        (f.duration === "short" ? p.months <= 30 : p.months > 30)) &&
      (!f.bench || p.bench === f.bench) &&
      (!f.cycle || cycle(p, today) === f.cycle) &&
      (!f.cost || (f.cost === "published" ? !!p.cost.value : !p.cost.value)) &&
      (!f.saved || f.saved.includes(p.id))
    );
  }
  const api = { day, cycle, matches };
  if (typeof module !== "undefined") module.exports = api;
  else root.TDPrograms = api;
})(typeof window !== "undefined" ? window : globalThis);
