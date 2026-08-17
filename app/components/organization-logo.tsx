import type { OrganizationLogoData } from "../domain/route-data";

interface OrganizationLogoProps {
  readonly logo: OrganizationLogoData;
}

export function OrganizationLogo({ logo }: OrganizationLogoProps) {
  return (
    <span className="organization-logo">
      <img
        alt={logo.altText}
        decoding="async"
        height={logo.height}
        loading="lazy"
        src={logo.path}
        width={logo.width}
      />
    </span>
  );
}
