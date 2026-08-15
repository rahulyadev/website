import type { PublicImageAsset } from "../domain/content";
import type {
  HomePageData,
  ResponsiveImageData,
  SiteShellData,
} from "../domain/route-data";
import type { ContentRepository } from "./content-repository";
import { getContentRepository } from "./content.server";

function projectPortrait(
  assets: readonly PublicImageAsset[],
): ResponsiveImageData {
  const first = assets[0];
  if (first === undefined) {
    throw new Error("The approved profile image set is missing.");
  }

  if (assets.some((asset) => asset.altText !== first.altText)) {
    throw new Error("Profile image variants must share alternative text.");
  }

  return {
    altText: first.altText,
    variants: assets.map(({ height, mediaType, path, width }) => ({
      height,
      mediaType,
      path,
      width,
    })),
  };
}

export async function loadSiteShellData(
  repository: ContentRepository = getContentRepository(),
): Promise<SiteShellData> {
  const overview = await repository.getPortfolioOverview();
  const compact = overview.profileImage?.compact;
  if (compact === undefined) {
    throw new Error("The approved compact profile image is missing.");
  }

  return {
    identity: {
      displayName: overview.identity.displayName,
      roleLabel: overview.identity.roleLabel,
    },
    compactPortrait: projectPortrait(compact),
  };
}

export async function loadHomePageData(
  repository: ContentRepository = getContentRepository(),
): Promise<HomePageData> {
  const overview = await repository.getPortfolioOverview();
  const mainPortrait = overview.profileImage?.main;
  const resume = overview.resumeAsset;

  if (mainPortrait === undefined) {
    throw new Error("The approved main profile image is missing.");
  }
  if (resume === undefined) {
    throw new Error("The approved public resume is missing.");
  }

  const contacts = overview.contacts.map(({ href, kind, label }) => ({
    href,
    kind,
    label,
  }));
  const socialLinks = overview.socialLinks
    .filter(
      (link) => link.platform === "github" || link.platform === "linkedin",
    )
    .map(({ label, platform, url }) => ({ label, platform, url }));

  if (!contacts.some((contact) => contact.kind === "email")) {
    throw new Error("The approved email contact is missing.");
  }
  if (!contacts.some((contact) => contact.kind === "phone")) {
    throw new Error("The approved phone contact is missing.");
  }
  if (socialLinks.length !== 2) {
    throw new Error("The approved GitHub and LinkedIn links are required.");
  }

  return {
    canonicalOrigin: overview.canonicalOrigin,
    seo: overview.seo,
    location: overview.identity.location,
    identity: {
      displayName: overview.identity.displayName,
      roleLabel: overview.identity.roleLabel,
      professionalPositioning: overview.identity.professionalPositioning,
      introduction: overview.identity.introduction,
      opportunityStatement: overview.identity.opportunityStatement,
    },
    credibilityHighlights: overview.credibilityHighlights.map(
      ({ detail, lead }) => ({ detail, lead }),
    ),
    contacts,
    socialLinks,
    resume: {
      downloadName: resume.downloadName,
      path: resume.path,
      title: resume.title,
    },
    portrait: projectPortrait(mainPortrait),
  };
}
