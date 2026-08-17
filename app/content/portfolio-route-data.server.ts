import type {
  CredibilityHighlight,
  DateRange,
  PublicImageAsset,
} from "../domain/content";
import type {
  HomeCredibilityCardData,
  HomePageData,
  HomeTextSegmentData,
  OrganizationLogoData,
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

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatPartialDate(value: string) {
  const [year, month, day] = value.split("-");
  if (year === undefined) {
    throw new Error(`Invalid validated date: ${value}.`);
  }
  if (month === undefined) return year;

  const monthLabel = monthLabels[Number(month) - 1];
  if (monthLabel === undefined) {
    throw new Error(`Invalid validated month: ${value}.`);
  }

  return day === undefined
    ? `${monthLabel} ${year}`
    : `${String(Number(day))} ${monthLabel} ${year}`;
}

function formatDateRange(dates: DateRange) {
  const end =
    dates.end.kind === "present"
      ? "Present"
      : formatPartialDate(dates.end.value);
  return `${formatPartialDate(dates.start)}–${end}`;
}

function projectOrganizationLogo(
  asset: PublicImageAsset,
): OrganizationLogoData {
  if (!asset.decorative || asset.altText !== "") {
    throw new Error(
      `Organization logo ${asset.id} must be decorative beside visible text.`,
    );
  }

  const { path, width, height, altText } = asset;
  return { path, width, height, altText };
}

const requiredCredibilityEvidence = [
  ["highlight-modernization-architecture", "claim-sopra-modernization"],
  ["highlight-full-stack-delivery", "claim-gainfront-greenfield"],
  ["highlight-delivery-leadership", "claim-sopra-leadership"],
  ["highlight-api-payload", "claim-sopra-payload-reduction"],
  ["highlight-test-coverage", "claim-gainfront-testing"],
] as const;

const homeCredibilityCards = [
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
      {
        label: "Delivery leadership",
        detail:
          "Led delivery for three engineers and reviewed PRs across Sopra Steria, Airbus, and partner teams, while strengthening persistence and authorization testing with database-backed pytest fixtures.",
      },
      {
        label: "Payload efficiency",
        detail:
          "Reduced primary data-grid API payloads from approximately 1.5–2 MB to below 1 MB through response shaping and Gzip compression, meeting the ALB-to-Lambda response limit.",
      },
      {
        label: "Test coverage",
        detail:
          "At Gainfront, helped raise backend test coverage by approximately 45 percentage points, from approximately 40% to 85%, while strengthening CI and linting checks.",
      },
    ],
  },
] satisfies readonly HomeCredibilityCardData[];

function projectCredibilityCards(
  highlights: readonly CredibilityHighlight[],
): readonly HomeCredibilityCardData[] {
  if (highlights.length !== requiredCredibilityEvidence.length) {
    throw new Error(
      "The five approved credibility evidence records are required.",
    );
  }

  const highlightsById = new Map(
    highlights.map((highlight) => [highlight.id, highlight]),
  );
  for (const [highlightId, claimId] of requiredCredibilityEvidence) {
    const highlight = highlightsById.get(highlightId);
    if (
      highlight?.supportingClaimIds.length !== 1 ||
      highlight.supportingClaimIds[0] !== claimId
    ) {
      throw new Error(
        `Credibility evidence ${highlightId} must retain its approved claim reference.`,
      );
    }
  }

  return homeCredibilityCards;
}

const resumeEmphasisByClaimId: Readonly<Record<string, readonly string[]>> = {
  "claim-sopra-modernization": [
    "Strangler Fig pattern",
    "AWS ALB listener-rule URL rewrite transforms",
  ],
  "claim-sopra-identity-authorization": [
    "identity, authorization, and configuration state",
    "FastAPI and React",
  ],
  "claim-sopra-workflow-migration": [
    "PHP to FastAPI/React",
    "multi-select React component",
  ],
  "claim-sopra-platform-capabilities": [
    "2 cross-cutting platform capabilities",
    "User Impersonation and Audit Logging",
  ],
  "claim-sopra-payload-reduction": ["~1.5-2 MB to <1 MB", "Gzip compression"],
  "claim-sopra-leadership": [
    "3 engineers",
    "reviewed PRs across Sopra, Airbus, and partner teams",
  ],
  "claim-gainfront-modernization": [
    "5 supplier-facing modules",
    "decoupled DRF APIs and a Vue.js/Quasar SPA",
  ],
  "claim-gainfront-greenfield": ["4 greenfield modules"],
  "claim-gainfront-rabbitmq-prototype": [
    "RabbitMQ-based asynchronous document-processing prototype",
  ],
  "claim-gainfront-authentication": [
    "JWT authentication with Redis-backed token revocation and API rate limiting",
  ],
  "claim-gainfront-testing": ["~45 percentage points (~40% to ~85%)", "pytest"],
  "claim-marsdevs-polestar": ["Polestar"],
  "claim-marsdevs-castapp": [
    "60%",
    "Python/Flask processing and GCP task orchestration",
  ],
  "claim-marsdevs-document-ai": ["Google Cloud Document AI", "35%"],
};

function projectEmphasizedText(
  claimId: string,
  text: string,
): readonly HomeTextSegmentData[] {
  const emphasizedPhrases = resumeEmphasisByClaimId[claimId];
  if (emphasizedPhrases === undefined) {
    throw new Error(`Missing public-resume emphasis mapping for ${claimId}.`);
  }

  const segments: HomeTextSegmentData[] = [];
  let cursor = 0;
  for (const phrase of emphasizedPhrases) {
    const phraseStart = text.indexOf(phrase, cursor);
    if (phraseStart < 0) {
      throw new Error(
        `Public-resume emphasis phrase "${phrase}" does not match ${claimId}.`,
      );
    }
    if (phraseStart > cursor) {
      segments.push({
        text: text.slice(cursor, phraseStart),
        emphasized: false,
      });
    }
    segments.push({ text: phrase, emphasized: true });
    cursor = phraseStart + phrase.length;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), emphasized: false });
  }

  if (segments.map((segment) => segment.text).join("") !== text) {
    throw new Error(`Emphasis segments do not reconstruct ${claimId}.`);
  }
  return segments;
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

  const education = overview.education.map((record) => {
    if (record.score === undefined) {
      throw new Error(
        `The approved education score is missing for ${record.institution}.`,
      );
    }

    return {
      institution: record.institution,
      credential: record.credential,
      fieldOfStudy: record.fieldOfStudy,
      dateRange: formatDateRange(record.dates),
      score: record.score,
      logo: projectOrganizationLogo(record.logo),
    };
  });

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
    credibilityCards: projectCredibilityCards(overview.credibilityHighlights),
    experiences: overview.experiences.map((experience) => ({
      organization: experience.organization,
      featured: experience.featured,
      logo: projectOrganizationLogo(experience.logo),
      roles: experience.roles.map((role) => ({
        title: role.title,
        dateRange: formatDateRange(role.dates),
        location: role.location,
        ...(role.engagement === undefined
          ? {}
          : {
              engagement: {
                label: "Customer engagement" as const,
                organization: role.engagement.organization,
              },
            }),
        summary: role.summary,
        contributions: role.responsibilities.map(({ id, text }) =>
          projectEmphasizedText(id, text),
        ),
        technologies: role.technologies.map(({ name }) => name),
      })),
    })),
    skillGroups: overview.skillGroups.map(({ category, name, skills }) => ({
      category,
      name,
      skills: skills.map((skill) => skill.name),
    })),
    education,
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
