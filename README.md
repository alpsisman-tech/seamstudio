# Seam Studio — company site

The flagship marketing site for **Seam Studio**, an independent AI product studio.
It showcases the studio's three ventures — **Seam** (AI textile defect detection),
**Quotewright** (RFQ emails in, finished quotes out), and **Misafir** (an AI maître
for hospitality) — and positions the studio itself.

Pure static site — **no build step, no dependencies**. HTML + one CSS file + one
vanilla-JS file. Deploy anywhere (Netlify, GitHub Pages, Vercel, Cloudflare Pages).

## Design language — "atelier at night"

A cinematic dark ground (deep ink `#0A0B10`) with warm-paper ink and a signature
**tri-thread accent** that weaves the three ventures together, each with its own colour:

| Venture      | Role                                   | Accent            |
|--------------|----------------------------------------|-------------------|
| Seam         | AI textile defect detection            | lime  `#9BE45E`   |
| Quotewright  | RFQ emails in, finished quotes out     | blue  `#5B8CFF`   |
| Misafir      | An AI maître for hospitality           | amber `#F6A54A`   |

The thread motif (a woven `linear-gradient` of the three) recurs across the
selvedge bar, headline underlines, buttons, card top-borders and the hero canvas.

- Type: **Fraunces** (editorial display) · **Inter** (body) · **IBM Plex Mono** (labels).
- Motion: a live woven-threads `<canvas>` hero, drifting colour blobs, scroll reveals,
  count-ups, an auto-advancing ventures showcase with per-venture live micro-demos
  (fabric scan, quote build, guest-reply draft), a marquee ticker and a process pipeline.
- Fully responsive and **`prefers-reduced-motion` safe** — every animation degrades to a
  static resolved state, and the hero canvas draws a single frame instead of looping.

## Pages

- `index.html` — flagship home: hero, the animated three-venture showcase, stats,
  the studio approach, the build process pipeline, and CTAs.
- `ventures.html` — a deep dive on each product, with its own live micro-demo,
  feature list, and the shared DNA that connects them.
- `studio.html` — the studio story, six operating principles, a timeline, and an FAQ.
- `contact.html` — a working "start a project" form.
- `404.html` — themed not-found page.

## Files

```
index.html · ventures.html · studio.html · contact.html · 404.html
assets/style.css   — the whole design system
assets/main.js     — nav, mobile drawer, reveals, count-ups, ventures showcase,
                     hero canvas, FAQ accordion, and the contact form handler
favicon.svg        — the tri-thread brand mark
netlify.toml       — static publish + security headers
```

## Contact form — instant send, no backend

The form posts over AJAX to **FormSubmit** (`https://formsubmit.co`) and shows an inline
success message. The destination address is assembled at runtime from a base64 string in
`assets/main.js` (search `atob`), so it never appears as plain text in the markup, and a
honeypot field silently drops bots.

**One-time activation:** the first submission triggers a confirmation email to the
destination address — click the link once, and every submission after lands instantly.
To swap the address, change the base64 value in `assets/main.js`. For an address fully
hidden behind a random key, create a free key at web3forms.com and point the `fetch` there.

## Deploy

No build. Serve the folder as static files. Locally:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

On Netlify the included `netlify.toml` publishes the repo root with sensible security and
caching headers.
