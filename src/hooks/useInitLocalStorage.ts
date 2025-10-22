import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import {
  orderDetailsSchema,
  useMainStore,
  type OrderDetails,
} from "~/stores/MainStore";
import { api } from "~/utils/api";
import { clearLocalStorage } from "~/utils/clearLocalStorage";
import { getFirstValidMidnightDate } from "~/utils/dateHelpers/getFirstValidMidnightDate";

function useInitLocalStorage() {
  const userId = useGetUserId();
  const { isLoaded, isSignedIn } = useAuth();
  const { asPath } = useRouter();

  const {
    cartInitiallyValidated,
    setItemNamesRemovedFromCart,
    setCartInitiallyValidated,
    setValidatingCart,
    initOrderDetailsRetrieved,
    setInitOrderDetailsRetrieved,
  } = useMainStore((state) => ({
    cartInitiallyValidated: state.cartInitiallyValidated,
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
      datetimeToPickup: getFirstValidMidnightDate(),
      items: [],
      tipPercentage: null,
      tipValue: 0,
      includeNapkinsAndUtensils: false,
      discountId: null,
    } as OrderDetails;

    const resetOrderDetails = asPath.includes("/payment-success")
      ? localStorage.getItem("khue's-resetOrderDetails")
      : false;

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

    let localStorageOrder = resetOrderDetails
      ? null
      : localStorage.getItem("khue's-orderDetails");

    if (resetOrderDetails) {
      localStorage.removeItem("khue's-resetOrderDetails");
    }

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
    userId,
    initOrderDetailsRetrieved,
    user,
    isLoaded,
    isSignedIn,
    setValidatingCart,
    validateOrder,
    setInitOrderDetailsRetrieved,
    asPath,
  ]);

  useEffect(() => {
    if (isSignedIn) {
      clearLocalStorage();
    } else if (isSignedIn === false) {
      // if user doesn't have any orderDetails in their localstorage, then set it to default
      const localStorageOrder = localStorage.getItem("khue's-orderDetails");

      if (!localStorageOrder) {
        const defaultCart = {
          datetimeToPickup: getFirstValidMidnightDate(),
          items: [],
          tipPercentage: null,
          tipValue: 0,
          includeNapkinsAndUtensils: false,
          discountId: null,
        } as OrderDetails;

        localStorage.setItem(
          "khue's-orderDetails",
          JSON.stringify(defaultCart),
        );
      }

      // set key for pickupName to empty string
      localStorage.setItem("khue's-pickupName", "");
    }
  }, [isSignedIn]);
}

export default useInitLocalStorage;
