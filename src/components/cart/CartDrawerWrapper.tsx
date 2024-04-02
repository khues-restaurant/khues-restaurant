import { type MenuItem } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState, type Dispatch, type SetStateAction } from "react";
import CartDrawer from "~/components/cart/CartDrawer";
import GuestCheckoutDrawer from "~/components/cart/GuestCheckoutDrawer";
import RewardsDrawer from "~/components/cart/RewardsDrawer";
import ItemCustomizationDrawer from "~/components/itemCustomization/ItemCustomizationDrawer";
import { Drawer, DrawerContent } from "~/components/ui/drawer";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { useMainStore, type Item } from "~/stores/MainStore";

interface CartDrawerWrapper {
  showCartDrawer: boolean;
  setShowCartDrawer: Dispatch<SetStateAction<boolean>>;
}
function CartDrawerWrapper({
  showCartDrawer,
  setShowCartDrawer,
}: CartDrawerWrapper) {
  const { orderDetails } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
  }));

  const [itemBeingModified, setItemBeingModified] =
    useState<FullMenuItem | null>(null);

  const [showRewardsDrawer, setShowRewardsDrawer] = useState(false);

  const [guestCheckoutView, setGuestCheckoutView] = useState<
    "credentialsForm" | "mainView" | "notShowing"
  >("notShowing");
  const [initialItemState, setInitialItemState] = useState<Item>();

  function getDrawerHeight() {
    if (guestCheckoutView === "credentialsForm") {
      return "535px";
    } else if (guestCheckoutView === "mainView") {
      return "500px";
    }

    return "85dvh";
  }

  return (
    <Drawer
      open={showCartDrawer}
      onOpenChange={(open) => {
        setShowCartDrawer(open);

        if (!open) {
          setItemBeingModified(null);
          setInitialItemState(undefined);
          setGuestCheckoutView("notShowing");
        }
      }}
    >
      <DrawerContent>
        <div
          style={{
            height: getDrawerHeight(),
            transition: "height 0.3s ease-in-out",
          }}
          className="baseVertFlex relative h-auto w-full !justify-start"
          // TODO: currently since this is flex, upon transitioning both the prev and current contianers
          // will be rendered one on top of each other so it looks like the component is slightly moving
          // down/up, see if you can't readjust structure to maybe be under same div somehow?
        >
          {/* idk about height yet, could be flat 85dvh but might look weird on certain viewports */}

          <AnimatePresence mode="popLayout" initial={false}>
            {guestCheckoutView === "notShowing" &&
              !itemBeingModified &&
              !showRewardsDrawer && (
                <motion.div key="cart" className="baseVertFlex h-full w-full">
                  <CartDrawer
                    setShowCartDrawer={setShowCartDrawer}
                    setItemBeingModified={setItemBeingModified}
                    setInitialItemState={setInitialItemState}
                    setGuestCheckoutView={setGuestCheckoutView}
                    setShowRewardsDrawer={setShowRewardsDrawer}
                  />
                </motion.div>
              )}

            {itemBeingModified && (
              <motion.div
                key="customize"
                className="baseVertFlex h-full w-full"
              >
                <ItemCustomizationDrawer
                  itemToCustomize={itemBeingModified}
                  setItemToCustomize={setItemBeingModified}
                  itemOrderDetails={initialItemState}
                  forCart
                />
              </motion.div>
            )}

            {showRewardsDrawer && (
              <motion.div key="rewards" className="baseVertFlex h-full w-full">
                <RewardsDrawer
                  showRewardsDrawer={showRewardsDrawer}
                  setShowRewardsDrawer={setShowRewardsDrawer}
                />
              </motion.div>
            )}

            {guestCheckoutView !== "notShowing" && (
              <motion.div key="guest" className="baseVertFlex h-full w-full">
                <GuestCheckoutDrawer
                  guestCheckoutView={guestCheckoutView}
                  setGuestCheckoutView={setGuestCheckoutView}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default CartDrawerWrapper;
