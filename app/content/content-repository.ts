import type {
  ContentLookup,
  PortfolioOverview,
  PublishedProject,
  PublishedProjectCollection,
  PublishedWriting,
  PublishedWritingCollection,
  Slug,
} from "../domain/content";

export interface ContentRepository {
  getPortfolioOverview(): Promise<PortfolioOverview>;
  getPublishedProjects(): Promise<PublishedProjectCollection>;
  getPublishedProjectSlugs(): Promise<readonly Slug[]>;
  getProjectBySlug(
    slug: string,
  ): Promise<ContentLookup<PublishedProject, "project">>;
  getPublishedWritings(): Promise<PublishedWritingCollection>;
  getPublishedWritingSlugs(): Promise<readonly Slug[]>;
  getWritingBySlug(
    slug: string,
  ): Promise<ContentLookup<PublishedWriting, "writing">>;
}
