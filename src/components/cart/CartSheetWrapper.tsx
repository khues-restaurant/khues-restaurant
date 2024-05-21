import { useState, type Dispatch, type SetStateAction } from "react";
import CartSheet from "~/components/cart/CartSheet";
import RewardsDialog from "~/components/cart/RewardsDialog";
import ItemCustomizationDialog from "~/components/itemCustomization/ItemCustomizationDialog";
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

  const [itemBeingModified, setItemBeingModified] =
    useState<FullMenuItem | null>(null);
  const [initialItemState, setInitialItemState] = useState<Item>();

  return (
    <>
      <Sheet
        open={showCartSheet}
        onOpenChange={(open) => {
          setShowCartSheet(open);

          if (!open) {
            setItemBeingModified(null);
            setInitialItemState(undefined);
          }
        }}
      >
        <SheetContent className="h-screen">
          <div className="baseVertFlex relative size-full">
            <CartSheet
              setShowCartSheet={setShowCartSheet}
              setItemBeingModified={setItemBeingModified}
              setInitialItemState={setInitialItemState}
              setIsEditingItem={setIsEditingItem}
              setShowRewardsDialog={setShowRewardsDialog}
              pickupName={pickupName}
              setPickupName={setPickupName}
            />
          </div>
        </SheetContent>
      </Sheet>

      <RewardsDialog
        key={
          showRewardsDialog
            ? "cartSheetRewardDialogManualRerenderOne"
            : "cartSheetRewardDialogManualRerenderTwo"
        }
        showRewardsDialog={showRewardsDialog}
        setShowRewardsDialog={setShowRewardsDialog}
      />

      <ItemCustomizationDialog
        key={
          isEditingItem
            ? "cartSheetItemCustomizationDialogManualRerenderOne"
            : "cartSheetItemCustomizationDialogManualRerenderTwo"
        }
        isDialogOpen={isEditingItem}
        setIsDialogOpen={setIsEditingItem}
        itemToCustomize={itemBeingModified}
        setItemToCustomize={setItemBeingModified}
        itemOrderDetails={initialItemState}
        forCart
      />
    </>
  );
}

export default CartSheetWrapper;
