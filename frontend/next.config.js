/** @type {import("next").NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",   // on autorise les logos CDN / LinkedIn / domain externes
      }
    ]
  }
};

module.exports = nextConfig;
