import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const clientDirectory = path.join(repositoryRoot, "build", "client");

function readQuotedAttribute(tag, attributeName) {
  const match = tag.match(
    new RegExp(`\\s${attributeName}\\s*=\\s*(["'])(.*?)\\1`, "i"),
  );

  return match?.[2];
}

function hasMetaToken(html, metaName, token) {
  const normalizedName = metaName.toLowerCase();
  const normalizedToken = token.toLowerCase();

  return [...html.matchAll(/<meta\b[^>]*>/gi)].some(([tag]) => {
    if (readQuotedAttribute(tag, "name")?.toLowerCase() !== normalizedName) {
      return false;
    }

    return Boolean(
      readQuotedAttribute(tag, "content")
        ?.split(/[\s,]+/)
        .some((value) => value.toLowerCase() === normalizedToken),
    );
  });
}

function readDocumentTitle(html) {
  return html.match(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i)?.[1].trim();
}

const expectedDocuments = new Map([
  [
    "index.html",
    {
      title: "Portfolio foundation",
      heading: "Portfolio foundation",
      canonical: "https://rahuly.in/",
    },
  ],
  [
    "projects/index.html",
    {
      title: "Projects | Portfolio foundation",
      heading: "Projects",
      canonical: "https://rahuly.in/projects",
    },
  ],
  [
    "writings/index.html",
    {
      title: "Writings | Portfolio foundation",
      heading: "Writings",
      canonical: "https://rahuly.in/writings",
    },
  ],
]);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(absolutePath)));
    } else {
      files.push(absolutePath);
    }
  }

  return files;
}

async function requireNonEmptyFile(relativePath) {
  const absolutePath = path.join(clientDirectory, relativePath);
  const fileStat = await stat(absolutePath);

  if (!fileStat.isFile() || fileStat.size === 0) {
    throw new Error(`Expected a non-empty file at ${relativePath}.`);
  }

  return readFile(absolutePath, "utf8");
}

const generatedFiles = await listFiles(clientDirectory);
const generatedHtml = generatedFiles
  .filter((file) => file.endsWith(".html"))
  .map((file) => path.relative(clientDirectory, file))
  .sort();
const expectedHtml = [
  "__spa-fallback.html",
  ...expectedDocuments.keys(),
].sort();

if (JSON.stringify(generatedHtml) !== JSON.stringify(expectedHtml)) {
  throw new Error(
    `Unexpected static HTML inventory. Expected ${expectedHtml.join(", ")}; received ${generatedHtml.join(", ")}.`,
  );
}

for (const [relativePath, expected] of expectedDocuments) {
  const html = await requireNonEmptyFile(relativePath);
  const actualTitle = readDocumentTitle(html);

  if (actualTitle !== expected.title) {
    throw new Error(
      `Expected the title "${expected.title}" in ${relativePath}; received ${actualTitle ? `"${actualTitle}"` : "no title"}.`,
    );
  }

  if (!html.includes(`>${expected.heading}</h1>`)) {
    throw new Error(
      `Expected the ${expected.heading} heading in ${relativePath}.`,
    );
  }

  if (!html.includes(`rel="canonical" href="${expected.canonical}"`)) {
    throw new Error(`Expected the canonical URL in ${relativePath}.`);
  }

  if (hasMetaToken(html, "robots", "noindex")) {
    throw new Error(
      `Expected ${relativePath} to remain indexable, but found a robots directive containing noindex.`,
    );
  }

  const assetReferences = [
    ...html.matchAll(/(?:href|src)="(\/assets\/[^"?#]+)["?#]/g),
    ...html.matchAll(/(?:href|src)="(\/assets\/[^"]+)"/g),
  ].map((match) => match[1]);

  if (assetReferences.length === 0) {
    throw new Error(`Expected generated asset references in ${relativePath}.`);
  }

  for (const assetReference of new Set(assetReferences)) {
    await requireNonEmptyFile(assetReference.slice(1));
  }
}

const spaFallback = await requireNonEmptyFile("__spa-fallback.html");

if (!spaFallback.includes('role="status">Loading page.</p>')) {
  throw new Error(
    "The SPA fallback does not contain the expected loading state.",
  );
}

if (!hasMetaToken(spaFallback, "robots", "noindex")) {
  throw new Error(
    "Expected __spa-fallback.html to contain a robots directive with the noindex token.",
  );
}

const generatedText = await Promise.all(
  generatedFiles
    .filter((file) => /\.(?:css|html|js)$/.test(file))
    .map((file) => readFile(file, "utf8")),
);
const forbiddenLegacyMarkers = ["quasar", "pinia", "vue-router"];

for (const marker of forbiddenLegacyMarkers) {
  if (
    generatedText.some((contents) => contents.toLowerCase().includes(marker))
  ) {
    throw new Error(`Found the legacy marker ${marker} in the static build.`);
  }
}

console.log(
  `Verified ${expectedDocuments.size} prerendered routes and the SPA fallback in build/client.`,
);
