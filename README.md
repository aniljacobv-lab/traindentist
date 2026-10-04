# traindentist.com

The website for Dr. Liji Mathew, DMD: mentorship for internationally trained dentists applying to U.S. dental schools. It's a static site (plain HTML, CSS and JS with no build step), hosted free on **GitHub Pages**, and includes the **Dr. Mathew** chat assistant.

```
index.html               the page
css/styles.css           all styles, including the chat widget
js/config.js             EDIT ME: email, phone, form endpoint, chat API URL
js/main.js               menu and consultation form
js/drmathew-knowledge.js the chatbot's built-in guide (answers and keywords)
js/drmathew-widget.js    the chat widget (modelled on Roxi)
assets/                  photos and favicon (replace with professional photos anytime)
worker/                  optional AI backend (Cloudflare Worker + Claude)
CNAME                    tells GitHub Pages the custom domain
```

## 1. Publish on GitHub Pages

```bash
git init && git add . && git commit -m "traindentist.com site"
gh repo create traindentist --public --source . --push
gh api -X POST repos/{owner}/traindentist/pages -f "source[branch]=main" -f "source[path]=/"
```
Or use the GitHub website: **Settings → Pages → Deploy from branch → main / (root)**, then enter `traindentist.com` under *Custom domain*.

## 2. DNS at your domain registrar

Replace the current `www → traindentist.com` CNAME with these records:

| Type  | Name | Content                      | TTL |
|-------|------|------------------------------|-----|
| A     | @    | 185.199.108.153              | 300 |
| A     | @    | 185.199.109.153              | 300 |
| A     | @    | 185.199.110.153              | 300 |
| A     | @    | 185.199.111.153              | 300 |
| CNAME | www  | `<your-github-username>.github.io` | 300 |

Optional IPv6 (AAAA, @): `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.

Once DNS has propagated (from a few minutes up to 24 hours), go to **Settings → Pages** and tick **Enforce HTTPS**.

## 3. The Dr. Mathew chatbot

The chatbot works the same way Roxi does:
1. Questions that clearly match the built-in guide (`js/drmathew-knowledge.js`) are answered instantly. This is free and needs no server, so it works on GitHub Pages out of the box.
2. Other questions go to the AI worker, **if** `chatApi` is set in `js/config.js`.
3. With no worker configured, the bot gives the closest guide answer, or suggests booking a consultation.

To add or edit answers, edit the entries in `drmathew-knowledge.js`. Each entry has `keywords`, `examples` and an `answer`.

### Optional: turn on AI answers (Claude)
GitHub Pages can't safely store an API key, so the AI runs on a free Cloudflare Worker:
```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY     # paste your key from console.anthropic.com
npx wrangler deploy                           # prints https://drmathew-chat.<you>.workers.dev
```
Then set `chatApi: "https://drmathew-chat.<you>.workers.dev"` in `js/config.js` and push. The worker accepts requests only from traindentist.com, limits each visitor to 30 questions per hour, and has a strict system prompt: no admission guarantees, no visa advice, and no invented school statistics. Set a monthly spend limit in the Anthropic Console as well.

## 4. Contact form
By default, the form opens the visitor's email app with the request already filled in. To receive submissions directly instead, create a free form at formspree.io and paste its endpoint into `formEndpoint` in `js/config.js`.

## Content to finish
- [ ] Dr. Mathew's specifics: dental school and year, state license, years in practice (see the TODO comment in `index.html`, section `#about`)
- [ ] A professional headshot (`assets/dr-mathew.jpg`) and hero photo (`assets/hero-mentorship.jpg`); the current images are cropped from the flyer
- [ ] Confirm the email: the flyer uses info@usdentalprep.com. Change it in `js/config.js` and `index.html` if you set up an @traindentist.com address
- [ ] Testimonials, once you have permission from real students

## Design and graphics

The responsive redesign uses an ivory, forest-green, and sage palette with an editorial layout. Programs lead into a six-stage admissions roadmap, followed by the mentor profile, visual learning guides, FAQs, and consultation form. The existing photographs and contact settings are retained.

Original, editable SVG graphics are in `assets/`:
- `admissions-roadmap.svg`: downloadable six-stage planning guide, also linked from the page.
- `bench-focus.svg`: conceptual illustration of precision, protection, and timing. It is not a clinical preparation guide.
- `interview-framework.svg`: the STAR structure for behavioral interview answers.
- `icons.svg`: reusable interface icon symbols.
- `favicon.svg`: updated tooth brand mark.

The roadmap displayed on the page is semantic HTML, so it adapts from a horizontal graphic to a vertical sequence on phones. Illustration descriptions are available to screen readers. The mobile menu supports Escape; reduced-motion preferences are respected. The chat identifies itself as an automated guide.

With `formEndpoint` empty, the form prepares an email draft and explicitly asks the visitor to send it. If an endpoint is configured, it submits directly, prevents duplicate requests, and preserves entered details if submission fails.

### Verification

Run `node --test tests/consultation.test.cjs` for consultation request tests (no dependencies or external requests). Preview with any static HTTP server, for example `python -m http.server 4173`, and visit `http://localhost:4173`.
