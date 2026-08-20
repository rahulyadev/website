import { useEffect, useId, useRef, useState } from "react";
import {
  IconButton,
  LinkButton,
  VisuallyHidden,
} from "@rahulyadev/design-system";

import type { HomePageData } from "../../domain/route-data";

interface ContactActionsProps {
  contacts: HomePageData["contacts"];
  location: HomePageData["location"];
  resume: HomePageData["resume"];
  socialLinks: HomePageData["socialLinks"];
}

function CopyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect height="13" rx="2" width="13" x="8" y="8" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 2.7a9.5 9.5 0 0 0-3 18.51c.48.09.65-.2.65-.46v-1.67c-2.65.58-3.21-1.13-3.21-1.13-.43-1.1-1.06-1.4-1.06-1.4-.87-.59.07-.58.07-.58.96.07 1.47.99 1.47.99.85 1.47 2.24 1.04 2.79.8.09-.62.33-1.04.61-1.28-2.12-.24-4.35-1.06-4.35-4.7 0-1.04.37-1.89.99-2.56-.1-.24-.43-1.21.09-2.52 0 0 .8-.26 2.61.98A9.1 9.1 0 0 1 12 7.36a9.1 9.1 0 0 1 2.38.32c1.81-1.24 2.61-.98 2.61-.98.52 1.31.19 2.28.09 2.52.61.67.98 1.52.98 2.56 0 3.65-2.23 4.45-4.36 4.69.34.3.65.88.65 1.78v2.5c0 .26.17.56.66.46A9.5 9.5 0 0 0 12 2.7Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6.6 8.2H3.4V21h3.2V8.2ZM5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm15.6 10.7c0-3.8-2-5.7-4.7-5.7a4.1 4.1 0 0 0-3.7 2v-1.8H9V21h3.2v-6.3c0-1.7.3-3.3 2.4-3.3 2 0 2.1 1.9 2.1 3.4V21H20v-7.3Z" />
    </svg>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  return platform === "linkedin" ? <LinkedInIcon /> : <GitHubIcon />;
}

function SocialAction({
  link,
}: {
  readonly link: HomePageData["socialLinks"][number];
}) {
  const tooltipId = useId();

  return (
    <a
      aria-describedby={tooltipId}
      aria-label={`${link.label} (opens in a new tab)`}
      className="contact-actions__social-link"
      href={link.url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span aria-hidden="true" className="contact-actions__social-icon">
        <SocialIcon platform={link.platform} />
      </span>
      <span
        className="contact-actions__social-tooltip"
        id={tooltipId}
        role="tooltip"
      >
        {link.label}
      </span>
    </a>
  );
}

export function ContactActions({
  contacts,
  location,
  resume,
  socialLinks,
}: ContactActionsProps) {
  const email = contacts.find((contact) => contact.kind === "email");
  const phone = contacts.find((contact) => contact.kind === "phone");
  const github = socialLinks.find((link) => link.platform === "github");
  const linkedin = socialLinks.find((link) => link.platform === "linkedin");
  const copyTooltipId = useId();
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [copyPhase, setCopyPhase] = useState<"idle" | "copied">("idle");
  const [copyAnnouncement, setCopyAnnouncement] = useState("");

  useEffect(
    () => () => {
      if (copyResetTimer.current !== undefined) {
        clearTimeout(copyResetTimer.current);
      }
    },
    [],
  );

  if (
    email === undefined ||
    phone === undefined ||
    github === undefined ||
    linkedin === undefined
  ) {
    throw new Error(
      "Approved email, phone, GitHub, and LinkedIn contacts are required.",
    );
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email.label);
      if (copyResetTimer.current !== undefined) {
        clearTimeout(copyResetTimer.current);
      }
      setCopyPhase("copied");
      setCopyAnnouncement("Email copied");
      copyResetTimer.current = setTimeout(() => {
        setCopyPhase("idle");
        copyResetTimer.current = undefined;
      }, 2_000);
    } catch {
      if (copyResetTimer.current !== undefined) {
        clearTimeout(copyResetTimer.current);
        copyResetTimer.current = undefined;
      }
      setCopyPhase("idle");
      setCopyAnnouncement("Copy failed. Use the email link instead.");
    }
  };

  return (
    <div className="contact-actions">
      <address className="contact-actions__details">
        <dl>
          <div className="contact-actions__row contact-actions__row--email">
            <dt>Email</dt>
            <dd className="contact-actions__email">
              <a href={email.href}>{email.label}</a>
              <span className="contact-actions__copy-control">
                <IconButton
                  aria-describedby={copyTooltipId}
                  aria-label="Copy email address"
                  data-copy-status={copyPhase}
                  onClick={() => {
                    void copyEmail();
                  }}
                  variant="ghost"
                >
                  {copyPhase === "copied" ? <CheckIcon /> : <CopyIcon />}
                </IconButton>
                <span
                  className="contact-actions__copy-tooltip"
                  id={copyTooltipId}
                  role="tooltip"
                >
                  {copyPhase === "copied" ? "Copied" : "Copy email"}
                </span>
              </span>
            </dd>
          </div>
          <div className="contact-actions__row contact-actions__row--phone">
            <dt>Phone</dt>
            <dd>
              <a href={phone.href}>{phone.label}</a>
            </dd>
          </div>
          <div className="contact-actions__row contact-actions__row--profiles">
            <dt>Profiles</dt>
            <dd>
              <div className="contact-actions__profile-row">
                <LinkButton
                  className="contact-actions__resume"
                  download={resume.downloadName}
                  href={resume.path}
                  size="small"
                  variant="secondary"
                >
                  Download resume
                </LinkButton>
                <ul
                  aria-label="Professional links"
                  className="contact-actions__socials"
                >
                  {[github, linkedin].map((link) => (
                    <li key={link.platform}>
                      <SocialAction link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            </dd>
          </div>
          <div className="contact-actions__row contact-actions__row--location">
            <dt>Location</dt>
            <dd>{location}</dd>
          </div>
        </dl>
      </address>

      <VisuallyHidden aria-live="polite" role="status">
        {copyAnnouncement}
      </VisuallyHidden>
    </div>
  );
}
