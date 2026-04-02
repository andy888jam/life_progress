// next.config.ts — Next.js 設定：standalone 輸出模式（Docker 用）、better-sqlite3 外部套件

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
