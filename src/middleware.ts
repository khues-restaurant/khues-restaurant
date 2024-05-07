import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isProfileRoute = createRouteMatcher(["/profile(.*)"]);

export default clerkMiddleware((auth, req) => {
  // Restrict admin route to users with specific role
  if (isDashboardRoute(req)) auth().protect({ role: "org:admin" });

  // otherwise, just check based on userId if roles are weird
  // ^ auth().userId;

  // Restrict profile routes to signed in users
  if (isProfileRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
