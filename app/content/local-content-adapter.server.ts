import type {
  LocalContentSource,
  ValidatedContentSnapshot,
} from "../domain/content";
import { professionalContent } from "./public/professional-content.server";
import { projectsContent } from "./public/projects-content.server";
import { siteContent } from "./public/site-content.server";
import { writingsContent } from "./public/writings-content.server";
import type { BuildAssetManifestEntry } from "./content-schemas.server";
import { validateContent } from "./validate-content.server";

const localContent = {
  site: siteContent,
  professional: professionalContent,
  projects: projectsContent,
  writings: writingsContent,
} satisfies LocalContentSource;

// Governance fields belong to this build-only manifest, never to public records.
const buildAssetManifest = [] satisfies readonly BuildAssetManifestEntry[];

export interface ValidatedLocalContentAdapter {
  load(): Promise<ValidatedContentSnapshot>;
}

export class LocalContentAdapter implements ValidatedLocalContentAdapter {
  load() {
    return Promise.resolve(validateContent(localContent, buildAssetManifest));
  }
}
