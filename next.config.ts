import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep webpack and Turbopack caches isolated so switching bundlers never clobbers .next.
  distDir: process.env.NEXT_WEBPACK_DEV ? ".next-webpack" : ".next",
  experimental: {
    mdxRs: true,
  },
};

export default nextConfig;
