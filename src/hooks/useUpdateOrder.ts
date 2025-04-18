import { useAuth } from "@clerk/nextjs";
import debounce from "lodash.debounce";
import isEqual from "lodash.isequal";
import { useCallback, useEffect, useRef } from "react";
import useGetUserId from "~/hooks/useGetUserId";
import { useMainStore, type Item, type OrderDetails } from "~/stores/MainStore";
import { api } from "~/utils/api";
// import { calculateTotalCartPrices } from "~/utils/calculateTotalCartPrices";

interface UpdateOrder {
  newOrderDetails: OrderDetails;
}

interface UpdateUserOrderDetails {
  userId: string;
  currentOrder: OrderDetails;
}

function useUpdateOrder() {
  const { isSignedIn } = useAuth();
  const userId = useGetUserId();

  const {
    setOrderDetails,
    // customizationChoices, discounts,
    validatingCart,
  } = useMainStore((state) => ({
    setOrderDetails: state.setOrderDetails,
    // customizationChoices: state.customizationChoices,
    // discounts: state.discounts,
    validatingCart: state.validatingCart,
  }));

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });
  const { mutate: updateUser } = api.user.updateOrder.useMutation();

  const updateQueue = useRef<OrderDetails[]>([]);

  const debouncedUpdateUser = useRef(
    debounce((newOrderDetails: UpdateUserOrderDetails) => {
      updateUser(newOrderDetails);
    }, 3000),
  ).current;

  const processQueue = useCallback(() => {
    while (updateQueue.current.length > 0) {
      const orderDetails = updateQueue.current.shift(); // Get the first item in the queue

      if (user && orderDetails) {
        debouncedUpdateUser({
          userId: user.userId,
          currentOrder: orderDetails,
        });
      }
    }
  }, [debouncedUpdateUser, user]);

  useEffect(() => {
    if (!validatingCart && updateQueue.current.length > 0) {
      processQueue();
    }
  }, [validatingCart, processQueue]);

  function attemptToMergeDuplicateItems(newOrderDetails: OrderDetails) {
    const newItems = newOrderDetails.items;

    const mergedItems = newItems.reduce((acc: Item[], newItem) => {
      // Trying to find an item that is the same as newItem.
      // excludes quantity and id since they don't change the "uniqueness" of an item
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
        acc[existingItemIndex].quantity += newItem.quantity;
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
      // const totalCartPrices = calculateTotalCartPrices({
      //   items: sanitizedNewOrderDetails.items,
      //   customizationChoices,
      //   discounts,
      // });

      // // if "Spend X, Save Y" exists, apply it here
      // if (isSignedIn) {
      //   // loop through discounts to find the "Spend X, Save Y" discount
      //   for (const discount of Object.values(discounts)) {
      //     if (discount.name !== "Spend $35, Save $5") continue;

      //     const spendXSaveY = 5;
      //     const spendX = 35;

      //     if (totalCartPrices.subtotal >= spendX) {
      //       sanitizedNewOrderDetails.discountId = discount.id;
      //     } else {
      //       sanitizedNewOrderDetails.discountId = null;
      //     }
      //   }
      // }

      // setting store state
      setOrderDetails(sanitizedNewOrderDetails);

      // update user's order details in database
      if (isSignedIn && user) {
        if (validatingCart) {
          updateQueue.current.push(sanitizedNewOrderDetails);
        } else {
          debouncedUpdateUser({
            ...user,
            currentOrder: sanitizedNewOrderDetails,
          });
        }
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
      // customizationChoices,
      // discounts,
      validatingCart,
    ],
  );

  return {
    updateOrder,
  };
}

export default useUpdateOrder;
