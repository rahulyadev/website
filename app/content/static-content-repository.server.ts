import type {
  PortfolioOverview,
  PublishedProject,
  PublishedWriting,
  ResolvedEducation,
  ResolvedExperience,
  ResolvedProfileImage,
  ResolvedSkillGroup,
  SiteIdentity,
  Skill,
  ValidatedContentSnapshot,
} from "../domain/content";
import type { ContentRepository } from "./content-repository";
import type { ValidatedLocalContentAdapter } from "./local-content-adapter.server";

function sortByOrder<T extends { readonly order: number }>(
  values: readonly T[],
) {
  return [...values].sort((left, right) => left.order - right.order);
}

function isPublishedProject(
  project: ValidatedContentSnapshot["projects"][number],
): project is PublishedProject {
  return project.publicationStatus === "published";
}

function isPublishedWriting(
  writing: ValidatedContentSnapshot["writings"][number],
): writing is PublishedWriting {
  return writing.metadata.publicationStatus === "published";
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }

  for (const child of Object.values(value)) {
    deepFreeze(child);
  }

  return Object.freeze(value);
}

function approximateYearsSince(careerStart: string, currentDate: Date) {
  const [yearText, monthText = "01"] = careerStart.split("-");
  const startYear = Number(yearText);
  const startMonth = Number(monthText);
  const elapsedMonths =
    (currentDate.getUTCFullYear() - startYear) * 12 +
    (currentDate.getUTCMonth() + 1 - startMonth);

  return Math.max(0, Math.round(elapsedMonths / 12));
}

function resolveSkillGroups(snapshot: ValidatedContentSnapshot) {
  const skills = new Map<string, Skill>(
    snapshot.professional.skills.map((skill) => [skill.id, skill]),
  );

  return sortByOrder(snapshot.professional.skillGroups).map<ResolvedSkillGroup>(
    (group) => ({
      id: group.id,
      category: group.category,
      name: group.name,
      order: group.order,
      skills: sortByOrder(group.skills).map((reference) => {
        const skill = skills.get(reference.skillId);

        if (skill === undefined) {
          throw new Error(
            `Validated skill group ${group.id} lost skill ${reference.skillId}.`,
          );
        }

        return skill;
      }),
    }),
  );
}

function resolveExperiences(
  snapshot: ValidatedContentSnapshot,
): readonly ResolvedExperience[] {
  const images = new Map(
    snapshot.site.images.map((image) => [image.id, image]),
  );
  const skills = new Map<string, Skill>(
    snapshot.professional.skills.map((skill) => [skill.id, skill]),
  );

  return snapshot.professional.experiences
    .map<ResolvedExperience>((experience) => {
      const logo = images.get(experience.logoAssetId);
      if (logo?.publicationStatus !== "published") {
        throw new Error(
          `Validated experience ${experience.id} lost published logo ${experience.logoAssetId}.`,
        );
      }

      return {
        id: experience.id,
        organization: experience.organization,
        featured: experience.featured,
        order: experience.order,
        logo,
        roles: [...experience.roles]
          .sort(
            (left, right) =>
              right.dates.start.localeCompare(left.dates.start) ||
              left.order - right.order,
          )
          .map((role) => ({
            id: role.id,
            title: role.title,
            dates: role.dates,
            location: role.location,
            ...(role.engagement === undefined
              ? {}
              : { engagement: role.engagement }),
            summary: role.summary,
            responsibilities: sortByOrder(role.responsibilities),
            technologies: role.technologyIds.map((technologyId) => {
              const skill = skills.get(technologyId);
              if (skill === undefined) {
                throw new Error(
                  `Validated experience role ${role.id} lost technology ${technologyId}.`,
                );
              }
              return skill;
            }),
            order: role.order,
          })),
      };
    })
    .sort((left, right) => {
      const leftStart = left.roles[0]?.dates.start ?? "";
      const rightStart = right.roles[0]?.dates.start ?? "";
      return rightStart.localeCompare(leftStart) || left.order - right.order;
    });
}

function resolveEducation(
  snapshot: ValidatedContentSnapshot,
): readonly ResolvedEducation[] {
  const images = new Map(
    snapshot.site.images.map((image) => [image.id, image]),
  );

  return sortByOrder(snapshot.professional.education).map((record) => {
    const logo = images.get(record.logoAssetId);
    if (logo?.publicationStatus !== "published") {
      throw new Error(
        `Validated education ${record.id} lost published logo ${record.logoAssetId}.`,
      );
    }

    return {
      id: record.id,
      institution: record.institution,
      credential: record.credential,
      fieldOfStudy: record.fieldOfStudy,
      dates: record.dates,
      ...(record.score === undefined ? {} : { score: record.score }),
      order: record.order,
      logo,
    };
  });
}

