import type { SiteContentSource } from "../../domain/content";

export const siteContent = {
  identity: {
    id: "site-identity",
    displayName: "Rahul Yadav",
    professionalPositioning:
      "Senior backend and backend-heavy full-stack engineer",
    introduction:
      "Modernizes enterprise platforms and delivers Python services and backend-heavy full-stack systems across API and data design, frontend integration, testing, and release.",
    careerStart: "2020-11",
    locale: "en-IN",
  },
  seo: {
    id: "seo-defaults",
    siteName: "Rahul Yadav",
    canonicalOrigin: "https://rahuly.in",
    titleTemplate: "%s | Rahul Yadav",
    home: {
      title: "Rahul Yadav | Senior Backend and Full-Stack Engineer",
      description:
        "Rahul Yadav is a senior backend and backend-heavy full-stack engineer working across Python, FastAPI, Django, React, PostgreSQL, and AWS.",
      canonicalPath: "/",
    },
    projects: {
      title: "Projects | Rahul Yadav",
      description:
        "Approved project case studies will be added in a later portfolio milestone.",
      canonicalPath: "/projects",
    },
    writings: {
      title: "Writings | Rahul Yadav",
      description:
        "Published technical writings will be added in a later portfolio milestone.",
      canonicalPath: "/writings",
    },
  },
  contacts: [
    {
      id: "contact-email",
      kind: "email",
      label: "rahulyadevx@gmail.com",
      href: "mailto:rahulyadevx@gmail.com",
      order: 10,
    },
    {
      id: "contact-phone",
      kind: "phone",
      label: "+91 96195 63665",
      href: "tel:+919619563665",
      order: 20,
    },
  ],
  socialLinks: [
    {
      id: "social-linkedin",
      platform: "linkedin",
      label: "LinkedIn",
      url: "https://linkedin.com/in/rahulyadev",
      order: 10,
    },
    {
      id: "social-github",
      platform: "github",
      label: "GitHub",
      url: "https://github.com/rahulyadev",
      order: 20,
    },
  ],
  resumeAssets: [],
  images: [],
} satisfies SiteContentSource;
