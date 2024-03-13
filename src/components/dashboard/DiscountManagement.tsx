import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { FaTrashAlt } from "react-icons/fa";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Button } from "~/components/ui/button";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { format } from "date-fns";
import { LuPlus } from "react-icons/lu";

function DiscountManagement() {
  const ctx = api.useUtils();
  const { data: menuCategories } = api.menuCategory.getAll.useQuery();
  const { mutate: addCategoryDiscount, isLoading: addingCategoryDiscount } =
    api.discount.createCategoryDiscount.useMutation({
      onSuccess: () => {
        void ctx.discount.getAll.refetch();
        setShowDialog(false);
      },
      onError: (e) => {
        // toast notification here
        console.error(e);
      },
    });

  const { mutate: addItemDiscount, isLoading: addingItemsDiscount } =
    api.discount.createItemDiscount.useMutation({
      onSuccess: () => {
        void ctx.discount.getAll.refetch();
      },
      onError: (e) => {
        // toast notification here
        console.error(e);
      },
    });

  const [showDialog, setShowDialog] = useState(false);

  const [discountType, setDiscountType] = useState<"Category" | "Item(s)">(
    "Category",
  );

  const [categoryIdToDiscount, setCategoryIdToDiscount] = useState("");
  const [itemIdsToDiscount, setItemIdsToDiscount] = useState([""]);

  const [discountName, setDiscountName] = useState("");
  const [discountDescription, setDiscountDescription] = useState("");
  const [discountExpirationDate, setDiscountExpirationDate] = useState(
    new Date(),
  );

  return (
    <AlertDialog
      open={showDialog}
      onOpenChange={() => {
        setDiscountType("Category");
        setCategoryIdToDiscount("");
        setItemIdsToDiscount([""]);
        setDiscountName("");
        setDiscountDescription("");
        setDiscountExpirationDate(new Date());
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant={"link"}
          className="text-xl"
          onClick={() => setShowDialog(true)}
        >
          Add a discount
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <div className="baseVertFlex w-full">
          {/* TODO: probably add a section for "Existing discounts", which will show the names
            of the discounts along with their expiration dates, and if none exist then still say
            "No discounts are currently active." */}
          <div className="baseVertFlex !items-start gap-8">
            <div className="baseVertFlex !items-start gap-4">
              <Label htmlFor="discountType">Discount type</Label>
              <RadioGroup
                id="discountType"
                value={discountType}
                onValueChange={(type) => {
                  setDiscountType(type as "Category" | "Item(s)");
                }}
                className="baseFlex gap-4"
              >
                <div className="baseFlex gap-2">
                  <RadioGroupItem value="Category" id="Category" />
                  <Label htmlFor="Category">Category</Label>
                </div>
                <div className="baseFlex gap-2">
                  <RadioGroupItem value="Item(s)" id="Item(s)" />
                  <Label htmlFor="Item(s)">Item(s)</Label>
                </div>
              </RadioGroup>
            </div>

            {discountType === "Category" ? (
              <div className="baseFlex gap-2">
                <Label htmlFor="categoryIdToDiscount">Category</Label>
                <Select
                  value={categoryIdToDiscount}
                  onValueChange={(id) => setCategoryIdToDiscount(id)}
                >
                  <SelectTrigger
                    id={"categoryIdToDiscount"}
                    className="w-[180px]"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      {menuCategories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div
                className="baseVertFlex max-h-64 !items-start !justify-start gap-2 overflow-y-auto
p-2"
              >
                <Label htmlFor="itemIdsToDiscount">Items</Label>
                {itemIdsToDiscount.map((itemId, index) => (
                  <div key={index} className="baseFlex gap-2 ">
                    <Select
                      value={itemId}
                      onValueChange={(id) => {
                        const newItems = [...itemIdsToDiscount];
                        newItems[index] = id;
                        setItemIdsToDiscount(newItems);
                      }}
                    >
                      <SelectTrigger
                        id={`itemIdsToDiscount-${index}`}
                        className="w-[180px]"
                      >
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Items</SelectLabel>
                          {menuCategories?.map((category) => (
                            <SelectGroup key={category.id}>
                              <SelectLabel>{category.name}</SelectLabel>
                              {category.menuItems.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      disabled={itemIdsToDiscount.length === 1}
                      onClick={() => {
                        const newItems = [...itemIdsToDiscount];
                        newItems.splice(index, 1);
                        setItemIdsToDiscount(newItems);
                      }}
                    >
                      <FaTrashAlt />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  onClick={() =>
                    setItemIdsToDiscount([...itemIdsToDiscount, ""])
                  }
                  className="baseFlex gap-2"
                >
                  Add another item
                  <LuPlus className="size-3" />
                </Button>
              </div>
            )}

            {/* name, description, and expiration date inputs here */}
            <div className="baseVertFlex !items-start gap-2">
              <Label htmlFor="discountName">Name</Label>
              <Input
                id="discountName"
                value={discountName}
                onChange={(e) => {
                  setDiscountName(e.target.value);
                }}
                placeholder="10% off"
              />

              <Label htmlFor="discountDescription">Description</Label>
              <Input
                id="discountDescription"
                value={discountDescription}
                onChange={(e) => {
                  setDiscountDescription(e.target.value);
                }}
                placeholder="Enjoy 10% off all appetizers this weekend!"
              />

              <Label htmlFor="discountExpirationDate">Expiration date</Label>
              <span className="text-sm italic text-gray-400">
                * Discount will expire at the start of this day
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-[200px] justify-start text-left font-normal"
                  >
                    {format(discountExpirationDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    // disabled={getDisabledDates()}
                    selected={discountExpirationDate}
                    onSelect={(e) => {
                      if (e instanceof Date) {
                        setDiscountExpirationDate(e);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              // disabled if any of the inputs are empty/currently posting a discount
              disabled={
                !discountName ||
                !discountDescription ||
                (discountType === "Category" && !categoryIdToDiscount) ||
                (discountType === "Item(s)" &&
                  itemIdsToDiscount.some((id) => !id)) ||
                addingCategoryDiscount ||
                addingItemsDiscount
              }
              onClick={() => {
                if (discountType === "Category") {
                  addCategoryDiscount({
                    id: categoryIdToDiscount,
                    name: discountName,
                    description: discountDescription,
                    expirationDate: discountExpirationDate,
                  });
                } else {
                  addItemDiscount({
                    ids: itemIdsToDiscount,
                    name: discountName,
                    description: discountDescription,
                    expirationDate: discountExpirationDate,
                  });
                }
              }}
            >
              Add discount
              {/* TODO: add spinner + checkmark for mutation */}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DiscountManagement;
