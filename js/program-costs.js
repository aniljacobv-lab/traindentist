/* One rendering policy for interactive profiles and the static directory. */
(function (root) {
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
  const money = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  function hasEstimate(cost) {
    return (
      cost.coverage === "estimate" &&
      Number.isFinite(cost.total) &&
      cost.total > 0
    );
  }
  function headline(cost) {
    return hasEstimate(cost) ? money(cost.total) : "Full cost not confirmed";
  }
  function summary(cost) {
    const label = hasEstimate(cost)
      ? "Program attendance estimate"
      : cost.coverage === "conflict"
        ? "Source figures need clarification"
        : "Partial information · request complete budget";
    return `<div class="cost-block${hasEstimate(cost) ? "" : " cost-pending"}"><span class="cost-label">${label}</span><strong>${headline(cost)}</strong><p>${escape(cost.summary)}</p><span>${escape(cost.year)}</span></div>`;
  }
  function breakdown(cost) {
    const rows = [
      ["Initial term & cash timing", cost.initial],
      ["Tuition & required charges", cost.tuition],
      ["Housing, food & living", cost.living],
      ["In-state / out-of-state rates", cost.residency],
    ];
    const phases = cost.phases.length
      ? `<details class="cost-phases"><summary>View published phase budgets</summary><ul>${cost.phases.map((p) => `<li><span>${escape(p.label)}</span><strong>${money(p.amount)}</strong></li>`).join("")}</ul><p class="micro">Sum: ${money(cost.phases.reduce((sum, p) => sum + p.amount, 0))}. ${hasEstimate(cost) ? "Already included in the estimate above." : "A subtotal, not a confirmed complete program budget."}</p></details>`
      : "";
    return `<dl class="cost-breakdown">${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join("")}</dl>${phases}<p class="cost-caveat">${escape(cost.note)}</p>`;
  }
  const api = { hasEstimate, headline, summary, breakdown };
  if (typeof module !== "undefined") module.exports = api;
  else root.TDCosts = api;
})(typeof window !== "undefined" ? window : globalThis);
