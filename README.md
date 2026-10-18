# Harborline — marketing site

Static, dependency-free single page. No build step, no framework.

```
.                        # repo root = publish directory (staticPublishPath: .)
├── render.yaml              # Render blueprint (static site + security/cache headers)
├── README.md
├── index.html               # Home: SEO head, canonical, OG/Twitter, icons, manifest
├── 404.html
├── platform/  company/  legal/  sign-in/  settings/
├── site.webmanifest  sitemap.xml  robots.txt
├── css/styles.css
├── js/theme.js  js/main.js
└── assets/ (og-image.png, logo/)
```

## Run locally

```bash
python3 -m http.server 5173
# http://localhost:5173
```

## Deploy to Render

**Blueprint (recommended)** — push this repo, then in Render choose *New → Blueprint* and pick it up from `render.yaml`.

**Manual** — *New → Static Site*:
- Build command: *(leave empty)*
- Publish directory: `.` (repo root)

## Before launch

- Replace every block marked "Placeholder" (customers, careers, security details, legal text, audit date) with real content, or remove the page and its links.
- Confirm the phone number, address and the McLeod / Turvo / AscendTMS, DAT and Truckstop integrations are accurate.
- Point the pilot and sign-in forms at real endpoints in `js/main.js` (and add the origins to `connect-src`).
- Check that Render serves `404.html` for unknown paths; if not, add a custom 404 rule in the dashboard.

- Replace `https://harborline.example.com` with the real domain in `index.html` (canonical, og:url, og:image, twitter:image), `sitemap.xml` and `robots.txt`.
- Run PageSpeed Insights and the Facebook/LinkedIn share debuggers on the live URL.

## Notes

- Breakpoints: fluid throughout via `clamp()` and auto-fit grids; the only hard breaks are the nav at 880px and small-screen tweaks at 640px.
- Fonts load from Google Fonts. To go fully self-hosted, drop the woff2 files in `site/fonts/`, replace the `<link>` in `index.html` with `@font-face` rules, and tighten `font-src` in `render.yaml` to `'self'`.
- The pilot form is client-side only — point it at your CRM endpoint in `js/main.js` (and add that origin to `connect-src`).
- Accessibility: skip link, 44px+ targets, visible focus rings, `aria-expanded` on nav/FAQ, `role="status"` on form feedback. Text meets WCAG AA on every surface.

## Changelog

- 2026-10-17 — File normalization: favicon set (SVG + PNG 32, apple-touch-icon, 192/512, maskable 512), og-image 1200×630, site.webmanifest, sitemap.xml, robots.txt with sitemap line, full OG/Twitter head, HSTS + Permissions-Policy + content-type/cache headers. Removed root favicon.svg (now assets/logo/logo-mark.svg, metadata stripped).
- 2026-10-17 · Multipage site and antislop pass. Pages for every footer and menu link (4 platform, 3 company, 4 legal, sign in, 404). Platform and Company dropdown submenus with keyboard support; mobile drawer opens over the page with a backdrop. Header is fixed on inner pages and drops in on Home after the hero. One breadcrumb bar with a back button on every page except Home. Back-to-top button. Removed fabricated metrics, customer logo bar, testimonial, uptime figure, "most picked" flag and timing claims; replaced every em dash; demo data labelled as examples. Removed the catch-all rewrite in render.yaml so inner pages resolve. CSS/JS bumped to v=3.
- 2026-10-17 · Menu and footer links point at real files (`…/index.html`) so they open locally and in previews. Header pilot button removed. Settings page (Light, Dark, High contrast; three text sizes) added to the menu, applied before first paint by `js/theme.js`. Footer legal row: Terms and conditions, Privacy policy, Cookie settings (dialog), DPA, Accessibility. Back to top follows the Stepwright pattern: floating button after 600px, docked button on the footer edge once the footer is in view. CSS/JS v=4.
- 2026-10-18 · Motion and polish pass. Hero load feed replaces the board card; brass grid floor. Featured pricing card with gradient border and spring lift; "Most popular" pill. Platform bento grid with hover/focus dimming (:has() plus pointer fallback). Marker highlight on hero and section headings; line-by-line reveal on leads and list items. Moving-border CTA on the pilot form. Sign-in: floating-label fields, press feedback, filled header Sign in button. The js-anim flag moved from an inline script into theme.js to comply with the CSP (script-src 'self'). og-image redrawn to match the hero. CSS v=7, theme.js v=5, main.js v=6.
