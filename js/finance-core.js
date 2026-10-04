/* Fixed-rate educational model. No lender quotes or eligibility decisions. */
(function (root) {
  function valid(n, max = 10000000) {
    if (!Number.isFinite(n) || n < 0 || n > max)
      throw new RangeError("Enter a valid nonnegative amount.");
    return n;
  }
  function payment(principal, rate, months) {
    valid(principal);
    valid(rate, 40);
    if (!Number.isInteger(months) || months < 1 || months > 600)
      throw new RangeError("Invalid repayment period.");
    const r = rate / 1200;
    return r
      ? (principal * r) / -Math.expm1(-months * Math.log1p(r))
      : principal / months;
  }
  function budget({
    tuition,
    fees,
    living,
    months,
    other,
    savings,
    rate,
    grace,
    interestOnly,
  }) {
    [tuition, fees, living, other, savings].forEach((n) => valid(n));
    valid(rate, 40);
    if (
      !Number.isInteger(months) ||
      months < 1 ||
      months > 72 ||
      !Number.isInteger(grace) ||
      grace < 0 ||
      grace > 48
    )
      throw new RangeError("Check study and grace periods.");
    const total = tuition + fees + living * months + other,
      principal = Math.max(0, total - savings);
    // Equal draws at the beginning of each study month; simple interest, capitalized once.
    const schoolInterest = (((principal * rate) / 1200) * (months + 1)) / 2;
    const graceInterest = ((principal * rate) / 1200) * grace;
    const accrued = schoolInterest + graceInterest;
    return {
      total,
      principal,
      accrued,
      schoolInterest,
      graceInterest,
      balance: principal + (interestOnly ? 0 : accrued),
      interestPaid: interestOnly ? accrued : 0,
    };
  }
  function amortize(principal, rate, monthly) {
    valid(principal);
    valid(rate, 40);
    valid(monthly);
    if (principal === 0)
      return { months: 0, interest: 0, total: 0, balances: [0] };
    const r = rate / 1200;
    if (monthly <= principal * r || monthly === 0) return null;
    let balance = principal,
      interest = 0,
      total = 0,
      months = 0;
    const balances = [principal];
    while (balance > 0.000001 && months < 600) {
      const charge = balance * r,
        paid = Math.min(monthly, balance + charge);
      balance = Math.max(0, balance + charge - paid);
      interest += charge;
      total += paid;
      months++;
      balances.push(balance);
    }
    return balance > 0.000001 ? null : { months, interest, total, balances };
  }
  const api = { payment, budget, amortize };
  if (typeof module !== "undefined") module.exports = api;
  else root.TDFinance = api;
})(typeof window !== "undefined" ? window : globalThis);
