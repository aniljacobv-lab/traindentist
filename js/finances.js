(function () {
  const form = document.getElementById("finance-form");
  const $ = (id) => document.getElementById(id);
  const money = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  const duration = (m) =>
    `${Math.floor(m / 12)} years${m % 12 ? ` ${m % 12} months` : ""}`;
  function calculate(event) {
    if (event) event.preventDefault();
    if (!form.reportValidity()) return;
    try {
      const v = Object.fromEntries(new FormData(form));
      const input = Object.fromEntries(
        [
          "tuition",
          "fees",
          "living",
          "months",
          "other",
          "savings",
          "rate",
          "grace",
        ].map((k) => [k, Number(v[k])]),
      );
      input.interestOnly = v.interestMode === "pay";
      const b = TDFinance.budget(input),
        term = Number(v.term),
        extra = Number(v.extra),
        cash = Number(v.income) - Number(v.spending);
      const monthly = TDFinance.payment(b.balance, input.rate, term * 12),
        schedule = TDFinance.amortize(b.balance, input.rate, monthly + extra);
      $("result-balance").textContent = money(b.balance);
      $("result-total").textContent = money(b.total);
      $("result-principal").textContent = money(b.principal);
      $("result-accrued").textContent =
        money(b.accrued) + (input.interestOnly ? " · paid" : " · added");
      $("result-payment").textContent =
        money(b.balance ? monthly + extra : 0) + "/mo";
      $("term-results").innerHTML = [5, 10, 15, 20]
        .map((years) => {
          const pay = TDFinance.payment(b.balance, input.rate, years * 12),
            s = TDFinance.amortize(b.balance, input.rate, pay);
          const interest = s.interest + b.accrued,
            total = b.principal + interest;
          const share = s.total ? (s.interest / s.total) * 100 : 0;
          return `<div class="term-card ${years === term ? "selected" : ""}"><h4>${years} years</h4><strong>${money(pay)}<span> / mo</span></strong><p>Total interest: ${money(interest)}</p><p>Total loan payments: ${money(total)}</p><div class="term-bar" aria-hidden="true"><span style="width:${share.toFixed(2)}%;margin-left:auto"></span></div></div>`;
        })
        .join("");
      if (b.principal === 0) {
        $("extra-result").textContent =
          "Your entered savings and other cash cover this education budget. No loan is needed in this scenario.";
      } else if (schedule) {
        const base = TDFinance.amortize(b.balance, input.rate, monthly);
        $("extra-result").innerHTML =
          `<strong>${extra ? `Adding ${money(extra)} per month` : "Your selected schedule"}</strong><br>Repayment takes ${duration(schedule.months)} after school and grace. ${extra ? `You save approximately ${money(Math.max(0, base.interest - schedule.interest))} in interest versus the selected base term. ` : ""}Total loan payments: ${money(schedule.total + b.interestPaid)}. Full timeline from first borrowing: about ${duration(input.months + input.grace + schedule.months)}.`;
      } else {
        $("extra-result").textContent =
          "This payment does not retire the balance within 50 years. Increase the payment or reduce the borrowing.";
      }
      const actual = b.balance ? monthly + extra : 0,
        left = cash - actual;
      $("affordability-result").classList.toggle("warning", left < 0);
      $("affordability-result").innerHTML =
        `<strong>Monthly cash-flow check</strong><br>${money(Number(v.income))} take-home − ${money(Number(v.spending))} other commitments − ${money(actual)} loan payment = <strong>${money(left)}</strong> ${left < 0 ? "shortfall" : "remaining"}. ${left < 0 ? "The entered budget cannot support this payment." : "Check that your commitments already include adequate savings and a reserve."}`;
      const stressed = Math.min(40, input.rate + 3),
        stressBudget = TDFinance.budget({ ...input, rate: stressed }),
        stressPay = TDFinance.payment(
          stressBudget.balance,
          stressed,
          term * 12,
        );
      $("stress-result").innerHTML =
        `<strong>Higher-rate scenario: ${stressed}%</strong><br>At this rate throughout school and repayment, the ${term}-year base payment would be ${money(stressPay)}/month, before extra payments. This is a sensitivity check, not a forecast.${input.interestOnly ? `<br>You also need ${money(b.accrued)} from outside funds to pay interest during the original school/grace scenario.` : ""}`;
      $("calc-error").textContent = "";
      $("calc-announcement").textContent =
        `Estimate updated. Repayment balance ${money(b.balance)}, monthly payment ${money(actual)}. ${left < 0 ? "Your monthly budget has a shortfall." : ""}`;
    } catch {
      $("calc-error").textContent =
        "Please check the amounts and periods, then update your estimate.";
    }
  }
  form.addEventListener("submit", calculate);
  calculate();
})();
