import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";

export type Link = {
  label: string;
  url: string;
};

export type Media = {
  type: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
};

export type PublicationEnhancement = {
  bibkey: string;
  preprint?: boolean;
  venueShort?: string;
  selected?: boolean;
  year?: number;
  summary?: string;
  topics?: string[];
  media?: Media;
  links?: Link[];
};

export type Author = {
  name: string;
  url?: string;
};

type AuthorProfile = Author & {
  aliases?: string[];
};

export type Publication = {
  key: string;
  type: string;
  title: string;
  authors: Author[];
  venue: string;
  year: number;
  date: string;
  doi?: string;
  url?: string;
  preprint: boolean;
  venueShort: string;
  selected: boolean;
  summary?: string;
  topics: string[];
  media?: Media;
  links: Link[];
  monogram: string;
};

type BibRecord = {
  key: string;
  type: string;
  fields: Record<string, string>;
};

export function loadYaml<T>(relativePath: string): T {
  const filename = relativePath.replace(/^\.\.\/data\//, "");
  return parseYaml(readFileSync(resolve(process.cwd(), "src", "data", filename), "utf8")) as T;
}

function findTopLevelComma(value: string): number {
  let depth = 0;
  let quoted = false;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') quoted = !quoted;
    if (quoted) continue;
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (char === "," && depth === 0) return index;
  }

  return -1;
}

function parseFields(source: string): Record<string, string> {
  const fields: Record<string, string> = {};
  let cursor = 0;

  while (cursor < source.length) {
    while (cursor < source.length && /[\s,]/.test(source[cursor])) cursor += 1;
    if (cursor >= source.length) break;

    const nameStart = cursor;
    while (cursor < source.length && /[A-Za-z0-9_-]/.test(source[cursor])) cursor += 1;
    const name = source.slice(nameStart, cursor).trim().toLowerCase();
    while (cursor < source.length && /\s/.test(source[cursor])) cursor += 1;

    if (!name || source[cursor] !== "=") {
      cursor += 1;
      continue;
    }

    cursor += 1;
    while (cursor < source.length && /\s/.test(source[cursor])) cursor += 1;

    let value = "";
    if (source[cursor] === "{") {
      cursor += 1;
      const start = cursor;
      let depth = 1;
      while (cursor < source.length && depth > 0) {
        if (source[cursor] === "{" && source[cursor - 1] !== "\\") depth += 1;
        if (source[cursor] === "}" && source[cursor - 1] !== "\\") depth -= 1;
        cursor += 1;
      }
      value = source.slice(start, cursor - 1);
    } else if (source[cursor] === '"') {
      cursor += 1;
      const start = cursor;
      while (cursor < source.length) {
        if (source[cursor] === '"' && source[cursor - 1] !== "\\") break;
        cursor += 1;
      }
      value = source.slice(start, cursor);
      cursor += 1;
    } else {
      const start = cursor;
      while (cursor < source.length && source[cursor] !== "," && source[cursor] !== "\n") cursor += 1;
      value = source.slice(start, cursor).trim();
    }

    fields[name] = value.trim();
  }

  return fields;
}

