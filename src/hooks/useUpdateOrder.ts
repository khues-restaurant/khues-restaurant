import { useAuth } from "@clerk/nextjs";
import useGetUserId from "~/hooks/useGetUserId";
import { useMainStore, type OrderDetails, type Item } from "~/stores/MainStore";
import { api } from "~/utils/api";
import isEqual from "lodash.isequal";
import debounce from "lodash.debounce";
import { useCallback, useRef } from "react";
import { calculateTotalCartPrices } from "~/utils/calculateTotalCartPrices";

interface UpdateOrder {
  newOrderDetails: OrderDetails;
}

interface UpdateUserData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthday: Date;
  dietaryRestrictions: string;
  currentOrder: OrderDetails;
}

function useUpdateOrder() {
  const { isSignedIn } = useAuth();
  const userId = useGetUserId();

  const { setOrderDetails, customizationChoices, discounts } = useMainStore(
    (state) => ({
      setOrderDetails: state.setOrderDetails,
      customizationChoices: state.customizationChoices,
      discounts: state.discounts,
    }),
  );

  const { data: user } = api.user.get.useQuery(userId);
  const { mutate: updateUser } = api.user.update.useMutation();

  const debouncedUpdateUser = useRef(
    debounce((updatedUserData: UpdateUserData) => {
      updateUser(updatedUserData);
    }, 1000),
  ).current;

  function attemptToMergeDuplicateItems(newOrderDetails: OrderDetails) {
    const newItems = newOrderDetails.items;

    const mergedItems = newItems.reduce((acc: Item[], newItem) => {
      // Find an item that is the same as newItem, excluding the quantity/id
      const existingItemIndex = acc.findIndex((item: Item) =>
        isEqual(
          { ...item, quantity: undefined, id: undefined },
          { ...newItem, quantity: undefined, id: undefined },
        ),
      );

      if (
        existingItemIndex !== -1 &&
        acc[existingItemIndex]?.quantity !== undefined
      ) {
        // If found, add quantities
        acc[existingItemIndex]!.quantity += newItem.quantity;
      } else {
        // Otherwise, push the new item to the accumulator
        acc.push(newItem);
      }

      return acc;
    }, []);

    return {
      ...newOrderDetails,
      items: mergedItems,
    };
  }

  const updateOrder = useCallback(
    ({ newOrderDetails }: UpdateOrder) => {
      const sanitizedNewOrderDetails =
        attemptToMergeDuplicateItems(newOrderDetails);

      // check if there is a "Spend X, Save Y" discount able to be applied to orderDetails
      const totalCartPrices = calculateTotalCartPrices({
        items: sanitizedNewOrderDetails.items,
        customizationChoices,
        discounts,
      });

      // if "Spend X, Save Y" exists, apply it here
      if (isSignedIn) {
        // loop through discounts to find the "Spend X, Save Y" discount
        for (const discount of Object.values(discounts)) {
          if (discount.name !== "Spend $35, Save $5") continue;

          const spendXSaveY = 5;
          const spendX = 35;

          if (totalCartPrices.subtotal >= spendX) {
            sanitizedNewOrderDetails.discountId = discount.id;
          } else {
            sanitizedNewOrderDetails.discountId = null;
          }
        }
      }

      // setting store state
      setOrderDetails(sanitizedNewOrderDetails);

      // update user's order details in database
      if (isSignedIn && user) {
        debouncedUpdateUser({
          ...user,
          currentOrder: sanitizedNewOrderDetails,
        });
      }

      // setting local storage state
      else {
        localStorage.setItem(
          "khue's-orderDetails",
          JSON.stringify(sanitizedNewOrderDetails),
        );
      }
    },
    [
      isSignedIn,
      user,
      debouncedUpdateUser,
      setOrderDetails,
      customizationChoices,
      discounts,
    ],
  );

  return {
    updateOrder,
  };
}

export default useUpdateOrder;
