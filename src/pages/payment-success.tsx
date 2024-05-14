import { useAuth } from "@clerk/nextjs";
import { PrismaClient } from "@prisma/client";
import { motion } from "framer-motion";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdOutlineMail } from "react-icons/md";
import Stripe from "stripe";
import AnimatedLotus from "~/components/ui/AnimatedLotus";
import { env } from "~/env";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { OrderDetails, useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getTodayAtMidnight } from "~/utils/getTodayAtMidnight";

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

  const { setOrderDetails } = useMainStore((state) => ({
    setOrderDetails: state.setOrderDetails,
  }));

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

  // resetting cart to empty state if user isn't logged in (since we already reset
  // their cart in their database row otherwise)
  useEffect(() => {
    // included the orderCompletedAt === null so that if user somehow navigates back to
    // this page sometime in the future, they won't (*shouldn't*) have their cart reset
    if (isLoaded && !isSignedIn && order?.orderCompletedAt === null) {
      const defaultCart = {
        datetimeToPickup: getTodayAtMidnight(),
        isASAP: false,
        items: [],
        includeNapkinsAndUtensils: false,
        discountId: null,
      } as OrderDetails;

      localStorage.setItem("khue's-orderDetails", JSON.stringify(defaultCart));
      setOrderDetails(defaultCart);
    }
  }, [isLoaded, isSignedIn, order, setOrderDetails]);

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
      <Head>
        <title>Payment success | Khue&apos;s</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta property="og:title" content="Payment success | Khue's"></meta>
        <meta
          property="og:url"
          content={`www.khueskitchen.com/payment-sucess?session_id=${sessionId}&userId=${userId}`}
        />
        <meta property="og:type" content="website" />
      </Head>

      <div className="baseVertFlex max-w-80 gap-6 p-4 tablet:max-w-2xl tablet:gap-8 tablet:p-8">
        <AnimatedLotus className="size-24 fill-primary" />

        <p className="mt-8 text-center text-lg font-semibold">
          Thank you! Your order has been successfully placed.
        </p>

        <div className="baseVertFlex gap-6 tablet:gap-8">
          {emailReceiptsAllowed && (
            <div className="baseFlex mt-4 gap-4 rounded-md border p-4 text-sm">
              <MdOutlineMail className="size-6" />
              Your email receipt has been sent and should arrive shortly.
            </div>
          )}

          <p className="text-center">
            Please wait while your order is sent to our kitchen.
          </p>

          {/* <motion.div
            key={"paymentSuccessSpinner"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 3.5 }}
            className="inline-block size-8 animate-spin rounded-full border-[4px] border-current border-t-transparent text-primary"
            role="status"
            aria-label="loading"
          >
            <span className="sr-only">Loading...</span>
          </motion.div> */}
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
    apiVersion: "2023-10-16",
  });

  const session = await stripe.checkout.sessions.retrieve(
    ctx.query.session_id as string,
  );

  if (session.customer_email === null) {
    return {
      props: {
        emailReceiptsAllowed: false,
      },
    };
  }

  const emailIsBlacklisted = await prisma.blacklistedEmail.findFirst({
    where: {
      emailAddress: session.customer_email,
    },
  });

  return {
    props: {
      emailReceiptsAllowed: !emailIsBlacklisted,
    },
  };
};
