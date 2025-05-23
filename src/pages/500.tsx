import { motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import StaticLotus from "~/components/ui/StaticLotus";

function Custom500() {
  return (
    <motion.div
      key={"500"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      // TODO: find a way css wise so that you don't have any scrollbar on tablet+ since this is guarenteed
      // to be a tiny tiny element on this page
      className="baseVertFlex min-h-[calc(100dvh-5rem)] w-full tablet:min-h-[calc(100dvh-6rem)]"
    >
      <div className="baseVertFlex relative max-w-80 gap-4 overflow-hidden rounded-lg border bg-gradient-to-br from-offwhite to-primary/10 px-6 py-8 shadow-md tablet:max-w-2xl tablet:p-12 tablet:pb-8">
        <StaticLotus className="absolute -right-5 -top-5 size-16 rotate-[-135deg] fill-primary/50" />
        <StaticLotus className="absolute -left-5 -top-5 size-16 rotate-[135deg] fill-primary/50" />
        <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
        <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />

        <X className="mb-4 size-10" />

        <Separator />

        <div className="baseVertFlex gap-4 pb-6">
          <p className="text-center font-medium sm:text-lg">
            Oops! Something went wrong.
          </p>

          <p className="text-center text-sm">
            We encountered an unexpected error. Our team has been notified and
            is working to resolve the issue. We apologize for the inconvenience
            and appreciate your patience.
          </p>

          <Button asChild>
            <Link prefetch={false} href={"/"} className="baseFlex mt-2 gap-2">
              <SideAccentSwirls className="h-4 scale-x-[-1] fill-offwhite" />
              Return home
              <SideAccentSwirls className="h-4 fill-offwhite" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default Custom500;
