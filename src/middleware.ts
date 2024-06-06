import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isProfileRoute = createRouteMatcher(["/profile(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { redirectToSignIn, userId } = auth();

  // Restrict admin route to users with specific role within privateMetadata
  if (isDashboardRoute(req)) {
    if (!userId) {
      return redirectToSignIn();
    }

    const user = await clerkClient.users.getUser(userId);

    if (typeof user.privateMetadata !== "object") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (user.privateMetadata.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Restrict profile routes to signed in users
  if (isProfileRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
