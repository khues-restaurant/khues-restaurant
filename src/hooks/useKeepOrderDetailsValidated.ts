import { useEffect } from "react";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { orderDetailsSchema } from "~/stores/MainStore";
import { useMainStore, type OrderDetails } from "~/stores/MainStore";
import { api } from "~/utils/api";

function useKeepOrderDetailsValidated() {
  const userId = useGetUserId();
  const {
    cartInitiallyValidated,
    setOrderDetails,
    setItemNamesRemovedFromCart,
  } = useMainStore((state) => ({
    cartInitiallyValidated: state.cartInitiallyValidated,
    setOrderDetails: state.setOrderDetails,
    setItemNamesRemovedFromCart: state.setItemNamesRemovedFromCart,
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

      if (data.removedItemNames && data.removedItemNames.length > 0) {
        setItemNamesRemovedFromCart(data.removedItemNames);
      }
    },
    onError: (error) => {
      console.error(error);
      // idk.. toast here? or just internal log of error;
    },
  });

  // revalidates order details on window refocus
  useEffect(() => {
    function validateOrderOnWindowRefocus() {
      if (user === undefined || userId === "" || !cartInitiallyValidated)
        return;

      console.log("validating from keep order deailts");

      if (user) {
        try {
          orderDetailsSchema.parse(user.currentOrder);

          const parsedOrder = user.currentOrder as unknown as OrderDetails;

          validateOrder({ userId: user.userId, orderDetails: parsedOrder });

          return;
        } catch {
          // falling back to localstorage if user.currentOrder is not in valid shape
          const localStorageOrder = localStorage.getItem("khue's-orderDetails");

          if (!localStorageOrder) return;

          const parsedOrder = JSON.parse(localStorageOrder) as OrderDetails;

          parsedOrder.datetimeToPickUp = new Date(parsedOrder.datetimeToPickUp);

          validateOrder({ userId, orderDetails: parsedOrder });

          return;
        }
      }

      let localStorageOrder = localStorage.getItem("khue's-orderDetails");

      if (!localStorageOrder) {
        // set local storage to default values (right?)
        localStorage.setItem(
          "khue's-orderDetails",
          JSON.stringify({
            datetimeToPickUp: new Date(),
            isASAP: false,
            items: [],
            includeNapkinsAndUtensils: false,
            discountId: null,
          }),
        );

        localStorageOrder = JSON.stringify({
          datetimeToPickUp: new Date(),
          items: [],
          includeNapkinsAndUtensils: false,
          discountId: null,
        });
      }
      const parsedOrder = JSON.parse(localStorageOrder) as OrderDetails;

      parsedOrder.datetimeToPickUp = new Date(parsedOrder.datetimeToPickUp);

      validateOrder({ userId, orderDetails: parsedOrder });
    }

    window.addEventListener("focus", validateOrderOnWindowRefocus);

    return () => {
      window.removeEventListener("focus", validateOrderOnWindowRefocus);
    };
  }, [setOrderDetails, userId, user, validateOrder, cartInitiallyValidated]);
}

export default useKeepOrderDetailsValidated;
