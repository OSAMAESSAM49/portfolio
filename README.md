# Dr. Osama Essam — Personal Brand Website

Static site: plain HTML, CSS and vanilla JavaScript. No build step, no frameworks.

```
index.html            all page content (sections are commented)
css/style.css         design tokens + base styles
css/responsive.css    laptop / tablet / mobile layouts
js/main.js            CONFIG (links) + interactions
assets/images/        optimized portraits + og-image
assets/icons/         favicon
assets/documents/     optional local PDF (empty — portfolio is on Canva)
```

## Editing

**Links & contact details** — top of `js/main.js`:

- `PORTFOLIO_URL` — your Canva link or public PDF link. Every portfolio button uses it.
  Use a **view-only** link (Canva → Share → "Public view link"), never an edit link.
  A direct `.pdf` link also enables the **Preview Portfolio** modal on desktop.
- `email`, `whatsapp`, `phone`, `instagram`, `linkedin`, `youtube` — empty values are hidden on the page.

**Text content** (About, Skills, Journey, Education) lives in `index.html`, taken from the portfolio PDF.

**Accent colour** — `--lime` in `css/style.css`.

**Live site** — https://osamaessam49.github.io/portfolio/ (GitHub Pages, `main` branch). If you move to a custom domain, update the canonical/Open Graph URLs in the `<head>` of `index.html`.

## Run locally

Any static server works, e.g. `npx serve .` or VS Code Live Server, then open the printed URL.

## Deploy

Netlify / Vercel: drag the folder in (or connect the repo); no build command, publish directory = root.

The portfolio is hosted on Canva, so no large files ship with the site. If you ever add a PDF to
`assets/documents/`, keep it under 100 MB (GitHub's file limit). The folders `header image/`, `my portfolio pdf/`, `reference/` and `colors/` are
source material and don't need to be deployed.