function resolveProfileImage(
  snapshot: ValidatedContentSnapshot,
): ResolvedProfileImage | undefined {
  const source = snapshot.site.profileImage;
  if (source === undefined) return undefined;

  const images = new Map(
    snapshot.site.images.map((image) => [image.id, image]),
  );
  const resolve = (assetIds: readonly string[]) =>
    assetIds.map((assetId) => {
      const image = images.get(assetId);
      if (image?.publicationStatus !== "published") {
        throw new Error(
          `Validated profile image lost published asset ${assetId}.`,
        );
      }
      return image;
    });

  return {
    main: resolve(source.mainAssetIds),
    compact: resolve(source.compactAssetIds),
  };
}

function publicationDateDescending(
  left: PublishedWriting,
  right: PublishedWriting,
) {
  return (
    right.metadata.publishedOn.localeCompare(left.metadata.publishedOn) ||
    left.metadata.slug.localeCompare(right.metadata.slug)
  );
}

export class StaticContentRepository implements ContentRepository {
  private snapshotPromise: Promise<ValidatedContentSnapshot> | undefined;

  constructor(
    private readonly adapter: ValidatedLocalContentAdapter,
    private readonly currentDate: () => Date = () => new Date(),
  ) {}

  private async snapshot() {
    this.snapshotPromise ??= this.adapter
      .load()
      .then((snapshot) => deepFreeze(snapshot));
    return this.snapshotPromise;
  }

  private async publishedProjects() {
    const snapshot = await this.snapshot();
    return snapshot.projects.filter(isPublishedProject).sort((left, right) => {
      return left.order - right.order || left.slug.localeCompare(right.slug);
    });
  }

  private async publishedWritings() {
    const snapshot = await this.snapshot();
    return snapshot.writings
      .filter(isPublishedWriting)
      .sort(publicationDateDescending);
  }

  async getPortfolioOverview(): Promise<PortfolioOverview> {
    const snapshot = await this.snapshot();
    const identity: SiteIdentity = {
      ...snapshot.site.identity,
      approximateYearsExperience: approximateYearsSince(
        snapshot.site.identity.careerStart,
        this.currentDate(),
      ),
    };
    const [publishedProjects, publishedWritings] = await Promise.all([
      this.publishedProjects(),
      this.publishedWritings(),
    ]);

    return deepFreeze({
      identity,
      seo: snapshot.site.seo.home,
      canonicalOrigin: snapshot.site.seo.canonicalOrigin,
      contacts: sortByOrder(snapshot.site.contacts),
      socialLinks: sortByOrder(snapshot.site.socialLinks),
      experiences: resolveExperiences(snapshot),
      credibilityHighlights: sortByOrder(
        snapshot.professional.credibilityHighlights,
      ),
      skillGroups: resolveSkillGroups(snapshot),
      education: resolveEducation(snapshot),
      featuredProjects: publishedProjects
        .filter((project) => project.featuredOrder !== undefined)
        .sort(
          (left, right) =>
            (left.featuredOrder ?? Number.MAX_SAFE_INTEGER) -
            (right.featuredOrder ?? Number.MAX_SAFE_INTEGER),
        ),
      recentWritings: publishedWritings.slice(0, 3),
      resumeAsset: snapshot.site.resumeAssets.find(
        (asset) => asset.publicationStatus === "published",
      ),
      profileImage: resolveProfileImage(snapshot),
    });
  }

  async getPublishedProjects() {
    const snapshot = await this.snapshot();
    return deepFreeze({
      seo: snapshot.site.seo.projects,
      canonicalOrigin: snapshot.site.seo.canonicalOrigin,
      items: await this.publishedProjects(),
    });
  }

  async getPublishedProjectSlugs() {
    return deepFreeze(
      (await this.publishedProjects()).map((project) => project.slug),
    );
  }

  async getProjectBySlug(slug: string) {
    const project = (await this.publishedProjects()).find(
      (candidate) => candidate.slug === slug,
    );

    return deepFreeze(
      project === undefined
        ? {
            kind: "not-found" as const,
            contentType: "project" as const,
            requestedSlug: slug,
          }
        : { kind: "found" as const, content: project },
    );
  }

  async getPublishedWritings() {
    const snapshot = await this.snapshot();
    return deepFreeze({
      seo: snapshot.site.seo.writings,
      canonicalOrigin: snapshot.site.seo.canonicalOrigin,
      items: await this.publishedWritings(),
    });
  }

  async getPublishedWritingSlugs() {
    return deepFreeze(
      (await this.publishedWritings()).map((writing) => writing.metadata.slug),
    );
  }

  async getWritingBySlug(slug: string) {
    const writing = (await this.publishedWritings()).find(
      (candidate) => candidate.metadata.slug === slug,
    );

    return deepFreeze(
      writing === undefined
        ? {
            kind: "not-found" as const,
            contentType: "writing" as const,
            requestedSlug: slug,
          }
        : { kind: "found" as const, content: writing },
    );
  }
}
