# Personal Website Rebuild Plan

Last updated: 2026-09-04

This document is the implementation record for rebuilding Mengyu (Rachel) Chu's academic homepage. It is intentionally kept in the repository so that design decisions, content assumptions, unfinished items, and validation results can be reviewed later.

## 1. Objectives

- Present current personal and research information clearly in the first viewport.
- Add maintainable News, Publications, Funding, and Service sections.
- Generate the bibliographic part of Publications from `works.bib`.
- Allow each publication to have a media preview, project links, and a short custom description without editing page markup.
- Preserve the existing GitHub Pages identity, search verification file, and useful media assets.
- Produce a fast, responsive, accessible static site that remains easy to update.

## 2. Confirmed technical direction

- Framework: Astro with TypeScript, generating a static site.
- Styling: project-owned CSS with a small design-token layer; no inherited HTML5 UP theme and no jQuery dependency.
- Content: human-editable YAML and Markdown files.
- Publications: `works.bib` is the bibliographic source; a separate YAML file adds media, descriptions, tags, and links.
- Hosting target: the existing `RachelCmy.github.io` GitHub Pages site. A deployment workflow will be prepared, but no remote push or public deployment will be performed without an explicit final publishing decision.
- Language: English-first academic presentation, retaining Chinese names and official Chinese funding titles. The content model will not prevent adding a Chinese version later.

## 3. Information architecture

Navigation order:

1. About
2. News
3. Publications
4. Funding
5. Service
6. Contact

The page will remain a focused single-page academic profile. Publications are expected to be the longest section and will support Selected/All and year filtering without requiring a separate application backend.

## 4. Content sources

| Content | Source of truth | Notes |
| --- | --- | --- |
| Personal profile | `src/data/profile.yml` | Name, position, biography, research interests, links, contact |
| News | `src/data/news.yml` | Talks, activities, awards, organization, new papers |
| Funding | `src/data/fundings.yml` | Official title, agency, dates, role, optional description |
| Service | `src/data/service.yml` | Leadership, program committees, reviewing, institutional service |
| Publication metadata | `works.bib` | Title, authors, venue, date/year, DOI and source URL |
| Publication enhancements | `src/data/publications.yml` | Media, custom summary, project/paper/code/video links, tags, selected flag |

## 5. Publication behavior

Each publication will render as a responsive media card:

- Left: image or muted looping video with a poster/fallback.
- Right: title, author list, venue/year, custom description, and relevant links.
- Mengyu Chu's name is emphasized automatically.
- Entries are sorted newest first using `date`, then `year`.
- BibTeX-only entries still render when no enhanced content exists.
- Missing images use a deliberate neutral fallback rather than a broken image.
- Filters operate progressively: the unfiltered list remains readable if JavaScript is unavailable.

## 6. Visual direction

- Editorial academic style: warm off-white background, ink-colored text, and restrained Peking University red accents.
- Strong typographic hierarchy, generous whitespace, and compact factual metadata.
- Research media is the main visual material; decorative imagery will not compete with it.
- A sticky desktop navigation becomes a compact mobile header.
- Motion is subtle and disabled when the visitor requests reduced motion.

## 7. Execution checklist

### Phase A — Baseline and architecture

- [x] Inspect the current single-page HTML, old theme dependencies, assets, and `works.bib`.
- [x] Confirm that the repository is not currently an OpenAI Sites project.
- [x] Record this implementation plan before source changes.
- [x] Add the Astro project structure, scripts, and static build configuration.
- [x] Preserve current verification and legacy source while the new site is developed.

Acceptance: the project can start locally and render a recognizable first slice containing the real profile and representative publications.

### Phase B — Design foundation and first preview

- [x] Establish global color, typography, spacing, border, and motion tokens.
- [x] Implement the header/navigation and About hero using real profile content.
- [x] Add representative News and Publication content.
- [x] Start the development server and confirm a successful non-error response.
- [x] Open the first meaningful preview in Codex before broadening the implementation.

Acceptance: the new visual direction is evident without placeholder starter content.

### Phase C — Content system

- [x] Create editable profile, news, funding, service, and publication enhancement data files.
- [x] Migrate verified facts from the current site.
- [x] Add only user-supplied facts where official dates/details are not yet available; omit unknown optional fields.
- [x] Document every remaining factual detail that needs confirmation.

Acceptance: all requested sections render from data rather than hard-coded repeated markup.

### Phase D — Publications pipeline

- [x] Parse all entries in `works.bib` during the static build.
- [x] Normalize BibTeX names, braces, LaTeX accents, venues, dates, DOI links, and URLs.
- [x] Merge optional data from `src/data/publications.yml`.
- [x] Implement author highlighting, reverse chronological sorting, Selected/All filtering, and year filtering.
- [x] Reuse the current publication imagery and videos for matching works.
- [x] Provide helpful fallback media for papers without supplied assets.

