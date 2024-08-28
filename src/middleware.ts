import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isProfileRoute = createRouteMatcher(["/profile(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { redirectToSignIn, userId } = auth();

  // Restrict profile routes to signed in users
  if (isProfileRoute(req)) {
    auth().protect();
  }

  // Restrict admin route to users with specific role within privateMetadata
  else if (isDashboardRoute(req)) {
    if (!userId) {
      return redirectToSignIn();
    }

    const user = await clerkClient().users.getUser(userId);

    if (
      typeof user.privateMetadata !== "object" ||
      user.privateMetadata.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
