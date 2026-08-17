import { readdir, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TextDecoder } from "node:util";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const clientDirectory = path.join(repositoryRoot, "build", "client");

const approvedPublicAssets = [
  {
    path: "assets/resume/rahul-yadav-resume.pdf",
    byteSize: 97_539,
    sha256: "5fbee53357526963b6cd78cd472f16bcde7525a1607f85f737d61b2f8411a9b9",
    pageCount: 1,
    linkCount: 4,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-400.avif",
    byteSize: 24_286,
    sha256: "ff5e68ce66b405bb6c10212a9e1cb5d9ba1642607a7e8e1c47c392d0429bf2e5",
    width: 400,
    height: 500,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-400.webp",
    byteSize: 39_244,
    sha256: "6d0811f85d124ee8f490acc12a8f250ed7a538fd39ae8df9413a92f76e4f2e47",
    width: 400,
    height: 500,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-400.jpg",
    byteSize: 54_285,
    sha256: "f4f66cf7a275afc8a151493ba3e6b682f00ca1805908aca8b08231332f142993",
    width: 400,
    height: 500,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-640.avif",
    byteSize: 51_939,
    sha256: "c9e78ffc38c2e76807d776102d12b414949c302eb1f052d9b31987778592ba33",
    width: 640,
    height: 800,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-640.webp",
    byteSize: 84_256,
    sha256: "bd6e20cabd4cf556a47d25ef18275cb1cc50450b7243f38b65b0253a907baa05",
    width: 640,
    height: 800,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-640.jpg",
    byteSize: 121_098,
    sha256: "654512d43bc30c5c9f70068aad87bc8fedd57e2c1c358cbad02ba19efac278d7",
    width: 640,
    height: 800,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-800.avif",
    byteSize: 74_908,
    sha256: "03c525bf68aca8c829aa5398b2cdd2c817a6c162f42f05d4decf345cf24791ca",
    width: 800,
    height: 1000,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-800.webp",
    byteSize: 117_140,
    sha256: "a72daa11d7a320c2c2e272c625cf285228e8a8f5a3bfebe37309f233b655cc11",
    width: 800,
    height: 1000,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-800.jpg",
    byteSize: 177_291,
    sha256: "1fff9c7cdb40a4a2e8988a894711a20ef5d7bf42ad99f208ede88d66334381d6",
    width: 800,
    height: 1000,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-compact-96.avif",
    byteSize: 2_615,
    sha256: "5ebb4ae73ee7ea3cc01ced0edfcfaddb83015655c404282da7d740719c16709f",
    width: 96,
    height: 120,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-compact-96.webp",
    byteSize: 3_800,
    sha256: "97e4503f53db4ada526a146e7cf23023fd6e1baf776530849bdb3cb961bb6c6b",
    width: 96,
    height: 120,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-compact-96.jpg",
    byteSize: 5_819,
    sha256: "dc2efa2b007eb0f9f76aba18312ee7bb8e5c42d9c75544f5bb4d43278eed62a4",
    width: 96,
    height: 120,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-compact-192.avif",
    byteSize: 7_604,
    sha256: "58ac21846daa823e3bd1b071d66131016c07f67e8e4b199b14b9611ff2a882cc",
    width: 192,
    height: 240,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-compact-192.webp",
    byteSize: 11_022,
    sha256: "ea289ee6744652dae8fdf8a6a8266cfd15e9bfc6b8652d9aeb4d1f39a98557de",
    width: 192,
    height: 240,
  },
  {
    path: "assets/profile/rahul-yadav-portrait-compact-192.jpg",
    byteSize: 18_094,
    sha256: "5409786d32b9a454ab7aef757a4739933ac6f6bdb81d2369a5f34e3dbf5ae6f2",
    width: 192,
    height: 240,
  },
  {
    path: "assets/organizations/sopra-steria.jpeg",
    byteSize: 6_816,
    sha256: "884da523bb0662c22c08770ad7d82c6ecb4cd69e189f6c03ea2324e8da45aae1",
    width: 200,
    height: 200,
  },
  {
    path: "assets/organizations/gainfront.jpeg",
    byteSize: 8_364,
    sha256: "cb5cdbe5c8d1fcd45e76444bec8f133a2b3ca632be5b8b8dd35dbaf640cb7f54",
    width: 200,
    height: 200,
  },
  {
    path: "assets/organizations/marsdevs.jpeg",
    byteSize: 5_264,
    sha256: "a2fe753d1ff176ef6f551a19b85f103a4bd561e893f253c6ef994a0f95c5f46b",
    width: 200,
    height: 200,
  },
  {
    path: "assets/organizations/university-of-mumbai.jpeg",
    byteSize: 13_985,
    sha256: "41371e7854f72e2215c9a8726bfb60b0ed8c497695a709bde783585f88472e42",
    width: 200,
    height: 200,
  },
];

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

