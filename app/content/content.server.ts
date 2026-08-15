import type { ContentRepository } from "./content-repository";
import { LocalContentAdapter } from "./local-content-adapter.server";
import { StaticContentRepository } from "./static-content-repository.server";

let repository: ContentRepository | undefined;

export function getContentRepository(): ContentRepository {
  repository ??= new StaticContentRepository(new LocalContentAdapter());
  return repository;
}
