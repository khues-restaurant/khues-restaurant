import { format } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BiTimer } from "react-icons/bi";
import { CiGift } from "react-icons/ci";
import { FaCakeCandles } from "react-icons/fa6";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import TopProfileNavigationLayout from "~/components/layouts/TopProfileNavigationLayout";
import RevealFromTop from "~/components/ui/RevealFromTop";
import { Button } from "~/components/ui/button";
import { TabsContent } from "~/components/ui/tabs";
import WideFancySwirls from "~/components/ui/wideFancySwirls";
import useGetUserId from "~/hooks/useGetUserId";
import { api } from "~/utils/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import OrderSummary from "~/components/cart/OrderSummary";

function RecentOrders() {
  const userId = useGetUserId();
  const { data: user } = api.user.get.useQuery(userId, {
    enabled: !!userId,
  });

  const { data: recentOrders } = api.order.getUsersRecentOrders.useQuery(
    userId,
    {
      enabled: !!userId,
    },
  );

  // TODO: ah prob can't do the nested route level animated logo based on if user
  // api has been fetched, since this needs the recentOrders.. not the end of the world to define it here

  return (
    <motion.div
      key={"profile-recent-orders"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex relative w-full"
    >
      <TabsContent value="recent-orders">
        <div className="baseVertFlex relative mt-4 w-full p-4 transition-all tablet:my-8 tablet:p-8">
          {recentOrders && recentOrders.length > 0 ? (
            <>
              {recentOrders.map((order) => (
                <Accordion
                  key={order.id}
                  type="single"
                  collapsible
                  className="w-full"
                >
                  <AccordionItem value={order.id} className="border-none">
                    <AccordionTrigger className="baseFlex gap-2 py-2 text-lg text-primary !no-underline">
                      content here, mostly follow figma
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <OrderSummary order={order} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </>
          ) : (
            <div>
              chatgpt generated logo of idk an empty pho bowl or something?
              needs to be pretty detailed though can't use react-icons for this
              one and then something like "It looks like you haven't placed any
              orders yet. ButtonToOrderNowPage[Get started] with your first
              order today!
            </div>
          )}
        </div>
      </TabsContent>
    </motion.div>
  );
}

RecentOrders.PageLayout = TopProfileNavigationLayout;

export default RecentOrders;
