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
    viewportLabel,
    cartDrawerIsOpen,
    setCartDrawerIsOpen,
  } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    cartInitiallyValidated: state.cartInitiallyValidated,
    refetchMenu: state.refetchMenu,
    refetchMinOrderPickupTime: state.refetchMinOrderPickupTime,
    viewportLabel: state.viewportLabel,
    cartDrawerIsOpen: state.cartDrawerIsOpen,
    setCartDrawerIsOpen: state.setCartDrawerIsOpen,
  }));

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const [showCartSheet, setShowCartSheet] = useState(false);
  const [pickupName, setPickupName] = useState("");

  // ------ signed in flow ------
  useEffect(() => {
    if (user && !cartInitiallyValidated && pickupName === "") {
      // set pickup name to user's name in db
      setPickupName(`${user.firstName} ${user.lastName}`);
    }
  }, [cartInitiallyValidated, pickupName, user]);

  // ------ signed out flow ------
  useEffect(() => {
    if (!isSignedIn && !cartInitiallyValidated && pickupName === "") {
      // check localStorage for pickup name, and set it if it exists
      const pickupName = localStorage.getItem("khue's-pickupName");
      if (pickupName) {
        setPickupName(pickupName);
      }
    }
  }, [cartInitiallyValidated, isSignedIn, pickupName]);

  useEffect(() => {
    // unsure if cartInitiallyValidated is necessary here
    if (!isSignedIn && cartInitiallyValidated) {
      // keep localStorage pickupName in sync with state
      localStorage.setItem("khue's-pickupName", pickupName);
    }
  }, [cartInitiallyValidated, isSignedIn, pickupName]);

  useEffect(() => {
    if (showCartSheet || cartDrawerIsOpen) {
      refetchMenu?.();
      refetchMinOrderPickupTime?.();
    }
  }, [refetchMenu, refetchMinOrderPickupTime, cartDrawerIsOpen, showCartSheet]);

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
            setCartDrawerIsOpen(true);
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
