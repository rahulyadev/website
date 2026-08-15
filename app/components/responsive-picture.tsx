import type { ImgHTMLAttributes } from "react";

import type {
  ResponsiveImageData,
  ResponsiveImageVariant,
} from "../domain/route-data";

interface ResponsivePictureProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "alt" | "height" | "src" | "srcSet" | "width"
> {
  image: ResponsiveImageData;
  imageClassName?: string;
  sizes: string;
}

function variantsFor(
  image: ResponsiveImageData,
  mediaType: ResponsiveImageVariant["mediaType"],
) {
  return image.variants
    .filter((variant) => variant.mediaType === mediaType)
    .sort((left, right) => left.width - right.width);
}

function srcSet(variants: readonly ResponsiveImageVariant[]) {
  return variants
    .map((variant) => `${variant.path} ${String(variant.width)}w`)
    .join(", ");
}

export function ResponsivePicture({
  image,
  imageClassName,
  sizes,
  ...imageProps
}: ResponsivePictureProps) {
  const avif = variantsFor(image, "image/avif");
  const webp = variantsFor(image, "image/webp");
  const fallbackVariants = variantsFor(image, "image/jpeg");
  const fallback = fallbackVariants.at(-1);

  if (fallback === undefined) {
    throw new Error("Responsive images require a JPEG fallback.");
  }

  return (
    <picture>
      {avif.length > 0 ? (
        <source sizes={sizes} srcSet={srcSet(avif)} type="image/avif" />
      ) : null}
      {webp.length > 0 ? (
        <source sizes={sizes} srcSet={srcSet(webp)} type="image/webp" />
      ) : null}
      <img
        {...imageProps}
        alt={image.altText}
        className={imageClassName}
        height={fallback.height}
        sizes={sizes}
        src={fallback.path}
        srcSet={srcSet(fallbackVariants)}
        width={fallback.width}
      />
    </picture>
  );
}
