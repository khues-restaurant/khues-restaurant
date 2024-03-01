import { type MenuItem, type MenuCategory } from "@prisma/client";
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
import { Button } from "~/components/ui/button";
import { TRPCClientErrorLike } from "@trpc/client";
import { UseMutateFunction } from "@tanstack/react-query";

type MenuCategoryWithItems = MenuCategory & { menuItems: MenuItem[] };

interface ItemManagement {
  menuCategories: MenuCategoryWithItems[];
}

function ItemManagement({ menuCategories }: ItemManagement) {
  return (
    <motion.div
      key={"itemManagement"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-8 h-full w-full tablet:mt-0"
    >
      {menuCategories?.map((category) => (
        <MenuCategoryContainer
          key={category.id}
          name={category.name}
          menuItems={category.menuItems}
        />
      ))}
    </motion.div>
  );
}

export default ItemManagement;

interface MenuCategoryContainer {
  name: string;
  menuItems: MenuItem[];
}

function MenuCategoryContainer({ name, menuItems }: MenuCategoryContainer) {
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
        setOpenDialogId(null);
        setItemIdBeingMutated(null);
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
            className="baseFlex w-full !justify-between rounded-md border"
          >
            <div className="baseFlex gap-2">
              <div className="imageFiller size-16 rounded-md" />
              <p>{item.name}</p>
            </div>

            <AlertDialog open={openDialogId === item.id}>
              <AlertDialogTrigger asChild>
                <Button
                  className={`${
                    item.available
                      ? "bg-red-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                  onClick={() => {
                    setOpenDialogId(item.id);
                  }}
                >
                  {item.available ? "Make unavailable" : "Make available"}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  {item.available ? "Make unavailable" : "Make available"}
                </AlertDialogHeader>
                <AlertDialogDescription>
                  Are you sure you want to make
                  <span className="font-semibold">{item.name}</span>{" "}
                  {item.available ? "unavailable" : "available"}?
                </AlertDialogDescription>

                <AlertDialogFooter>
                  <Button
                    variant="secondary"
                    disabled={itemIdBeingMutated === item.id}
                    onClick={() => {
                      setOpenDialogId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={itemIdBeingMutated === item.id}
                    className="baseFlex gap-2"
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
                        className="inline-block size-4 animate-spin rounded-full border-[4px] border-current border-t-transparent text-primary"
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
