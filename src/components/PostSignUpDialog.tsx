import { useAuth, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { CiGift } from "react-icons/ci";
import { z } from "zod";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { AlertDialog, AlertDialogContent } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import useGetUserId from "~/hooks/useGetUserId";
import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { formatPhoneNumber } from "~/utils/formatPhoneNumber";

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
  birthday: z
    .string()
    .refine(
      (birthday) => {
        const date = new Date(birthday);
        return !isNaN(date.getTime());
      },
      { message: "Invalid date" },
    )
    .refine(
      (birthday) => {
        const year = new Date(birthday).getFullYear();
        const currentYear = new Date().getFullYear();

        return year > currentYear;
      },
      { message: "Year must not be in the future" },
    ),
});

const dietaryRestrictionsSchema = z.object({
  dietaryRestrictions: z
    .string()
    .max(100, { message: "Must be at most 100 characters" }),
});

function PostSignUpDialog() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const userId = useGetUserId();

  const { orderDetails } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
  }));

  const { data: userExists } = api.user.isUserRegistered.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  // TODO: probably if you are going with the storing of the orderId in a "redeemedOrders" model
  // in the database, you would have a query here checking whether the redeemedOrder is available to
  // be redeemed still? I think there's no other way really besides storing this id inside of a new
  // variable in localStorage. def low priority atm though.

  const { mutate: createUser, isLoading: isSaving } =
    api.user.create.useMutation({
      onSuccess: () => {
        setTimeout(() => setSaveButtonText("Saved"), 2000);

        setTimeout(() => {
          setIsOpen(false);
        }, 750);
      },
      onError: (error) => {
        console.error("Error creating user", error); // toast error here
      },
    });

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [initialRewardsPoints, setInitialRewardsPoints] = useState(0);
  const [saveButtonText, setSaveButtonText] = useState("Save");

  const [mainFormValues, setMainFormValues] = useState<z.infer<
    typeof mainFormSchema
  > | null>(null);
  const [dietaryRestrictionsValues, setdietaryRestrictionsValues] =
    useState<z.infer<typeof dietaryRestrictionsSchema> | null>(null);

  useEffect(() => {
    if (userId && isSignedIn && userExists !== undefined && !userExists) {
      setIsOpen(true);
    }
  }, [isSignedIn, userExists, userId]);

  const mainForm = useForm<z.infer<typeof mainFormSchema>>({
    resolver: zodResolver(mainFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      birthday: "",
    },
  });

  function onMainFormSubmit(values: z.infer<typeof mainFormSchema>) {
    setMainFormValues(values);
    setStep(2);
  }

  const dietaryRestrictionsForm = useForm<
    z.infer<typeof dietaryRestrictionsSchema>
  >({
    resolver: zodResolver(dietaryRestrictionsSchema),
    defaultValues: {
      dietaryRestrictions: "",
    },
  });

  function onDietaryRestrictionsFormSubmit(
    values: z.infer<typeof dietaryRestrictionsSchema>,
  ) {
    setdietaryRestrictionsValues(values);
    setStep(3);
  }

  const viewportLabel = useGetViewportLabel();

  // TODO: technically need to have left/right sliding content transitions respect which
  // direction the user is going in, but this is a low priority atm

  useEffect(() => {
    if (step === 3) {
      setTimeout(() => {
        setInitialRewardsPoints(500);
      }, 500);
    }

    setInitialRewardsPoints(0);
  }, [step]);

  function getDynamicWidth() {
    if (step === 3) {
      if (saveButtonText !== "Save") return "75px";
      return "100px";
    } else if (step === 2) {
      if (dietaryRestrictionsForm.formState.isDirty) return "175px";
      return "100px";
    }

    return "150px";
  }

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <></>;

  // TODO: can't think of a good reason why you would need to keep the <input> type of "calendar" for birthday
  // since I think every rational person would just be typing in the numbers rather than using w/e ui is provided.
  // therefore I think just doing the same realtime sanitization of the input as the phone number would be best.
  // ^ then you can also add a phone/calendar icon inside on left side of the input to make it look nicer
  // ^ FaPhone and CiCalendarDate

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-screen-md">
        <div
          style={{
            transition: "height 0.2s ease-in-out",
          }}
          className="baseVertFlex relative overflow-hidden"
        >
          <p className="text-center font-semibold">
            Finish setting up your account
          </p>
          <div className="baseFlex mt-4 w-full !justify-between p-0 pb-8 pt-2 tablet:mt-0 tablet:p-8">
            <div className="baseVertFlex relative gap-2 pl-4 pr-4 tablet:pl-8">
              <Step step={1} currentStep={step} />
              <p
                className={`absolute left-[0px] top-10 text-center text-xs transition-all tablet:left-[9px] tablet:top-12 tablet:text-nowrap tablet:text-sm ${step === 1 ? "font-semibold" : "text-stone-400"}`}
              >
                Personal info
              </p>
            </div>

            <div
              style={{
                position: "relative",
                flex: 1,
                height: "2px",
                backgroundColor: "#6b7280",
              }}
              className="rounded-md"
            >
              <AnimatePresence>
                {step > 1 && (
                  <motion.div
                    key="lineOne"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    exit={{ width: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      position: "absolute",
                      height: "2px",
                      backgroundColor: "hsl(5.3deg, 72.11%, 50.78%)",
                      top: 0,
                      left: 0,
                    }}
                    className="rounded-md"
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="baseVertFlex relative gap-2 px-4 text-sm">
              <Step step={2} currentStep={step} />

              <p
                className={`absolute left-[-3px] top-10 text-center text-xs transition-all tablet:left-[-29px] tablet:top-12 tablet:text-nowrap tablet:text-sm ${step === 2 ? "font-semibold" : "text-stone-400"}`}
              >
                Dietary preferences
              </p>
            </div>

            <div
              style={{
                position: "relative",
                flex: 1,
                height: "2px",
                backgroundColor: "#6b7280",
              }}
            >
              <AnimatePresence>
                {step === 3 && (
                  <motion.div
                    key="lineTwo"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    exit={{ width: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      position: "absolute",
                      height: "2px",
                      backgroundColor: "hsl(5.3deg, 72.11%, 50.78%)",
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="baseVertFlex relative gap-2 pl-4 pr-4 text-sm tablet:pr-8">
              <Step step={3} currentStep={step} />
              {/* <p className="absolute left-[16px] top-12">Finish</p> */}
              <CiGift
                className={`absolute top-10 size-6 tablet:top-11 ${step === 3 ? "" : "text-stone-400"}`}
              />
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {step === 1 && (
              <motion.div
                key={"personalInfo"}
                initial={{ opacity: 0, translateX: "-100%" }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: "-100%" }}
                transition={{ duration: 0.35 }}
                className="baseVertFlex min-h-48 w-full"
              >
                <Form {...mainForm}>
                  <form className="baseVertFlex mt-8 w-full p-1">
                    <div className="baseVertFlex w-full gap-4 tablet:gap-16">
                      <div className="grid grid-cols-2 !items-start gap-4 tablet:gap-8">
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
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
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
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <FormMessage />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 !items-start gap-4 tablet:gap-8">
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
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
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
                          name="birthday"
                          render={({ field, fieldState: { invalid } }) => (
                            <FormItem className="relative">
                              <FormLabel className="font-semibold">
                                Birthday
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  placeholder="mm/dd/yyyy"
                                  className="w-full"
                                  {...field}
                                />
                              </FormControl>
                              <AnimatePresence>
                                {invalid && (
                                  <motion.div
                                    key={"birthdayError"}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <FormMessage />
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
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key={"allergiesAndDietaryRestrictions"}
                initial={{ opacity: 0, translateX: "100%" }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: "-100%" }}
                transition={{ duration: 0.35 }}
                className="baseVertFlex mt-8 min-h-48 w-full"
              >
                <Form {...dietaryRestrictionsForm}>
                  <form className="baseVertFlex w-full gap-16">
                    <div className="baseVertFlex">
                      <FormField
                        control={dietaryRestrictionsForm.control}
                        name="dietaryRestrictions"
                        render={({ field }) => (
                          <FormItem className="px-2 tablet:w-[500px]">
                            <FormLabel className="font-semibold">
                              Dietary preferences
                            </FormLabel>
                            <FormDescription>
                              Please list any allergies or dietary restrictions
                              you may have.
                            </FormDescription>
                            <FormControl>
                              <Textarea
                                maxLength={100}
                                placeholder="I am allergic to..."
                                className="max-h-32 w-full"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key={"finish"}
                initial={{ opacity: 0, translateX: "100%" }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: "100%" }}
                transition={{ duration: 0.2 }}
                className="baseVertFlex mt-8 min-h-48 w-full"
              >
                <div
                  style={{
                    backgroundImage:
                      "linear-gradient(to right bottom, oklch(0.9 0.13 87.8 / 1) 0%, rgb(212, 175, 55) 100%)",
                  }}
                  className="baseFlex relative h-48 w-full overflow-hidden rounded-md"
                >
                  <motion.div
                    key={"rewardsHeroMobileImageOne"}
                    initial={{ opacity: 0, y: -125, x: -125 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.5,
                    }}
                    className="absolute -left-10 -top-10"
                  >
                    <Image
                      src={"/menuItems/sampleImage.webp"}
                      alt={"TODO: replace with proper alt tag text"}
                      width={96}
                      height={96}
                      className="!relative"
                    />
                  </motion.div>

                  <motion.div
                    key={"rewardsHeroMobileImageTwo"}
                    initial={{ opacity: 0, y: 125, x: -125 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.75,
                    }}
                    className="absolute -bottom-10 -left-10"
                  >
                    <Image
                      src={"/menuItems/sampleImage.webp"}
                      alt={"TODO: replace with proper alt tag text"}
                      width={96}
                      height={96}
                      className="!relative"
                    />
                  </motion.div>

                  <div className="baseVertFlex z-10 gap-4 rounded-md bg-offwhite px-8 py-4 text-yellow-500 shadow-lg">
                    <div className="text-center text-lg font-semibold">
                      Khue&apos;s Rewards
                    </div>

                    <div className="baseFlex gap-4 font-bold tracking-wider">
                      <SideAccentSwirls className="h-5 scale-x-[-1] fill-yellow-500" />

                      <div className="baseVertFlex">
                        <AnimatedNumbers
                          value={initialRewardsPoints}
                          fontSize={viewportLabel.includes("mobile") ? 18 : 24}
                          padding={0}
                        />
                        <p className="font-semibold tracking-normal">points</p>
                      </div>

                      <SideAccentSwirls className="h-5 fill-yellow-500" />
                    </div>
                  </div>

                  <motion.div
                    key={"rewardsHeroMobileImageThree"}
                    initial={{ opacity: 0, y: -125, x: 125 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.95,
                    }}
                    className="absolute -right-10 -top-10"
                  >
                    <Image
                      src={"/menuItems/sampleImage.webp"}
                      alt={"TODO: replace with proper alt tag text"}
                      width={96}
                      height={96}
                      className="!relative"
                    />
                  </motion.div>

                  <motion.div
                    key={"rewardsHeroMobileImageFour"}
                    initial={{ opacity: 0, y: 125, x: 125 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.6,
                    }}
                    className="absolute -bottom-10 -right-10"
                  >
                    <Image
                      src={"/menuItems/sampleImage.webp"}
                      alt={"TODO: replace with proper alt tag text"}
                      width={96}
                      height={96}
                      className="!relative"
                    />
                  </motion.div>
                </div>

                <p className="mt-8 text-center">
                  Congratulations! You have successfully created your account.
                </p>

                <p className="mt-8 max-w-96 text-sm text-neutral-500">
                  As a token of our appreciation, enjoy a head start of 500 free
                  rewards points. Visit your rewards page in your profile to
                  browse meals you can redeem your points for.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="baseFlex mt-4 w-full !justify-between p-1 tablet:mt-16">
            <Button
              variant={"text"}
              onClick={() => setStep(step - 1)}
              className={`${
                step === 1 || isSaving
                  ? "pointer-events-none opacity-50"
                  : "text-stone-500"
              }`}
            >
              Back
            </Button>
            <Button
              style={{
                width: getDynamicWidth(),
              }}
              className="font-medium transition-all"
              onClick={() => {
                if (step === 1) {
                  void mainForm.handleSubmit(onMainFormSubmit)();
                } else if (step === 2) {
                  void dietaryRestrictionsForm.handleSubmit(
                    onDietaryRestrictionsFormSubmit,
                  )();
                } else {
                  if (!user) return;

                  setSaveButtonText("Saving");

                  createUser({
                    userId,
                    email: user.primaryEmailAddress!.emailAddress, // guaranteed to exist
                    ...mainFormValues!,
                    ...dietaryRestrictionsValues!,
                    birthday: new Date(mainFormValues!.birthday),
                    currentOrder: orderDetails,
                  });
                }
              }}
            >
              <AnimatePresence mode="wait">
                {step !== 2 ||
                (step === 2 && dietaryRestrictionsForm.formState.isDirty) ? (
                  step === 3 ? (
                    <AnimatePresence mode={"popLayout"}>
                      <motion.div
                        key={saveButtonText}
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
                        {saveButtonText}
                        {saveButtonText === "Saving" && (
                          <div
                            className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-offwhite"
                            role="status"
                            aria-label="loading"
                          >
                            <span className="sr-only">Loading...</span>
                          </div>
                        )}
                        {saveButtonText === "Saved" && (
                          <svg
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="size-4 text-offwhite"
                          >
                            <motion.path
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{
                                delay: 0.2,
                                type: "tween",
                                ease: "easeOut",
                                duration: 0.3,
                              }}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <motion.span
                      key="continue"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Continue
                    </motion.span>
                  )
                ) : (
                  <motion.span
                    key="skip"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Skip
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PostSignUpDialog;

function Step({ step, currentStep }: { step: number; currentStep: number }) {
  const status =
    currentStep === step
      ? "active"
      : currentStep < step
        ? "inactive"
        : "complete";

  return (
    <motion.div animate={status} className="relative">
      <motion.div
        variants={{
          active: {
            scale: 1,
            transition: {
              delay: 0,
              duration: 0.2,
            },
          },
          complete: {
            scale: 1.25,
          },
        }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          type: "tween",
          ease: "circOut",
        }}
        className="absolute inset-0 rounded-full bg-red-200"
      />

      <motion.div
        initial={false}
        variants={{
          inactive: {
            backgroundColor: "#fff", // neutral
            borderColor: "#e5e5e5", // neutral-200
            color: "#a3a3a3", // neutral-400
          },
          active: {
            backgroundColor: "#fff",
            borderColor: "#dc3727", //  bg-primary
            color: "#dc3727", //  bg-primary
            transition: {
              delay: 0.5,
            },
          },
          complete: {
            backgroundColor: "#dc3727", //  bg-primary
            borderColor: "#dc3727", //  bg-primary
            color: "#dc3727", //  bg-primary
          },
        }}
        transition={{ duration: 0.2 }}
        className="relative flex size-8 items-center justify-center rounded-full border-2 font-semibold tablet:size-10"
      >
        <div className="flex items-center justify-center">
          {status === "complete" ? (
            <CheckIcon className="size-4 text-offwhite tablet:size-6" />
          ) : (
            <span className="text-sm tablet:text-lg">{step}</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CheckIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.2,
          type: "tween",
          ease: "easeOut",
          duration: 0.3,
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
