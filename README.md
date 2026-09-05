# Mengyu (Rachel) Chu — Academic Homepage

This repository contains the source for <https://rachelcmy.github.io>.

The site is built with Astro and generated as static HTML for GitHub Pages. Its repeated content is kept outside the page template so routine updates do not require editing HTML.

## Updating content

| Task | File |
| --- | --- |
| Bio, contact, research interests | `src/data/profile.yml` |
| Talks, activities, awards, and news | `src/data/news.yml` |
| Funding | `src/data/fundings.yml` |
| Academic service | `src/data/service.yml` |
| Publication title, authors, venue, DOI | `works.bib` |
| Publication media, summary, tags, links | `src/data/publications.yml` |
| Author homepage links and aliases | `src/data/authors.yml` |
| Team groups, roles, links, and portraits | `src/data/team.yml` |

### Add a publication

1. Add the BibTeX entry to `works.bib`. Include `date = {YYYY-MM-DD}` when
   available, or at least `month`, so publications within the same year follow
   newest-first calendar order; records without either are placed last in that
   year.
2. Add a matching item to `src/data/publications.yml` using the same BibTeX key.
3. Add a compact `venueShort` label for the card badge (for example,
   `SIGGRAPH 2026`), and set `preprint: true` while the work belongs in the
   separate Preprints section.
4. Optionally add `selected`, `summary`, `topics`, `media`, and `links` fields.
5. Place local images or videos under `public/media/publications/`.
6. Run the build. The verification script reports duplicate/missing keys and missing local media.

A publication without custom media is rendered with a designed fallback panel. A publication without a custom Paper link uses its DOI or source URL automatically.

Author links are maintained once in `src/data/authors.yml`. Add an abbreviated BibTeX form to `aliases` when the same author appears with initials in another record.

### Update the Team page

Edit `src/data/team.yml` to add, remove, or regroup people. A member needs
`name` and `role`; `url`, `image`, `imageSource`, and `objectPosition` are
optional. Keep locally stored portraits under `public/media/team/` and retain
the public source URL in `imageSource`. Without a verified portrait, the card
automatically uses the person's initials.

### Add news

Append an item to `src/data/news.yml`:

```yaml
- date: 2026-09-04
  type: Talk
  title: Title of the talk
  detail: Event name · City or online
  link: https://example.com
```

News year buttons are generated automatically from `date`. The latest year is
selected by default; no navigation configuration is required. Every News item
must include a relevant `link`, preferably an official event, journal, project,
or paper page.

### Add funding or service

Copy an existing item in `src/data/fundings.yml` or `src/data/service.yml` and replace its values. Each funding item requires its program category (`titleZh` and `titleEn`), concrete Chinese and English project titles (`projectTitleZh` and `projectTitleEn`), role, and period. If an official English title is not ready, keep `projectTitleEn` as an empty string; empty English titles are not rendered. Omit unknown optional fields such as `projectNumber` instead of inserting placeholder facts.

For recurring committee service, use a single `Technical Program Committees`
record with an `items` list of venue/year pairs. Keep distinct roles, such as
Program Co-Chair or Poster Co-Chair, as separate records.

## Local development

Use a supported Node.js release and pnpm:

```bash
pnpm install
pnpm dev
```

The production check is:

```bash
pnpm build
```

It performs Astro type/template checks, builds the static site, and verifies publication coverage, local media, required sections, and metadata.

## Publishing

`.github/workflows/deploy.yml` follows Astro's official GitHub Pages deployment flow. In the repository's GitHub Pages settings, select **GitHub Actions** as the publishing source. A push to `main` then builds and deploys the site.

See `SITE_REBUILD_PLAN.md` for implementation decisions, validation results, and content still awaiting confirmation.
