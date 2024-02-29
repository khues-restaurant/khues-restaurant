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
import { Dialog, DialogContent } from "~/components/ui/dialog";

const useStripe = () => {
  const stripe = useMemo<Promise<Stripe | null>>(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    [],
  );

  return stripe;
};

const mainFormSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "Must be at least 1 character" })
    .max(30, { message: "Must be at most 30 characters" }),
  lastName: z
    .string()
    .min(1, { message: "Must be at least 1 character" })
    .max(30, { message: "Must be at most 30 characters" }),
  email: z.string().email({ message: "Invalid email format" }),
  phoneNumber: z
    .string()
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

interface GuestCheckoutDialog {
  guestCheckoutView: "credentialsForm" | "mainView" | "notShowing";
  setGuestCheckoutView: Dispatch<
    SetStateAction<"credentialsForm" | "mainView" | "notShowing">
  >;
}

function GuestCheckoutDialog({
  guestCheckoutView,
  setGuestCheckoutView,
}: GuestCheckoutDialog) {
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

  // const [mainFormValues, setMainFormValues] = useState<z.infer<
  //   typeof mainFormSchema
  // > | null>(null);

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
    console.log(values);
    await createTransientOrder({
      userId,
      details: orderDetails,
    });

    checkout().catch(console.error);
  }

  return (
    <Dialog open={guestCheckoutView !== "notShowing"}>
      <DialogContent
        className="max-w-xl"
        extraBottomSpacer={false}
        onCloseClickFunction={() => {
          setGuestCheckoutView("notShowing");
        }}
      >
        <AnimatePresence mode="wait">
          {guestCheckoutView === "credentialsForm" ? (
            <motion.div
              key="guestCheckoutDrawerCredentialsForm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="baseVertFlex relative mt-4 h-[350px] w-full gap-4 overflow-y-auto"
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
                            <FormLabel className="font-semibold">
                              Email
                            </FormLabel>
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

              <div className="baseVertFlex mt-8 w-[80%] !items-end gap-8 px-4 tablet:!grid tablet:grid-cols-2">
                <Button
                  variant="secondary"
                  className="baseFlex gap-2"
                  onClick={() => {
                    mainForm.reset();

                    setGuestCheckoutView("mainView");
                  }}
                >
                  <IoIosArrowBack />
                  Back
                </Button>
                <Button
                  className="mt-6 font-medium"
                  onClick={() => {
                    // okay but can we just directly tie state to the link in template string
                    // look up stripe shape it expects maybe

                    void mainForm.handleSubmit(onMainFormSubmit)();
                  }}
                  // asChild uncomment this as well
                >
                  <div>Continue to checkout</div>
                  {isLoading && <div>Loading...</div>}
                  {/* <a href="clerklink">Continue to checkout</a> */}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="guestCheckoutDrawerMainScreen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="baseVertFlex relative h-[350px] w-full overflow-y-auto"
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
      </DialogContent>
    </Dialog>
  );
}

export default GuestCheckoutDialog;
