import type { NextConfig } from "next";
const withPWA = require("next-pwa")({
  dest: "public", // service worker en /public
  register: true,
  skipWaiting: true,
  // disable: process.env.NODE_ENV === "development", // desactivar en dev
});

const nextConfig: NextConfig = withPWA({
  reactStrictMode: true,
});

export default nextConfig;