Acceptance: every valid BibTeX entry appears exactly once and no publication requires editing the page component.

### Phase E — Quality and delivery

- [x] Add responsive behavior for desktop, tablet, and mobile.
- [x] Add semantic headings, focus states, alt text, reduced-motion behavior, and video fallbacks.
- [x] Add metadata, canonical URL, Open Graph fields, structured Person data, sitemap, and robots policy.
- [x] Add a GitHub Pages build/deployment workflow.
- [x] Run the production build and content integrity checks.
- [x] Review the generated output for missing links/assets and malformed sections.
- [x] Update this document with the actual implementation and test results.

Acceptance: a clean production build is generated and the repository contains clear update instructions.

## 8. Current assumptions and content requiring confirmation

These assumptions allow implementation to proceed without blocking. They must remain visibly marked in the content files until confirmed.

- `SCA 2026 Program Chair` will be included under Conference Leadership; the exact preferred conference name/link still needs confirmation.
- Funding will include the three user-specified programs, but official project titles, project numbers, dates, and the exact wording of each leadership role still need confirmation.
- Existing biography, affiliation, email, address, Google Scholar, GitHub, and YouTube details will be migrated from the current page.
- News can initially demonstrate the system with a clearly marked content-request item; real talks and activities require dates, titles, venues, locations, and links from the user.
- Publication media is now complete for all 22 records. Recent-paper thumbnails come from the corresponding official project, author, or paper page and are displayed without cropping.
- No CV file is currently present, so a CV button will not link to an invented file.

## 9. Maintenance workflow after launch

- Add a publication: append BibTeX to `works.bib`; optionally add one keyed entry to `src/data/publications.yml`.
- Add or change an author homepage: edit the author once in `src/data/authors.yml`; use `aliases` for abbreviated BibTeX forms.
- Add a talk/activity: append one item to `src/data/news.yml`.
- Add service: append one item to `src/data/service.yml`.
- Add funding: append one item to `src/data/fundings.yml`.
- Change biography/contact: edit `src/data/profile.yml`.
- Replace publication media: add the asset under `public/media/publications/` and update its path in `src/data/publications.yml`.

## 10. Completion record

Status: implementation complete; publishing awaits the repository owner's decision.

Completed on 2026-09-04:

- Replaced the old page architecture with an Astro static site while leaving the legacy root source available for reference.
- Added a responsive editorial design with About, News, Publications, Funding, Service, and Contact sections.
- Added YAML-based content files for routine edits and a focused component for publication cards.
- Implemented a local BibTeX parser and merged all 22 `works.bib` records with `src/data/publications.yml`.
- Added Selected/All and year filtering, automatic author emphasis, DOI fallbacks, media fallbacks, and viewport-aware video playback.
- Reused the existing research assets and added 14 official paper/project teasers so all 22 publication cards now have relevant visual media.
- Added the user-supplied funding programs and SCA 2026 Program Chair service entry.
- Generated and integrated a 1200×630 social-preview card matching the site's academic visual identity.
- Added canonical/Open Graph/X metadata, Person structured data, favicon, robots policy, sitemap, and preserved Google verification.
- Added `.github/workflows/deploy.yml` following the current official Astro GitHub Pages workflow.
- Added `scripts/verify-site.mjs` so future builds fail on missing BibTeX mappings, duplicate publication keys, missing local media, required-section regressions, or missing metadata.
- Replaced the placeholder README with content editing, local build, and publishing instructions.

Validation results:

- Astro diagnostics: 0 errors, 0 warnings, 0 hints.
- Production build: successful; one static page generated.
- Content verification: 22 of 22 BibTeX entries rendered exactly once.
- Required local media, sections, social metadata, structured data, sitemap, robots file, favicon, and Google verification file: present.
- Local development route: HTTP 200 with Funding, Service, and Open Graph metadata confirmed.

Publishing state:

- The production artifact is available locally under `dist/`.
- The GitHub Pages workflow is ready but has not been pushed or run against the public site.
- Before public release, the repository owner should confirm whether to publish this version and set GitHub Pages Source to **GitHub Actions** if it is not already selected.

## 11. Follow-up content checklist

The site is functional without these details, but the following additions will make it complete and authoritative:

- Exact SCA 2026 conference URL and preferred official role wording.
- Official title, project number, period, and precise role wording for each funding item.
- Real recent talk/activity entries: date, title, event, location, and optional link.
- Optional two-sentence descriptions for publications that do not yet have a custom `summary` in `src/data/publications.yml`.
- A current CV file, if a CV button should be added.
- Optional updated portrait if a higher-resolution image becomes available.

