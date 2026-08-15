import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TextDecoder } from "node:util";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const clientDirectory = path.join(repositoryRoot, "build", "client");

function normalizedExtension(filePath) {
  return path.extname(filePath).toLowerCase();
}

function relativeGeneratedPath(filePath) {
  return path.relative(clientDirectory, filePath).replaceAll(path.sep, "/");
}

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

function readCanonicalHrefs(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .filter(([tag]) =>
      readQuotedAttribute(tag, "rel")
        ?.split(/\s+/)
        .some((value) => value.toLowerCase() === "canonical"),
    )
    .map(([tag]) => readQuotedAttribute(tag, "href"))
    .filter((href) => href !== undefined);
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertExactRecordFields(value, expectedFields, relativePath, label) {
  if (!isRecord(value)) {
    throw new Error(`Expected ${label} in ${relativePath} to be an object.`);
  }

  const expected = [...expectedFields].sort();
  const actual = Object.keys(value).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Unexpected ${label} fields in ${relativePath}. Expected ${expected.join(", ")}; received ${actual.join(", ")}.`,
    );
  }
}

function assertNonEmptyTrimmedString(value, relativePath, fieldPath) {
  if (typeof value !== "string" || value === "" || value !== value.trim()) {
    throw new Error(
      `Expected ${fieldPath} in ${relativePath} to be a non-empty trimmed string.`,
    );
  }
}

function assertSeoContract(value, expected, relativePath) {
  assertExactRecordFields(
    value,
    ["canonicalPath", "description", "title"],
    relativePath,
    "SEO",
  );

  for (const [field, expectedValue] of Object.entries(expected)) {
    if (value[field] !== expectedValue) {
      throw new Error(
        `Expected seo.${field} in ${relativePath} to equal ${JSON.stringify(expectedValue)}; received ${JSON.stringify(value[field])}.`,
      );
    }
  }
}

// React Router's bundled turbo-stream-v2 encoder uses exactly these negative
// values. None is valid in this milestone's public loader contracts.
const flattenedDataSentinels = new Map([
  [-1, "sparse array hole"],
  [-2, "NaN"],
  [-3, "negative Infinity"],
  [-4, "negative zero"],
  [-5, "null"],
  [-6, "positive Infinity"],
  [-7, "undefined"],
]);

function decodeRouteLoaderData(contents, relativePath, routeId) {
  let flattened;

  try {
    flattened = JSON.parse(contents);
  } catch (error) {
    throw new Error(`Could not parse route data in ${relativePath}.`, {
      cause: error,
    });
  }

  if (!Array.isArray(flattened)) {
    throw new Error(`Expected flattened route data in ${relativePath}.`);
  }

  if (flattened.length === 0) {
    throw new Error(
      `Expected non-empty flattened route data in ${relativePath}.`,
    );
  }

  const decoded = new Map();
  const decodeReference = (reference, referencePath) => {
    if (!Number.isInteger(reference)) {
      throw new Error(
        `Found a non-integer route-data reference in ${relativePath} at ${referencePath}.`,
      );
    }

    if (reference < 0) {
      const sentinelMeaning = flattenedDataSentinels.get(reference);
      if (sentinelMeaning === undefined) {
        throw new Error(
          `Found unsupported negative route-data reference ${reference} in ${relativePath} at ${referencePath}.`,
        );
      }

      throw new Error(
        `Route data in ${relativePath} uses ${sentinelMeaning} sentinel ${reference} at ${referencePath}; sentinels are not permitted in public loader data.`,
      );
    }

    if (reference >= flattened.length) {
      throw new Error(
        `Found out-of-bounds route-data reference ${reference} in ${relativePath} at ${referencePath}; flattened data has ${flattened.length} entries.`,
      );
    }

    if (decoded.has(reference)) return decoded.get(reference);

    const encoded = flattened[reference];
    if (Array.isArray(encoded)) {
      const result = [];
      decoded.set(reference, result);
      for (const [index, childReference] of encoded.entries()) {
        result.push(
          decodeReference(childReference, `${referencePath}[${String(index)}]`),
        );
      }
      return result;
    }

    if (isRecord(encoded)) {
      const result = {};
      decoded.set(reference, result);

      for (const [encodedKey, encodedValue] of Object.entries(encoded)) {
        if (!/^_\d+$/.test(encodedKey)) {
          throw new Error(
            `Found unsupported route-data key ${encodedKey} in ${relativePath} at ${referencePath}.`,
          );
        }

        const key = decodeReference(
          Number(encodedKey.slice(1)),
          `${referencePath}.<key:${encodedKey}>`,
        );
        if (typeof key !== "string") {
          throw new Error(
            `Found a non-string route-data key in ${relativePath} at ${referencePath}.`,
          );
        }
        result[key] = decodeReference(encodedValue, `${referencePath}.${key}`);
      }

      return result;
    }

    decoded.set(reference, encoded);
    return encoded;
  };

  const root = decodeReference(0, "data");
  const routeEntry = isRecord(root) ? root[routeId] : undefined;
  const loaderData = isRecord(routeEntry) ? routeEntry["data"] : undefined;

  if (!isRecord(loaderData)) {
    throw new Error(
      `Expected object loader data for ${routeId} in ${relativePath}.`,
    );
  }

  return loaderData;
}

function findPropertyPath(value, propertyNames, pathLabel = "data", seen) {
  if (typeof value !== "object" || value === null) return undefined;

  const visited = seen ?? new WeakSet();
  if (visited.has(value)) return undefined;
  visited.add(value);

  if (Array.isArray(value)) {
    for (const [index, child] of value.entries()) {
      const found = findPropertyPath(
        child,
        propertyNames,
        `${pathLabel}.${String(index)}`,
        visited,
      );
      if (found !== undefined) return found;
    }
    return undefined;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${pathLabel}.${key}`;
    if (propertyNames.has(key)) return childPath;
    const found = findPropertyPath(child, propertyNames, childPath, visited);
    if (found !== undefined) return found;
  }

  return undefined;
}

