/* Page behaviour: mobile menu, contact details from config, consultation form. */
(function () {
  const C = window.TD_CONFIG || {};

  const toggle = document.querySelector(".nav-toggle"), links = document.getElementById("nav-links");
  toggle.addEventListener("click", () => { const open = links.classList.toggle("open"); toggle.setAttribute("aria-expanded", open); });
  links.addEventListener("click", (e) => { if (e.target.closest("a")) { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); } });
  addEventListener("scroll", () => document.querySelector(".nav").classList.toggle("scrolled", scrollY > 8), { passive: true });

  for (const a of document.querySelectorAll("[data-cfg]")) {
    const k = a.dataset.cfg;
    if (k === "email" && C.email) { a.href = "mailto:" + C.email; a.textContent = C.email; }
    if (k === "phone" && C.phone) { a.href = "tel:" + C.phoneHref; a.textContent = C.phone; }
    if (k === "social" && C.social) { a.href = C.socialUrl; a.textContent = C.social; }
  }
  document.getElementById("year").textContent = new Date().getFullYear();

  const form = document.getElementById("contact-form"), note = document.getElementById("form-note");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email)) { note.textContent = "Please enter your name and a valid email."; note.className = "form-note err"; return; }
    if (C.formEndpoint) {
      try {
        const r = await fetch(C.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) });
        if (!r.ok) throw new Error();
        form.reset(); note.textContent = "Thank you! Dr. Mathew's team will contact you within 1–2 business days."; note.className = "form-note ok"; return;
      } catch { note.textContent = "Couldn't send right now. Opening your email app instead…"; }
    }
    const body = `Name: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nCountry of degree: ${d.country}\nInterested in: ${d.interest}\n\n${d.message}`;
    location.href = `mailto:${C.email}?subject=${encodeURIComponent("Consultation request: " + d.interest)}&body=${encodeURIComponent(body)}`;
    note.textContent = "Your email app should open with the request filled in. Just press send."; note.className = "form-note ok";
  });
})();
