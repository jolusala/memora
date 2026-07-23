import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // sharp ships native bindings that Next's file tracing can miss when
  // bundling for the standalone output; keep it as a real require().
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
