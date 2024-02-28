import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { api } from "~/utils/api";
import { motion } from "framer-motion";

function PaymentSuccess() {
  const { push, isReady } = useRouter();
  const sessionId = useRouter().query.session_id as string;

  const session = api.payment.getStripeSession.useQuery(
    { sessionId },
    {
      enabled: isReady,
    },
  );

  const { data: order } = api.order.getByStripeSessionId.useQuery(sessionId, {
    enabled: isReady,
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
          dateToPickUp: new Date(),
          timeToPickUp: "",
          items: [],
          discount: {
            title: "",
            value: 0,
          },
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
      className="baseVertFlex mt-[6.05rem] min-h-dvh w-full !justify-start tablet:mt-32"
    >
      <div className="baseVertFlex gap-4 tablet:!flex-row">
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

        {/* TODO: have this be the revealing text with from Aceternity UI snippet 
            prob want to even do logo fade in, then thank you text, then
            blurb below, then spinner fade in that order to make it more dynamic*/}

        {/* maybe include the animated checkmark? */}

        <h1 className="text-3xl font-semibold">Thank you!</h1>
      </div>

      <div className="baseVertFlex gap-4">
        <p>Your order has been processed and is being sent to our kitchen.</p>

        <div
          className="inline-block size-8 animate-spin rounded-full border-[4px] border-current border-t-transparent text-primary"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </motion.div>
  );
}

export default PaymentSuccess;
