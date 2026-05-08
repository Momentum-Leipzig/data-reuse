import NextImage, { ImageProps } from "next/image";

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

function withBasePath(src: string): string {
  if (!src.startsWith("/")) {
    return src;
  }

  if (!basePath || src === basePath || src.startsWith(`${basePath}/`)) {
    return src;
  }

  return `${basePath}${src}`;
}

export const Image: React.FC<ImageProps> = ({ src, ...rest }) => {
  const resolvedSrc = typeof src === "string" ? withBasePath(src) : src;

  return <NextImage src={resolvedSrc} {...rest} />;
};
