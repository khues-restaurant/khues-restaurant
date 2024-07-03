import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState, type Dispatch, type SetStateAction } from "react";
import CartSheet from "~/components/cart/CartSheet";
import RewardsDialog from "~/components/cart/RewardsDialog";
import ItemCustomizationDialog from "~/components/itemCustomization/ItemCustomizationDialog";
import { DialogDescription, DialogTitle } from "~/components/ui/dialog";
import { Sheet, SheetContent } from "~/components/ui/sheet";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { type Item } from "~/stores/MainStore";

interface CartSheetWrapper {
  showCartSheet: boolean;
  setShowCartSheet: Dispatch<SetStateAction<boolean>>;
  pickupName: string;
  setPickupName: Dispatch<SetStateAction<string>>;
}
function CartSheetWrapper({
  showCartSheet,
  setShowCartSheet,
  pickupName,
  setPickupName,
}: CartSheetWrapper) {
  const [isEditingItem, setIsEditingItem] = useState(false);

  const [showRewardsDialog, setShowRewardsDialog] = useState(false);

  const [itemToCustomize, setItemToCustomize] = useState<FullMenuItem | null>(
    null,
  );
  const [itemOrderDetails, setItemOrderDetails] = useState<Item>();

  return (
    <>
      <Sheet
        open={showCartSheet}
        onOpenChange={(open) => {
          setShowCartSheet(open);

          if (!open) {
            setItemToCustomize(null);
            setItemOrderDetails(undefined);
          }
        }}
      >
        <SheetContent className="h-screen">
          <VisuallyHidden>
            <DialogTitle>Cart</DialogTitle>
            <DialogDescription>
              Cart drawer containing all items added to your cart
            </DialogDescription>
          </VisuallyHidden>

          <div className="baseVertFlex relative size-full">
            <CartSheet
              setShowCartSheet={setShowCartSheet}
              setItemToCustomize={setItemToCustomize}
              setItemOrderDetails={setItemOrderDetails}
              setIsEditingItem={setIsEditingItem}
              setShowRewardsDialog={setShowRewardsDialog}
              pickupName={pickupName}
              setPickupName={setPickupName}
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
        itemToCustomize={itemToCustomize}
        setItemToCustomize={setItemToCustomize}
        itemOrderDetails={itemOrderDetails}
        setItemOrderDetails={setItemOrderDetails}
        forCart
      />
    </>
  );
}

export default CartSheetWrapper;
