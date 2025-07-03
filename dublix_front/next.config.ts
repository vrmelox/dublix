import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  images: {
    remotePatterns:[
      {hostname:"images.pexels.com"},
      {hostname: "img.freepik.com"}
    ],
  }
};

export default nextConfig;