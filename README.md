# traindentist.com

The website for Dr. Liji Mathew, DMD: mentorship for internationally trained dentists applying to U.S. dental schools. It's a static site (plain HTML, CSS and JS with no build step), hosted free on **GitHub Pages**, and includes the **Dr. Mathew** chat assistant.

```
index.html               home page
pathway.html             the U.S. Pathway Guide + Pathway Planner
schools.html             47-program explorer, U.S. map and school comparison
finances.html            funding guide and education-loan calculator
my-story.html            Dr. Mathew’s biography, journey and original photographs
careers.html             graduate, associate, DSO and ownership guide
data/programs.json       reviewed school facts, cost bases and official sources
js/planner.js            the Pathway Planner checklist
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

Or use the GitHub website: **Settings → Pages → Deploy from branch → main / (root)**, then enter `traindentist.com` under _Custom domain_.

## 2. DNS at your domain registrar

Replace the current `www → traindentist.com` CNAME with these records:

| Type  | Name | Content                            | TTL |
| ----- | ---- | ---------------------------------- | --- |
| A     | @    | 185.199.108.153                    | 300 |
| A     | @    | 185.199.109.153                    | 300 |
| A     | @    | 185.199.110.153                    | 300 |
| A     | @    | 185.199.111.153                    | 300 |
| CNAME | www  | `<your-github-username>.github.io` | 300 |

Optional IPv6 (AAAA, @): `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.

Once DNS has propagated (from a few minutes up to 24 hours), go to **Settings → Pages** and tick **Enforce HTTPS**.

## 3. The Dr. Mathew chatbot

The chatbot works the same way Roxi does:

1. Questions that clearly match the built-in guide (`js/drmathew-knowledge.js`) are answered instantly. This is free and needs no server, so it works on GitHub Pages out of the box.
2. Other questions go to the AI worker, **if** `chatApi` is set in `js/config.js`.
3. With no worker configured, the bot gives the closest guide answer, or suggests booking a consultation.

To add or edit answers, edit the entries in `drmathew-knowledge.js`. Each entry has `keywords`, `examples` and an `answer`.

### Optional: turn on AI answers (Gemini or Claude)

GitHub Pages can't keep a key secret, so the AI runs on a free Cloudflare Worker and the key is stored as an encrypted Cloudflare secret. **Never put a key in `js/config.js` or anywhere in this repo.** Run from a short path (e.g. `C:	raindentist`):

```bash
cd worker
npm install
npx wrangler login                          # approve in the browser
npx wrangler secret put GEMINI_API_KEY      # paste your Google AI Studio key when prompted
#   or: npx wrangler secret put ANTHROPIC_API_KEY  (Claude is used if both are set)
npx wrangler deploy                         # prints https://drmathew-chat.<you>.workers.dev
```

Then set `chatApi: "https://drmathew-chat.<you>.workers.dev"` in `js/config.js` and push. How the AI answers: it uses Claude (Opus 5.5) and is grounded in `worker/src/knowledge.js`, a verified reference covering every route, exam, fee, deadline, program example, licensure and visa basics, sent as a cached system block. When a question needs something newer or more specific (a school's current deadline, a state's rules), it runs a **live web search restricted to official sources and dental-school websites** (`SEARCH_DOMAINS`) and shows its sources. It remembers the conversation, so follow-ups are personal. The worker accepts requests only from traindentist.com, limits each visitor to 30 questions per hour, and has strict rules: no admission guarantees, no immigration advice, and no invented statistics. Update `knowledge.js` each application cycle. Set a monthly spend limit in the Anthropic Console as well.

## 4. Contact form

By default, the form opens the visitor's email app with the request already filled in. To receive submissions directly instead, create a free form at formspree.io and paste its endpoint into `formEndpoint` in `js/config.js`.

## Content to finish

- [ ] Set up the **info@traindentist.com** mailbox (or forwarding) at your domain host, or change `email` in `js/config.js`
- [x] Polished solo portrait in her original black dental outfit, with Dr Liji Mathew DMD embroidery, based on the owner-selected photograph, created with built-in image generation; originals retained.
- [ ] Coaching rates for the Programs section (currently "Contact for current rates")
- [ ] Student testimonials, once you have permission from real students
- [ ] Re-check the Pathway Guide facts each cycle (CAAPID dates, fees, TOEFL minimums)

## Design and graphics

The responsive redesign uses an ivory, forest-green, and sage palette with an editorial layout. Programs lead into a six-stage admissions roadmap, followed by the mentor profile, visual learning guides, FAQs, and consultation form. Original photographs remain in the repository; current contact settings are preserved.

Original, editable SVG graphics are in `assets/`:

- `admissions-roadmap.svg`: downloadable six-stage planning guide, also linked from the page.
- `bench-focus.svg`: conceptual illustration of precision, protection, and timing. It is not a clinical preparation guide.
- `interview-framework.svg`: the STAR structure for behavioral interview answers.
- `icons.svg`: reusable interface icon symbols.
- `favicon.svg`: updated tooth brand mark.

The roadmap displayed on the page is semantic HTML, so it adapts from a horizontal graphic to a vertical sequence on phones. Illustration descriptions are available to screen readers. The mobile menu supports Escape; reduced-motion preferences are respected. The chat identifies itself as an automated guide.

With `formEndpoint` empty, the form prepares an email draft and explicitly asks the visitor to send it. If an endpoint is configured, it submits directly, prevents duplicate requests, and preserves entered details if submission fails.

### Verification

Run `node --test tests/*.test.cjs` for consultation, repayment, school filtering and local-link checks (no dependencies or external requests). Preview with any static HTTP server, for example `python -m http.server 4173`, and visit `http://localhost:4173`.

The resource pages use `css/resources.css`. School summaries remain available if interactive loading fails. The calculator and shortlist stay in the visitor's browser. See `data/README.md` for source review rules and the command to refresh static school summaries after editing the catalog. Loan terms and admission rules are dated editorial snapshots; confirm them with the original source before changing a review date.

## Portrait update

The current homepage, mentor profile, and chat use `assets/dr-mathew-professional-v2.webp` and `assets/dr-mathew-avatar-v2.webp`. `assets/dr-mathew-professional-v2.jpg` is used for social previews. This is an AI-polished portrait based on the clinical photograph selected by the site owner, preserving her broad smile and black dental outfit. The jacket embroidery reads Dr Liji Mathew, with DMD below. The original photographs remain in the repository. The newer Pathway Guide, Planner, credentials, contact settings, knowledge base, and worker updates from main are retained. The guide has a matching stylesheet in `css/pathway.css`.

The October 4 portrait refinement uses additional owner-supplied face/smile references and natural proportions. Original milestone/event photographs on `my-story.html` are unchanged. The supplied CVs informed public career facts; private contact details, references and full CV documents are not published. Clinical Research and Data Management is correctly described as a postgraduate diploma, and the MDS subject is Prosthodontics and Crown & Bridge. The partially completed healthcare-management MS is not presented as an earned degree.
