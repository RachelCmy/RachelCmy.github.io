import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";

const root = process.cwd();
const fail = (message) => {
  throw new Error(`[site verification] ${message}`);
};

const bibSource = readFileSync(resolve(root, "works.bib"), "utf8");
const bibKeys = [...bibSource.matchAll(/@\w+\s*[({]\s*([^,\s]+)\s*,/g)].map((match) => match[1]);
if (bibKeys.length === 0) fail("No BibTeX entries were found in works.bib.");

const enhancements = parseYaml(readFileSync(resolve(root, "src/data/publications.yml"), "utf8"));
const authorProfiles = parseYaml(readFileSync(resolve(root, "src/data/authors.yml"), "utf8"));
const fundings = parseYaml(readFileSync(resolve(root, "src/data/fundings.yml"), "utf8"));
const news = parseYaml(readFileSync(resolve(root, "src/data/news.yml"), "utf8"));
const teamGroups = parseYaml(readFileSync(resolve(root, "src/data/team.yml"), "utf8"));
const enhancementKeys = enhancements.map((item) => item.bibkey);
const duplicateKeys = enhancementKeys.filter((key, index) => enhancementKeys.indexOf(key) !== index);
if (duplicateKeys.length > 0) fail(`Duplicate publication enhancement keys: ${[...new Set(duplicateKeys)].join(", ")}`);

const unknownKeys = enhancementKeys.filter((key) => !bibKeys.includes(key));
if (unknownKeys.length > 0) fail(`Publication enhancements do not match works.bib: ${unknownKeys.join(", ")}`);

const unconfiguredKeys = bibKeys.filter((key) => !enhancementKeys.includes(key));
if (unconfiguredKeys.length > 0) fail(`BibTeX entries need a publications.yml entry: ${unconfiguredKeys.join(", ")}`);

for (const publication of enhancements) {
  if (!publication.venueShort?.trim()) fail(`Missing venueShort for ${publication.bibkey}`);
  const mediaPaths = [publication.media?.src, publication.media?.poster].filter(Boolean);
  for (const mediaPath of mediaPaths) {
    if (!mediaPath.startsWith("/")) fail(`Media path for ${publication.bibkey} must start with /: ${mediaPath}`);
    if (!existsSync(resolve(root, "public", mediaPath.slice(1)))) fail(`Missing media for ${publication.bibkey}: ${mediaPath}`);
  }

  for (const link of publication.links ?? []) {
    try {
      new URL(link.url);
    } catch {
      fail(`Invalid ${link.label} URL for ${publication.bibkey}: ${link.url}`);
    }
  }
}

const authorNames = authorProfiles.flatMap((author) => [author.name, ...(author.aliases ?? [])]);
const duplicateAuthorNames = authorNames.filter((name, index) => authorNames.indexOf(name) !== index);
if (duplicateAuthorNames.length > 0) fail(`Duplicate author names or aliases: ${[...new Set(duplicateAuthorNames)].join(", ")}`);
for (const author of authorProfiles) {
  try {
    new URL(author.url);
  } catch {
    fail(`Invalid author URL for ${author.name}: ${author.url}`);
  }
}

for (const funding of fundings) {
  if (!funding.projectTitleZh?.trim()) fail(`Missing projectTitleZh for funding: ${funding.titleZh}`);
  if (!Object.hasOwn(funding, "projectTitleEn")) fail(`Missing projectTitleEn placeholder for funding: ${funding.titleZh}`);
  if (!funding.period?.trim()) fail(`Missing period for funding: ${funding.titleZh}`);
}

const outputPath = resolve(root, "dist/index.html");
if (!existsSync(outputPath)) fail("dist/index.html does not exist; run the production build first.");
const html = readFileSync(outputPath, "utf8");
const renderedCards = [...html.matchAll(/<article[^>]*data-publication/g)].length;
if (renderedCards !== bibKeys.length) fail(`Rendered ${renderedCards} publication cards for ${bibKeys.length} BibTeX entries.`);

for (const anchor of ["about", "news", "publications", "preprints", "funding", "service", "contact"]) {
  if (!html.includes(`id="${anchor}"`)) fail(`Missing required section: ${anchor}`);
}

const newsYears = [...new Set(news.map((item) => String(item.date)))];
for (const item of news) {
  if (!item.link) fail(`Missing link for News item: ${item.title}`);
  try {
    new URL(item.link);
  } catch {
    fail(`Invalid News URL for ${item.title}: ${item.link}`);
  }
}
for (const year of newsYears) {
  if (!html.includes(`data-news-year="${year}"`)) fail(`Missing News year control: ${year}`);
}
if (!html.includes("data-news-item")) fail("News year filtering hooks are missing.");
if (html.includes("section-kicker")) fail("Obsolete section kicker labels are still rendered.");

for (const requiredFile of ["og.png", "favicon.svg", "robots.txt", "sitemap.xml", "googlec7da58c40c184745.html"]) {
  if (!existsSync(resolve(root, "dist", requiredFile))) fail(`Missing generated public file: ${requiredFile}`);
}

if (!html.includes('property="og:image"')) fail("Open Graph image metadata is missing.");
if (!html.includes('type="application/ld+json"')) fail("Person structured data is missing.");

const teamOutputPath = resolve(root, "dist/team/index.html");
if (!existsSync(teamOutputPath)) fail("dist/team/index.html does not exist.");
const teamHtml = readFileSync(teamOutputPath, "utf8");
if (!html.includes('href="/team/"')) fail("The homepage navigation is missing the Team route.");
if (!html.includes(">People</a>")) fail("The homepage navigation is missing the People label.");
if (!teamHtml.includes("<h1 id=\"team-title\">People</h1>")) fail("The People page title is missing.");
if (teamHtml.includes("team-group-index")) fail("Obsolete numbered People section labels are still rendered.");

const teamIds = new Set();
const teamNames = new Set();
const expectedTeamOrder = ["vcl-faculty", "frequent-collaborators", "vcl-physics", "undergraduate-students"];
if (teamGroups.map((group) => group.id).join(",") !== expectedTeamOrder.join(",")) {
  fail("Team groups are not in the intended faculty, collaborators, physics-group, undergraduate order.");
}
for (const group of teamGroups) {
  if (!group.id?.trim() || teamIds.has(group.id)) fail(`Invalid or duplicate Team group id: ${group.id}`);
  teamIds.add(group.id);
  if (!group.title?.trim() || !group.description?.trim()) fail(`Incomplete Team group: ${group.id}`);
  if (!teamHtml.includes(`id="${group.id}"`)) fail(`Team group is not rendered: ${group.id}`);

  for (const member of group.members ?? []) {
    if (!member.name?.trim() || !member.role?.trim()) fail(`Incomplete Team member in ${group.id}`);
    if (teamNames.has(member.name)) fail(`Duplicate Team member: ${member.name}`);
    teamNames.add(member.name);
    if (!teamHtml.includes(member.name)) fail(`Team member is not rendered: ${member.name}`);

    for (const field of ["url", "imageSource"]) {
      if (!member[field]) continue;
      try {
        new URL(member[field]);
      } catch {
        fail(`Invalid ${field} for Team member ${member.name}: ${member[field]}`);
      }
    }

    if (member.image) {
      if (!member.image.startsWith("/")) fail(`Team image must start with /: ${member.image}`);
      if (!existsSync(resolve(root, "public", member.image.slice(1)))) fail(`Missing Team image for ${member.name}: ${member.image}`);
    }
  }
}

const siggraph2026 = html.indexOf("LagrangianSplats: Divergence-Free Transport");
const iclr2026 = html.indexOf("FieryGS: In-the-Wild Fire Synthesis");
if (siggraph2026 < 0 || iclr2026 < 0 || siggraph2026 > iclr2026) {
  fail("Publications within 2026 are not ordered by month descending.");
}

console.log(`[site verification] ${bibKeys.length} publications and ${teamNames.size} Team members rendered; ${authorProfiles.length} author profiles, content keys, local media, routes, sections, and metadata verified.`);
