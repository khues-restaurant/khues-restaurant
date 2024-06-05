/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: false,

  // not sure if these are really necessary since we will just be using generic user icons right?
  images: {
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

  experimental: {
    swcPlugins: [
      [
        "next-superjson-plugin",
        {
          excluded: [],
        },
      ],
    ],
  },

  crons: [
    // Daily at midnight CST (including offset for DST)
    {
      path: "/api/crons/resetDBMinPickupTime",
      schedule: "0 6 * * *",
    },
    {
      path: "/api/crons/bulkExpireRewards",
      schedule: "0 6 * * *",
    },
    // Monthly at 6:00 AM CST (including offset for DST)
    {
      path: "/api/crons/bulkRemoveExpiredEmailUnsubscribeTokens",
      schedule: "0 6 1 * *",
    },
  ],

  // TODO: remove these out before actual production
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

export default config;
