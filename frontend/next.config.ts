import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true, // This forces Next.js to generate out/test/index.html instead of out/test.html, which is what Apache/Nginx expects for clean URLs
  basePath: "/leipzig-momentum-panel", // still needed because it's not a real domain root
  assetPrefix: "/leipzig-momentum-panel/",
};

export default nextConfig;
