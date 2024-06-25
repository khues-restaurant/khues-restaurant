import { AnimatePresence, motion } from "framer-motion";
import { useState, type Dispatch, type SetStateAction } from "react";
import CartDrawer from "~/components/cart/CartDrawer";
import RewardsDrawer from "~/components/cart/RewardsDrawer";
import ItemCustomizationDrawer from "~/components/itemCustomization/ItemCustomizationDrawer";
import { Sheet, SheetContent } from "~/components/ui/sheet";
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

  const [showRewardsDrawer, setShowRewardsDrawer] = useState(false);

  const [itemToCustomize, setItemToCustomize] = useState<FullMenuItem | null>(
    null,
  );
  const [itemOrderDetails, setItemOrderDetails] = useState<Item>();

  function getDrawerHeight() {
    return "85dvh";
  }

  return (
    <Sheet
      open={cartDrawerIsOpen}
      onOpenChange={(open) => {
        setCartDrawerIsOpen(open);

        if (!open) {
          setItemToCustomize(null);
          setItemOrderDetails(undefined);
          setShowRewardsDrawer(false);
        }
      }}
    >
      <SheetContent side={"bottom"}>
        <div
          style={{
            height: getDrawerHeight(),
            transition: "height 0.3s ease-in-out",
          }}
          className="baseVertFlex relative h-auto w-full !justify-start"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!itemToCustomize && !showRewardsDrawer && (
              <motion.div key="cart" className="baseVertFlex size-full">
                <CartDrawer
                  setItemToCustomize={setItemToCustomize}
                  setItemOrderDetails={setItemOrderDetails}
                  setShowRewardsDrawer={setShowRewardsDrawer}
                  pickupName={pickupName}
                  setPickupName={setPickupName}
                />
              </motion.div>
            )}

            {itemToCustomize && (
              <motion.div key="customize" className="baseVertFlex size-full">
                <ItemCustomizationDrawer
                  itemToCustomize={itemToCustomize}
                  setItemToCustomize={setItemToCustomize}
                  itemOrderDetails={itemOrderDetails}
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
      </SheetContent>
    </Sheet>
  );
}

export default CartDrawerWrapper;
