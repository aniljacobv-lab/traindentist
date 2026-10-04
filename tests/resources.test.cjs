const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const F = require("../js/finance-core.js");
const P = require("../js/programs-core.js");
const C = require("../js/program-costs.js");
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
test("shortlist filter is a subset and attendance filter preserves incomplete budgets", () => {
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
  assert.ok(priced.length > 0);
  assert.ok(priced.every((p) => C.hasEstimate(p.cost)));
  assert.ok(pending.every((p) => p.cost.total === null));
});
test("partial and conflicting school costs never become full-price headlines", () => {
  for (const p of programs) {
    for (const field of [
      "initial",
      "tuition",
      "living",
      "residency",
      "year",
      "summary",
    ])
      assert.ok(p.cost[field].length > 0, `${p.short}: missing ${field}`);
    if (C.hasEstimate(p.cost)) {
      near(
        p.cost.total,
        p.cost.phases.reduce((sum, phase) => sum + phase.amount, 0),
      );
      assert.ok(p.cost.phases.length >= 2, p.short);
    } else {
      assert.equal(p.cost.total, null, p.short);
      assert.equal(p.cost.value, null, p.short);
      assert.equal(C.headline(p.cost), "Full cost not confirmed", p.short);
    }
  }
  assert.equal(C.headline(programs[0].cost), "Full cost not confirmed");
  assert.equal(C.headline(programs[1].cost), "$325,167");
  assert.ok(programs[28].cost.residency.includes("$41,500"));
  assert.ok(programs[28].cost.residency.includes("$47,376"));
  assert.equal(P.matches(programs[28], { cost: "published" }), false);
  assert.equal(P.matches(programs[28], { cost: "conflict" }), true);
  assert.equal(C.hasEstimate(programs[45].cost), false);
});
test("published complete budgets reconcile independently to reference phase sums", () => {
  near(programs[1].cost.total, 325167);
  near(programs[15].cost.total, 308849.34);
  near(programs[26].cost.total, 294553);
  near(programs[31].cost.total, 475183);
  near(programs[42].cost.total, 398758);
});
test("initial cash timing reports a shortfall without creating duplicate costs", () => {
  assert.deepEqual(F.cashTiming(15000, 10000, 318000, 30000), {
    gap: 5000,
    remaining: 0,
  });
  assert.deepEqual(F.cashTiming(4000, 10000, 294553, 30000), {
    gap: 0,
    remaining: 6000,
  });
  assert.throws(() => F.cashTiming(12000, 10000, 11000, 30000));
  assert.throws(() => F.cashTiming(12000, 31000, 318000, 30000));
});
test("all local HTML links and script/style/image assets resolve", () => {
  const root = path.join(__dirname, "..");
  for (const file of [
    "index.html",
    "pathway.html",
    "schools.html",
    "finances.html",
    "careers.html",
    "my-story.html",
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
    assert.ok(text.includes('href="my-story.html"'));
  }
});
test("the chatbot's routed answers use full budgets and the corrected biography", () => {
  const context = { window: { TD_CONFIG: { email: "test@example.com" } } };
  vm.runInNewContext(
    fs.readFileSync(
      path.join(__dirname, "../js/drmathew-knowledge.js"),
      "utf8",
    ),
    context,
  );
  const kb = context.window.DrMathewKB;
  const costs = kb.route(
    "How much does an advanced standing program cost?",
  ).fact;
  assert.equal(costs.id, "costs");
  assert.ok(costs.answer.includes("$294,553"));
  assert.ok(costs.answer.includes("living expenses"));
  assert.ok(!costs.answer.includes("$185k"));
  const about = kb.route("Who is Dr. Mathew?").fact;
  assert.equal(about.id, "about");
  assert.ok(about.answer.includes("Postgraduate diploma"));
  assert.ok(about.answer.includes("my-story.html"));
  assert.ok(!about.answer.includes("Christian Medical College"));
});
