import { PrismaClient } from "@prisma/client";
import { motion } from "framer-motion";
import { type GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdOutlineMail } from "react-icons/md";
import AnimatedLogo from "~/components/ui/AnimatedLogo";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { api } from "~/utils/api";

function PaymentSuccess({
  emailReceiptsAllowed,
}: {
  emailReceiptsAllowed: boolean;
}) {
  const { push, isReady, query } = useRouter();
  const sessionId = query.session_id as string;

  const { data: order } = api.order.getByStripeSessionId.useQuery(sessionId, {
    enabled: isReady,
    retryDelay: 1500,
    retry: 3,
  });

  const { updateOrder } = useUpdateOrder();

  // why did we name this orderHasBeenReset?
  const [orderHasBeenReset, setOrderHasBeenReset] = useState(false);

  useEffect(() => {
    if (order && !orderHasBeenReset) {
      setOrderHasBeenReset(true);

      if (localStorage.getItem("khue's-resetOrderDetails") === "true") {
        localStorage.setItem(
          "khue's-orderDetails",
          JSON.stringify({
            datetimeToPickUp: new Date(),
            isASAP: false,
            items: [],
            includeNapkinsAndUtensils: false,
            discountId: null,
          }),
        );

        localStorage.removeItem("khue's-resetOrderDetails");
      }

      setTimeout(() => {
        push(`/track?id=${order.id}`).catch(console.error);
      }, 3000);
    }
  }, [order, updateOrder, push, orderHasBeenReset]);

  // TODO: I have to imagine that the "missing" piece of this design is to add some images (probably of food items
  // right?), but idk the best way to incorporate them tbh.. you do have to remember that this page should ideally
  // be visible for no longer than like 5 seconds.. so parsing of the text should remain the main focus

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
      <div className="baseVertFlex max-w-80 gap-6 p-4 tablet:max-w-2xl tablet:gap-8 tablet:p-8">
        {/* Testing just this instead of the loading spinner below */}
        <AnimatedLogo className="size-36" />

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

  // maybe could have gotten this through clerk but w/e

  const user = await prisma.user.findUnique({
    where: {
      userId: ctx.query.userId as string,
    },
  });

  const emailReceiptsAllowed = user?.allowsEmailReceipts ?? false;

  return {
    props: {
      emailReceiptsAllowed,
    },
  };
};
