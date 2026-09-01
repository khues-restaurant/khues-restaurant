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
    qualities: [75, 100],
  },
  typescript: {
    ignoreBuildErrors: true, // ideally don't want this, but our types are very transient right now
  },
  reactCompiler: true,
};
export default config;
