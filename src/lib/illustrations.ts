import type { ImageMetadata } from "astro";

// Automatically import all image files in public/illustrations folder
const globbedIllustrations = import.meta.glob<ImageMetadata | string>(
  "/public/illustrations/*.{png,jpg,jpeg,webp,svg,gif,PNG,JPG,JPEG,WEBP,SVG,GIF}",
  { eager: true, import: "default" }
);

export interface Illustration {
  src: ImageMetadata | string;
  alt: string;
}

function formatAltText(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  return nameWithoutExt;
}

const entries = Object.entries(globbedIllustrations);

export const illustrationsAll: Illustration[] = entries.map(([path, imageMeta]) => {
  const filename = decodeURIComponent(path.split("/").pop() || "");
  let finalSrc: ImageMetadata | string = imageMeta;

  if (typeof imageMeta === "string") {
    finalSrc = imageMeta.replace(/^\/public/, "");
  } else if (!imageMeta) {
    finalSrc = path.replace(/^\/public/, "");
  }

  return {
    src: finalSrc,
    alt: formatAltText(filename),
  };
});

// Marquee rows used in the DesignWorksCard home widget
const half = Math.ceil(illustrationsAll.length / 2);
export const illustrationsRow1: Illustration[] = illustrationsAll.slice(0, half);
export const illustrationsRow2: Illustration[] = illustrationsAll.slice(half);
