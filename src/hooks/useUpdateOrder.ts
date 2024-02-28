import { useAuth } from "@clerk/nextjs";
import useGetUserId from "~/hooks/useGetUserId";
import { useMainStore, type OrderDetails, type Item } from "~/stores/MainStore";
import { api } from "~/utils/api";
import isEqual from "lodash.isequal";
import debounce from "lodash.debounce";
import { useCallback } from "react";

function useUpdateOrder() {
  const { isSignedIn } = useAuth();
  const userId = useGetUserId();

  const { setOrderDetails } = useMainStore((state) => ({
    setOrderDetails: state.setOrderDetails,
  }));

  const { data: user } = api.user.get.useQuery(userId);
  const { mutate: updateUser } = api.user.update.useMutation();

  interface UpdateOrder {
    newOrderDetails: OrderDetails;
  }

  // is there any argument for keeping this to only take in / update just the items field rather than
  // taking in the whole OrderDetails object and updating the whole thing?

  // TODO: hopefully don't have to explicitly set state or something for cart icon+number
  // to update, but maybe too many edge cases if just comparing previous state of
  // orderDetails to current one?
  // ^ nah that's probably the way

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

      // setting store state
      setOrderDetails(sanitizedNewOrderDetails);

      // update user's order details in database
      if (isSignedIn && user) {
        debounce(() => {
          // should be fine to pass user object here because
          // we aren't actually updating any of those values, they only can be changed
          // on the initial post signup/profile routes
          updateUser({
            ...user,
            currentOrder: sanitizedNewOrderDetails,
          });
        }, 1000); // TODO: I have no clue if this actually does what I want it to
      }
      // setting local storage state
      else {
        localStorage.setItem(
          "khue's-orderDetails",
          JSON.stringify(sanitizedNewOrderDetails),
        );
      }
    },
    [isSignedIn, user, updateUser, setOrderDetails],
  );

  return {
    updateOrder,
  };
}

export default useUpdateOrder;
