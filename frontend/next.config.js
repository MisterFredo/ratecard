/** @type {import("next").NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  // Oblige Next.js à exposer les fichiers statiques en mode standalone (Render)
  output: "standalone",

  // Autorise vraiment /media/* à être servi en production
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: "/media/:path*", // ne réécrit pas, mais force Next à exposer le dossier
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      }
    ]
  }
};

module.exports = nextConfig;