function findUnpublishedPath(value, pathLabel = "data", seen) {
  if (typeof value !== "object" || value === null) return undefined;

  const visited = seen ?? new WeakSet();
  if (visited.has(value)) return undefined;
  visited.add(value);

  if (Array.isArray(value)) {
    for (const [index, child] of value.entries()) {
      const found = findUnpublishedPath(
        child,
        `${pathLabel}.${String(index)}`,
        visited,
      );
      if (found !== undefined) return found;
    }
    return undefined;
  }

  if (
    value["publicationStatus"] === "draft" ||
    value["publicationStatus"] === "archived"
  ) {
    return `${pathLabel}.publicationStatus`;
  }

  for (const [key, child] of Object.entries(value)) {
    const found = findUnpublishedPath(child, `${pathLabel}.${key}`, visited);
    if (found !== undefined) return found;
  }

  return undefined;
}

const expectedDocuments = new Map([
  [
    "index.html",
    {
      title: "Rahul Yadav | Senior Backend and Full-Stack Engineer",
      heading: "Rahul Yadav",
      canonical: "https://rahuly.in/",
    },
  ],
  [
    "projects/index.html",
    {
      title: "Projects | Rahul Yadav",
      heading: "Projects",
      canonical: "https://rahuly.in/projects",
    },
  ],
  [
    "writings/index.html",
    {
      title: "Writings | Rahul Yadav",
      heading: "Writings",
      canonical: "https://rahuly.in/writings",
    },
  ],
]);

async function listGeneratedEntries(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const generatedEntries = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    generatedEntries.push({
      absolutePath,
      isDirectory: entry.isDirectory(),
      relativePath: path.relative(clientDirectory, absolutePath),
    });

    if (entry.isDirectory()) {
      generatedEntries.push(...(await listGeneratedEntries(absolutePath)));
    }
  }

  return generatedEntries;
}

async function requireNonEmptyFile(relativePath) {
  const absolutePath = path.join(clientDirectory, relativePath);
  const fileStat = await stat(absolutePath);

  if (!fileStat.isFile() || fileStat.size === 0) {
    throw new Error(`Expected a non-empty file at ${relativePath}.`);
  }

  return readFile(absolutePath, "utf8");
}

const forbiddenPrivateMarkers = [
  "references/private",
  "rahul_yadav_senior_backend_engineer.docx.pdf",
  "rahul_yadav_senior_full_stack_engineer.docx.pdf",
  "resume-comparison.md",
  "backend-extracted.txt",
  "full-stack-extracted.txt",
];
const generatedEntries = await listGeneratedEntries(clientDirectory);
const generatedRelativePaths = generatedEntries.map((entry) =>
  relativeGeneratedPath(entry.absolutePath),
);

