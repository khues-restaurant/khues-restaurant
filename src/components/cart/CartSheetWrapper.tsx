import { type MenuItem } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState, type Dispatch, type SetStateAction } from "react";
import CartDrawer from "~/components/cart/CartDrawer";
import CartSheet from "~/components/cart/CartSheet";
import GuestCheckoutDrawer from "~/components/cart/GuestCheckoutDrawer";
import ItemCustomizationDialog from "~/components/itemCustomization/ItemCustomizationDialog";
import ItemCustomizationDrawer from "~/components/itemCustomization/ItemCustomizationDrawer";
import { Sheet, SheetContent } from "~/components/ui/sheet";
import { useMainStore, type Item } from "~/stores/MainStore";

interface CartSheetWrapper {
  showCartSheet: boolean;
  setShowCartSheet: Dispatch<SetStateAction<boolean>>;
}
function CartSheetWrapper({
  showCartSheet,
  setShowCartSheet,
}: CartSheetWrapper) {
  const { orderDetails } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
  }));

  const [isEditingItem, setIsEditingItem] = useState(false);

  const [guestCheckoutView, setGuestCheckoutView] = useState<
    "credentialsForm" | "mainView" | "notShowing"
  >("notShowing");

  const [itemBeingModified, setItemBeingModified] = useState<MenuItem | null>(
    null,
  );
  const [initialItemState, setInitialItemState] = useState<Item>();

  function getSheetHeight() {
    if (orderDetails.items.length === 0) {
      return "350px";
    }

    return "100dvh";
  }

  return (
    <>
      <Sheet
        open={showCartSheet}
        onOpenChange={(open) => {
          setShowCartSheet(open);

          if (!open) {
            setItemBeingModified(null);
            setInitialItemState(undefined);
            setGuestCheckoutView("notShowing");
          }
        }}
      >
        <SheetContent className="h-screen">
          <div
            style={{
              height: getSheetHeight(),
              transition: "height 0.3s ease-in-out",
            }}
            className="baseVertFlex relative h-full w-full !justify-start"
            // TODO: currently since this is flex, upon transitioning both the prev and current contianers
            // will be rendered one on top of each other so it looks like the component is slightly moving
            // down/up, see if you can't readjust structure to maybe be under same div somehow?
          >
            <CartSheet
              setShowCartSheet={setShowCartSheet}
              setItemBeingModified={setItemBeingModified}
              setInitialItemState={setInitialItemState}
              setGuestCheckoutView={setGuestCheckoutView}
            />
          </div>
        </SheetContent>
      </Sheet>

      <ItemCustomizationDialog
        isDialogOpen={isEditingItem}
        setIsDialogOpen={setIsEditingItem}
        itemToCustomize={itemBeingModified}
        setItemToCustomize={setItemBeingModified}
        itemOrderDetails={initialItemState}
        forCart
      />

      {/* {guestCheckoutView !== "notShowing" && (
        <motion.div key="guest" className="baseVertFlex h-full w-full">
          <GuestCheckoutDialog
            guestCheckoutView={guestCheckoutView}
            setGuestCheckoutView={setGuestCheckoutView}
          />
        </motion.div>
      )} */}
    </>
  );
}

export default CartSheetWrapper;
