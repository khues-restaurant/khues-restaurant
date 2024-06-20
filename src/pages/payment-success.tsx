import { useAuth } from "@clerk/nextjs";
import { PrismaClient } from "@prisma/client";
import { motion } from "framer-motion";
import { type GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdOutlineMail } from "react-icons/md";
import Stripe from "stripe";
import AnimatedLotus from "~/components/ui/AnimatedLotus";
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
  const userId = query.userId as string;

  const { data: order } = api.order.getByStripeSessionId.useQuery(sessionId, {
    enabled: isReady,
    retryDelay: 1500,
    retry: 3,
  });

  const { updateOrder } = useUpdateOrder();

  const [orderHasBeenAcknowledged, setOrderHasBeenAcknowledged] =
    useState(false);

  useEffect(() => {
    if (order && !orderHasBeenAcknowledged) {
      setOrderHasBeenAcknowledged(true);

      setTimeout(() => {
        push(`/track?id=${order.id}`).catch(console.error);
      }, 3000);
    }
  }, [
    order,
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
      className="baseVertFlex mt-24 min-h-[calc(100dvh-6rem)] w-full tablet:mt-28 tablet:min-h-[calc(100dvh-7rem)]"
    >
      <div className="baseVertFlex relative max-w-80 gap-4 overflow-hidden rounded-lg border bg-gradient-to-br from-offwhite to-primary/10 px-6 py-8 shadow-md tablet:max-w-2xl tablet:p-12">
        <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
        <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />
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

          <p className="text-center">
            Please wait while your order is sent to our kitchen.
          </p>
        </div>
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

  // check stripe session to get the email address to be able to check
  // whether it is in EmailBlacklist model in prisma
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-04-10",
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
