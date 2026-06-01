/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: false,
  images: {
    localPatterns: [
      {
        pathname: "/_next/static/media/**",
        search: "?ts=*",
      },
      {
        pathname: "/_next/static/media/**",
      },
      {
        pathname: "/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "www.gravatar.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true, // ideally don't want this, but our types are very transient right now
  },
  reactCompiler: true,
};
export default config;
