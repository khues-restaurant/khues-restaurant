import {
  type MenuItem,
  type MenuCategory,
  CustomizationCategory,
  CustomizationChoice,
} from "@prisma/client";
import React, { Dispatch, SetStateAction, useState } from "react";
import { api } from "~/utils/api";
import { motion } from "framer-motion";
import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { socket } from "~/pages/_app";
import { Button } from "~/components/ui/button";
import { TRPCClientErrorLike } from "@trpc/client";
import { UseMutateFunction } from "@tanstack/react-query";
import { Separator } from "~/components/ui/separator";

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
  console.log(menuCategories);
  return (
    <motion.div
      key={"itemManagement"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex my-8 h-full max-w-3xl tablet:mb-24 tablet:mt-48"
    >
      <div className="grid w-full grid-cols-2 gap-4">
        {menuCategories?.map((category) => (
          <MenuCategoryContainer
            key={category.id}
            name={category.name}
            menuItems={category.menuItems}
          />
        ))}
      </div>

      <Separator className="my-4 h-[1px] w-full bg-gray-300" />

      <div className="grid w-full grid-cols-2 gap-4">
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

        // emit an event to the socket server
        socket.emit("menuItemAvailabilityChanged");
      },
    });

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

      <div className="baseFlex w-full flex-wrap !justify-start gap-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="baseFlex w-full !justify-between rounded-md border p-2"
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
                <AlertDialogHeader>
                  {item.available ? "Disable ordering" : "Enable ordering"}
                </AlertDialogHeader>
                <AlertDialogDescription>
                  Are you sure you want to make{" "}
                  <span className="font-semibold">{item.name}</span>{" "}
                  {item.available ? "unable" : "able"} to be ordered online?
                </AlertDialogDescription>

                <AlertDialogFooter className="mt-4 gap-4">
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
                      toggleAvailability({
                        id: item.id,
                        available: !item.available,
                      });
                    }}
                  >
                    Confirm
                    {itemIdBeingMutated === item.id && (
                      <motion.div
                        key={`${item.id}Spinner`}
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

        // emit an event to the socket server (same emit since the query also
        // fetches the customization categories/choices)
        socket.emit("menuItemAvailabilityChanged");
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

      <div className="baseFlex w-full flex-wrap !justify-start gap-4">
        {customizationChoices.map((choice) => (
          <div
            key={choice.id}
            className="baseFlex w-full !justify-between rounded-md border p-2"
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

                <AlertDialogFooter className="mt-4 gap-4">
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
