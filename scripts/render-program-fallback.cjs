// Keep the no-JavaScript directory aligned with the reviewed JSON catalog.
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const { programs } = require("../data/programs.json");
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const link = (url, label) =>
  `<a href="${escape(url)}" target="_blank" rel="noopener">${label} ↗</a>`;
const cards = programs
  .map(
    (p) =>
      `<article class="program-card"><span class="tag">${escape(p.city)}, ${escape(p.state)}</span><h3>${escape(p.short)}</h3><p class="school-full">${escape(p.name)}</p><p>${escape(p.degree)} · ${escape(p.length)}</p><div class="cost-block"><strong>${escape(p.cost.value || "Confirm with school")}</strong><span>${escape(p.cost.label)}</span><span>${escape(p.cost.year)}</span></div><p class="micro">${escape(p.visa)}</p><div class="source-links">${link(p.source, "Program requirements")}${link(p.cost.source, "Cost source")}</div></article>`,
  )
  .join("\n");
const file = path.join(root, "schools.html");
const page = fs.readFileSync(file, "utf8");
const region =
  /(<div class="program-grid" id="program-results">)[\s\S]*?(?=\s*<div class="load-row">)/;
if (!region.test(page)) throw new Error("Cannot find static program directory");
fs.writeFileSync(
  file,
  page.replace(region, (_, opening) => `${opening}\n${cards}\n</div>\n`),
);
console.log(`Updated ${programs.length} static school profiles.`);
