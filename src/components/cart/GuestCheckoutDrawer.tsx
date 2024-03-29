import { SignInButton } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { type Stripe, loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import { useState, useMemo, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { IoIosArrowBack } from "react-icons/io";
import { CiGift } from "react-icons/ci";
import { TfiReceipt } from "react-icons/tfi";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { DrawerContent } from "~/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { formatPhoneNumber } from "~/utils/formatPhoneNumber";
import { api } from "~/utils/api";
import { useMainStore } from "~/stores/MainStore";
import useGetUserId from "~/hooks/useGetUserId";

const useStripe = () => {
  const stripe = useMemo<Promise<Stripe | null>>(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    [],
  );

  return stripe;
};

const mainFormSchema = z.object({
  firstName: z
    .string({
      required_error: "First name cannot be empty",
    })
    .min(1, { message: "Must be at least 1 character" })
    .max(30, { message: "Must be at most 30 characters" }),
  lastName: z
    .string({
      required_error: "Last name cannot be empty",
    })
    .min(1, { message: "Must be at least 1 character" })
    .max(30, { message: "Must be at most 30 characters" }),
  email: z
    .string({
      required_error: "Email cannot be empty",
    })
    .email({ message: "Invalid email format" }),
  phoneNumber: z
    .string({
      required_error: "Phone number cannot be empty",
    })
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Invalid phone number format")
    .refine(
      async (phoneNumber) => {
        // TODO: do this later, but should be very possible to query users model to see if phone number is unique. I don't think any special authentication logic is desired/needed here

        const isUnique = true; // Replace with actual check
        return isUnique;
      },
      {
        message: "Phone number must be unique",
      },
    ),
});

interface GuestCheckoutDrawer {
  guestCheckoutView: "credentialsForm" | "mainView" | "notShowing";
  setGuestCheckoutView: Dispatch<
    SetStateAction<"credentialsForm" | "mainView" | "notShowing">
  >;
}

function GuestCheckoutDrawer({
  guestCheckoutView,
  setGuestCheckoutView,
}: GuestCheckoutDrawer) {
  const userId = useGetUserId();
  const { asPath } = useRouter();

  const { orderDetails, menuItems } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    menuItems: state.menuItems,
  }));

  const createCheckout = api.payment.createCheckout.useMutation();
  const { mutateAsync: createTransientOrder, isLoading } =
    api.transientOrder.create.useMutation();
  const stripePromise = useStripe();

  async function checkout() {
    const response = await createCheckout.mutateAsync({
      userId,
      orderDetails,
      ...mainForm.getValues(),
    });
    const stripe = await stripePromise;

    if (stripe !== null) {
      await stripe.redirectToCheckout({
        sessionId: response.id,
      });
    }
  }

  const [checkoutButtonText, setCheckoutButtonText] = useState(
    "Proceed to checkout",
  );

  const mainForm = useForm<z.infer<typeof mainFormSchema>>({
    resolver: zodResolver(mainFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });

  async function onMainFormSubmit(values: z.infer<typeof mainFormSchema>) {
    // call stripe POST url here w/ mainForm values & orderDetails

    setCheckoutButtonText("Loading");

    await createTransientOrder({
      userId,
      details: orderDetails,
    });

    checkout().catch(console.error);
  }

  return (
    <motion.div
      key="guestCheckoutDrawerWrapper"
      initial={{ opacity: 0, translateX: "-100%" }}
      animate={{ opacity: 1, translateX: "0%" }}
      exit={{ opacity: 0, translateX: "-100%" }}
      transition={{
        duration: 0.35,
      }}
      className="baseVertFlex relative h-full w-full !justify-start overflow-y-auto"
    >
      <AnimatePresence mode="popLayout">
        {guestCheckoutView === "credentialsForm" ? (
          // start with this today, it's a grind but you have framework for <Form> in the
          // post signup component

          <motion.div
            key="guestCheckoutDrawerCredentialsForm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="baseVertFlex full relative mt-12 w-full gap-4 overflow-y-auto"
          >
            <Form {...mainForm}>
              <form className="baseVertFlex w-full">
                <div className="baseVertFlex w-full gap-8 tablet:gap-16">
                  <div className="baseVertFlex !items-start gap-8 tablet:!grid tablet:grid-cols-2">
                    <FormField
                      control={mainForm.control}
                      name="firstName"
                      render={({ field, fieldState: { invalid } }) => (
                        <FormItem className="relative">
                          <FormLabel className="font-semibold">
                            First name
                          </FormLabel>
                          <FormControl>
                            <Input
                              maxLength={30}
                              placeholder="First name"
                              className="w-full"
                              {...field}
                            />
                          </FormControl>
                          <AnimatePresence>
                            {invalid && (
                              <motion.div
                                key={"firstNameError"}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute -bottom-6 left-0 right-0"
                              >
                                <FormMessage />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={mainForm.control}
                      name="lastName"
                      render={({ field, fieldState: { invalid } }) => (
                        <FormItem className="relative">
                          <FormLabel className="font-semibold">
                            Last name
                          </FormLabel>
                          <FormControl>
                            <Input
                              maxLength={30}
                              placeholder="Last name"
                              className="w-full"
                              {...field}
                            />
                          </FormControl>
                          <AnimatePresence>
                            {invalid && (
                              <motion.div
                                key={"lastNameError"}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute -bottom-6 left-0 right-0"
                              >
                                <FormMessage />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="baseVertFlex !items-start gap-8 tablet:!grid tablet:grid-cols-2">
                    <FormField
                      control={mainForm.control}
                      name="email"
                      render={({ field, fieldState: { invalid } }) => (
                        <FormItem className="relative">
                          <FormLabel className="font-semibold">Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Email"
                              className="w-full"
                              {...field}
                            />
                          </FormControl>
                          <AnimatePresence>
                            {invalid && (
                              <motion.div
                                key={"emailError"}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute -bottom-6 left-0 right-0"
                              >
                                <FormMessage />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="baseVertFlex !items-start gap-8 tablet:!grid tablet:grid-cols-2">
                    <FormField
                      control={mainForm.control}
                      name="phoneNumber"
                      render={({
                        field: { onChange, onBlur, value, ref },
                        fieldState: { invalid },
                      }) => (
                        <FormItem className="relative">
                          <FormLabel className="font-semibold">
                            Phone number
                          </FormLabel>
                          <FormControl>
                            <Input
                              ref={ref}
                              value={formatPhoneNumber(value)}
                              onChange={(e) =>
                                onChange(formatPhoneNumber(e.target.value))
                              }
                              onBlur={onBlur}
                              placeholder="(012) 345-6789"
                              type={"tel"}
                              className="w-full"
                            />
                          </FormControl>
                          <AnimatePresence>
                            {invalid && (
                              <motion.div
                                key={"phoneNumberError"}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute -bottom-6 left-0 right-0"
                              >
                                <FormMessage className="w-max" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>

            <Button
              variant="default"
              disabled={checkoutButtonText !== "Proceed to checkout"}
              className="mt-6 font-medium"
              onClick={() => void mainForm.handleSubmit(onMainFormSubmit)()}
            >
              <AnimatePresence mode={"popLayout"}>
                <motion.div
                  key={`guestCheckoutDrawer-${checkoutButtonText}`}
                  layout
                  // whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="baseFlex gap-2"
                >
                  {checkoutButtonText}
                  {checkoutButtonText === "Loading" && (
                    <div
                      className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-white"
                      role="status"
                      aria-label="loading"
                    >
                      <span className="sr-only">Loading...</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="guestCheckoutDrawerMainScreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="baseVertFlex relative h-[500px] w-full overflow-y-auto"
          >
            <div className="baseVertFlex h-full w-full gap-4">
              <Button
                onClick={() => {
                  setGuestCheckoutView("credentialsForm");
                }}
              >
                Continue as a guest
              </Button>

              <div className="baseFlex gap-2">
                <Separator />
                or
                <Separator />
              </div>

              <div className="baseVertFlex w-80 gap-4">
                <SignInButton
                  mode="modal"
                  afterSignUpUrl={`${
                    process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
                  }/postSignUpRegistration`}
                  afterSignInUrl={`${
                    process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
                  }${asPath}`}
                >
                  <Button
                    variant={"secondary"}
                    onClick={() => {
                      localStorage.setItem(
                        "khue's-transferLocalStorageCartToAccount",
                        "true",
                      );
                      localStorage.setItem("khue's-redirectRoute", asPath);
                    }}
                  >
                    Sign in
                  </Button>
                </SignInButton>

                <div className="baseFlex mt-8 !items-start gap-4 rounded-md border-2 border-primary p-4">
                  <div className="baseVertFlex gap-2">
                    <CiGift className="size-10 border-b-2 border-primary pb-2" />
                    <div className="text-center">
                      Receive rewards points for your order
                    </div>
                  </div>

                  <div className="baseVertFlex gap-2">
                    <TfiReceipt className="size-10 border-b-2 border-primary pb-2" />
                    <div className="text-center">
                      Easily reorder this meal in the future
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="underline"
        size="sm"
        className="baseFlex absolute left-4 top-1 gap-2"
        onClick={() => {
          if (guestCheckoutView === "credentialsForm") {
            mainForm.reset();

            setGuestCheckoutView("mainView");
          } else {
            setGuestCheckoutView("notShowing");
          }
        }}
      >
        <IoIosArrowBack />
        Back
      </Button>
    </motion.div>
  );
}

export default GuestCheckoutDrawer;
