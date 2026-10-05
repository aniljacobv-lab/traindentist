/* Pure directory rules, shared with the validation tests. */
(function (root) {
  function day(value) {
    // "October 15, 2026" parses as local midnight; read it back in local time so the
    // calendar date is the same for a visitor in Kolkata, London or Los Angeles.
    const n = Date.parse(value);
    if (!Number.isFinite(n)) return null;
    const d = new Date(n);
    const pad = (x) => String(x).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
      (!f.cost ||
        (f.cost === "published"
          ? p.cost.coverage === "estimate" && Number.isFinite(p.cost.total)
          : f.cost === "conflict"
            ? p.cost.coverage === "conflict"
            : p.cost.total === null)) &&
      (!f.saved || f.saved.includes(p.id))
    );
  }
  const api = { day, cycle, matches };
  if (typeof module !== "undefined") module.exports = api;
  else root.TDPrograms = api;
})(typeof window !== "undefined" ? window : globalThis);
