import { useAuth } from "@clerk/nextjs";
import Decimal from "decimal.js";
import { useEffect } from "react";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { orderDetailsSchema } from "~/stores/MainStore";
import { useMainStore, type OrderDetails } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getFirstValidMidnightDate } from "~/utils/getFirstValidMidnightDate";

function useKeepOrderDetailsValidated() {
  const userId = useGetUserId();
  const { isLoaded, isSignedIn } = useAuth();

  const {
    cartInitiallyValidated,
    setOrderDetails,
    setItemNamesRemovedFromCart,
    setValidatingCart,
  } = useMainStore((state) => ({
    cartInitiallyValidated: state.cartInitiallyValidated,
    setOrderDetails: state.setOrderDetails,
    setItemNamesRemovedFromCart: state.setItemNamesRemovedFromCart,
    setValidatingCart: state.setValidatingCart,
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

  // revalidates order details on window refocus
  useEffect(() => {
    function validateOrderOnWindowRefocus() {
      if (
        !isLoaded ||
        (isSignedIn && user === undefined) ||
        userId === "" ||
        !cartInitiallyValidated
      )
        return;

      console.log("keep order details validated ran");

      const defaultCart = {
        datetimeToPickup: getFirstValidMidnightDate(new Date()),
        isASAP: false,
        items: [],
        tipPercentage: null,
        tipValue: new Decimal(0),
        includeNapkinsAndUtensils: false,
        discountId: null,
      } as OrderDetails;

      if (user) {
        try {
          orderDetailsSchema.parse(user.currentOrder);

          const parsedOrder = user.currentOrder as unknown as OrderDetails;

          setValidatingCart(true);
          validateOrder({ userId: user.userId, orderDetails: parsedOrder });

          return;
        } catch {
          // falling back to default (empty cart) if user.currentOrder is not in valid shape
          setValidatingCart(true);
          validateOrder({ userId, orderDetails: defaultCart });

          return;
        }
      }

      let localStorageOrder = localStorage.getItem("khue's-orderDetails");

      if (!localStorageOrder) {
        // set local storage to default (empty cart)
        localStorage.setItem(
          "khue's-orderDetails",
          JSON.stringify(defaultCart),
        );

        localStorageOrder = JSON.stringify(defaultCart);
      }

      const parsedOrder = JSON.parse(localStorageOrder) as OrderDetails;

      parsedOrder.datetimeToPickup = new Date(parsedOrder.datetimeToPickup);

      setValidatingCart(true);
      validateOrder({ userId, orderDetails: parsedOrder });
    }

    window.addEventListener("focus", validateOrderOnWindowRefocus);

    return () => {
      window.removeEventListener("focus", validateOrderOnWindowRefocus);
    };
  }, [
    setOrderDetails,
    isLoaded,
    isSignedIn,
    userId,
    user,
    validateOrder,
    setValidatingCart,
    cartInitiallyValidated,
  ]);
}

export default useKeepOrderDetailsValidated;
