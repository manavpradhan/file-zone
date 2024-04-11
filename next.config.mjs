/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "amicable-manatee-303.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
