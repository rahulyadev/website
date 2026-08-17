import type {
  LocalContentSource,
  ValidatedContentSnapshot,
} from "../domain/content";
import { professionalContent } from "./public/professional-content.server";
import { projectsContent } from "./public/projects-content.server";
import { siteContent } from "./public/site-content.server";
import type { BuildAssetManifestEntry } from "./content-schemas.server";
import { validateContent } from "./validate-content.server";
import { loadWritingSources } from "./writing-sources.server";

const localContent = {
  site: siteContent,
  professional: professionalContent,
  projects: projectsContent,
} satisfies Omit<LocalContentSource, "writings">;

// Governance fields belong to this build-only manifest, never to public records.
const buildAssetManifest = [
  {
    assetId: "resume-public",
    sourcePath: "external-approved-source/full-stack-resume",
    sha256: "5fbee53357526963b6cd78cd472f16bcde7525a1607f85f737d61b2f8411a9b9",
    byteSize: 97_539,
    metadataRemovalVerified: true,
    pageCount: 1,
    linkCount: 4,
    linkValidationVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-main-400-avif",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "ff5e68ce66b405bb6c10212a9e1cb5d9ba1642607a7e8e1c47c392d0429bf2e5",
    byteSize: 24_286,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-main-400-webp",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "6d0811f85d124ee8f490acc12a8f250ed7a538fd39ae8df9413a92f76e4f2e47",
    byteSize: 39_244,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-main-400-jpeg",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "f4f66cf7a275afc8a151493ba3e6b682f00ca1805908aca8b08231332f142993",
    byteSize: 54_285,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-main-640-avif",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "c9e78ffc38c2e76807d776102d12b414949c302eb1f052d9b31987778592ba33",
    byteSize: 51_939,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-main-640-webp",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "bd6e20cabd4cf556a47d25ef18275cb1cc50450b7243f38b65b0253a907baa05",
    byteSize: 84_256,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-main-640-jpeg",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "654512d43bc30c5c9f70068aad87bc8fedd57e2c1c358cbad02ba19efac278d7",
    byteSize: 121_098,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-main-800-avif",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "03c525bf68aca8c829aa5398b2cdd2c817a6c162f42f05d4decf345cf24791ca",
    byteSize: 74_908,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-main-800-webp",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "a72daa11d7a320c2c2e272c625cf285228e8a8f5a3bfebe37309f233b655cc11",
    byteSize: 117_140,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-main-800-jpeg",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "1fff9c7cdb40a4a2e8988a894711a20ef5d7bf42ad99f208ede88d66334381d6",
    byteSize: 177_291,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-compact-96-avif",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "5ebb4ae73ee7ea3cc01ced0edfcfaddb83015655c404282da7d740719c16709f",
    byteSize: 2_615,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-compact-96-webp",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "97e4503f53db4ada526a146e7cf23023fd6e1baf776530849bdb3cb961bb6c6b",
    byteSize: 3_800,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-compact-96-jpeg",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "dc2efa2b007eb0f9f76aba18312ee7bb8e5c42d9c75544f5bb4d43278eed62a4",
    byteSize: 5_819,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-compact-192-avif",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "58ac21846daa823e3bd1b071d66131016c07f67e8e4b199b14b9611ff2a882cc",
    byteSize: 7_604,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-compact-192-webp",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "ea289ee6744652dae8fdf8a6a8266cfd15e9bfc6b8652d9aeb4d1f39a98557de",
    byteSize: 11_022,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "profile-compact-192-jpeg",
    sourcePath: "external-approved-source/profile-photograph",
    sha256: "5409786d32b9a454ab7aef757a4739933ac6f6bdb81d2369a5f34e3dbf5ae6f2",
    byteSize: 18_094,
    metadataRemovalVerified: true,
    approvedOn: "2026-08-15",
  },
  {
    assetId: "organization-logo-sopra-steria",
    sourcePath: "chat-attachment:soprasteria_logo.jpeg",
    originalFilename: "soprasteria_logo.jpeg",
    intakeMediaType: "image/jpeg",
    intakeWidth: 200,
    intakeHeight: 200,
    intakeByteSize: 6_816,
    intakeSha256:
      "884da523bb0662c22c08770ad7d82c6ecb4cd69e189f6c03ea2324e8da45aae1",
    publicDerivativePath: "/assets/organizations/sopra-steria.jpeg",
    publicDerivativeMediaType: "image/jpeg",
    publicDerivativeWidth: 200,
    publicDerivativeHeight: 200,
    publicDerivativeByteSize: 6_816,
    publicDerivativeSha256:
      "884da523bb0662c22c08770ad7d82c6ecb4cd69e189f6c03ea2324e8da45aae1",
    sha256: "884da523bb0662c22c08770ad7d82c6ecb4cd69e189f6c03ea2324e8da45aae1",
    byteSize: 6_816,
    metadataRemovalVerified: true,
    metadataInspection: {
      decoderVerified: true,
      frameCount: 1,
      metadataPresentAtIntake: false,
      metadataRemovalRequired: false,
      pixelEquivalenceVerified: true,
      trailingPayloadBytes: 0,
    },
    approvedOn: "2026-08-16",
    intendedUse: "experience-employer-logo",
  },
  {
    assetId: "organization-logo-gainfront",
    sourcePath: "chat-attachment:gainfront_logo.jpeg",
    originalFilename: "gainfront_logo.jpeg",
    intakeMediaType: "image/jpeg",
    intakeWidth: 200,
    intakeHeight: 200,
    intakeByteSize: 8_364,
    intakeSha256:
      "cb5cdbe5c8d1fcd45e76444bec8f133a2b3ca632be5b8b8dd35dbaf640cb7f54",
    publicDerivativePath: "/assets/organizations/gainfront.jpeg",
    publicDerivativeMediaType: "image/jpeg",
    publicDerivativeWidth: 200,
    publicDerivativeHeight: 200,
    publicDerivativeByteSize: 8_364,
    publicDerivativeSha256:
      "cb5cdbe5c8d1fcd45e76444bec8f133a2b3ca632be5b8b8dd35dbaf640cb7f54",
    sha256: "cb5cdbe5c8d1fcd45e76444bec8f133a2b3ca632be5b8b8dd35dbaf640cb7f54",
    byteSize: 8_364,
    metadataRemovalVerified: true,
    metadataInspection: {
      decoderVerified: true,
      frameCount: 1,
      metadataPresentAtIntake: false,
      metadataRemovalRequired: false,
      pixelEquivalenceVerified: true,
      trailingPayloadBytes: 0,
    },
    approvedOn: "2026-08-16",
    intendedUse: "experience-employer-logo",
  },
  {
    assetId: "organization-logo-marsdevs",
    sourcePath: "chat-attachment:marsdevs_logo.jpeg",
    originalFilename: "marsdevs_logo.jpeg",
    intakeMediaType: "image/jpeg",
    intakeWidth: 200,
    intakeHeight: 200,
    intakeByteSize: 5_264,
    intakeSha256:
      "a2fe753d1ff176ef6f551a19b85f103a4bd561e893f253c6ef994a0f95c5f46b",
    publicDerivativePath: "/assets/organizations/marsdevs.jpeg",
    publicDerivativeMediaType: "image/jpeg",
    publicDerivativeWidth: 200,
    publicDerivativeHeight: 200,
    publicDerivativeByteSize: 5_264,
    publicDerivativeSha256:
      "a2fe753d1ff176ef6f551a19b85f103a4bd561e893f253c6ef994a0f95c5f46b",
    sha256: "a2fe753d1ff176ef6f551a19b85f103a4bd561e893f253c6ef994a0f95c5f46b",
    byteSize: 5_264,
    metadataRemovalVerified: true,
    metadataInspection: {
      decoderVerified: true,
      frameCount: 1,
      metadataPresentAtIntake: false,
      metadataRemovalRequired: false,
      pixelEquivalenceVerified: true,
      trailingPayloadBytes: 0,
    },
    approvedOn: "2026-08-16",
    intendedUse: "experience-employer-logo",
  },
  {
    assetId: "organization-logo-university-of-mumbai",
    sourcePath: "chat-attachment:university_of_mumbai.jpeg",
    originalFilename: "university_of_mumbai.jpeg",
    intakeMediaType: "image/jpeg",
    intakeWidth: 200,
    intakeHeight: 200,
    intakeByteSize: 13_985,
    intakeSha256:
      "41371e7854f72e2215c9a8726bfb60b0ed8c497695a709bde783585f88472e42",
    publicDerivativePath: "/assets/organizations/university-of-mumbai.jpeg",
    publicDerivativeMediaType: "image/jpeg",
    publicDerivativeWidth: 200,
    publicDerivativeHeight: 200,
    publicDerivativeByteSize: 13_985,
    publicDerivativeSha256:
      "41371e7854f72e2215c9a8726bfb60b0ed8c497695a709bde783585f88472e42",
    sha256: "41371e7854f72e2215c9a8726bfb60b0ed8c497695a709bde783585f88472e42",
    byteSize: 13_985,
    metadataRemovalVerified: true,
    metadataInspection: {
      decoderVerified: true,
      frameCount: 1,
      metadataPresentAtIntake: false,
      metadataRemovalRequired: false,
      pixelEquivalenceVerified: true,
      trailingPayloadBytes: 0,
    },
    approvedOn: "2026-08-16",
    intendedUse: "education-institution-logo",
  },
] satisfies readonly BuildAssetManifestEntry[];

export interface ValidatedLocalContentAdapter {
  load(): Promise<ValidatedContentSnapshot>;
}

export class LocalContentAdapter implements ValidatedLocalContentAdapter {
  async load() {
    const writings = await loadWritingSources();
    return validateContent({ ...localContent, writings }, buildAssetManifest);
  }
}
