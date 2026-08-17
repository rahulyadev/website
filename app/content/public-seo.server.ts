import type { SeoMetadata } from "../domain/content";
import type { PublicSeoMetadata } from "../domain/route-data";

export function projectPublicSeoMetadata(
  metadata: SeoMetadata,
): PublicSeoMetadata {
  return {
    title: metadata.title,
    description: metadata.description,
    canonicalPath: metadata.canonicalPath,
  };
}
