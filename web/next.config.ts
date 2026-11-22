import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },

  webpack(config) {
    // OECL imports its scientific modules from ../laboratory. Those files
    // must resolve dependencies installed under web/node_modules in standalone
    // web builds; webpack's nearest-node_modules lookup otherwise starts at
    // the repository root and misses the web's pinned MCP client.
    config.resolve.modules = [
      ...(config.resolve.modules ?? ["node_modules"]),
      path.resolve(process.cwd(), "node_modules"),
    ];
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
      ".cjs": [".cts", ".cjs"],
    };
    return config;
  },
};

export default nextConfig;
