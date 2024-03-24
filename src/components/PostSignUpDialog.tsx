import { useAuth, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { CiGift } from "react-icons/ci";
import { z } from "zod";
import AnimatedNumbers from "~/components/AnimatedNumbers";
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
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { formatPhoneNumber } from "~/utils/formatPhoneNumber";

const mainFormSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "Must be at least 1 character" })
    .max(30, { message: "Must be at most 30 characters" }),
  lastName: z
    .string()
    .min(1, { message: "Must be at least 1 character" })
    .max(30, { message: "Must be at most 30 characters" }),

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
  birthday: z.string().refine(
    (birthday) => {
      const date = new Date(birthday);
      return !isNaN(date.getTime());
    },
    { message: "Invalid date" },
  ),
});

const dietaryRestrictionsSchema = z.object({
  dietaryRestrictions: z
    .string()
    .max(100, { message: "Must be at most 100 characters" }),
});

const spring = {
  type: "spring",
  stiffness: 150, // Control the speed of the spring
  damping: 10, // Control the oscillation
  mass: 1, // Control the "weight" of the animation
};

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
        console.log("User created successfully");
        setShowSuccessCheckmark(true);
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
  const [showSuccessCheckmark, setShowSuccessCheckmark] = useState(false);

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

  // TODO: could initialize first and last name from clerk if present

  // TODO: figure out how to get natural left/right sliding animation between steps
  // currently they animate smoothly, however when going forward and back, they don't slide
  // in from where you would expect them to

  useEffect(() => {
    if (step === 3) {
      setTimeout(() => {
        setInitialRewardsPoints(150);
      }, 150);
    }
  }, [step]);

  function getDynamicWidth() {
    if (step === 3) {
      if (isSaving || showSuccessCheckmark) return "50px";
      return "100px";
    } else if (step === 2) {
      if (dietaryRestrictionsForm.formState.isDirty) return "175px";
      return "100px";
    }

    return "175px";
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <></>;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-screen-md">
        <div
          style={{
            transition: "height 0.2s ease-in-out",
          }}
          className="baseVertFlex relative overflow-hidden"
        >
          <div className="baseFlex w-full !justify-between p-0 pb-8 pt-2 tablet:p-8">
            <div className="baseVertFlex gap-4 text-sm tablet:text-base">
              <Step step={1} currentStep={step} />
              Personal info
            </div>

            <div
              style={{
                position: "relative",
                flex: 1,
                height: "2px",
                backgroundColor: "gray",
                marginBottom: "2.45rem",
              }}
            >
              <AnimatePresence>
                {step > 1 && (
                  <motion.div
                    key="lineOne"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    exit={{ width: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      position: "absolute",
                      height: "2px",
                      backgroundColor: "red",
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="baseVertFlex gap-4 text-sm tablet:text-base">
              <Step step={2} currentStep={step} />
              Dietary preferences
            </div>

            <div
              style={{
                position: "relative",
                flex: 1,
                height: "2px",
                backgroundColor: "gray",
                marginBottom: "2.45rem",
              }}
              className="baseFlex"
            >
              <AnimatePresence>
                {step === 3 && (
                  <motion.div
                    key="lineTwo"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    exit={{ width: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      position: "absolute",
                      height: "2px",
                      backgroundColor: "red",
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="baseVertFlex gap-4 text-sm tablet:text-base">
              <Step step={3} currentStep={step} />
              Finish
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {step === 1 && (
              <motion.div
                key={"personalInfo"}
                initial={{ opacity: 0, translateX: "100%" }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: "-100%" }}
                transition={{ duration: 0.35 }}
                className="baseVertFlex min-h-48 w-full"
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
                className="baseVertFlex min-h-48 w-full"
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
                exit={{ opacity: 0, translateX: "-100%" }}
                transition={{ duration: 0.2 }}
                className="baseVertFlex min-h-48 w-full"
              >
                <motion.div
                  key={"rankIconAndProgressBar"}
                  initial={{ opacity: 0, translateY: "100%" }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                  className="baseVertFlex gap-4"
                >
                  {/* TODO: come back and bring this styling to current rewards styling +
                  figure out what exactly makes sense to dislay for text */}
                  <p className="font-semibold">Rank One: Lorem Ipsum</p>

                  <div className="imageFiller baseFlex h-16 w-16">
                    <p className="p-1">level 1 rewards icon</p>
                  </div>

                  <div className="baseFlex relative h-8 w-80 !justify-start rounded-full bg-slate-500 shadow-md">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(150 / 1000) * 100}%` }}
                      transition={{
                        delay: 0.5,
                        ...spring,
                      }}
                      className="absolute left-0 top-0 h-8 rounded-full bg-green-600"
                    ></motion.div>
                  </div>

                  <div className="baseFlex">
                    <AnimatedNumbers
                      value={initialRewardsPoints}
                      fontSize={16}
                      padding={0}
                    />
                    /<span>1000</span>
                  </div>
                </motion.div>

                <span className="baseFlex mt-4 gap-2">
                  Thanks for completing the form, here&apos;s a head start on
                  your rewards <CiGift size="1.25rem" />
                </span>

                <p className="mt-8 max-w-96 text-neutral-500">
                  Reminder: Ordering though our website will grant you points,
                  which grant discounts and special meals!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="baseFlex mt-10 w-full !justify-between">
            <Button
              variant={"text"}
              onClick={() => setStep(step - 1)}
              className={`${
                step === 1 || isSaving ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Back
            </Button>
            <Button
              style={{
                width: getDynamicWidth(),
              }}
              className="font-medium transition-[width]"
              onClick={() => {
                if (step === 1) {
                  void mainForm.handleSubmit(onMainFormSubmit)();
                } else if (step === 2) {
                  void dietaryRestrictionsForm.handleSubmit(
                    onDietaryRestrictionsFormSubmit,
                  )();
                } else {
                  if (!user) return;

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
                    <motion.div
                      key="save"
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AnimatePresence mode={"popLayout"}>
                        {showSuccessCheckmark ? (
                          <svg
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="size-4 text-white"
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
                        ) : isSaving ? (
                          <motion.div
                            key="saveSpinner"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <svg
                              className="size-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="saveText"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            Save
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
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
        className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold"
      >
        <div className="flex items-center justify-center">
          {status === "complete" ? (
            <CheckIcon className="h-6 w-6 text-white" />
          ) : (
            <span>{step}</span>
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
