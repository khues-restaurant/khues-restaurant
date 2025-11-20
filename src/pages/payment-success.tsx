import { useAuth } from "@clerk/nextjs";
import { PrismaClient } from "@prisma/client";
import { motion } from "framer-motion";
import { type GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdOutlineMail, MdQuestionMark } from "react-icons/md";
import Stripe from "stripe";
import AnimatedLotus from "~/components/ui/AnimatedLotus";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import StaticLotus from "~/components/ui/StaticLotus";
import { env } from "~/env";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { api } from "~/utils/api";

function PaymentSuccess({
  emailReceiptsAllowed,
}: {
  emailReceiptsAllowed: boolean;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const { push, isReady, query } = useRouter();
  const sessionId = query.session_id as string;

  const { data: order } = api.order.getByStripeSessionId.useQuery(sessionId, {
    enabled: isReady && sessionId !== "GIFT_CARD_PAID",
    retryDelay: 1500,
    retry: 3,
  });

  const { data: giftCardOrder } = api.order.getById.useQuery(
    query.orderId as string,
    {
      enabled:
        isReady &&
        sessionId === "GIFT_CARD_PAID" &&
        typeof query.orderId === "string",
      retryDelay: 1500,
      retry: 3,
    },
  );

  const finalOrder = order ?? giftCardOrder ?? null;

  const { updateOrder } = useUpdateOrder();

  const [orderHasBeenAcknowledged, setOrderHasBeenAcknowledged] =
    useState(false);

  useEffect(() => {
    if (finalOrder && !orderHasBeenAcknowledged) {
      setOrderHasBeenAcknowledged(true);

      setTimeout(() => {
        push(`/track?id=${finalOrder.id}`).catch(console.error);
      }, 3000);
    }
  }, [
    finalOrder,
    updateOrder,
    push,
    orderHasBeenAcknowledged,
    isLoaded,
    isSignedIn,
  ]);

  return (
    <motion.div
      key={"payment-success"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      // TODO: find a way css wise so that you don't have any scrollbar on tablet+ since this is guarenteed
      // to be a tiny tiny element on this page
      className="baseVertFlex min-h-[calc(100dvh-5rem)] w-full tablet:min-h-[calc(100dvh-6rem)]"
    >
      <div className="baseVertFlex relative max-w-80 gap-4 overflow-hidden rounded-lg border bg-gradient-to-br from-offwhite to-primary/10 px-6 py-8 shadow-md tablet:max-w-2xl tablet:p-12 tablet:pb-8">
        {finalOrder === null ? (
          <>
            <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50 sm:-bottom-8 sm:-right-8 sm:size-24" />
            <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50 sm:-bottom-8 sm:-left-8 sm:size-24" />

            <MdQuestionMark className="mb-4 size-10" />

            <Separator />

            <div className="baseVertFlex gap-4 pb-6">
              <p className="text-center font-medium">
                We were unable to find your order.
              </p>

              <p className="text-center text-sm">
                If you think this is a mistake, please contact us.
              </p>

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
          </>
        ) : (
          <>
            <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50 sm:-bottom-8 sm:-right-8 sm:size-24" />
            <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50 sm:-bottom-8 sm:-left-8 sm:size-24" />
            <AnimatedLotus className="size-16 fill-primary tablet:size-24" />

            <p className="mt-4 text-center text-lg font-medium tablet:mt-6">
              Thank you! Your order has been successfully placed.
            </p>

            <div className="baseVertFlex gap-4">
              {emailReceiptsAllowed && (
                <div className="baseFlex my-2 gap-4 rounded-md border bg-offwhite/60 p-4 text-sm shadow-inner">
                  <MdOutlineMail className="size-5 shrink-0 tablet:size-6" />
                  Your email receipt has been sent and should arrive shortly.
                </div>
              )}

              <p className="mb-4 text-center sm:mb-8">
                Please wait while your order is sent to our kitchen.
              </p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default PaymentSuccess;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const prisma = new PrismaClient();

  if (!ctx.query.session_id || !ctx.query.userId) {
    return {
      props: {
        emailReceiptsAllowed: false,
      },
    };
  }

  // maybe could have gotten this through clerk but w/e

  const user = await prisma.user.findUnique({
    where: {
      userId: ctx.query.userId as string,
    },
  });

  if (user) {
    return {
      props: {
        emailReceiptsAllowed: user.allowsEmailReceipts,
      },
    };
  }

  if (ctx.query.session_id === "GIFT_CARD_PAID") {
    return {
      props: {
        emailReceiptsAllowed: true,
      },
    };
  }

  // check stripe session to get the email address to be able to check
  // whether it is in EmailBlacklist model in prisma
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover",
  });

  const session = await stripe.checkout.sessions.retrieve(
    ctx.query.session_id as string,
  );

  if (
    session.customer_details?.email === null ||
    session.customer_details?.email === undefined
  ) {
    return {
      props: {
        emailReceiptsAllowed: false,
      },
    };
  }

  const emailIsBlacklisted = await prisma.blacklistedEmail.findFirst({
    where: {
      emailAddress: session.customer_details.email,
    },
  });

  return {
    props: {
      emailReceiptsAllowed: !emailIsBlacklisted,
    },
  };
};