function assertNonEmptyTextSegment(value, relativePath, fieldPath) {
  if (typeof value !== "string" || value.length === 0 || value.trim() === "") {
    throw new Error(
      `Expected ${fieldPath} in ${relativePath} to contain non-whitespace text.`,
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

function assertResponsiveImageContract(
  value,
  { altText, expectedWidths, heightForWidth, pathFragment, variantCount },
  relativePath,
  label,
) {
  assertExactRecordFields(value, ["altText", "variants"], relativePath, label);
  if (value["altText"] !== altText) {
    throw new Error(`Unexpected ${label} alternative text in ${relativePath}.`);
  }
  if (
    !Array.isArray(value["variants"]) ||
    value["variants"].length !== variantCount
  ) {
    throw new Error(
      `Expected ${String(variantCount)} ${label} variants in ${relativePath}.`,
    );
  }

  const typesByWidth = new Map();
  for (const [index, variant] of value["variants"].entries()) {
    assertExactRecordFields(
      variant,
      ["height", "mediaType", "path", "width"],
      relativePath,
      `${label} variant ${String(index)}`,
    );
    if (
      !expectedWidths.includes(variant["width"]) ||
      variant["height"] !== heightForWidth(variant["width"]) ||
      typeof variant["path"] !== "string" ||
      !variant["path"].includes(pathFragment)
    ) {
      throw new Error(
        `Unexpected dimensions or path for ${label} variant ${String(index)} in ${relativePath}.`,
      );
    }

    const extensionByType = new Map([
      ["image/avif", ".avif"],
      ["image/jpeg", ".jpg"],
      ["image/webp", ".webp"],
    ]);
    const extension = extensionByType.get(variant["mediaType"]);
    if (extension === undefined || !variant["path"].endsWith(extension)) {
      throw new Error(
        `Unexpected media type for ${label} variant ${String(index)} in ${relativePath}.`,
      );
    }

    const types = typesByWidth.get(variant["width"]) ?? new Set();
    types.add(variant["mediaType"]);
    typesByWidth.set(variant["width"], types);
  }

  for (const width of expectedWidths) {
    const types = [...(typesByWidth.get(width) ?? [])].sort();
    if (
      JSON.stringify(types) !==
      JSON.stringify(["image/avif", "image/jpeg", "image/webp"])
    ) {
      throw new Error(
        `Expected AVIF, JPEG, and WebP ${label} variants at ${String(width)}px in ${relativePath}.`,
      );
    }
  }
}

function assertOrganizationLogoContract(
  value,
  expectedPath,
  relativePath,
  label,
) {
  assertExactRecordFields(
    value,
    ["altText", "height", "path", "width"],
    relativePath,
    label,
  );
  if (
    value["path"] !== expectedPath ||
    value["width"] !== 200 ||
    value["height"] !== 200 ||
    value["altText"] !== ""
  ) {
    throw new Error(`Unexpected ${label} projection in ${relativePath}.`);
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
      title: "Rahul Yadav | Senior Software Engineer",
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

function readJpegDimensions(bytes, relativePath) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error(`Expected JPEG signature in ${relativePath}.`);
  }

  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce,
    0xcf,
  ]);
  let offset = 2;

  while (offset + 8 < bytes.length) {
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    offset += 1;

    if (marker === undefined || marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;

    const segmentLength = bytes.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) break;

    if (startOfFrameMarkers.has(marker)) {
      return {
        height: bytes.readUInt16BE(offset + 3),
        width: bytes.readUInt16BE(offset + 5),
      };
    }

    offset += segmentLength;
  }

  throw new Error(`Could not read JPEG dimensions from ${relativePath}.`);
}

function assertCleanJpegPayload(bytes, relativePath) {
  const endOfImage = bytes.lastIndexOf(Buffer.from([0xff, 0xd9]));
  if (endOfImage !== bytes.length - 2) {
    throw new Error(
      `Expected ${relativePath} to end at its JPEG end-of-image marker.`,
    );
  }

  let offset = 2;
  while (offset + 4 <= bytes.length) {
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xda || marker === 0xd9 || marker === undefined) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;

    const segmentLength = bytes.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      throw new Error(`Found a malformed JPEG segment in ${relativePath}.`);
    }
    if (marker === 0xfe || (marker >= 0xe1 && marker <= 0xef)) {
      throw new Error(
        `Found an unnecessary JPEG metadata or application segment in ${relativePath}.`,
      );
    }
    if (marker === 0xe0) {
      const segment = bytes.subarray(offset + 2, offset + segmentLength);
      if (
        segment.subarray(0, 5).toString("ascii") !== "JFIF\0" ||
        segment.at(12) !== 0 ||
        segment.at(13) !== 0
      ) {
        throw new Error(
          `Expected only a thumbnail-free JFIF application segment in ${relativePath}.`,
        );
      }
    }
    offset += segmentLength;
  }

  const searchableBytes = bytes.toString("latin1").toLowerCase();
  const embeddedPayloadMarker = ["<script", "%pdf-", "pk\u0003\u0004"].find(
    (marker) => searchableBytes.includes(marker),
  );
  if (embeddedPayloadMarker !== undefined) {
    throw new Error(
      `Found an unexpected embedded payload marker in ${relativePath}.`,
    );
  }
}

