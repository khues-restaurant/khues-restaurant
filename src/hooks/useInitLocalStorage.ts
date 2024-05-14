import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { orderDetailsSchema } from "~/stores/MainStore";
import { useMainStore, type OrderDetails } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { clearLocalStorage } from "~/utils/clearLocalStorage";
import { getTodayAtMidnight } from "~/utils/getTodayAtMidnight";

function useInitLocalStorage() {
  const userId = useGetUserId();
  const { isLoaded, isSignedIn } = useAuth();

  const {
    cartInitiallyValidated,
    setOrderDetails,
    setItemNamesRemovedFromCart,
    setCartInitiallyValidated,
    setValidatingCart,
    initOrderDetailsRetrieved,
    setInitOrderDetailsRetrieved,
  } = useMainStore((state) => ({
    cartInitiallyValidated: state.cartInitiallyValidated,
    setOrderDetails: state.setOrderDetails,
    setItemNamesRemovedFromCart: state.setItemNamesRemovedFromCart,
    setCartInitiallyValidated: state.setCartInitiallyValidated,
    setValidatingCart: state.setValidatingCart,
    initOrderDetailsRetrieved: state.initOrderDetailsRetrieved,
    setInitOrderDetailsRetrieved: state.setInitOrderDetailsRetrieved,
  }));

  const { updateOrder } = useUpdateOrder();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { mutate: validateOrder } = api.validateOrder.validate.useMutation({
    onSuccess: (data) => {
      if (data.changedOrderDetails) {
        updateOrder({
          newOrderDetails: data.changedOrderDetails,
        });
      }

      setCartInitiallyValidated(true);

      if (data.removedItemNames && data.removedItemNames.length > 0) {
        setItemNamesRemovedFromCart(data.removedItemNames);
      }
    },
    onError: (error) => {
      console.error(error);
      // idk.. toast here? or just internal log of error;
    },
    onSettled: (data) => {
      setValidatingCart(false);
    },
  });

  useEffect(() => {
    if (
      !isLoaded ||
      (isSignedIn && user === undefined) ||
      userId === "" ||
      initOrderDetailsRetrieved ||
      cartInitiallyValidated
    )
      return;

    const defaultCart = {
      datetimeToPickup: getTodayAtMidnight(),
      isASAP: false,
      items: [],
      includeNapkinsAndUtensils: false,
      discountId: null,
    } as OrderDetails;

    if (user) {
      try {
        orderDetailsSchema.parse(user.currentOrder);

        const parsedOrder = user.currentOrder as unknown as OrderDetails;

        setValidatingCart(true);

        validateOrder({
          userId: user.userId,
          orderDetails: parsedOrder,
          forceReturnOrderDetails: true,
        });
        setInitOrderDetailsRetrieved(true);

        return;
      } catch {
        // falling back to localstorage if user.currentOrder is not in valid shape

        setValidatingCart(true);
        validateOrder({
          userId,
          orderDetails: defaultCart,
          forceReturnOrderDetails: true,
        });
        setInitOrderDetailsRetrieved(true);

        return;
      }
    }

    let localStorageOrder = localStorage.getItem("khue's-orderDetails");

    if (!localStorageOrder) {
      // set local storage to default (empty cart)
      localStorage.setItem("khue's-orderDetails", JSON.stringify(defaultCart));

      localStorageOrder = JSON.stringify(defaultCart);
    }

    const parsedOrder = JSON.parse(localStorageOrder) as OrderDetails;

    parsedOrder.datetimeToPickup = new Date(parsedOrder.datetimeToPickup);

    setValidatingCart(true);
    validateOrder({
      userId,
      orderDetails: parsedOrder,
      forceReturnOrderDetails: true,
    });
    setInitOrderDetailsRetrieved(true);
  }, [
    cartInitiallyValidated,
    setOrderDetails,
    userId,
    initOrderDetailsRetrieved,
    user,
    isLoaded,
    isSignedIn,
    setValidatingCart,
    validateOrder,
    setInitOrderDetailsRetrieved,
  ]);

  useEffect(() => {
    if (isSignedIn) {
      clearLocalStorage();
    } else if (isSignedIn === false) {
      // if user doesn't have any orderDetails in their localstorage, then set it to default
      const localStorageOrder = localStorage.getItem("khue's-orderDetails");

      if (!localStorageOrder) {
        const defaultCart = {
          datetimeToPickup: getTodayAtMidnight(),
          isASAP: false,
          items: [],
          includeNapkinsAndUtensils: false,
          discountId: null,
        } as OrderDetails;

        localStorage.setItem(
          "khue's-orderDetails",
          JSON.stringify(defaultCart),
        );
      }
    }
  }, [isSignedIn]);
}

export default useInitLocalStorage;
