/* Navigation, program selection, and consultation requests. No build step required. */
(function () {
  const C = window.TD_CONFIG || {};
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  function setMenu(open) {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.addEventListener("click", () =>
    setMenu(toggle.getAttribute("aria-expanded") !== "true"),
  );
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav")) setMenu(false);
  });
  for (const a of document.querySelectorAll("[data-cfg]")) {
    const k = a.dataset.cfg;
    if (k === "email" && C.email) {
      a.href = "mailto:" + C.email;
      a.textContent = C.email;
    }
    if (k === "phone" && C.phone) {
      a.href = "tel:" + C.phoneHref;
      a.textContent = C.phone;
    }
    if (k === "social" && C.social) {
      a.href = C.socialUrl;
      a.textContent = C.social;
    }
  }
  document.getElementById("year").textContent = new Date().getFullYear();
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  const submit = form.querySelector('[type="submit"]');
  document.querySelectorAll("[data-interest]").forEach((a) =>
    a.addEventListener("click", () => {
      form.elements.interest.value = a.dataset.interest;
    }),
  );
  if (C.formEndpoint) {
    document.getElementById("form-explainer").textContent =
      "Tell us about your goals. We’ll be in touch to arrange your free consultation.";
    submit.firstChild.textContent = "Request my free consultation ";
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submit.disabled || !form.reportValidity()) return;
    const d = Object.fromEntries(new FormData(form));
    if (!d.name.trim()) {
      note.textContent = "Please enter your full name.";
      note.className = "form-note err";
      form.elements.name.focus();
      return;
    }
    if (C.formEndpoint) {
      submit.disabled = true;
      note.textContent = "Sending your request…";
      note.className = "form-note";
      try {
        const r = await fetch(C.formEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(d),
          signal: AbortSignal.timeout(15000),
        });
        if (!r.ok) throw new Error("Request failed");
        form.reset();
        note.textContent =
          "Thank you. Your consultation request has been sent. We’ll be in touch.";
        note.className = "form-note ok";
      } catch {
        note.replaceChildren(
          document.createTextNode(
            "Your request could not be confirmed. Please email us at ",
          ),
        );
        const fallback = document.createElement("a");
        fallback.href = makeEmail(d);
        fallback.textContent = C.email || "info@usdentalprep.com";
        note.append(fallback, ". Your details are still here.");
        note.className = "form-note err";
      } finally {
        submit.disabled = false;
      }
      return;
    }
    location.href = makeEmail(d);
    note.textContent =
      "Your email app should open with a draft. Review it and press Send to complete your request. If it does not open, email " +
      (C.email || "info@usdentalprep.com") +
      ".";
    note.className = "form-note ok";
  });
  function makeEmail(d) {
    const body = `Name: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nCountry of degree: ${d.country}\nInterested in: ${d.interest}\n\n${d.message}`;
    return `mailto:${C.email || "info@usdentalprep.com"}?subject=${encodeURIComponent("Consultation request: " + d.interest)}&body=${encodeURIComponent(body)}`;
  }
})();
