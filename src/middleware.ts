import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  publicRoutes: (req) =>
    !req.url.includes("/dashboard") && !req.url.includes("/profile"),

  // ignoredRoutes: [`/((?!api|trpc|domains))(_next.*|.+\\.[\\w]+$)`] idk is this wanted/needed?
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
