import {
  type CustomizationCategory,
  type CustomizationChoice,
  type MenuCategory,
  type MenuItem,
} from "@prisma/client";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/utils/api";

type MenuCategoryWithItems = MenuCategory & { menuItems: MenuItem[] };

type CustomizationCategoryWithChoices = CustomizationCategory & {
  customizationChoices: CustomizationChoice[];
};

interface ItemManagement {
  menuCategories: MenuCategoryWithItems[];
  customizationCategories: CustomizationCategoryWithChoices[];
}

function ItemManagement({
  menuCategories,
  customizationCategories,
}: ItemManagement) {
  return (
    <motion.div
      key={"itemManagement"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex my-8 mb-24 h-full max-w-3xl desktop:max-w-6xl"
    >
      <p className="mt-8 pb-8 text-xl font-semibold underline underline-offset-2">
        Menu items
      </p>
      <div className="baseVertFlex w-full !items-start gap-4 px-4">
        {menuCategories?.map((category) => (
          <MenuCategoryContainer
            key={category.id}
            name={category.name}
            menuItems={category.menuItems}
          />
        ))}
      </div>

      <Separator className="mb-4 mt-8 h-[2px] w-full bg-gray-300" />

      <p className="mt-8 pb-8 text-xl font-semibold underline underline-offset-2">
        Customizations
      </p>
      <div className="baseVertFlex w-full !items-start gap-4 px-4">
        {customizationCategories?.map((category) => (
          <CustomizationCategoryContainer
            key={category.id}
            name={category.name}
            customizationChoices={category.customizationChoices}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default ItemManagement;

interface MenuCategoryContainer {
  name: string;
  menuItems: MenuItem[];
}

function MenuCategoryContainer({ name, menuItems }: MenuCategoryContainer) {
  const ctx = api.useUtils();

  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [itemIdBeingMutated, setItemIdBeingMutated] = useState<string | null>(
    null,
  );
  const [itemNameBeingMutated, setItemNameBeingMutated] = useState<
    string | null
  >(null);

  const { mutate: toggleAvailability } =
    api.menuItem.changeAvailability.useMutation({
      onError: (error) => {
        console.error(error);
        // toast this error
      },
      onSettled: () => {
        void ctx.menuCategory.getAll.refetch();

        setOpenDialogId(null);
        setItemIdBeingMutated(null);
        setItemNameBeingMutated(null);

        toast({
          description: `Availability of ${itemNameBeingMutated} has been updated.`,
        });
      },
    });

  const { toast } = useToast();

  return (
    <motion.div
      key={`${name}Category`}
      id={`${name}Container`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="baseVertFlex w-full !items-start gap-4 p-2"
    >
      <p className="text-lg font-semibold underline underline-offset-2">
        {name}
      </p>

      <div className="grid w-full grid-cols-1 !justify-start gap-4 sm:grid-cols-2 desktop:grid-cols-3">
        {menuItems.map((item) => (
          <div
            key={item.id}
            style={{
              order: item.listOrder,
            }}
            className="baseFlex w-full !justify-between gap-2 rounded-md border p-2"
          >
            <p>{item.name}</p>

            <AlertDialog open={openDialogId === item.id}>
              <AlertDialogTrigger asChild>
                <Button
                  className={`
                  ${
                    item.available
                      ? "bg-red-500 text-offwhite"
                      : "bg-green-500 text-offwhite"
                  }`}
                  onClick={() => {
                    setOpenDialogId(item.id);
                  }}
                >
                  {item.available ? "Disable ordering" : "Enable ordering"}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader className="font-semibold">
                  {item.available ? "Disable ordering" : "Enable ordering"}
                </AlertDialogHeader>
                <AlertDialogDescription>
                  Are you sure you want to{" "}
                  {item.available ? "disable" : "enable"} ordering for{" "}
                  <span className="font-semibold">{item.name}</span>?
                </AlertDialogDescription>

                <AlertDialogFooter className="baseFlex mt-8 w-full !flex-row gap-8">
                  <Button
                    variant="secondary"
                    disabled={itemIdBeingMutated === item.id}
                    className="w-full"
                    onClick={() => {
                      setOpenDialogId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={itemIdBeingMutated === item.id}
                    className="baseFlex w-full gap-2"
                    onClick={() => {
                      setItemIdBeingMutated(item.id);
                      setItemNameBeingMutated(item.name);
                      toggleAvailability({
                        id: item.id,
                        available: !item.available,
                      });
                    }}
                  >
                    Confirm
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

interface CustomizationCategoryContainer {
  name: string;
  customizationChoices: CustomizationChoice[];
}

function CustomizationCategoryContainer({
  name,
  customizationChoices,
}: CustomizationCategoryContainer) {
  const ctx = api.useUtils();

  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [customizationIdBeingMutated, setCustomizationIdBeingMutated] =
    useState<string | null>(null);

  const { mutate: toggleAvailability } =
    api.customizationChoice.changeAvailability.useMutation({
      onError: (error) => {
        console.error(error);
        // toast this error
      },
      onSettled: () => {
        void ctx.customizationCategory.getAll.refetch();
        setOpenDialogId(null);
        setCustomizationIdBeingMutated(null);
      },
    });

  return (
    <motion.div
      key={`${name}CustomizationCategory`}
      id={`${name}CustomizationContainer`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="baseVertFlex w-full !items-start gap-4 p-2"
    >
      <p className="text-lg font-semibold underline underline-offset-2">
        {name}
      </p>

      <div className="grid w-full grid-cols-1 !justify-start gap-4 sm:grid-cols-2 desktop:grid-cols-3">
        {customizationChoices.map((choice) => (
          <div
            key={choice.id}
            style={{
              order: choice.listOrder,
            }}
            className="baseFlex w-full !justify-between gap-2 rounded-md border p-2"
          >
            <p>{choice.name}</p>

            <AlertDialog open={openDialogId === choice.id}>
              <AlertDialogTrigger asChild>
                <Button
                  className={`
                  ${
                    choice.isAvailable
                      ? "bg-red-500 text-offwhite"
                      : "bg-green-500 text-offwhite"
                  }`}
                  onClick={() => {
                    setOpenDialogId(choice.id);
                  }}
                >
                  {choice.isAvailable ? "Disable ordering" : "Enable ordering"}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  {choice.isAvailable ? "Disable ordering" : "Enable ordering"}
                </AlertDialogHeader>
                <AlertDialogDescription>
                  Are you sure you want to make{" "}
                  <span className="font-semibold">{choice.name}</span>{" "}
                  {choice.isAvailable ? "unable" : "able"} to be ordered online?
                </AlertDialogDescription>

                <AlertDialogFooter className="baseFlex mt-8 w-full !flex-row gap-8">
                  <Button
                    variant="secondary"
                    disabled={customizationIdBeingMutated === choice.id}
                    className="w-full"
                    onClick={() => {
                      setOpenDialogId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={customizationIdBeingMutated === choice.id}
                    className="baseFlex w-full gap-2"
                    onClick={() => {
                      setCustomizationIdBeingMutated(choice.id);
                      toggleAvailability({
                        id: choice.id,
                        isAvailable: !choice.isAvailable,
                      });
                    }}
                  >
                    Confirm
                    {customizationIdBeingMutated === choice.id && (
                      <motion.div
                        key={`${choice.id}Spinner`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="inline-block size-4 animate-spin rounded-full border-[2px] border-current border-t-transparent text-offwhite"
                        role="status"
                        aria-label="loading"
                      >
                        <span className="sr-only">Loading...</span>
                      </motion.div>
                    )}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
