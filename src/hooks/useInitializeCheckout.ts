import { useAuth } from "@clerk/nextjs";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useMemo } from "react";
import useGetUserId from "~/hooks/useGetUserId";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { env } from "~/env";

const useStripe = () => {
  const stripe = useMemo<Promise<Stripe | null>>(
    () => loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    [],
  );

  return stripe;
};

// TODO: prob allow this to accept props for user details so this
// can also be used for guest checkout

function useInitializeCheckout() {
  const userId = useGetUserId();
  const { isSignedIn } = useAuth();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { orderDetails } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
  }));

  const createCheckout = api.payment.createCheckout.useMutation();
  const { mutateAsync: createTransientOrder, isLoading } =
    api.transientOrder.create.useMutation();

  const stripePromise = useStripe();

  async function checkout() {
    const response = await createCheckout.mutateAsync({
      userId,
      stripeUserId: user?.stripeUserId,
      orderDetails,
    });
    const stripe = await stripePromise;

    if (stripe !== null) {
      await stripe.redirectToCheckout({
        sessionId: response.id,
      });
    }
  }

  async function initializeCheckout() {
    await createTransientOrder({
      userId,
      details: orderDetails,
    });

    localStorage.setItem("khue's-resetOrderDetails", "true");

    checkout().catch(console.error);
  }

  return {
    initializeCheckout,
    isLoading,
  };
}

export default useInitializeCheckout;