for (const marker of forbiddenPrivateMarkers) {
  const normalizedMarker = marker.toLowerCase();
  const generatedPath = generatedRelativePaths.find((relativePath) =>
    relativePath.toLowerCase().includes(normalizedMarker),
  );
  if (generatedPath !== undefined) {
    throw new Error(
      `Found the private-source marker ${marker} in generated path ${generatedPath}.`,
    );
  }
}

const generatedFiles = generatedEntries
  .filter((entry) => !entry.isDirectory)
  .map((entry) => entry.absolutePath);
const generatedHtml = generatedFiles
  .filter((file) => normalizedExtension(file) === ".html")
  .map(relativeGeneratedPath)
  .sort();
const expectedHtml = [
  "__spa-fallback.html",
  ...expectedDocuments.keys(),
].sort();
const generatedRouteData = generatedFiles
  .filter((file) => normalizedExtension(file) === ".data")
  .map(relativeGeneratedPath)
  .sort();
const expectedRouteData = ["_.data", "projects.data", "writings.data"];

if (JSON.stringify(generatedHtml) !== JSON.stringify(expectedHtml)) {
  throw new Error(
    `Unexpected static HTML inventory. Expected ${expectedHtml.join(", ")}; received ${generatedHtml.join(", ")}.`,
  );
}

