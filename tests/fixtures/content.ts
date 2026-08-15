import type { LocalContentSource } from "../../app/domain/content";
import type { BuildAssetManifestEntry } from "../../app/content/content-schemas.server";

export function createValidContentFixture() {
  return {
    site: {
      identity: {
        id: "site-example",
        displayName: "Example Engineer",
        roleLabel: "Software Engineer",
        location: "London, United Kingdom",
        professionalPositioning: "Backend engineer",
        introduction: "Builds maintainable services and web applications.",
        opportunityStatement: "Open to suitable engineering opportunities.",
        careerStart: "2020-02",
        locale: "en-GB",
      },
      seo: {
        id: "seo-example",
        siteName: "Example Engineer",
        canonicalOrigin: "https://example.test",
        titleTemplate: "%s | Example Engineer",
        home: {
          title: "Example Engineer",
          description: "An example portfolio used by automated tests.",
          canonicalPath: "/",
          socialImageAssetId: "image-social",
        },
        projects: {
          title: "Projects | Example Engineer",
          description: "Published example projects.",
          canonicalPath: "/projects",
        },
        writings: {
          title: "Writings | Example Engineer",
          description: "Published example writings.",
          canonicalPath: "/writings",
        },
      },
      contacts: [
        {
          id: "contact-example-email",
          kind: "email",
          label: "hello@example.test",
          href: "mailto:hello@example.test",
          order: 10,
        },
        {
          id: "contact-example-phone",
          kind: "phone",
          label: "+1 202 555 0100",
          href: "tel:+12025550100",
          order: 30,
        },
      ],
      socialLinks: [
        {
          id: "social-example",
          platform: "code-host",
          label: "Code profile",
          url: "https://code.example.test/example",
          order: 10,
        },
      ],
      resumeAssets: [
        {
          id: "resume-example",
          publicationStatus: "draft",
          title: "Example résumé",
          path: "/assets/example-resume.pdf",
          mediaType: "application/pdf",
          downloadName: "example-resume.pdf",
        },
      ],
      images: [
        {
          id: "image-social",
          publicationStatus: "published",
          path: "/assets/example-social.webp",
          mediaType: "image/webp",
          width: 1200,
          height: 630,
          decorative: false,
          altText: "Abstract geometric shapes",
        },
      ],
    },
    professional: {
      experiences: [
        {
          id: "experience-example",
          organization: "Example Company",
          order: 10,
          featured: true,
          roles: [
            {
              id: "role-example",
              title: "Software Engineer",
              dates: {
                start: "2020-02",
                end: { kind: "present" },
              },
              summary: "Develops example systems.",
              responsibilities: [
                {
                  id: "claim-example-delivery",
                  order: 10,
                  text: "Delivered a tested example service.",
                },
                {
                  id: "claim-example-review",
                  order: 30,
                  text: "Reviewed changes with the engineering team.",
                },
              ],
              technologyIds: ["skill-typescript"],
              order: 10,
            },
          ],
        },
      ],
      credibilityHighlights: [
        {
          id: "highlight-example",
          lead: "Delivered a tested example service.",
          detail: "Built and released it with the example engineering team.",
          supportingClaimIds: ["claim-example-delivery"],
          order: 10,
        },
      ],
      skills: [
        { id: "skill-typescript", name: "TypeScript" },
        { id: "skill-testing", name: "Testing" },
      ],
      skillGroups: [
        {
          id: "skill-group-example",
          name: "Engineering",
          skills: [
            { skillId: "skill-typescript", order: 10 },
            { skillId: "skill-testing", order: 30 },
          ],
          order: 10,
        },
      ],
      education: [
        {
          id: "education-example",
          institution: "Example Institute",
          affiliation: "Example University",
          credential: "Bachelor of Engineering",
          fieldOfStudy: "Computer Engineering",
          dates: {
            start: "2016",
            end: { kind: "date", value: "2020" },
          },
          score: "Example score",
          order: 10,
        },
      ],
    },
    projects: [
      {
        id: "project-published",
        slug: "published-project",
        title: "Published project",
        publicationStatus: "published",
        projectStatus: "Complete",
        summary: "A complete published project.",
        problem: "A clear problem needed solving.",
        role: "Contributed to implementation.",
        approach: "Used a small typed architecture.",
        architecture: "A statically generated web application.",
        order: 30,
        featuredOrder: 20,
        decisions: [
          {
            id: "decision-published",
            order: 10,
            text: "Kept the design small.",
          },
        ],
        outcomes: [
          { id: "outcome-published", order: 10, text: "Met the stated goal." },
        ],
        technologyIds: ["skill-typescript"],
        links: [
          {
            id: "link-published-project",
            kind: "internal",
            label: "Project page",
            href: "/projects/published-project",
            order: 10,
          },
        ],
        imageAssetIds: ["image-social"],
        relatedProjectIds: [],
        seo: {
          title: "Published project | Example Engineer",
          description: "An example published project.",
          canonicalPath: "/projects/published-project",
          socialImageAssetId: "image-social",
        },
      },
      {
        id: "project-draft",
        slug: "draft-project",
        title: "Draft project",
        publicationStatus: "draft",
        decisions: [],
        outcomes: [],
        technologyIds: [],
        links: [],
        imageAssetIds: [],
        relatedProjectIds: [],
        featuredOrder: 40,
      },
      {
        id: "project-archived",
        slug: "archived-project",
        title: "Archived project",
        publicationStatus: "archived",
        decisions: [],
        outcomes: [],
        technologyIds: [],
        links: [],
        imageAssetIds: [],
        relatedProjectIds: [],
      },
    ],
    writings: [
      {
        metadata: {
          id: "writing-published",
          slug: "published-writing",
          title: "Published writing",
          publicationStatus: "published",
          summary: "A complete published article.",
          publishedOn: "2024-02-29",
          updatedOn: "2024-03-01",
          tags: ["testing"],
          featuredOrder: 10,
          coverImageAssetId: "image-social",
          seo: {
            title: "Published writing | Example Engineer",
            description: "An example published writing.",
            canonicalPath: "/writings/published-writing",
          },
        },
        article: { format: "provisional", text: "Example article content." },
      },
      {
        metadata: {
          id: "writing-draft",
          slug: "draft-writing",
          title: "Draft writing",
          publicationStatus: "draft",
          tags: [],
          featuredOrder: 30,
        },
      },
      {
        metadata: {
          id: "writing-archived",
          slug: "archived-writing",
          title: "Archived writing",
          publicationStatus: "archived",
          tags: [],
        },
      },
    ],
  } satisfies LocalContentSource;
}

export function createValidAssetManifestFixture() {
  return [
    {
      assetId: "resume-example",
      sourcePath: "source-assets/example-resume.pdf",
      sha256: "a".repeat(64),
      byteSize: 1024,
      metadataRemovalVerified: true,
      pageCount: 1,
      linkCount: 2,
      linkValidationVerified: true,
      approvedOn: "2026-01-15",
    },
    {
      assetId: "image-social",
      sourcePath: "source-assets/example-social.webp",
      sha256: "b".repeat(64),
      byteSize: 2048,
      metadataRemovalVerified: true,
      approvedOn: "2026-01-15",
    },
  ] satisfies readonly BuildAssetManifestEntry[];
}
