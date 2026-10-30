# jovantomovic.com

Personal site. Static [Astro](https://astro.build) pages served by a single Cloudflare Worker
([static assets](https://developers.cloudflare.com/workers/static-assets/)), which also handles the contact form.

```
src/content/      ← everything you edit day to day (see below)
src/pages/        pages: /, /blog/, /blog/<post>/, /links/, /contact/, 404, feeds
src/components/   header, footer, figures
src/styles/       design tokens (dark + light) and shared styles
worker/index.ts   POST /api/contact → Turnstile check → email; everything else → static files
wrangler.jsonc    Worker config
```

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | install dependencies |
| `npm run dev` | Astro dev server at `localhost:4321` (pages only, drafts visible, no `/api`) |
| `npm run build` | build the site into `dist/` |
| `npm run preview` | build, then run the whole thing (site + Worker) at `localhost:8787` |
| `npm run check` | type-check pages and the Worker |
| `npm run deploy` | build and deploy with Wrangler (Workers Builds does this on every push to `main`) |

For `npm run preview`, copy `.dev.vars.example` to `.dev.vars`. It uses Turnstile's always-pass test
secret, and emails are not sent, only written to `.wrangler/tmp/email/`.

## Editing content

All content lives in `src/content/`. Every file is checked against a schema in `src/content.config.ts`:
a typo or a missing field stops the build with a message naming the file and the field.

### Profile: `src/content/profile.yaml`

Name, tagline, bio, email, CV link, the `now/` lines on the home page, and the optional highlighted
banner on `/links`.

### Links: `src/content/links.yaml`

One ordered list that drives `/links`. Add `contact: true` to also show a link under "elsewhere" on
`/contact`. Numbers and arrows are added automatically (→ this site or email, ↗ other sites, ↓ PDFs).

### Timeline: `src/content/timeline/*.md`

One file per entry. To add one, create a new file (any name; `YYYY-MM-DD-short-name.md` keeps them tidy):

```md
---
date: 2026-10-11          # YYYY, YYYY-MM or YYYY-MM-DD: sorting and the year group come from this
category: win             # edu | event | project | win
title: 3rd place — GDG DevFest Belgrade AI hackathon
tags: [ai, hackathon]     # optional
status: wip               # optional: planning | wip | done
link: /blog/pitchcheck/   # optional: makes the card clickable
end: 2023                 # optional: shows "2019 → 2023"
label: "2026-10"          # optional: text to show instead of the date
---
Built PitchCheck with a team of four over two days.
```

The text under the `---` is the description (Markdown, so links work).

### Blog: `src/content/blog/<slug>/index.mdx`

One folder per post; the folder name is the URL (`/blog/<slug>/`). Put images in the same folder.

~~~mdx
---
title: My post
description: One-line summary, shown in the list and in link previews.
date: 2026-10-20
tags: [solana, tools]
draft: true               # optional: hidden from the live site, visible in `npm run dev`
cover: ./cover.png        # optional: shown at the top and used as the link preview image
coverAlt: What the cover shows
---

import Figure from '../../../components/Figure.astro';
import CodeFigure from '../../../components/CodeFigure.astro';
import diagram from './diagram.png';

Plain image, optimized automatically:

![A screenshot of the debugger](./screenshot.png)

Image with a caption:

<Figure src={diagram} alt="How the pieces connect" caption="fig. 1 — overview" />

Code with a file name:

<CodeFigure file="fetch-tx.ts" lang="typescript">
```ts
console.log('hi');
```
</CodeFigure>
~~~

A plain `index.md` works too if you don't need `<Figure>` or `<CodeFigure>`. `## Headings` are numbered
01, 02, … and listed in the post's contents box.

### CV

Put the PDF in `public/` and point `cv` in `src/content/profile.yaml` (and the `cv` row in `links.yaml`) at it.

## Cloudflare setup (done once, for reference)

- **Email Routing** is on for jovantomovic.com. `contact@jovantomovic.com` forwards to the verified
  Gmail inbox, which is also where contact-form messages go (Worker secret `CONTACT_TO`).
- **Turnstile** widget "jovantomovic.com contact form": site key in `src/config.ts`, secret in the
  Worker secret `TURNSTILE_SECRET`. To rotate: `npx wrangler secret put TURNSTILE_SECRET`.
- **Domains**: `jovantomovic.com/*` and `www.jovantomovic.com/*` are Worker routes (`routes` in
  `wrangler.jsonc`). The zone's existing proxied DNS records stay as they are; other subdomains
  (`links.`, `github.`, `dev.`, …) and their redirect rules are unaffected.
- **Workers Builds**: Workers & Pages → `jovantomovic` → Settings → Builds is connected to this repo.
  Build command `npm run build`, deploy command `npx wrangler deploy`. Every push to `main` deploys.
