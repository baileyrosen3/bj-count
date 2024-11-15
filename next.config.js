const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config, { dev, isServer }) => {
    // Disable cache completely
    config.cache = false;

    // Add some performance optimizations
    config.optimization = {
      ...config.optimization,
      moduleIds: "deterministic",
      chunkIds: "deterministic",
      // Disable some memory-intensive optimizations in development
      minimize: !dev,
      splitChunks: dev ? false : config.optimization.splitChunks,
    };

    return config;
  },
  // Add some general Next.js optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
