import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // not intuitive to let every route be public, but we handle
  // proper auth protection in each trpc handler and in appropriate pages
  // with getServerSideProps
  publicRoutes: ["/(.*)"],

  // TODO: could either leave as is or try and get /profile routes to be protected
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
