import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { api } from "~/utils/api";
import { motion } from "framer-motion";
import { TextGenerateEffect } from "~/components/ui/TextGenerateEffect";

function PaymentSuccess() {
  const { push, isReady } = useRouter();
  const sessionId = useRouter().query.session_id as string;

  // const session = api.payment.getStripeSession.useQuery(
  //   { sessionId },
  //   {
  //     enabled: isReady,
  //   },
  // );
  // ^ I feel like this was copy pasted, since why would we want/need to get the session
  // at this point? The session should already be complete when this page is loaded

  const { data: order } = api.order.getByStripeSessionId.useQuery(sessionId, {
    enabled: isReady,
    refetchInterval: 1000,
    retry: 15, // prob excessive..
  });

  const { updateOrder } = useUpdateOrder();

  const [orderHasBeenReset, setOrderHasBeenReset] = useState(false);

  useEffect(() => {
    if (order && !orderHasBeenReset) {
      setOrderHasBeenReset(true);

      console.log("rerendering");

      // reset order since it's been paid for
      updateOrder({
        newOrderDetails: {
          datetimeToPickUp: new Date(),
          items: [],
          includeNapkinsAndUtensils: false,
        },
      });

      setTimeout(() => {
        push(`/track?id=${order.id}`).catch(console.error);
      }, 3000);
    }
  }, [order, updateOrder, push, orderHasBeenReset]);

  return (
    <motion.div
      key={"payment-success"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-[6.05rem] min-h-dvh w-full tablet:mt-32"
    >
      <div className="baseVertFlex max-w-80 gap-6 rounded-md border-2 border-primary p-4 shadow-lg tablet:max-w-2xl tablet:gap-8 tablet:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="baseVertFlex"
        >
          <Image
            src="/logo.webp"
            alt="Khue's header logo"
            style={{
              filter: "drop-shadow(0px 1px 0.5px hsla(336, 84%, 17%, 0.25))", // keep this?
            }}
            width={200}
            height={185}
            priority
          />
        </motion.div>

        {/* maybe include the animated checkmark? */}

        {/* <h1 className="text-3xl font-semibold">Thank you!</h1> */}
        <TextGenerateEffect
          words={"Thank you! Your order has been successfully placed."}
          startDelay={0.85}
          className="text-center text-lg font-semibold"
        />

        <div className="baseVertFlex gap-6 tablet:gap-8">
          {/* <p>Your order has been processed and is being sent to our kitchen.</p> */}
          <TextGenerateEffect
            words={"Sending your order to our kitchen."}
            startDelay={1.75}
            className="text-center"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 3.5 }}
            className="inline-block size-8 animate-spin rounded-full border-[4px] border-current border-t-transparent text-primary"
            role="status"
            aria-label="loading"
          >
            <span className="sr-only">Loading...</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default PaymentSuccess;
