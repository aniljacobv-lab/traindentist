const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const F = require("../js/finance-core.js");
const P = require("../js/programs-core.js");
const { programs } = require("../data/programs.json");
const near = (a, b, eps = 0.01) =>
  assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
test("loan payment matches independent standard amortization example", () => {
  near(F.payment(300000, 8, 120), 3639.8278);
  const s = F.amortize(300000, 8, F.payment(300000, 8, 120));
  assert.equal(s.months, 120);
  near(s.interest, 136779.335, 1);
  near(s.total, 436779.335, 1);
  near(s.balances.at(-1), 0, 0.000001);
});
test("zero-rate loan has exact principal-only payments", () => {
  near(F.payment(120000, 0, 120), 1000);
  assert.equal(F.amortize(120000, 0, 1000).months, 120);
  assert.equal(F.amortize(120000, 0, 1000).interest, 0);
});
test("equal monthly borrowing models school and grace simple interest", () => {
  const b = F.budget({
    tuition: 12000,
    fees: 0,
    living: 0,
    months: 12,
    other: 0,
    savings: 0,
    rate: 12,
    grace: 6,
    interestOnly: false,
  });
  near(b.schoolInterest, 780);
  near(b.graceInterest, 720);
  near(b.balance, 13500);
  const paid = F.budget({
    tuition: 12000,
    fees: 0,
    living: 0,
    months: 12,
    other: 0,
    savings: 0,
    rate: 12,
    grace: 6,
    interestOnly: true,
  });
  near(paid.balance, 12000);
  near(paid.interestPaid, 1500);
});
test("extra payments shorten repayment, lower interest and cap final payment", () => {
  const pay = F.payment(100000, 6, 120),
    base = F.amortize(100000, 6, pay),
    fast = F.amortize(100000, 6, pay + 500);
  assert.ok(fast.months < base.months);
  assert.ok(fast.interest < base.interest);
  near(fast.total - fast.interest, 100000);
  assert.ok(fast.total < (pay + 500) * fast.months);
});
test("non-amortizing payment returns no false payoff date", () => {
  assert.equal(F.amortize(100000, 12, 1000), null);
  assert.equal(F.amortize(100000, 0, 0), null);
});
test("savings beyond cost produces no negative debt or interest", () => {
  const b = F.budget({
    tuition: 100,
    fees: 0,
    living: 0,
    months: 24,
    other: 0,
    savings: 500,
    rate: 8,
    grace: 6,
    interestOnly: false,
  });
  assert.equal(b.balance, 0);
  assert.equal(b.accrued, 0);
  assert.equal(F.amortize(0, 8, 0).months, 0);
});
test("invalid periods, negative inputs and nonfinite rates are rejected", () => {
  assert.throws(() => F.payment(100, -1, 12));
  assert.throws(() => F.payment(100, Infinity, 12));
  assert.throws(() => F.payment(100, 8, 0));
  assert.throws(() =>
    F.budget({
      tuition: 100,
      fees: 0,
      living: 0,
      months: 1.5,
      other: 0,
      savings: 0,
      rate: 8,
      grace: 6,
    }),
  );
});
test("directory covers 47 unique sourced profiles with usable campus points", () => {
  assert.equal(programs.length, 47);
  assert.equal(new Set(programs.map((p) => p.id)).size, 47);
  programs.forEach((p) => {
    assert.ok(
      p.source.startsWith("https://programs.adea.org/CAAPID/programs/"),
    );
    assert.ok(p.cost.source.startsWith("https://"));
    assert.ok(p.cost.note.length > 30);
    assert.ok(
      p.point[0] > 0 && p.point[0] < 1000 && p.point[1] > 0 && p.point[1] < 580,
      p.short,
    );
    assert.ok(
      ["international", "citizen-pr", "conditional"].includes(p.eligibility),
    );
    assert.ok(p.visa.length > 25);
    assert.ok(p.months >= 24 && p.months <= 48);
  });
  assert.equal(programs.filter((p) => p.state === "PR").length, 2);
});
test("filters combine state, text, status, bench and duration", () => {
  const f = {
    state: "MA",
    search: "Boston",
    eligibility: "international",
    bench: "No",
    duration: "short",
    cycle: "open",
  };
  assert.deepEqual(
    programs.filter((p) => P.matches(p, f, "2026-10-04")).map((p) => p.short),
    ["Boston University"],
  );
  assert.equal(
    programs.filter((p) => P.matches(p, { state: "AK" }, "2026-10-04")).length,
    0,
  );
});
test("citizenship categories do not silently include contradictory profiles", () => {
  assert.equal(
    programs.find((p) => p.short === "Pikeville").eligibility,
    "conditional",
  );
  assert.equal(
    programs.find((p) => p.short === "New England").eligibility,
    "conditional",
  );
  assert.equal(
    programs.find((p) => p.short === "ATSU Missouri").eligibility,
    "citizen-pr",
  );
});
test("cycle status includes deadline day and detects contradictory timeline", () => {
  const p = programs.find((p) => p.short === "Boston University");
  assert.equal(P.cycle(p, "2026-10-15"), "open");
  assert.equal(P.cycle(p, "2026-10-16"), "closed");
  assert.equal(P.cycle(p, "2026-01-01"), "upcoming");
  assert.equal(
    P.cycle(
      programs.find((p) => p.short === "Touro"),
      "2026-10-04",
    ),
    "confirm",
  );
});
test("shortlist filter is a subset and numeric cost filter preserves unknowns", () => {
  assert.equal(
    programs.filter((p) => P.matches(p, { saved: [] }, "2026-10-04")).length,
    0,
  );
  assert.equal(
    programs.filter((p) =>
      P.matches(p, { saved: [programs[0].id] }, "2026-10-04"),
    ).length,
    1,
  );
  const priced = programs.filter((p) => P.matches(p, { cost: "published" })),
    pending = programs.filter((p) => P.matches(p, { cost: "pending" }));
  assert.equal(priced.length + pending.length, 47);
  assert.ok(priced.length >= 31);
});
test("all local HTML links and script/style/image assets resolve", () => {
  const root = path.join(__dirname, "..");
  for (const file of [
    "index.html",
    "pathway.html",
    "schools.html",
    "finances.html",
    "careers.html",
  ]) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    for (const m of text.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = m[1];
      if (/^(https?:|mailto:|tel:|data:|#)/.test(url)) continue;
      const target = url.split("#")[0].split("?")[0];
      assert.ok(fs.existsSync(path.join(root, target)), `${file} -> ${target}`);
      const hash = url.split("#")[1];
      if (hash && target.endsWith(".html"))
        assert.ok(
          fs
            .readFileSync(path.join(root, target), "utf8")
            .includes(`id="${hash}"`),
          `${url} missing anchor`,
        );
    }
    assert.ok(text.includes('name="viewport"'));
    assert.ok(text.includes('href="schools.html"'));
  }
});
