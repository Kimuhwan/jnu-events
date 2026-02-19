import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages에서 runtime 제약이 있을 수 있어, 기본은 무난한 설정
  images: { unoptimized: true },
};

export default nextConfig;
