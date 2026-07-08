# seam® Studio

Marketing site for **seam® Studio** — design and systems, London / İstanbul.

Static, no build step. Multipage:

- `index.html` — home (hero, projects, services, experiences, case, FAQ, blog, contact)
- `studio.html` — about the studio + the founder
- `projects.html` — the four ventures (Seam Studio, Seam Vision, Quotewright, Misafir)
- `blog.html` — notes from the studio
- `contact.html` — contact form (Netlify Forms) + `thanks.html` success page
- `404.html` — not-found page
- `styles.css`, `app.js` — shared styles + smooth-scroll / reveals / menu

## Deploy (Netlify)

Connect this repo to a Netlify site — `netlify.toml` sets `publish = "."`, no build command.
Contact + newsletter forms use Netlify Forms (`data-netlify="true"`), active automatically on deploy.

## The ventures

- **Seam Vision** — AI textile defect detection · https://seam.seamuk.com
- **Quotewright** — RFQ email → quote automation · https://quotewright.seamuk.com
- **Misafir** — AI guest communications for hospitality · https://misafir.seamuk.com