## 12. Revision log

### 2026-09-04 — Density and media-fit refinement

- Simplified Service into a plain, light-background list with compact year, role, organization, and category columns.
- Reduced publication card height from the original spacious presentation to a compact reading layout.
- Narrowed the publication media column and reduced card spacing, typography, and internal padding.
- Changed publication images and videos from cropped `cover` rendering to full-frame `contain` rendering; media may appear smaller, but no longer loses content at the edges.

### 2026-09-04 — Bio consolidation

- Removed the separate dark Research Focus section.
- Renamed About to Bio and consolidated the personal overview into one compact two-column section.
- Replaced the redundant biography paragraphs with Research Interests on the left and retained the academic background list on the right.
- Reduced the Bio heading and content typography for a quieter, denser presentation.

### 2026-09-05 — News density refinement

- Reduced the News section's vertical padding and heading gap.
- Narrowed the date column and tightened spacing between dates and content.
- Reduced each news row's padding, title size, and text spacing while keeping readable body text and clear row separators.

### 2026-09-05 — Publication links, authors, and thumbnails

- Verified all publication destinations against official project pages, author pages, arXiv/OpenReview, publisher pages, and official repositories.
- Added a Paper link for every one of the 22 publications; 17 publications also have a verified Project page, with Code, Video, Dataset, Results, or Supplement links where publicly available.
- Added `src/data/authors.yml` as the single source of truth for personal-homepage links and abbreviated-name aliases.
- Added 32 verified author profiles, producing 87 linked author-name instances across the rendered publication list while keeping Mengyu Chu visually emphasized.
- Added 14 recent-paper teaser/featured images from official project, author, or paper pages. Together with the existing media, all 22 publication cards now have a paper-specific image or video.
- Kept publication media on `object-fit: contain`, so wide teasers remain fully visible rather than being cropped.
- Extended the verification script to reject duplicate author names/aliases and malformed author URLs.
- Left papers without a separately published project site linked only to their authoritative Paper entry; no speculative project URLs were added.

Validation results for this refinement:

- Astro diagnostics: 0 errors, 0 warnings, 0 hints.
- Production build: successful; one static page generated.
- Publication verification: 22 of 22 records rendered, each with a Paper link and relevant media.
- Author-directory verification: 32 profiles valid; 87 linked author-name instances rendered.
- Local development route: HTTP 200 and the new publication destinations are present in the served page.

### 2026-09-05 — Preprints, venue badges, and homepage line

- Added the TDIB-E repository as the Code destination for *Floating-Point
  Robustness in Neural Differential Equations*.
- Split the publication index into 19 formally published works and 3 preprints;
  Preprints now has its own section and navigation anchor.
- Replaced year-only publication badges with concise venue-and-year labels such
  as `SIGGRAPH 2026`, `ICLR 2026`, and `IEEE TVCG 2021`.
- Added explicit `preprint` and `venueShort` metadata to the publication content
  model and extended verification to require venue labels and the Preprints
  anchor.
- Replaced the homepage opening line with: “From captured reality to
  simulation-ready worlds.” This foregrounds the recent real-to-sim direction
  without making a broader claim than the work supports.

Validation results for this refinement:

- Astro diagnostics: 0 errors, 0 warnings, 0 hints.
- Production build: successful; one static page generated.
- Publication verification: 22 records rendered, comprising 19 publications and
  3 preprints, with 22 venue badges.
- Local development route: HTTP 200.

### 2026-09-05 — Funding project titles and periods

- Extended each Funding record with a required concrete project title and
  project period, while retaining the broader program category and English
  program name.
- Added the three confirmed titles and periods: “面向空间智能的可微物理计算体系”
  (2026–2030), “动态内容的高保真生成和智能交互创作” (2024–2026), and
  “城市动态现象物理建模与仿真” (2023–2025).
- Updated Funding cards with a dedicated “项目题目” line and a more visible
  semantic time label.
- Extended site verification so future Funding entries must include both a
  concrete title and a period.

### 2026-09-05 — Section-heading cleanup

- Removed the generic right-aligned explanatory copy from Bio, News,
  Publications, Preprints, Funding, and Service.
- Removed the now-unused two-column heading layout so section titles no longer
  reserve an empty right-hand text area.
- Kept the short section kickers as the only supporting labels; these identify
  each section without repeating or narrating its contents.

### 2026-09-05 — Publication proportions and Funding simplification

- Widened publication and preprint media columns to 230–280 px and set their
  minimum height to 205 px, producing a broader, less vertically elongated
  thumbnail area while retaining full-frame `object-fit: contain` media.
- Removed the decorative 01/02/03 numbering from Funding cards and closed the
  unused space it occupied.
- Removed the “项目题目” label so each concrete Chinese project title appears
  directly beneath the program name.
