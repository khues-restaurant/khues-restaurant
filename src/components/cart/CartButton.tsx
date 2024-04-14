import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useState } from "react";
import { LiaShoppingBagSolid } from "react-icons/lia";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import CartDrawerWrapper from "~/components/cart/CartDrawerWrapper";
import CartSheetWrapper from "~/components/cart/CartSheetWrapper";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import { useMainStore } from "~/stores/MainStore";

function CartButton() {
  const { orderDetails, cartInitiallyValidated } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    cartInitiallyValidated: state.cartInitiallyValidated,
  }));

  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showCartSheet, setShowCartSheet] = useState(false);

  const viewportLabel = useGetViewportLabel();

  const totalItems = orderDetails.items.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  const { dismiss: dismissToasts } = useToast();

  return (
    <>
      <Button
        variant={"outline"}
        disabled={!cartInitiallyValidated}
        className="baseFlex relative"
        onClick={() => {
          dismissToasts();

          if (viewportLabel.includes("mobile")) {
            setShowCartDrawer(true);
          } else {
            setShowCartSheet(true);
          }
        }}
      >
        <AnimatePresence mode="popLayout">
          {cartInitiallyValidated ? (
            <motion.div
              key={"cart-item-validated"}
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="baseFlex"
            >
              <LiaShoppingBagSolid className="h-6 w-6" />

              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.div
                    key={"cart-item-count"}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: 0.35,
                      ease: "easeOut",
                    }}
                    className="absolute -right-2 -top-2 rounded-full bg-primary px-2 py-0.5 text-white"
                  >
                    <AnimatedNumbers
                      value={totalItems}
                      fontSize={14}
                      padding={6}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key={"cartButtonBeingValidatedSpinner"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="inline-block size-4 animate-spin rounded-full border-[2px] border-current border-t-transparent text-primary"
              role="status"
              aria-label="loading"
            >
              <span className="sr-only">Loading...</span>
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
