import { useAuth } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LiaShoppingBagSolid } from "react-icons/lia";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import CartDrawerWrapper from "~/components/cart/CartDrawerWrapper";
import CartSheetWrapper from "~/components/cart/CartSheetWrapper";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import useGetUserId from "~/hooks/useGetUserId";
import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";

function CartButton() {
  const userId = useGetUserId();

  const { isSignedIn } = useAuth();

  const {
    orderDetails,
    cartInitiallyValidated,
    refetchMenu,
    refetchMinOrderPickupTime,
  } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    cartInitiallyValidated: state.cartInitiallyValidated,
    refetchMenu: state.refetchMenu,
    refetchMinOrderPickupTime: state.refetchMinOrderPickupTime,
  }));

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showCartSheet, setShowCartSheet] = useState(false);

  // was planning on having this be on orderDetails object, but feels flaky
  // to implement workaround for if user hits "undo" button (it will reset field to
  // an empty string, which would not be expected for the user)
  const [pickupName, setPickupName] = useState("");

  useEffect(() => {
    if (user && !cartInitiallyValidated && pickupName === "") {
      // set pickup name to user's name in db
      setPickupName(`${user.firstName} ${user.lastName}`);
    }
  }, [cartInitiallyValidated, pickupName, user]);

  useEffect(() => {
    if (showCartSheet || showCartDrawer) {
      refetchMenu?.();
      refetchMinOrderPickupTime?.();
    }
  }, [refetchMenu, refetchMinOrderPickupTime, showCartDrawer, showCartSheet]);

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
        <AnimatePresence mode="wait">
          {cartInitiallyValidated ? (
            <motion.div
              key={"cart-item-validated"}
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="baseFlex"
            >
              <LiaShoppingBagSolid className="h-6 w-6" />

              <div className="absolute size-6">
                <AnimatePresence mode="wait">
                  {totalItems > 0 && cartInitiallyValidated && (
                    <motion.div
                      key={"cart-item-count"}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: 0.35,
                        ease: "easeInOut",
                      }}
                      className={`absolute rounded-full bg-primary px-2 py-0.5 text-offwhite ${totalItems < 10 ? " -right-6 -top-4" : "-right-8 -top-4"}`}
                    >
                      <AnimatedNumbers
                        value={totalItems}
                        fontSize={14}
                        padding={6}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={"cartButtonBeingValidatedSpinner"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="mx-1 inline-block size-4 animate-spin rounded-full border-[2px] border-current border-t-transparent text-primary"
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
          pickupName={pickupName}
          setPickupName={setPickupName}
        />
      ) : (
        <CartSheetWrapper
          showCartSheet={showCartSheet}
          setShowCartSheet={setShowCartSheet}
          pickupName={pickupName}
          setPickupName={setPickupName}
        />
      )}
    </>
  );
}

export default CartButton;
