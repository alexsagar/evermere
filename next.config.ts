import type { NextConfig } from "next";
import { siteConfig } from "./src/lib/site";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    // Adds 1280/1440/1680 so common laptop widths are not served 1920px photographs.
    deviceSizes: [640, 750, 828, 1080, 1280, 1440, 1680, 1920, 2048, 3840],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" }],
  },
  async headers() {
    // noindex on every response unless production indexing is explicitly approved (src/lib/site.ts).
    // Development routes and the API stay noindex even then.
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    if (!siteConfig().indexable) return [{ source: "/:path*", headers: noindex }];
    return [{ source: "/dev/:path*", headers: noindex }, { source: "/api/:path*", headers: noindex }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
