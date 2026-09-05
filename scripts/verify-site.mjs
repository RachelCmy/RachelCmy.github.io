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

for (const requiredFile of ["og.png", "favicon.svg", "robots.txt", "sitemap.xml", "googlec7da58c40c184745.html"]) {
  if (!existsSync(resolve(root, "dist", requiredFile))) fail(`Missing generated public file: ${requiredFile}`);
}

if (!html.includes('property="og:image"')) fail("Open Graph image metadata is missing.");
if (!html.includes('type="application/ld+json"')) fail("Person structured data is missing.");

console.log(`[site verification] ${bibKeys.length} publications rendered; ${authorProfiles.length} author profiles, content keys, local media, sections, and metadata verified.`);
