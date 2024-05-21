import { useAuth } from "@clerk/nextjs";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import useGetUserId from "~/hooks/useGetUserId";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { env } from "~/env";
import useUpdateOrder from "~/hooks/useUpdateOrder";

const useStripe = () => {
  const stripe = useMemo<Promise<Stripe | null>>(
    () => loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    [],
  );

  return stripe;
};

interface UseInitializeCheckout {
  setCheckoutButtonText: Dispatch<SetStateAction<string>>;
}

function useInitializeCheckout({
  setCheckoutButtonText,
}: UseInitializeCheckout) {
  const userId = useGetUserId();
  const { isSignedIn } = useAuth();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { orderDetails, setValidatingCart, setItemNamesRemovedFromCart } =
    useMainStore((state) => ({
      orderDetails: state.orderDetails,
      setValidatingCart: state.setValidatingCart,
      setItemNamesRemovedFromCart: state.setItemNamesRemovedFromCart,
    }));

  const [pickupName, setPickupName] = useState("");

  const { updateOrder } = useUpdateOrder();

  const createCheckout = api.payment.createCheckout.useMutation();

  const { mutate: validateOrder } = api.validateOrder.validate.useMutation({
    onSuccess: async (data) => {
      if (data.changedOrderDetails) {
        updateOrder({
          newOrderDetails: data.changedOrderDetails,
        });
      }

      if (data.removedItemNames && data.removedItemNames.length > 0) {
        setItemNamesRemovedFromCart(data.removedItemNames);

        setCheckoutButtonText("Proceed to checkout");

        // do not want to proceed with checkout if there was any change of the
        // items in the cart for any reason.
        return;
      }

      if (isSignedIn === false) {
        localStorage.setItem("khue's-resetOrderDetails", "true");
      }

      checkout().catch(console.error);
    },
    onError: (error) => {
      console.error(error);
      // idk.. toast here? or just internal log of error;
    },
    onSettled: (data) => {
      setValidatingCart(false);
    },
  });

  const stripePromise = useStripe();

  async function checkout() {
    const response = await createCheckout.mutateAsync({
      userId,
      stripeUserId: user?.stripeUserId,
      orderDetails,
      pickupName,
    });
    const stripe = await stripePromise;

    setValidatingCart(false);

    if (stripe !== null) {
      await stripe.redirectToCheckout({
        sessionId: response.id,
      });
    }
  }

  async function initializeCheckout(pickupName: string) {
    setValidatingCart(true);
    setPickupName(pickupName);
    validateOrder({ userId, orderDetails });
  }

  return {
    initializeCheckout,
  };
}

export default useInitializeCheckout;