if (JSON.stringify(generatedRouteData) !== JSON.stringify(expectedRouteData)) {
  throw new Error(
    `Unexpected route-data inventory. Expected ${expectedRouteData.join(", ")}; received ${generatedRouteData.join(", ")}.`,
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

  const canonicalHrefs = readCanonicalHrefs(html);
  if (canonicalHrefs.length !== 1 || canonicalHrefs[0] !== expected.canonical) {
    throw new Error(
      `Expected one canonical URL of ${expected.canonical} in ${relativePath}; received ${canonicalHrefs.length === 0 ? "none" : canonicalHrefs.join(", ")}.`,
    );
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

const textArtifactExtensions = new Set([
  ".cjs",
  ".css",
  ".csv",
  ".data",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".map",
  ".markdown",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".webmanifest",
  ".xml",
  ".yaml",
  ".yml",
]);
const knownBinaryArtifactExtensions = new Set([
  ".3gp",
  ".7z",
  ".aac",
  ".aiff",
  ".apk",
  ".apng",
  ".avif",
  ".avi",
  ".bin",
  ".bmp",
  ".br",
  ".bz2",
  ".cab",
  ".class",
  ".db",
  ".deb",
  ".dll",
  ".dmg",
  ".docx",
  ".dylib",
  ".eot",
  ".epub",
  ".exe",
  ".flac",
  ".gif",
  ".gz",
  ".heic",
  ".heif",
  ".ico",
  ".iso",
  ".jar",
  ".jpeg",
  ".jpg",
  ".jxl",
  ".lz",
  ".lz4",
  ".lzma",
  ".m4a",
  ".m4v",
  ".mid",
  ".midi",
  ".mkv",
  ".mov",
  ".mp3",
  ".mp4",
  ".mpeg",
  ".node",
  ".o",
  ".obj",
  ".ogg",
  ".ogv",
  ".opus",
  ".otc",
  ".otf",
  ".pdf",
  ".png",
  ".pptx",
  ".psd",
  ".rar",
  ".rpm",
  ".so",
  ".sqlite",
  ".sqlite3",
  ".svgz",
  ".tar",
  ".tgz",
  ".tif",
  ".tiff",
  ".ttc",
  ".ttf",
  ".wav",
  ".wasm",
  ".webm",
  ".webp",
  ".wmv",
  ".woff",
  ".woff2",
  ".xlsx",
  ".xz",
  ".zip",
  ".zst",
]);
const bundleTextExtensions = new Set([".cjs", ".css", ".js", ".mjs"]);
const javaScriptExtensions = new Set([".cjs", ".js", ".mjs"]);

async function readGeneratedTextArtifact(file) {
  const extension = normalizedExtension(file);
  if (knownBinaryArtifactExtensions.has(extension)) return undefined;

  const bytes = await readFile(file);
  const knownTextFormat = textArtifactExtensions.has(extension);

  if (bytes.includes(0)) {
    if (knownTextFormat) {
      throw new Error(
        `Expected textual artifact ${relativeGeneratedPath(file)} not to contain NUL bytes.`,
      );
    }
    return undefined;
  }

  let contents;
  try {
    contents = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (error) {
    if (knownTextFormat) {
      throw new Error(
        `Expected textual artifact ${relativeGeneratedPath(file)} to contain valid UTF-8.`,
        { cause: error },
      );
    }
    return undefined;
  }

  return {
    absolutePath: file,
    contents,
    relativePath: relativeGeneratedPath(file),
  };
}

const generatedText = (
  await Promise.all(generatedFiles.map(readGeneratedTextArtifact))
).filter((artifact) => artifact !== undefined);
const generatedBundleText = generatedText.filter(({ absolutePath }) =>
  bundleTextExtensions.has(normalizedExtension(absolutePath)),
);
const forbiddenLegacyMarkers = ["quasar", "pinia", "vue-router"];

for (const marker of forbiddenLegacyMarkers) {
  const artifact = generatedBundleText.find(({ contents }) =>
    contents.toLowerCase().includes(marker),
  );
  if (artifact !== undefined) {
    throw new Error(
      `Found the legacy marker ${marker} in ${artifact.relativePath}.`,
    );
  }
}

const forbiddenPreviewMarkers = [
  "design-system-preview",
  "design-preview",
  "preview=design-system",
  "milestone 4 approval preview",
  "temporary local preview",
  "make complex work feel inevitable.",
];

for (const marker of forbiddenPreviewMarkers) {
  const normalizedMarker = marker.toLowerCase();
  const generatedPath = generatedRelativePaths.find((relativePath) =>
    relativePath.toLowerCase().includes(normalizedMarker),
  );
  if (generatedPath !== undefined) {
    throw new Error(
      `Found the development-only preview marker ${marker} in generated path ${generatedPath}.`,
    );
  }

  const artifact = generatedText.find(({ contents }) =>
    contents.toLowerCase().includes(normalizedMarker),
  );
  if (artifact !== undefined) {
    throw new Error(
      `Found the development-only preview marker ${marker} in ${artifact.relativePath}.`,
    );
  }
}

const generatedPdfFile = generatedFiles.find(
  (file) => normalizedExtension(file) === ".pdf",
);
const generatedPdf =
  generatedPdfFile === undefined
    ? undefined
    : relativeGeneratedPath(generatedPdfFile);
if (generatedPdf !== undefined) {
  throw new Error(`A résumé PDF or other PDF was emitted at ${generatedPdf}.`);
}

for (const marker of forbiddenPrivateMarkers) {
  const normalizedMarker = marker.toLowerCase();
  const artifact = generatedText.find(({ contents }) =>
    contents.toLowerCase().includes(normalizedMarker),
  );
  if (artifact !== undefined) {
    throw new Error(
      `Found the private-source marker ${marker} in ${artifact.relativePath}.`,
    );
  }
}

const clientJavaScript = generatedText.filter(({ absolutePath }) =>
  javaScriptExtensions.has(normalizedExtension(absolutePath)),
);
const serverOnlyMarkers = [
  "zod",
  "ContentValidationError",
  "Public content validation failed",
  "content-schemas.server",
  "validate-content.server",
  "site-content.server",
  "professional-content.server",
  "claim-sopra-modernization",
  "experience-sopra-steria",
];

for (const marker of serverOnlyMarkers) {
  const artifact = clientJavaScript.find(({ contents }) =>
    contents.toLowerCase().includes(marker.toLowerCase()),
  );
  if (artifact !== undefined) {
    throw new Error(
      `Found the server-only marker ${marker} in client JavaScript at ${artifact.relativePath}.`,
    );
  }
}

const routeData = new Map(
  await Promise.all(
    expectedRouteData.map(async (relativePath) => [
      relativePath,
      await requireNonEmptyFile(relativePath),
    ]),
  ),
);
const decodedRouteData = new Map([
  [
    "_.data",
    decodeRouteLoaderData(
      routeData.get("_.data") ?? "",
      "_.data",
      "routes/home",
    ),
  ],
  [
    "projects.data",
    decodeRouteLoaderData(
      routeData.get("projects.data") ?? "",
      "projects.data",
      "routes/projects",
    ),
  ],
  [
    "writings.data",
    decodeRouteLoaderData(
      routeData.get("writings.data") ?? "",
      "writings.data",
      "routes/writings",
    ),
  ],
]);
const expectedSeoByRouteData = new Map([
  [
    "_.data",
    {
      canonicalPath: "/",
      description:
        "Rahul Yadav is a senior backend and backend-heavy full-stack engineer working across Python, FastAPI, Django, React, PostgreSQL, and AWS.",
      title: "Rahul Yadav | Senior Backend and Full-Stack Engineer",
    },
  ],
  [
    "projects.data",
    {
      canonicalPath: "/projects",
      description:
        "Approved project case studies will be added in a later portfolio milestone.",
      title: "Projects | Rahul Yadav",
    },
  ],
  [
    "writings.data",
    {
      canonicalPath: "/writings",
      description:
        "Published technical writings will be added in a later portfolio milestone.",
      title: "Writings | Rahul Yadav",
    },
  ],
]);
const homeData = decodedRouteData.get("_.data") ?? {};
const expectedHomeFields = ["canonicalOrigin", "identity", "seo"];
assertExactRecordFields(homeData, expectedHomeFields, "_.data", "home loader");

if (homeData["canonicalOrigin"] !== "https://rahuly.in") {
  throw new Error(
    'Expected canonicalOrigin in _.data to equal "https://rahuly.in".',
  );
}

assertSeoContract(
  homeData["seo"],
  expectedSeoByRouteData.get("_.data"),
  "_.data",
);
assertExactRecordFields(
  homeData["identity"],
  [
    "approximateYearsExperience",
    "careerStart",
    "displayName",
    "id",
    "introduction",
    "locale",
    "professionalPositioning",
  ],
  "_.data",
  "identity",
);

const identity = homeData["identity"];
for (const field of [
  "careerStart",
  "displayName",
  "id",
  "introduction",
  "locale",
  "professionalPositioning",
]) {
  assertNonEmptyTrimmedString(identity[field], "_.data", `identity.${field}`);
}

if (
  identity["id"] !== "site-identity" ||
  identity["displayName"] !== "Rahul Yadav" ||
  !/^\d{4}-(?:0[1-9]|1[0-2])$/.test(identity["careerStart"]) ||
  !Number.isInteger(identity["approximateYearsExperience"]) ||
  identity["approximateYearsExperience"] <= 0
) {
  throw new Error(
    "The identity in _.data does not match the required public identity contract.",
  );
}

const forbiddenHomeFields = new Set([
  "contacts",
  "socialLinks",
  "experiences",
  "credibilityHighlights",
  "skillGroups",
  "education",
  "featuredProjects",
  "recentWritings",
  "resumeAsset",
  "projects",
  "writings",
  "resumeAssets",
  "images",
]);
const forbiddenHomeField = findPropertyPath(homeData, forbiddenHomeFields);
if (forbiddenHomeField !== undefined) {
  throw new Error(`Found non-minimal home data at ${forbiddenHomeField}.`);
}

for (const relativePath of ["projects.data", "writings.data"]) {
  const loaderData = decodedRouteData.get(relativePath);
  assertExactRecordFields(
    loaderData,
    ["canonicalOrigin", "items", "seo"],
    relativePath,
    "collection loader",
  );

  if (loaderData["canonicalOrigin"] !== "https://rahuly.in") {
    throw new Error(
      `Expected canonicalOrigin in ${relativePath} to equal "https://rahuly.in".`,
    );
  }

  assertSeoContract(
    loaderData["seo"],
    expectedSeoByRouteData.get(relativePath),
    relativePath,
  );

  if (!Array.isArray(loaderData["items"])) {
    throw new Error(`Expected items in ${relativePath} to be an array.`);
  }

  if (loaderData["items"].length !== 0) {
    throw new Error(
      `Expected an empty published collection in ${relativePath}.`,
    );
  }
}

for (const [relativePath, loaderData] of decodedRouteData) {
  const unpublishedPath = findUnpublishedPath(loaderData);
  if (unpublishedPath !== undefined) {
    throw new Error(
      `Found unpublished content in ${relativePath} at ${unpublishedPath}.`,
    );
  }
}

const forbiddenLoaderFields = [
  "sourcePath",
  "sha256",
  "byteSize",
  "metadataRemovalVerified",
  "approvedOn",
];

for (const [relativePath, loaderData] of decodedRouteData) {
  const fieldPath = findPropertyPath(
    loaderData,
    new Set(forbiddenLoaderFields),
  );
  if (fieldPath !== undefined) {
    throw new Error(
      `Found a build-only field in ${relativePath} at ${fieldPath}.`,
    );
  }
}

console.log(
  `Verified ${expectedDocuments.size} prerendered routes, ${expectedRouteData.length} route-data files, and the SPA fallback in build/client.`,
);
