import { useEffect, useState } from "react";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { orderDetailsSchema } from "~/stores/MainStore";
import { useMainStore, type OrderDetails } from "~/stores/MainStore";
import { api } from "~/utils/api";

function useHandleLocalStorage() {
  const userId = useGetUserId();
  const {
    setOrderDetails,
    setItemNamesRemovedFromCart,
    setCartInitiallyValidated,
  } = useMainStore((state) => ({
    setOrderDetails: state.setOrderDetails,
    setItemNamesRemovedFromCart: state.setItemNamesRemovedFromCart,
    setCartInitiallyValidated: state.setCartInitiallyValidated,
  }));

  const { updateOrder } = useUpdateOrder();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: userId.length > 0,
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
  });

  // maybe find better name for this
  const [orderDetailsRetrieved, setOrderDetailsRetrieved] = useState(false);

  useEffect(() => {
    if (user === undefined || userId === "" || orderDetailsRetrieved) return;

    if (user) {
      try {
        console.log("preparse", user.currentOrder);

        orderDetailsSchema.parse(user.currentOrder);

        console.log("post parse", user.currentOrder);

        const parsedOrder = user.currentOrder as unknown as OrderDetails;

        validateOrder({
          userId: user.userId,
          orderDetails: parsedOrder,
          forceReturnOrderDetails: true,
        });
        setOrderDetailsRetrieved(true);
      } catch {
        // falling back to localstorage if user.currentOrder is not in valid shape
        const localStorageOrder = localStorage.getItem("khues-orderDetails");

        if (!localStorageOrder) return;

        const parsedOrder = JSON.parse(localStorageOrder) as OrderDetails;

        parsedOrder.datetimeToPickUp = new Date(parsedOrder.datetimeToPickUp);

        validateOrder({
          userId,
          orderDetails: parsedOrder,
          forceReturnOrderDetails: true,
        });
        setOrderDetailsRetrieved(true);
        return;
      }
    }

    const localStorageOrder = localStorage.getItem("khues-orderDetails");

    if (!localStorageOrder) return;

    const parsedOrder = JSON.parse(localStorageOrder) as OrderDetails;

    parsedOrder.datetimeToPickUp = new Date(parsedOrder.datetimeToPickUp);

    validateOrder({
      userId,
      orderDetails: parsedOrder,
      forceReturnOrderDetails: true,
    });
    setOrderDetailsRetrieved(true);
  }, [setOrderDetails, userId, orderDetailsRetrieved, user, validateOrder]);
}

export default useHandleLocalStorage;