- Added a `projectTitleEn` field to every Funding record. Empty values are hidden;
  completed English titles appear automatically beneath the Chinese title.

### 2026-09-05 — Service history expansion

- Added the supplied SIGGRAPH Asia, Eurographics, SCA, CAD/Graphics, Graphics
  Interface, and Pacific Graphics committee service.
- Consolidated recurring committee appointments into one final “Technical
  Program Committees” entry with a compact two-column venue/year list.
- Kept Associate Editor, Program Co-Chair, Workshop Co-Chair, Poster Co-Chair,
  and Chair Secretariat Member as separate entries because they represent
  distinct responsibilities.
- Simplified each rendered row to two columns—year and role/venue—and removed the
  repetitive category column from the public page.

### 2026-09-05 — News grouped by year

- Added automatically generated year controls with per-year item counts.
- Included the 2025 CAD/Graphics Workshop Co-Chair and SIGGRAPH Technical
  Workshop keynote updates in the grouped News data.
- The newest available year is selected on page load; choosing another year
  replaces the visible News rows without affecting publication filters.
- Preserved progressive enhancement: all News remains readable when JavaScript
  is unavailable.
- Extended site verification to require the News filtering hooks and every year
  represented in `news.yml`.

### 2026-09-05 — Cleaner section titles and sourced News links

- Removed the small pre-title labels from Bio, News, Publications, Preprints,
  Funding, Service, and Contact; the hero research-direction eyebrow remains.
- Added a relevant destination to all eight News records, prioritizing official
  journal, conference, schedule, and project pages.
- Made linked News titles open their sources in a new tab and added a restrained
  external-link indicator and hover/focus treatment.
- Extended verification so every News item must have a valid URL and obsolete
  section-kicker labels cannot reappear unnoticed.

### 2026-09-05 — Unified section titles and chronological publications

- Unified the Bio, News, Publications, Preprints, Funding, and Service titles on
  one serif type scale, positioned between the former compact News title and
  oversized Publications title.
- Reduced section top padding so the whitespace before every module title is
  tighter while preserving clear separation between content blocks.
- Changed publication ordering to year descending and, within each year,
  calendar date descending. Explicit `date` values take priority, then `month`;
  entries without either appear last in their year.
- Added April metadata to the 2025 and 2026 ICLR entries so they correctly
  follow the corresponding summer SIGGRAPH publications.
- Confirmed that `works.bib` remains the primary source for publication titles,
  authors, venues, years, dates, DOI, and source URLs; `publications.yml` only
  augments those records with display metadata, summaries, media, and extra
  links.
- Removed the YouTube profile link from the hero, contact links, and structured
  profile metadata.

### 2026-09-05 — Team page

- Added a dedicated, fully English `/team/` route and a shared site header so
  Team is available from both desktop and mobile navigation.
- Organized 25 people into VCL Faculty Collaborators, Frequent Collaborators,
  and one combined VCL Physics Group, preserving the supplied member order and
  alumni years.
- Linked verified personal or institutional profiles where available. Used the
  official VCL roster or DBLP profile only as a conservative fallback, and left
  uncertain same-name results unlinked.
- Added 12 portraits from personal or official university pages, compressed to
  local WebP assets. Members without a trustworthy portrait use a consistent
  initials treatment rather than an invented or mismatched photo.
- Added Team data and asset checks, route verification, homepage navigation
  verification, and a same-year descending-publication-order assertion.

### 2026-09-06 — Team relationship hierarchy

- Moved VCL Faculty Collaborators to the first position.
- Renamed Other Collaborators to Frequent Collaborators and placed the group in
  the middle of the page.
- Merged the former VCL Physics collaborators and Ph.D. Students sections into
  one VCL Physics Group at the end of the page.
- Added a verification assertion for this three-part order so future data edits
  cannot silently rearrange the intended hierarchy.

## 12. Social-preview generation record

The project-bound output is `public/og.png`. It was generated with the built-in ImageGen tool at 1200×630 pixels and visually checked for exact text.

Final prompt:

> Create a refined 1200×630 editorial academic identity card for Mengyu (Rachel) Chu's work in computational graphics and physics-enhanced learning. Use an abstract, restrained visual field suggesting smoke flow, particles, and Gaussian splats through delicate translucent wisps, sparse point clusters, and softly layered scientific forms. Use a premium research-editorial style with warm off-white, deep ink black, restrained Peking University red, and muted stone gray. Keep generous crop-safe margins and a clear two-level typographic hierarchy. Render exactly: “Mengyu (Rachel) Chu” and “Physics-enhanced learning for visual computing and simulation”. No institution logo, invented credentials, watermark, people, laboratory equipment, extra text, misspellings, or gibberish characters.
