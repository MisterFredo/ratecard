/** @type {import("next").NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  // 🔑 IMPORTANT : transpiler le code partagé
  transpilePackages: ["shared"],

  async rewrites() {
    return [
      {
        source: "/media/:folder/:file",
        destination: "/api/media/raw/:folder/:file",
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
