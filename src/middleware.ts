import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  // not intuitive to let every route be public, but we handle
  // proper auth protection in each trpc handler and in appropriate pages
  // with getServerSideProps
  publicRoutes: ["/(.*)"],

  // ignoredRoutes: [`/((?!api|trpc|domains))(_next.*|.+\\.[\\w]+$)`] idk is this wanted/needed?

  // TODO: could either leave as is or try and get /profile routes to be protected
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
