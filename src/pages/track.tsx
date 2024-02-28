import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { api } from "~/utils/api";
import { motion } from "framer-motion";

function Track() {
  const router = useRouter();
  const orderId = useRouter().query.id as string;

  // const session = api.payment.getStripeSession.useQuery(
  //   { orderId },
  //   {
  //     enabled: router.isReady,
  //   },
  // );

  const { data: order } = api.order.getByStripeSessionId.useQuery(orderId, {
    enabled: router.isReady,
  });

  const { updateOrder } = useUpdateOrder();

  // useEffect(() => {
  //   if (order) {
  //     // reset order since it's been paid for
  //     updateOrder({
  //       newOrderDetails: {
  //         dateToPickUp: new Date(),
  //         timeToPickUp: "",
  //         items: [],
  //         discount: {
  //           title: "",
  //           value: 0,
  //         },
  //       },
  //     });

  //     router.push(`/track?id=${order.id}`).catch(console.error);
  //   }
  // }, [order, updateOrder, router]);

  return (
    <motion.div
      key={"payment-success"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-[6.05rem] min-h-dvh w-full !justify-start tablet:mt-32"
    >
      {orderId}
      {order?.firstName}
      {/* {session.data?.email && <p>Redirecting...</p>} */}
    </motion.div>
  );
}

export default Track;
