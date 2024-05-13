import { AnimatePresence, motion } from "framer-motion";
import { useState, type Dispatch, type SetStateAction } from "react";
import CartDrawer from "~/components/cart/CartDrawer";
import RewardsDrawer from "~/components/cart/RewardsDrawer";
import ItemCustomizationDrawer from "~/components/itemCustomization/ItemCustomizationDrawer";
import { Drawer, DrawerContent } from "~/components/ui/drawer";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { useMainStore, type Item } from "~/stores/MainStore";

interface CartDrawerWrapper {
  pickupName: string;
  setPickupName: Dispatch<SetStateAction<string>>;
}
function CartDrawerWrapper({ pickupName, setPickupName }: CartDrawerWrapper) {
  const { cartDrawerIsOpen, setCartDrawerIsOpen } = useMainStore((state) => ({
    cartDrawerIsOpen: state.cartDrawerIsOpen,
    setCartDrawerIsOpen: state.setCartDrawerIsOpen,
  }));

  const [itemBeingModified, setItemBeingModified] =
    useState<FullMenuItem | null>(null);

  const [showRewardsDrawer, setShowRewardsDrawer] = useState(false);

  const [initialItemState, setInitialItemState] = useState<Item>();

  function getDrawerHeight() {
    return "85dvh";
  }

  return (
    <Drawer
      open={cartDrawerIsOpen}
      onOpenChange={(open) => {
        setCartDrawerIsOpen(open);

        if (!open) {
          setItemBeingModified(null);
          setInitialItemState(undefined);
          setShowRewardsDrawer(false);
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
            {!itemBeingModified && !showRewardsDrawer && (
              <motion.div key="cart" className="baseVertFlex size-full">
                <CartDrawer
                  setItemBeingModified={setItemBeingModified}
                  setInitialItemState={setInitialItemState}
                  setShowRewardsDrawer={setShowRewardsDrawer}
                  pickupName={pickupName}
                  setPickupName={setPickupName}
                />
              </motion.div>
            )}

            {itemBeingModified && (
              <motion.div key="customize" className="baseVertFlex size-full">
                <ItemCustomizationDrawer
                  itemToCustomize={itemBeingModified}
                  setItemToCustomize={setItemBeingModified}
                  itemOrderDetails={initialItemState}
                  forCart
                />
              </motion.div>
            )}

            {showRewardsDrawer && (
              <motion.div key="rewards" className="baseVertFlex size-full">
                <RewardsDrawer
                  showRewardsDrawer={showRewardsDrawer}
                  setShowRewardsDrawer={setShowRewardsDrawer}
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
