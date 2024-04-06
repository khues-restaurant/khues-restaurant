import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { orderDetailsSchema } from "~/stores/MainStore";
import { useMainStore, type OrderDetails } from "~/stores/MainStore";
import { api } from "~/utils/api";

function useHandleLocalStorage() {
  const userId = useGetUserId();
  const { isSignedIn } = useAuth();

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
  });

  // maybe find better name for this
  const [orderDetailsRetrieved, setOrderDetailsRetrieved] = useState(false);

  useEffect(() => {
    if (user === undefined || userId === "" || orderDetailsRetrieved) return;

    console.log("validating from local storage");

    const resetOrderDetails =
      localStorage.getItem("khue's-resetOrderDetails") === "true"
        ? true
        : false;

    if (user) {
      try {
        orderDetailsSchema.parse(user.currentOrder);

        const parsedOrder = user.currentOrder as unknown as OrderDetails;

        validateOrder({
          userId: user.userId,
          orderDetails: parsedOrder,
          forceReturnOrderDetails: true,
        });
        setOrderDetailsRetrieved(true);

        return;
      } catch {
        // falling back to localstorage if user.currentOrder is not in valid shape
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

        validateOrder({
          userId,
          orderDetails: parsedOrder,
          forceReturnOrderDetails: true,
          resetOrderDetails,
        });
        setOrderDetailsRetrieved(true);

        // TODO: just check logic of this, do we want to clearLocalStorage() here if user is
        // logged in? I can't see a reason to keep it w/ it's potentially stale data.
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

    validateOrder({
      userId,
      orderDetails: parsedOrder,
      forceReturnOrderDetails: true,
      resetOrderDetails,
    });
    setOrderDetailsRetrieved(true);
  }, [setOrderDetails, userId, orderDetailsRetrieved, user, validateOrder]);
}

export default useHandleLocalStorage;