function parseBibtex(source: string): BibRecord[] {
  const records: BibRecord[] = [];
  let cursor = 0;

  while (cursor < source.length) {
    const at = source.indexOf("@", cursor);
    if (at < 0) break;

    let typeEnd = at + 1;
    while (typeEnd < source.length && /[A-Za-z]/.test(source[typeEnd])) typeEnd += 1;
    const type = source.slice(at + 1, typeEnd).toLowerCase();
    const open = source.slice(typeEnd).search(/[({]/);
    if (!type || open < 0) break;

    const openIndex = typeEnd + open;
    const openChar = source[openIndex];
    const closeChar = openChar === "{" ? "}" : ")";
    let depth = 1;
    let quoted = false;
    let escaped = false;
    let end = openIndex + 1;

    for (; end < source.length && depth > 0; end += 1) {
      const char = source[end];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') quoted = !quoted;
      if (quoted) continue;
      if (char === openChar) depth += 1;
      if (char === closeChar) depth -= 1;
    }

    const body = source.slice(openIndex + 1, end - 1);
    const firstComma = findTopLevelComma(body);
    if (firstComma > 0) {
      records.push({
        key: body.slice(0, firstComma).trim(),
        type,
        fields: parseFields(body.slice(firstComma + 1)),
      });
    }
    cursor = end;
  }

  return records;
}

const acuteMap: Record<string, string> = {
  a: "á", e: "é", i: "í", o: "ó", u: "ú", y: "ý",
  A: "Á", E: "É", I: "Í", O: "Ó", U: "Ú", Y: "Ý",
};

function cleanLatex(value = ""): string {
  return value
    .replace(/\\url\{([^}]+)\}/g, "$1")
    .replace(/\{\\'\{?([A-Za-z])\}?\}/g, (_, letter: string) => acuteMap[letter] ?? letter)
    .replace(/\\&/g, "&")
    .replace(/---/g, "—")
    .replace(/--/g, "–")
    .replace(/[{}]/g, "")
    .replace(/\\([A-Za-z]+)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCaseIfNeeded(value: string): string {
  if (value !== value.toLowerCase()) return value;
  return value.replace(/(^|[-\s])([a-z])/g, (_, boundary: string, letter: string) => `${boundary}${letter.toUpperCase()}`);
}

function formatAuthor(value: string): string {
  const cleaned = cleanLatex(value);
  if (!cleaned.includes(",")) return cleaned;
  const [last, first, suffix] = cleaned.split(",").map((part) => part.trim());
  return [titleCaseIfNeeded(first), titleCaseIfNeeded(last), suffix].filter(Boolean).join(" ");
}

function normalizeVenue(value: string, type: string): string {
  const venue = cleanLatex(value);
  if (/proceedings of the siggraph conference papers/i.test(venue) || /^siggraph conference papers$/i.test(venue)) {
    return "ACM SIGGRAPH Conference Papers";
  }
  if (!venue && type === "misc") return "Preprint";
  return venue || "Publication";
}

const monthNumbers: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function sortablePublicationDate(fields: Record<string, string>, year: number): string {
  const date = cleanLatex(fields.date);
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  const rawMonth = cleanLatex(fields.month).trim().toLowerCase();
  const numericMonth = Number(rawMonth);
  const month = Number.isInteger(numericMonth) && numericMonth >= 1 && numericMonth <= 12
    ? numericMonth
    : monthNumbers[rawMonth];

  // Unknown months sort after dated records within the same year.
  return year ? `${year}-${String(month ?? 13).padStart(2, "0")}-01` : "0000-13-01";
}

function makeMonogram(title: string): string {
  const ignored = new Set(["a", "an", "and", "for", "from", "in", "of", "on", "the", "to", "towards", "via", "with"]);
  return title
    .split(/\s+/)
    .filter((word) => !ignored.has(word.toLowerCase()))
    .slice(0, 3)
    .map((word) => word.replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase())
    .join("") || "R";
}

function mergeLinks(record: BibRecord, enhancement?: PublicationEnhancement): Link[] {
  const custom = enhancement?.links ?? [];
  const labels = new Set(custom.map((link) => link.label.toLowerCase()));
  const links = [...custom];
  const doi = cleanLatex(record.fields.doi);
  const sourceUrl = cleanLatex(record.fields.url);

  if (doi && !labels.has("paper")) {
    links.push({ label: "Paper", url: `https://doi.org/${doi}` });
  } else if (sourceUrl && !labels.has("paper") && !labels.has("source")) {
    links.push({ label: "Source", url: sourceUrl });
  }

  return links;
}

export function loadPublications(): Publication[] {
  const bibtex = readFileSync(resolve(process.cwd(), "works.bib"), "utf8");
  const records = parseBibtex(bibtex);
  const enhancements = loadYaml<PublicationEnhancement[]>("../data/publications.yml");
  const enhancementsByKey = new Map(enhancements.map((item) => [item.bibkey, item]));
  const authorProfiles = loadYaml<AuthorProfile[]>("../data/authors.yml");
  const authorUrls = new Map<string, string>();
  for (const profile of authorProfiles) {
    for (const name of [profile.name, ...(profile.aliases ?? [])]) authorUrls.set(name, profile.url ?? "");
  }

  return records
    .map((record) => {
      const enhancement = enhancementsByKey.get(record.key);
      const fields = record.fields;
      const sourceDate = cleanLatex(fields.date);
      const inferredYear = Number(cleanLatex(fields.year) || sourceDate.slice(0, 4));
      const year = enhancement?.year ?? (Number.isFinite(inferredYear) && inferredYear > 1900 ? inferredYear : 0);
      const title = cleanLatex(fields.title);
      const preprint = enhancement?.preprint ?? record.type === "misc";
      const authors = cleanLatex(fields.author)
        .split(/\s+and\s+/i)
        .filter(Boolean)
        .map(formatAuthor)
        .map((name) => ({ name, url: authorUrls.get(name) || undefined }));

      return {
        key: record.key,
        type: record.type,
        title,
        authors,
        venue: normalizeVenue(fields.booktitle || fields.journal, record.type),
        year,
        date: sortablePublicationDate(fields, year),
        doi: cleanLatex(fields.doi) || undefined,
        url: cleanLatex(fields.url) || undefined,
        preprint,
        venueShort: enhancement?.venueShort ?? `${preprint ? "Preprint" : normalizeVenue(fields.booktitle || fields.journal, record.type)} ${year}`,
        selected: enhancement?.selected ?? false,
        summary: enhancement?.summary,
        topics: enhancement?.topics ?? [],
        media: enhancement?.media,
        links: mergeLinks(record, enhancement),
        monogram: makeMonogram(title),
      } satisfies Publication;
    })
    .filter((publication) => publication.title && publication.authors.length > 0)
    .sort((left, right) => right.year - left.year || left.date.localeCompare(right.date) || left.title.localeCompare(right.title));
}
