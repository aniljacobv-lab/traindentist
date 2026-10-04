# Reviewed program directory

`programs.json` is an editorial snapshot of the 47 ADEA CAAPID listings reviewed on October 4, 2026, not a live admissions feed or an exhaustive list of U.S. dental schools.

To update a record, review its ADEA profile, school admissions page and official cost source. Keep admission eligibility, permission to study and loan eligibility separate. Preserve conflicting requirements in the notes rather than guessing. Review dates apply to the source check, not necessarily to the budget's academic year.

Every cost must state its period, academic year or cohort, and included charges. Use a null value when a relevant amount cannot be verified. Never substitute a regular four-year DDS budget for an advanced-standing budget without an explicit explanation. Costs with different bases must not be ranked as if they were comparable.

After editing the JSON, run `node scripts/render-program-fallback.cjs` to update the accessible static summaries in `schools.html`. Run `node --test tests/*.test.cjs`, then check filters, school details and the comparison dialog in a browser. When adding a location, update both longitude/latitude and the projected `point`; the map uses Albers USA at scale 1150, translation [500,315], with a separate Puerto Rico inset.

Finance and career guidance is maintained in its respective HTML page. Review lender terms, federal rules and dated salary data before changing the review date. Repayment calculations are illustrative and use the documented assumptions beside the calculator.

Map geography is derived from U.S. Atlas 3.0.1, based on U.S. Census geography. See `assets/map-geography-LICENSE.txt` for attribution.

## Cost coverage model

`cost.total` is numeric only for a reconciled attendance estimate that includes the published program phases and living allowances. `coverage` is `estimate`, `partial`, `unconfirmed`, or `conflict`. Missing totals and the legacy `value` remain null, even if a tuition or initial-term amount is known. Never impose an invented minimum to fill missing data. `phases` contains labeled school attendance budgets; summing them does not establish complete coverage when dates or introductory terms are unclear.

Every profile includes `initial`, `tuition`, `living`, `residency`, source year/cohort, limitations and official links. Individual households, insurance waivers, future increases and loan interest alter the actual cost. Same-year budgets for different cohorts are planning inputs, not a price commitment for one future student. Private program rates without a residency split must not be replaced with ordinary DDS resident/nonresident fees.

`js/program-costs.js` applies the same headline/breakdown policy to cards, dialogs, comparisons and generated static HTML. The cost filter selects usable attendance estimates, incomplete totals, or conflicting source figures. When correcting costs or biographical facts, also check `pathway.html`, `js/drmathew-knowledge.js`, and `worker/src/knowledge.js` so the guide and chatbot do not retain an old claim. A worker knowledge change needs deployment to the existing Cloudflare Worker; a GitHub Pages push alone does not update that service.
