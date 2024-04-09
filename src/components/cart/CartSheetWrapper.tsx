import { type MenuItem } from "@prisma/client";
import { useState, type Dispatch, type SetStateAction } from "react";
import CartSheet from "~/components/cart/CartSheet";
import GuestCheckoutDialog from "~/components/cart/GuestCheckoutDialog";
import RewardsDialog from "~/components/cart/RewardsDialog";
import ItemCustomizationDialog from "~/components/itemCustomization/ItemCustomizationDialog";
import { Sheet, SheetContent } from "~/components/ui/sheet";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
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

  const [showRewardsDialog, setShowRewardsDialog] = useState(false);

  const [guestCheckoutView, setGuestCheckoutView] = useState<
    "credentialsForm" | "mainView" | "notShowing"
  >("notShowing");

  const [itemBeingModified, setItemBeingModified] =
    useState<FullMenuItem | null>(null);
  const [initialItemState, setInitialItemState] = useState<Item>();

  // might want to eventually do just a ~50% viewport height if there
  // are no items in the user's cart
  function getSheetHeight() {
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
              justifyContent:
                orderDetails.items.length === 0 ? "center" : "flex-start",
            }}
            className="baseVertFlex relative h-full w-full"
          >
            <CartSheet
              setShowCartSheet={setShowCartSheet}
              setItemBeingModified={setItemBeingModified}
              setInitialItemState={setInitialItemState}
              setGuestCheckoutView={setGuestCheckoutView}
              setIsEditingItem={setIsEditingItem}
              setShowRewardsDialog={setShowRewardsDialog}
            />
          </div>
        </SheetContent>
      </Sheet>

      <RewardsDialog
        showRewardsDialog={showRewardsDialog}
        setShowRewardsDialog={setShowRewardsDialog}
      />

      <ItemCustomizationDialog
        isDialogOpen={isEditingItem}
        setIsDialogOpen={setIsEditingItem}
        itemToCustomize={itemBeingModified}
        setItemToCustomize={setItemBeingModified}
        itemOrderDetails={initialItemState}
        forCart
      />

      <GuestCheckoutDialog
        guestCheckoutView={guestCheckoutView}
        setGuestCheckoutView={setGuestCheckoutView}
      />
    </>
  );
}

export default CartSheetWrapper;
