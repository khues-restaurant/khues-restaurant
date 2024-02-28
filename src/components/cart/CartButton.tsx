import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useState } from "react";
import { LiaShoppingBagSolid } from "react-icons/lia";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import CartDrawerWrapper from "~/components/cart/CartDrawerWrapper";
import CartSheetWrapper from "~/components/cart/CartSheetWrapper";
import { Button } from "~/components/ui/button";
import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import { useMainStore } from "~/stores/MainStore";

function CartButton() {
  const { asPath } = useRouter();

  const { orderDetails } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
  }));

  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showCartSheet, setShowCartSheet] = useState(false);

  const viewportLabel = useGetViewportLabel();

  const totalItems = orderDetails.items.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  return (
    <>
      <Button
        variant={"outline"}
        className="baseFlex relative"
        onClick={() => {
          if (viewportLabel.includes("mobile")) {
            setShowCartDrawer(true);
          } else {
            setShowCartSheet(true);
          }
        }}
      >
        <LiaShoppingBagSolid className="h-6 w-6" />

        <AnimatePresence>
          {totalItems > 0 && (
            <motion.div
              key={"cart-item-count"}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute -right-2 -top-2 rounded-full bg-primary px-2 py-0.5 text-white"
            >
              <AnimatedNumbers value={totalItems} fontSize={16} padding={4} />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {viewportLabel.includes("mobile") ? (
        <CartDrawerWrapper
          showCartDrawer={showCartDrawer}
          setShowCartDrawer={setShowCartDrawer}
        />
      ) : (
        <CartSheetWrapper
          showCartSheet={showCartSheet}
          setShowCartSheet={setShowCartSheet}
        />
      )}
    </>
  );
}

export default CartButton;