function readWebpDimensions(bytes, relativePath) {
  if (
    bytes.subarray(0, 4).toString("ascii") !== "RIFF" ||
    bytes.subarray(8, 12).toString("ascii") !== "WEBP"
  ) {
    throw new Error(`Expected WebP signature in ${relativePath}.`);
  }

  const chunk = bytes.subarray(12, 16).toString("ascii");
  const dataOffset = 20;
  if (chunk === "VP8X") {
    return {
      width: bytes.readUIntLE(dataOffset + 4, 3) + 1,
      height: bytes.readUIntLE(dataOffset + 7, 3) + 1,
    };
  }
  if (chunk === "VP8 ") {
    return {
      width: bytes.readUInt16LE(dataOffset + 6) & 0x3fff,
      height: bytes.readUInt16LE(dataOffset + 8) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    const first = bytes[dataOffset + 1];
    const second = bytes[dataOffset + 2];
    const third = bytes[dataOffset + 3];
    const fourth = bytes[dataOffset + 4];
    if (
      first === undefined ||
      second === undefined ||
      third === undefined ||
      fourth === undefined
    ) {
      throw new Error(`WebP dimensions are truncated in ${relativePath}.`);
    }
    return {
      width: 1 + first + ((second & 0x3f) << 8),
      height: 1 + (second >> 6) + (third << 2) + ((fourth & 0x0f) << 10),
    };
  }

  throw new Error(`Unsupported WebP chunk ${chunk} in ${relativePath}.`);
}

function readAvifDimensions(bytes, relativePath) {
  const ispeIndex = bytes.indexOf(Buffer.from("ispe", "ascii"));
  if (ispeIndex < 4 || ispeIndex + 16 > bytes.length) {
    throw new Error(`Could not find AVIF spatial extents in ${relativePath}.`);
  }

  return {
    width: bytes.readUInt32BE(ispeIndex + 8),
    height: bytes.readUInt32BE(ispeIndex + 12),
  };
}

function readImageDimensions(bytes, relativePath) {
  const extension = normalizedExtension(relativePath);
  if (extension === ".jpg" || extension === ".jpeg") {
    return readJpegDimensions(bytes, relativePath);
  }
  if (extension === ".webp") return readWebpDimensions(bytes, relativePath);
  if (extension === ".avif") return readAvifDimensions(bytes, relativePath);
  throw new Error(`Unsupported approved image extension in ${relativePath}.`);
}

const forbiddenPrivateMarkers = [
  "references/private",
  "rahul_yadav_senior_backend_engineer.docx.pdf",
  "rahul_yadav_senior_full_stack_engineer.docx.pdf",
  "resume-comparison.md",
  "backend-extracted.txt",
  "full-stack-extracted.txt",
  "71522e83ade12473ad1b9da4a9ba6dfd9f30e3516b3303c0343d29e7fcf6d5a4",
];
const forbiddenOriginalUploadNames = [
  "soprasteria_logo.jpeg",
  "gainfront_logo.jpeg",
  "marsdevs_logo.jpeg",
  "university_of_mumbai.jpeg",
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

for (const marker of forbiddenOriginalUploadNames) {
  const normalizedMarker = marker.toLowerCase();
  const generatedPath = generatedRelativePaths.find((relativePath) =>
    relativePath.toLowerCase().includes(normalizedMarker),
  );
  if (generatedPath !== undefined) {
    throw new Error(
      `Found original upload filename ${marker} in generated path ${generatedPath}.`,
    );
  }
}

const generatedFiles = generatedEntries
  .filter((entry) => !entry.isDirectory)
  .map((entry) => entry.absolutePath);
const approvedPublicAssetPaths = approvedPublicAssets
  .map((asset) => asset.path)
  .sort();
const generatedPublicAssetPaths = generatedFiles
  .map(relativeGeneratedPath)
  .filter(
    (relativePath) =>
      relativePath.startsWith("assets/profile/") ||
      relativePath.startsWith("assets/resume/") ||
      relativePath.startsWith("assets/organizations/"),
  )
  .sort();

if (
  JSON.stringify(generatedPublicAssetPaths) !==
  JSON.stringify(approvedPublicAssetPaths)
) {
  throw new Error(
    `Unexpected approved public-asset inventory. Expected ${approvedPublicAssetPaths.join(", ")}; received ${generatedPublicAssetPaths.join(", ")}.`,
  );
}

for (const approvedAsset of approvedPublicAssets) {
  const absolutePath = path.join(clientDirectory, approvedAsset.path);
  const bytes = await readFile(absolutePath);
  const actualHash = createHash("sha256").update(bytes).digest("hex");

  if (bytes.length !== approvedAsset.byteSize) {
    throw new Error(
      `Expected ${approvedAsset.path} to contain ${String(approvedAsset.byteSize)} bytes; received ${String(bytes.length)}.`,
    );
  }
  if (actualHash !== approvedAsset.sha256) {
    throw new Error(
      `SHA-256 mismatch for approved public asset ${approvedAsset.path}.`,
    );
  }

  if (approvedAsset.width !== undefined && approvedAsset.height !== undefined) {
    const dimensions = readImageDimensions(bytes, approvedAsset.path);
    if (
      dimensions.width !== approvedAsset.width ||
      dimensions.height !== approvedAsset.height
    ) {
      throw new Error(
        `Expected ${approvedAsset.path} dimensions ${String(approvedAsset.width)}x${String(approvedAsset.height)}; received ${String(dimensions.width)}x${String(dimensions.height)}.`,
      );
    }

    const searchableImageBytes = bytes.toString("latin1").toLowerCase();
    const metadataMarker = [
      "exif\u0000\u0000",
      "<x:xmpmeta",
      "http://ns.adobe.com/xap",
      "photoshop 3.0",
    ].find((marker) => searchableImageBytes.includes(marker));
    if (metadataMarker !== undefined) {
      throw new Error(
        `Found unnecessary image metadata marker ${metadataMarker} in ${approvedAsset.path}.`,
      );
    }

    if ([".jpg", ".jpeg"].includes(normalizedExtension(approvedAsset.path))) {
      assertCleanJpegPayload(bytes, approvedAsset.path);
    }
  }

  if (normalizedExtension(approvedAsset.path) === ".pdf") {
    const pdfText = bytes.toString("latin1");
    const hiddenPdfMarker = [
      "/Author",
      "/CreationDate",
      "/Creator",
      "/EmbeddedFiles",
      "/FileAttachment",
      "/JavaScript",
      "/Metadata",
      "/ModDate",
      "/Producer",
      "/Source",
    ].find((marker) => pdfText.includes(marker));
    if (hiddenPdfMarker !== undefined) {
      throw new Error(
        `Found unnecessary PDF metadata or hidden-content marker ${hiddenPdfMarker} in ${approvedAsset.path}.`,
      );
    }

    const pageCount = (pdfText.match(/\/Type\s*\/Page\b/g) ?? []).length;
    const linkCount = (pdfText.match(/\/Subtype\s*\/Link\b/g) ?? []).length;
    const uriCount = (pdfText.match(/\/S\s*\/URI\b/g) ?? []).length;
    if (pageCount !== approvedAsset.pageCount) {
      throw new Error(
        `Expected ${approvedAsset.path} to contain ${String(approvedAsset.pageCount)} page; received ${String(pageCount)}.`,
      );
    }
    if (
      linkCount !== approvedAsset.linkCount ||
      uriCount !== approvedAsset.linkCount
    ) {
      throw new Error(
        `Expected ${approvedAsset.path} to contain ${String(approvedAsset.linkCount)} validated URI links; received ${String(linkCount)} link annotations and ${String(uriCount)} URI actions.`,
      );
    }
  }
}

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

const homeHtml = await requireNonEmptyFile("index.html");
const normalizedHomeHtml = homeHtml.replace(/<!-- -->/g, "");
for (const expectedMarkup of [
  ">Experience</h2>",
  ">Skills</h2>",
  ">Education</h2>",
  "<details>",
  "Show 3 more contributions",
  "Customer engagement:",
  "Airbus",
  "<strong>Strangler Fig pattern</strong>",
  'Made with <span aria-label="love" role="img">❤️</span> in India · Thank you for visiting.',
]) {
  if (!normalizedHomeHtml.includes(expectedMarkup)) {
    throw new Error(
      `Expected no-JavaScript professional content marker ${expectedMarkup} in index.html.`,
    );
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

const generatedPdfPaths = generatedFiles
  .filter((file) => normalizedExtension(file) === ".pdf")
  .map(relativeGeneratedPath);
if (
  generatedPdfPaths.length !== 1 ||
  generatedPdfPaths[0] !== "assets/resume/rahul-yadav-resume.pdf"
) {
  throw new Error(
    `Expected exactly the approved public résumé PDF; received ${generatedPdfPaths.join(", ") || "none"}.`,
  );
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

for (const marker of forbiddenOriginalUploadNames) {
  const normalizedMarker = marker.toLowerCase();
  const artifact = generatedText.find(({ contents }) =>
    contents.toLowerCase().includes(normalizedMarker),
  );
  if (artifact !== undefined) {
    throw new Error(
      `Found original upload filename ${marker} in ${artifact.relativePath}.`,
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
const decodedRootData = new Map(
  [...routeData.entries()].map(([relativePath, contents]) => [
    relativePath,
    decodeRouteLoaderData(contents, relativePath, "root"),
  ]),
);
const expectedSeoByRouteData = new Map([
  [
    "_.data",
    {
      canonicalPath: "/",
      description:
        "Senior Software Engineer Rahul Yadav has six years of experience modernizing Python backends and delivering backend-heavy React and Vue products.",
      title: "Rahul Yadav | Senior Software Engineer",
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
const expectedHomeFields = [
  "canonicalOrigin",
  "contacts",
  "credibilityCards",
  "education",
  "experiences",
  "identity",
  "location",
  "portrait",
  "resume",
  "seo",
  "skillGroups",
  "socialLinks",
];
assertExactRecordFields(homeData, expectedHomeFields, "_.data", "home loader");

if (homeData["canonicalOrigin"] !== "https://rahuly.in") {
  throw new Error(
    'Expected canonicalOrigin in _.data to equal "https://rahuly.in".',
  );
}

if (homeData["location"] !== "Bengaluru, Mumbai - India") {
  throw new Error("Unexpected public location projection in _.data.");
}

assertSeoContract(
  homeData["seo"],
  expectedSeoByRouteData.get("_.data"),
  "_.data",
);
assertExactRecordFields(
  homeData["identity"],
  [
    "displayName",
    "introduction",
    "opportunityStatement",
    "professionalPositioning",
    "roleLabel",
  ],
  "_.data",
  "identity",
);

const identity = homeData["identity"];
for (const field of [
  "displayName",
  "introduction",
  "opportunityStatement",
  "professionalPositioning",
  "roleLabel",
]) {
  assertNonEmptyTrimmedString(identity[field], "_.data", `identity.${field}`);
}

if (
  identity["displayName"] !== "Rahul Yadav" ||
  identity["roleLabel"] !== "Senior Software Engineer"
) {
  throw new Error(
    "The identity in _.data does not match the required public identity contract.",
  );
}

const expectedCredibilityCards = [
  {
    title: "Phased application modernization",
    body: "Co-designed a PHP-to-FastAPI/React modernization for the Airbus engagement at Sopra Steria, using Strangler Fig routing and AWS ALB URL rewrites to avoid a big-bang cutover.",
  },
  {
    title: "Greenfield product delivery",
    body: "Delivered four greenfield modules at Gainfront—Request for Price, Target Report, Spend Analytics, and Itemized Quote—from requirements through release using Django REST Framework and Vue/Quasar.",
  },
  {
    title: "Leadership and measurable outcomes",
    outcomes: [
      [
        "Delivery leadership",
        "Led delivery for three engineers and reviewed PRs across Sopra Steria, Airbus, and partner teams, while strengthening persistence and authorization testing with database-backed pytest fixtures.",
      ],
      [
        "Payload efficiency",
        "Reduced primary data-grid API payloads from approximately 1.5–2 MB to below 1 MB through response shaping and Gzip compression, meeting the ALB-to-Lambda response limit.",
      ],
      [
        "Test coverage",
        "At Gainfront, helped raise backend test coverage by approximately 45 percentage points, from approximately 40% to 85%, while strengthening CI and linting checks.",
      ],
    ],
  },
];
if (
  !Array.isArray(homeData["credibilityCards"]) ||
  homeData["credibilityCards"].length !== expectedCredibilityCards.length
) {
  throw new Error("Expected three approved credibility cards in _.data.");
}
for (const [index, expected] of expectedCredibilityCards.entries()) {
  const card = homeData["credibilityCards"][index];
  assertExactRecordFields(
    card,
    expected.body === undefined ? ["outcomes", "title"] : ["body", "title"],
    "_.data",
    `credibility card ${String(index)}`,
  );
  if (card["title"] !== expected.title) {
    throw new Error(`Unexpected credibility card ${String(index)} title.`);
  }
  if (expected.body !== undefined) {
    if (card["body"] !== expected.body) {
      throw new Error(`Unexpected credibility card ${String(index)} body.`);
    }
    continue;
  }
  if (
    !Array.isArray(card["outcomes"]) ||
    card["outcomes"].length !== expected.outcomes.length
  ) {
    throw new Error("Expected three grouped credibility outcomes in _.data.");
  }
  for (const [outcomeIndex, [label, detail]] of expected.outcomes.entries()) {
    const outcome = card["outcomes"][outcomeIndex];
    assertExactRecordFields(
      outcome,
      ["detail", "label"],
      "_.data",
      `credibility card ${String(index)} outcome ${String(outcomeIndex)}`,
    );
    if (outcome["label"] !== label || outcome["detail"] !== detail) {
      throw new Error(
        `Unexpected credibility outcome ${String(outcomeIndex)} in _.data.`,
      );
    }
  }
}

const expectedExperiences = [
  {
    organization: "Sopra Steria",
    featured: true,
    logoPath: "/assets/organizations/sopra-steria.jpeg",
    roleTitle: "Senior Software Engineer",
    dateRange: "Aug 2025–Present",
    location: "Bengaluru, Karnataka, India",
    contributionCount: 6,
    engagement: "Airbus",
  },
  {
    organization: "Gainfront",
    featured: true,
    logoPath: "/assets/organizations/gainfront.jpeg",
    roleTitle: "Software Developer",
    dateRange: "Jun 2023–Aug 2025",
    location: "Bengaluru, Karnataka, India",
    contributionCount: 5,
  },
  {
    organization: "MarsDevs",
    featured: false,
    logoPath: "/assets/organizations/marsdevs.jpeg",
    roleTitle: "Software Engineer",
    dateRange: "Nov 2020–Jun 2023",
    location: "Pune, Maharashtra, India",
    contributionCount: 3,
  },
];

if (
  !Array.isArray(homeData["experiences"]) ||
  homeData["experiences"].length !== expectedExperiences.length
) {
  throw new Error("Expected three approved experience groups in _.data.");
}
for (const [index, expected] of expectedExperiences.entries()) {
  const experience = homeData["experiences"][index];
  assertExactRecordFields(
    experience,
    ["featured", "logo", "organization", "roles"],
    "_.data",
    `experience ${String(index)}`,
  );
  if (
    experience["organization"] !== expected.organization ||
    experience["featured"] !== expected.featured ||
    !Array.isArray(experience["roles"]) ||
    experience["roles"].length !== 1
  ) {
    throw new Error(
      `Unexpected employer grouping or feature state for experience ${String(index)} in _.data.`,
    );
  }
  assertOrganizationLogoContract(
    experience["logo"],
    expected.logoPath,
    "_.data",
    `experience ${String(index)} logo`,
  );

  const role = experience["roles"][0];
  const roleFields = [
    "contributions",
    "dateRange",
    ...(expected.engagement === undefined ? [] : ["engagement"]),
    "location",
    "summary",
    "technologies",
    "title",
  ];
  assertExactRecordFields(
    role,
    roleFields,
    "_.data",
    `experience ${String(index)} role`,
  );
  if (
    role["title"] !== expected.roleTitle ||
    role["dateRange"] !== expected.dateRange ||
    role["location"] !== expected.location ||
    !Array.isArray(role["contributions"]) ||
    role["contributions"].length !== expected.contributionCount ||
    !Array.isArray(role["technologies"]) ||
    role["technologies"].length === 0
  ) {
    throw new Error(
      `Unexpected role projection for ${expected.organization} in _.data.`,
    );
  }
  for (const [contributionIndex, contribution] of role[
    "contributions"
  ].entries()) {
    if (!Array.isArray(contribution) || contribution.length === 0) {
      throw new Error(
        `Expected structured text segments for contribution ${String(contributionIndex)} on ${expected.organization}.`,
      );
    }
    for (const [segmentIndex, segment] of contribution.entries()) {
      assertExactRecordFields(
        segment,
        ["emphasized", "text"],
        "_.data",
        `experience ${String(index)} contribution ${String(contributionIndex)} segment ${String(segmentIndex)}`,
      );
      assertNonEmptyTextSegment(
        segment["text"],
        "_.data",
        `experiences.${String(index)}.roles.0.contributions.${String(contributionIndex)}.${String(segmentIndex)}.text`,
      );
      if (typeof segment["emphasized"] !== "boolean") {
        throw new Error("Experience emphasis flags must be boolean values.");
      }
    }
    if (!contribution.some((segment) => segment["emphasized"] === true)) {
      throw new Error(
        `Contribution ${String(contributionIndex)} on ${expected.organization} is missing approved résumé emphasis.`,
      );
    }
  }
  for (const [technologyIndex, technology] of role["technologies"].entries()) {
    assertNonEmptyTrimmedString(
      technology,
      "_.data",
      `experiences.${String(index)}.roles.0.technologies.${String(technologyIndex)}`,
    );
  }

  if (expected.engagement === undefined) {
    if (role["engagement"] !== undefined) {
      throw new Error(
        `Unexpected customer engagement on ${expected.organization} in _.data.`,
      );
    }
  } else {
    assertExactRecordFields(
      role["engagement"],
      ["label", "organization"],
      "_.data",
      `${expected.organization} engagement`,
    );
    if (
      role["engagement"]["label"] !== "Customer engagement" ||
      role["engagement"]["organization"] !== expected.engagement
    ) {
      throw new Error(
        `Expected Airbus to remain customer engagement context under Sopra Steria in _.data.`,
      );
    }
  }
}

const expectedSkillGroups = [
  ["languages", "Languages", 3],
  ["backend", "Backend and APIs", 13],
  ["frontend", "Frontend", 6],
  ["data", "Databases, caching, and asynchronous processing", 6],
  ["cloud", "Cloud and infrastructure", 10],
  ["tooling", "Testing, quality, and developer tooling", 6],
];
if (
  !Array.isArray(homeData["skillGroups"]) ||
  homeData["skillGroups"].length !== expectedSkillGroups.length
) {
  throw new Error("Expected six approved skill groups in _.data.");
}
const projectedSkills = [];
for (const [
  index,
  [category, name, skillCount],
] of expectedSkillGroups.entries()) {
  const group = homeData["skillGroups"][index];
  assertExactRecordFields(
    group,
    ["category", "name", "skills"],
    "_.data",
    `skill group ${String(index)}`,
  );
  if (
    group["category"] !== category ||
    group["name"] !== name ||
    !Array.isArray(group["skills"]) ||
    group["skills"].length !== skillCount
  ) {
    throw new Error(`Unexpected skill group ${String(index)} in _.data.`);
  }
  projectedSkills.push(...group["skills"]);
}
if (
  projectedSkills.length !== 44 ||
  new Set(projectedSkills).size !== 44 ||
  projectedSkills.includes("PHP")
) {
  throw new Error(
    "Expected exactly 44 unique public skills and no PHP skill in _.data.",
  );
}

if (
  !Array.isArray(homeData["education"]) ||
  homeData["education"].length !== 1
) {
  throw new Error("Expected one approved education record in _.data.");
}
const education = homeData["education"][0];
assertExactRecordFields(
  education,
  ["credential", "dateRange", "fieldOfStudy", "institution", "logo", "score"],
  "_.data",
  "education record",
);
if (
  education["institution"] !== "University of Mumbai" ||
  education["credential"] !== "Bachelor of Engineering" ||
  education["fieldOfStudy"] !== "Computer Engineering" ||
  education["dateRange"] !== "2016–2020" ||
  education["score"] !== "CGPA 8.74/10"
) {
  throw new Error("Unexpected public education projection in _.data.");
}
assertOrganizationLogoContract(
  education["logo"],
  "/assets/organizations/university-of-mumbai.jpeg",
  "_.data",
  "education logo",
);

if (!Array.isArray(homeData["contacts"]) || homeData["contacts"].length !== 2) {
  throw new Error("Expected approved email and phone contacts in _.data.");
}
for (const [index, contact] of homeData["contacts"].entries()) {
  assertExactRecordFields(
    contact,
    ["href", "kind", "label"],
    "_.data",
    `contact ${String(index)}`,
  );
}
if (
  JSON.stringify(
    homeData["contacts"].map((contact) => contact["kind"]).sort(),
  ) !== JSON.stringify(["email", "phone"])
) {
  throw new Error("Expected one email and one phone contact in _.data.");
}

if (
  !Array.isArray(homeData["socialLinks"]) ||
  homeData["socialLinks"].length !== 2
) {
  throw new Error("Expected approved GitHub and LinkedIn links in _.data.");
}
for (const [index, socialLink] of homeData["socialLinks"].entries()) {
  assertExactRecordFields(
    socialLink,
    ["label", "platform", "url"],
    "_.data",
    `social link ${String(index)}`,
  );
}
if (
  JSON.stringify(
    homeData["socialLinks"].map((link) => link["platform"]).sort(),
  ) !== JSON.stringify(["github", "linkedin"])
) {
  throw new Error(
    "Expected GitHub and LinkedIn platform projections in _.data.",
  );
}

assertExactRecordFields(
  homeData["resume"],
  ["downloadName", "path", "title"],
  "_.data",
  "resume",
);
if (
  homeData["resume"]["downloadName"] !== "rahul-yadav-resume.pdf" ||
  homeData["resume"]["path"] !== "/assets/resume/rahul-yadav-resume.pdf"
) {
  throw new Error("Unexpected public résumé projection in _.data.");
}

assertResponsiveImageContract(
  homeData["portrait"],
  {
    altText: "Portrait of Rahul Yadav smiling in a floral kurta.",
    expectedWidths: [400, 640, 800],
    heightForWidth: (width) => (width * 5) / 4,
    pathFragment: "/assets/profile/rahul-yadav-portrait-",
    variantCount: 9,
  },
  "_.data",
  "main portrait",
);

const forbiddenHomeFields = new Set([
  "credibilityHighlights",
  "featuredProjects",
  "recentWritings",
  "resumeAsset",
  "projects",
  "writings",
  "resumeAssets",
  "images",
  "profileImage",
  "supportingClaimIds",
  "technologyIds",
  "logoAssetId",
  "relationship",
  "responsibilities",
]);
const forbiddenHomeField = findPropertyPath(homeData, forbiddenHomeFields);
if (forbiddenHomeField !== undefined) {
  throw new Error(`Found non-minimal home data at ${forbiddenHomeField}.`);
}

for (const [relativePath, rootData] of decodedRootData) {
  assertExactRecordFields(
    rootData,
    ["compactPortrait", "identity"],
    relativePath,
    "root loader",
  );
  assertExactRecordFields(
    rootData["identity"],
    ["displayName", "roleLabel"],
    relativePath,
    "root identity",
  );
  if (
    rootData["identity"]["displayName"] !== "Rahul Yadav" ||
    rootData["identity"]["roleLabel"] !== "Senior Software Engineer"
  ) {
    throw new Error(`Unexpected root identity in ${relativePath}.`);
  }
  assertResponsiveImageContract(
    rootData["compactPortrait"],
    {
      altText: "",
      expectedWidths: [96, 192],
      heightForWidth: (width) => (width * 5) / 4,
      pathFragment: "/assets/profile/rahul-yadav-portrait-compact-",
      variantCount: 6,
    },
    relativePath,
    "compact portrait",
  );
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
  "credibilityHighlights",
  "id",
  "order",
  "assetId",
  "sourcePath",
  "sha256",
  "byteSize",
  "metadataRemovalVerified",
  "pageCount",
  "linkCount",
  "linkValidationVerified",
  "approvedOn",
  "originalFilename",
  "intakeMediaType",
  "intakeWidth",
  "intakeHeight",
  "intakeByteSize",
  "intakeSha256",
  "publicDerivativePath",
  "publicDerivativeMediaType",
  "publicDerivativeWidth",
  "publicDerivativeHeight",
  "publicDerivativeByteSize",
  "publicDerivativeSha256",
  "metadataInspection",
  "intendedUse",
  "supportingClaimIds",
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

for (const [relativePath, loaderData] of decodedRootData) {
  const fieldPath = findPropertyPath(
    loaderData,
    new Set(forbiddenLoaderFields),
  );
  if (fieldPath !== undefined) {
    throw new Error(
      `Found a build-only root field in ${relativePath} at ${fieldPath}.`,
    );
  }
}

console.log(
  `Verified ${expectedDocuments.size} prerendered routes, ${expectedRouteData.length} route-data files, ${approvedPublicAssets.length} approved public assets, and the SPA fallback in build/client.`,
);
