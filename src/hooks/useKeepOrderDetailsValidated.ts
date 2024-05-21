import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";

function useKeepOrderDetailsValidated() {
  const userId = useGetUserId();
  const { isLoaded, isSignedIn } = useAuth();

  const {
    orderDetails,
    cartInitiallyValidated,
    setOrderDetails,
    setItemNamesRemovedFromCart,
    setValidatingCart,
  } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    cartInitiallyValidated: state.cartInitiallyValidated,
    setOrderDetails: state.setOrderDetails,
    setItemNamesRemovedFromCart: state.setItemNamesRemovedFromCart,
    setValidatingCart: state.setValidatingCart,
  }));

  const { updateOrder } = useUpdateOrder();

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
      if (!isLoaded || userId === "" || !cartInitiallyValidated) return;

      console.log("keep order details validated ran");

      setValidatingCart(true);
      validateOrder({ userId, orderDetails });

      return;
    }

    window.addEventListener("focus", validateOrderOnWindowRefocus);

    return () => {
      window.removeEventListener("focus", validateOrderOnWindowRefocus);
    };
  }, [
    orderDetails,
    setOrderDetails,
    isLoaded,
    isSignedIn,
    userId,
    validateOrder,
    setValidatingCart,
    cartInitiallyValidated,
  ]);
}

export default useKeepOrderDetailsValidated;
