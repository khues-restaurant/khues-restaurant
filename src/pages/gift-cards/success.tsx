import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineMail } from "react-icons/md";
import { Button } from "~/components/ui/button";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import StaticLotus from "~/components/ui/StaticLotus";

import giftCardFront from "public/giftCards/giftCardFront.png";

export default function GiftCardSuccessPage() {
  return (
    <motion.div
      key={"gift-card-payment-success"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      // TODO: find a way css wise so that you don't have any scrollbar on tablet+ since this is guarenteed
      // to be a tiny tiny element on this page
      className="baseVertFlex min-h-[calc(100dvh-5rem)] w-full tablet:min-h-[calc(100dvh-6rem)]"
    >
      <div className="baseVertFlex relative max-w-80 gap-4 overflow-hidden rounded-lg border bg-gradient-to-br from-offwhite to-primary/10 px-6 py-8 shadow-md tablet:max-w-2xl tablet:p-12 tablet:pb-8">
        <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50 sm:-bottom-8 sm:-right-8 sm:size-24" />
        <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50 sm:-bottom-8 sm:-left-8 sm:size-24" />

        <Image
          src={giftCardFront}
          alt={"Khue's Restaurant Gift Card"}
          sizes="1600px"
          className="!relative !top-0 !size-full rounded-xl object-cover object-top shadow-lg"
        />

        <p className="mt-4 text-center text-lg font-medium tablet:mt-6">
          Thank you! Your Gift Card has been successfully processed.
        </p>

        <div className="baseVertFlex gap-4">
          <div className="baseFlex my-2 gap-4 rounded-md border bg-offwhite/60 p-4 text-sm shadow-inner">
            <MdOutlineMail className="size-5 shrink-0 tablet:size-6" />
            The e-Gift Card will be sent to the recipient&apos;s email address
            shortly.
          </div>

          <Button asChild>
            <Link
              prefetch={false}
              href={"/"}
              className="baseFlex mt-2 gap-2 tablet:mt-4"
            >
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
