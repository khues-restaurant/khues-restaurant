import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  useEffect,
  useState,
  type ComponentProps,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useForm } from "react-hook-form";
import { CiCalendarDate, CiGift } from "react-icons/ci";
import { FaList, FaUserAlt } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { IoIosMail } from "react-icons/io";
import { z } from "zod";
import AnimatedNumbers from "~/components/AnimatedNumbers";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { AlertDialog, AlertDialogContent } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import useGetUserId from "~/hooks/useGetUserId";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getMidnightCSTInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";
import { formatPhoneNumber } from "~/utils/formatters/formatPhoneNumber";

// import affogato from "public/menuItems/affogato.png";
// import grilledSirloin from "public/menuItems/grilled-sirloin.png";
// import roastPorkFriedRice from "public/menuItems/roast-pork-fried-rice.png";
// import thaiTeaTresLeches from "public/menuItems/thai-tea-tres-leches.png";

const mainFormSchema = z.object({
  firstName: z
    .string({
      required_error: "First name cannot be empty",
    })
    .min(1, { message: "At least 1 character required" })
    .max(30, { message: "Maximum 30 characters allowed" })
    .refine((value) => /^[A-Za-z'-]+$/.test(value), {
      message: "Only English characters, hyphens, and apostrophes are allowed",
    })
    .refine((value) => !/[^\u0000-\u007F]/.test(value), {
      message: "No non-ASCII characters are allowed",
    })
    .refine((value) => !/[\p{Emoji}]/u.test(value), {
      message: "No emojis are allowed",
    })
    .transform((value) => value.trim()) // Remove leading and trailing whitespace
    .transform((value) => value.replace(/\s+/g, " ")), // Remove consecutive spaces,
  lastName: z
    .string({
      required_error: "Last name cannot be empty",
    })
    .min(1, { message: "At least 1 character required" })
    .max(30, { message: "Maximum 30 characters allowed" })
    .refine((value) => /^[A-Za-z'-]+$/.test(value), {
      message: "Only English characters, hyphens, and apostrophes are allowed",
    })
    .refine((value) => !/[^\u0000-\u007F]/.test(value), {
      message: "No non-ASCII characters are allowed",
    })
    .refine((value) => !/[\p{Emoji}]/u.test(value), {
      message: "No emojis are allowed",
    })
    .transform((value) => value.trim()) // Remove leading and trailing whitespace
    .transform((value) => value.replace(/\s+/g, " ")), // Remove consecutive spaces,
  phoneNumber: z
    .string({
      required_error: "Phone number cannot be empty",
    })
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Invalid phone number format"),
  birthday: z
    .string()
    .refine(
      (birthday) => {
        if (birthday.length !== 10) return false;

        const date = new Date(birthday);
        return !isNaN(date.getTime());
      },
      { message: "Invalid date" },
    )
    .refine(
      (birthday) => {
        const date = new Date(birthday);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        const monthDiff = now.getMonth() - date.getMonth();
        const dayDiff = now.getDate() - date.getDate();

        return (
          age > 13 ||
          (age === 13 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
        );
      },
      { message: "Users must be at least 13 years old to sign up." },
    )
    .refine(
      (birthday) => {
        const date = new Date(birthday);
        return date <= new Date();
      },
      { message: "Date must not be in the future" },
    ),
});

const dietaryRestrictionsSchema = z.object({
  dietaryRestrictions: z
    .string()
    .max(100, { message: "Maximum 100 characters allowed" })
    .refine((value) => /^[A-Za-z0-9\s\-';.,!?:"(){}\[\]/\\_@]*$/.test(value), {
      message: "Invalid characters were found",
    })
    .refine((value) => !/[^\u0000-\u007F]/.test(value), {
      message: "No non-ASCII characters are allowed",
    })
    .transform((value) => value.trim()) // Remove leading and trailing whitespace
    .transform((value) => value.replace(/\s+/g, " ")), // Remove consecutive spaces,
  autoApplyDietaryRestrictions: z.boolean(),
});

const emailCommunicationsSchema = z.object({
  allowsEmailReceipts: z.boolean(),
  allowsOrderCompleteEmails: z.boolean(),
  allowsRewardAvailabilityReminderEmails: z.boolean(),
  allowsPromotionalEmails: z.boolean(),
});

interface PostSignUpDialog {
  setShouldRenderPostSignUpDialog: Dispatch<SetStateAction<boolean>>;
}

function PostSignUpDialog({
  setShouldRenderPostSignUpDialog,
}: PostSignUpDialog) {
  const { user: clerkUser } = useUser();
  const userId = useGetUserId();
  const ctx = api.useUtils();

  const { orderDetails, viewportLabel } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    viewportLabel: state.viewportLabel,
  }));

  const { data: order } = api.order.getById.useQuery(
    localStorage.getItem("khue's-orderIdToRedeem") ?? "",
    {
      enabled: localStorage.getItem("khue's-orderIdToRedeem") !== null,
    },
  );

  const { mutate: createUser, isLoading: isSaving } =
    api.user.create.useMutation({
      onSuccess: () => {
        setTimeout(() => {
          setSaveButtonText("Saved");
          void ctx.user.invalidate();
        }, 2000);

        setTimeout(() => {
          setDialogIsOpen(false);

          setTimeout(() => {
            setShouldRenderPostSignUpDialog(false);
          }, 300);
          // ^ duration of the dialog closing animation,
          // allows the dialog to fade out before being removed from the DOM
        }, 750);

        localStorage.removeItem("khue's-orderIdToRedeem");
      },
      onError: (error) => {
        console.error("Error creating user", error); // toast error here
      },
    });

  const [dialogIsOpen, setDialogIsOpen] = useState(true);
  const [step, setStep] = useState(1);
  const [saveButtonText, setSaveButtonText] = useState("Save");

  // if redeeming points for a previous order, this will be the amount of points being redeemed
  const [rewardsPointsBeingRedeemed, setRewardsPointsBeingRedeemed] =
    useState(0);
  // the total amount of points the user will have upon completion of the sign up process
  const [initialRewardsPoints, setInitialRewardsPoints] = useState(0);

  const [mainFormValues, setMainFormValues] = useState<z.infer<
    typeof mainFormSchema
  > | null>(null);
  const [dietaryRestrictionsValues, setDietaryRestrictionsValues] =
    useState<z.infer<typeof dietaryRestrictionsSchema> | null>(null);
  const [emailCommunicationsValues, setEmailCommunicationsValues] =
    useState<z.infer<typeof emailCommunicationsSchema> | null>(null);

  const mainForm = useForm<z.infer<typeof mainFormSchema>>({
    resolver: zodResolver(mainFormSchema),
    values: mainFormValues ?? {
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
      autoApplyDietaryRestrictions: false,
    },
  });

  function onDietaryRestrictionsFormSubmit(
    values: z.infer<typeof dietaryRestrictionsSchema>,
  ) {
    setDietaryRestrictionsValues(values);
    setStep(3);
  }

  const emailCommunicationsForm = useForm<
    z.infer<typeof emailCommunicationsSchema>
  >({
    resolver: zodResolver(emailCommunicationsSchema),
    defaultValues: {
      allowsEmailReceipts: true,
      allowsOrderCompleteEmails: true,
      allowsRewardAvailabilityReminderEmails: false,
      allowsPromotionalEmails: false,
    },
  });

  function onEmailCommunicationsFormSubmit(
    values: z.infer<typeof emailCommunicationsSchema>,
  ) {
    setEmailCommunicationsValues(values);
    setStep(4);
  }

  useEffect(() => {
    if (step === 4) {
      const pointsBeingRedeemedFromPreviousOrder = order
        ? order.userId === null
          ? order.earnedRewardsPoints
          : 0
        : 0;

      const pointsBeingRedeemed = 500 + pointsBeingRedeemedFromPreviousOrder;

      setRewardsPointsBeingRedeemed(pointsBeingRedeemedFromPreviousOrder);

      setTimeout(() => {
        setInitialRewardsPoints(pointsBeingRedeemed);
      }, 500);
    }

    setInitialRewardsPoints(0);
  }, [step, order]);

  function renderSaveButtonText() {
    if (
      step === 1 ||
      step === 3 ||
      (step === 2 && dietaryRestrictionsForm.formState.isDirty)
    ) {
      return (
        <motion.span
          key="continue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          Continue
        </motion.span>
      );
    } else if (step === 2 && !dietaryRestrictionsForm.formState.isDirty) {
      return (
        <motion.span
          key="skip"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          Skip
        </motion.span>
      );
    }

    return (
      <AnimatePresence mode={"popLayout"} initial={false}>
        <motion.div
          key={saveButtonText}
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
    );
  }

  function getDynamicWidth() {
    if (step === 4) {
      return "100px";
    } else if (step === 2 && !dietaryRestrictionsForm.formState.isDirty) {
      return "100px";
    }

    return "150px";
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void,
  ) {
    const value = event.target.value.replace(/\D/g, ""); // Remove all non-digit characters

    let formattedValue = value;
    if (value.length > 2 && value.length <= 4) {
      formattedValue = `${value.slice(0, 2)}/${value.slice(2)}`;
    } else if (value.length > 4) {
      formattedValue = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    }

    onChange(formattedValue);
  }

  return (
    <AlertDialog open={dialogIsOpen}>
      <AlertDialogContent className="max-w-screen-md pb-3">
        <div
          style={{
            height:
              step === 4
                ? viewportLabel !== "desktop"
                  ? "600px"
                  : "625px"
                : "525px",
            transition: "height 0.2s ease-in-out",
          }}
          className="baseVertFlex relative overflow-hidden"
        >
          <p className="text-center font-semibold tablet:text-lg">
            Account setup
          </p>
          <div className="baseFlex mt-4 w-full !justify-between p-0 pb-8 pt-2 tablet:mt-0 tablet:p-8">
            <div className="baseVertFlex relative gap-2 pl-2 pr-2 tablet:pl-8 tablet:pr-4">
              <Step step={1} currentStep={step} />
              <div
                className={`absolute left-[15px] top-12 text-center transition-all tablet:left-[44px]
                  tablet:top-14
                  ${step === 1 ? "scale-110 text-primary" : "text-stone-400"}
                  `}
              >
                <FaUserAlt />
              </div>
              <p
                className={`absolute left-[0px] top-[72px] text-center text-xs transition-all tablet:left-[9px] tablet:top-20 tablet:text-nowrap tablet:text-sm ${step === 1 ? "opacity-1 font-semibold text-primary" : "text-stone-400 opacity-0"}`}
              >
                Personal info
              </p>
            </div>

            <div
              style={{
                position: "relative",
                flex: 1,
                height: "2px",
              }}
              className="rounded-md bg-stone-400"
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
                      backgroundColor: "hsl(144deg, 61%, 20%)",
                      top: 0,
                      left: 0,
                    }}
                    className="rounded-md"
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="baseVertFlex relative gap-2 px-2 text-sm tablet:px-4">
              <Step step={2} currentStep={step} />
              <div
                className={`absolute left-[15px] top-12 text-center transition-all tablet:left-[29px] tablet:top-14
                  ${step === 2 ? "scale-110 text-primary" : "text-stone-400"}
                  `}
              >
                <FaList className="size-[17px]" />
              </div>

              <p
                className={`absolute left-[-10px] top-[72px] text-center text-xs transition-all tablet:left-[-29px] tablet:top-20 tablet:text-nowrap tablet:text-sm ${step === 2 ? "opacity-1 font-semibold text-primary" : "text-stone-400 opacity-0"}`}
              >
                Dietary preferences
              </p>
            </div>

            <div
              style={{
                position: "relative",
                flex: 1,
                height: "2px",
              }}
              className="rounded-md bg-stone-400"
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
                      backgroundColor: "hsl(144deg, 61%, 20%)",
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="baseVertFlex relative gap-2 px-2 text-sm tablet:px-4">
              <Step step={3} currentStep={step} />
              <div
                className={`absolute left-[14px] top-12 text-center transition-all tablet:left-[26px] tablet:top-14
                  ${step === 3 ? "scale-110 text-primary" : "text-stone-400"}
                  `}
              >
                <IoIosMail className="size-5" />
              </div>

              <p
                className={`absolute left-[-12px] top-[72px] text-center text-xs transition-all tablet:left-[-22px] tablet:top-20 tablet:text-nowrap tablet:text-sm ${step === 3 ? "opacity-1 font-semibold text-primary" : "text-stone-400 opacity-0"}`}
              >
                Email preferences
              </p>
            </div>

            <div
              style={{
                position: "relative",
                flex: 1,
                height: "2px",
              }}
              className="rounded-md bg-stone-400"
            >
              <AnimatePresence>
                {step === 4 && (
                  <motion.div
                    key="lineThree"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    exit={{ width: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      position: "absolute",
                      height: "2px",
                      backgroundColor: "hsl(144deg, 61%, 20%)",
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="baseVertFlex relative gap-2 px-2 text-sm tablet:pl-4 tablet:pr-8">
              <Step step={4} currentStep={step} />
              <CiGift
                className={`absolute top-12 size-5 tablet:top-14 ${step === 4 ? "scale-110 text-primary" : "text-stone-400"}`}
              />
              <p
                className={`absolute left-[0px] top-[72px] text-center text-xs transition-all tablet:left-[-3px] tablet:top-20 tablet:text-nowrap tablet:text-sm ${step === 4 ? "opacity-1 font-semibold text-primary" : "text-stone-400 opacity-0"}`}
              >
                Thank you!
              </p>
            </div>
          </div>

          <AnimatePresence initial={false} mode="wait">
            {step === 1 && (
              <motion.div
                key={"personalInfo"}
                initial={{ opacity: 0, translateX: "-25%" }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: "-25%" }}
                transition={{
                  opacity: { duration: 0.1 },
                  translateX: { duration: 0.25 },
                  ease: "easeInOut",
                }}
                className="baseVertFlex mt-16 h-full min-h-48 w-full overflow-hidden tablet:mt-0"
              >
                <Form {...mainForm}>
                  <form
                    onSubmit={mainForm.handleSubmit(onMainFormSubmit)}
                    className="baseVertFlex w-full p-1 tablet:mt-8"
                  >
                    <div
                      style={{
                        ...(viewportLabel.includes("mobile") && {
                          WebkitMaskImage:
                            "linear-gradient(to bottom, transparent 0, black var(--top-mask-size, 0), black calc(100% - 48px), transparent 100%)",
                          maskImage:
                            "linear-gradient(to bottom, transparent 0, black var(--top-mask-size, 0), black calc(100% - 48px), transparent 100%)",
                        }),
                      }}
                      className={`baseVertFlex h-[300px] w-full !justify-start gap-6 overflow-y-auto pb-16 tablet:h-auto tablet:!justify-center tablet:gap-8 tablet:overflow-y-visible tablet:pb-0
                      `}
                    >
                      <div className="grid w-64 grid-cols-1 !items-start gap-4 tablet:w-[500px] tablet:grid-cols-2 tablet:gap-16">
                        <FormField
                          control={mainForm.control}
                          name="firstName"
                          render={({
                            field,
                            fieldState: { invalid, error },
                          }) => (
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
                                    initial={{
                                      opacity: 0,
                                      height: 0,
                                      marginTop: 0,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      height: "auto",
                                      marginTop: "0.25rem",
                                    }}
                                    exit={{
                                      opacity: 0,
                                      height: 0,
                                      marginTop: 0,
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-1 max-w-48 text-sm font-medium text-red-500"
                                  >
                                    {error?.message}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={mainForm.control}
                          name="lastName"
                          render={({
                            field,
                            fieldState: { invalid, error },
                          }) => (
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
                                    initial={{
                                      opacity: 0,
                                      height: 0,
                                      marginTop: 0,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      height: "auto",
                                      marginTop: "0.25rem",
                                    }}
                                    exit={{
                                      opacity: 0,
                                      height: 0,
                                      marginTop: 0,
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-1 max-w-48 text-sm font-medium text-red-500"
                                  >
                                    {error?.message}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid w-64 grid-cols-1 !items-start gap-4 tablet:w-[500px] tablet:grid-cols-2 tablet:gap-16">
                        <FormField
                          control={mainForm.control}
                          name="phoneNumber"
                          render={({
                            field: { onChange, onBlur, value, ref },
                            fieldState: { invalid, error },
                          }) => (
                            <FormItem className="relative">
                              <FormLabel
                                htmlFor="phoneNumber"
                                className="baseFlex !justify-start gap-2 font-semibold"
                              >
                                <FaPhone
                                  className={`size-3 ${invalid ? "text-red-500" : "black"} h-[17px]`}
                                />
                                Phone number
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    ref={ref}
                                    id={"phoneNumber"}
                                    value={formatPhoneNumber(value)}
                                    onChange={(e) =>
                                      onChange(
                                        formatPhoneNumber(e.target.value),
                                      )
                                    }
                                    onBlur={onBlur}
                                    placeholder="(012) 345-6789"
                                    type={"tel"}
                                    className="w-full"
                                  />
                                  {/* <FaPhone className="absolute left-3 top-4 size-3 text-stone-500" /> */}
                                </div>
                              </FormControl>
                              <AnimatePresence>
                                {invalid && (
                                  <motion.div
                                    key={"phoneNumberError"}
                                    initial={{
                                      opacity: 0,
                                      height: 0,
                                      marginTop: 0,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      height: "auto",
                                      marginTop: "0.25rem",
                                    }}
                                    exit={{
                                      opacity: 0,
                                      height: 0,
                                      marginTop: 0,
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-1 text-sm font-medium text-red-500"
                                  >
                                    {error?.message}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={mainForm.control}
                          name="birthday"
                          render={({
                            field,
                            fieldState: { invalid, error },
                          }) => (
                            <FormItem className="relative">
                              <FormLabel
                                htmlFor="birthday"
                                className="baseFlex !justify-start gap-2 font-semibold"
                              >
                                <CiCalendarDate
                                  className={`${invalid ? "text-red-500" : "text-black"} size-[17px]`}
                                />
                                Birthday
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    id="birthday"
                                    type={"tel"}
                                    placeholder="MM/DD/YYYY"
                                    className="w-full"
                                    maxLength={10} // Ensure the input doesn't exceed the format length
                                    {...field}
                                    onChange={(e) =>
                                      handleInputChange(e, field.onChange)
                                    }
                                  />
                                </div>
                              </FormControl>
                              <AnimatePresence>
                                {invalid && (
                                  <motion.div
                                    // framer-motion has a bug where quick mounts/unmounts result in
                                    // the motion component staying mounted when it shouldn't be
                                    // removing the key entirely here seems to work minus the fact
                                    // that there aren't smooth transitions *between* the error messages
                                    // if going from "Invalid date" to "Users must be at least 13 years old to sign up." for example
                                    // key={"birthdayError"}
                                    initial={{
                                      opacity: 0,
                                      height: 0,
                                      marginTop: 0,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      height: "auto",
                                      marginTop: "0.25rem",
                                    }}
                                    exit={{
                                      opacity: 0,
                                      height: 0,
                                      marginTop: 0,
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-1 text-sm font-medium text-red-500"
                                  >
                                    {error?.message}
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
                initial={{ opacity: 0, translateX: "25%" }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: "-25%" }}
                transition={{
                  opacity: { duration: 0.1 },
                  translateX: { duration: 0.25 },
                  ease: "easeInOut",
                }}
                className="baseVertFlex mt-8 h-full min-h-48 w-full gap-2 overflow-hidden tablet:mt-12 "
              >
                <Form {...dietaryRestrictionsForm}>
                  <form
                    onSubmit={dietaryRestrictionsForm.handleSubmit(
                      onDietaryRestrictionsFormSubmit,
                    )}
                    className="baseVertFlex w-full gap-16"
                  >
                    <div className="baseVertFlex !items-start gap-2">
                      <FormField
                        control={dietaryRestrictionsForm.control}
                        name="dietaryRestrictions"
                        render={({ field, fieldState: { invalid, error } }) => (
                          <FormItem className="baseVertFlex !items-start px-2 tablet:w-[500px]">
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
                                {...field}
                                className="!mt-4 max-h-32 w-full"
                                onChange={(e) => {
                                  field.onChange(e.target.value);

                                  if (e.target.value.length === 0) {
                                    dietaryRestrictionsForm.setValue(
                                      "autoApplyDietaryRestrictions",
                                      false,
                                    );
                                  }
                                }}
                              />
                            </FormControl>

                            <AnimatePresence>
                              {invalid && (
                                <motion.div
                                  key={"birthdayError"}
                                  initial={{
                                    opacity: 0,
                                    height: 0,
                                    marginTop: 0,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    height: "auto",
                                    marginTop: "0.25rem",
                                  }}
                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="ml-1 max-w-48 text-sm font-medium text-red-500"
                                >
                                  {error?.message}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={dietaryRestrictionsForm.control}
                        name="autoApplyDietaryRestrictions"
                        render={({ field }) => (
                          <FormItem className="baseVertFlex relative ml-2 gap-2 space-y-0">
                            <div className="baseFlex gap-[1.1rem] sm:gap-3">
                              <FormControl>
                                <Checkbox
                                  disabled={
                                    dietaryRestrictionsForm.getValues(
                                      "dietaryRestrictions",
                                    ).length === 0
                                  }
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="size-4"
                                />
                              </FormControl>
                              <FormLabel className="leading-4">
                                Automatically apply these preferences to your
                                order&apos;s items.
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>

                <Separator className="mt-2 h-[1px] max-w-sm sm:mb-2 sm:mt-4" />

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant={"underline"}
                      className="baseFlex gap-2 text-xs sm:text-sm"
                    >
                      <HiOutlineInformationCircle className="size-4" />
                      How to add dietary restrictions
                    </Button>
                  </DialogTrigger>

                  <DialogContent
                    extraBottomSpacer={false}
                    className="baseVertFlex gap-8 text-sm sm:text-base"
                  >
                    <VisuallyHidden>
                      <DialogTitle>How to add dietary restrictions</DialogTitle>
                      <DialogDescription>
                        Instructions on how to add dietary restrictions to your
                        account.
                      </DialogDescription>
                    </VisuallyHidden>

                    <p className="px-4">
                      To add these restrictions when adding an item to your
                      order, toggle the switch found under the item&apos;s{" "}
                      <span className="font-medium">Special instructions</span>{" "}
                      menu.
                    </p>
                    <div className="baseFlex w-full gap-2 text-sm">
                      <Switch
                        id="allergySwitch"
                        disabled={true}
                        checked={true}
                      />
                      <Label
                        htmlFor="allergySwitch"
                        className="text-xs sm:text-sm"
                      >
                        Include your account&apos;s dietary preferences.
                      </Label>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key={"emailCommunications"}
                initial={{ opacity: 0, translateX: "25%" }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: "-25%" }}
                transition={{
                  opacity: { duration: 0.1 },
                  translateX: { duration: 0.25 },
                  ease: "easeInOut",
                }}
                className="baseVertFlex mt-4 h-full min-h-48 gap-4 overflow-hidden tablet:mt-8"
              >
                <div className="baseVertFlex w-full !items-start gap-1">
                  <p className="text-sm font-semibold">
                    Email communication preferences
                  </p>
                  <p className="text-sm text-stone-500">
                    Let us know how you&apos;d like to hear from us.
                  </p>
                </div>

                <Form {...emailCommunicationsForm}>
                  <form
                    onSubmit={emailCommunicationsForm.handleSubmit(
                      onEmailCommunicationsFormSubmit,
                    )}
                  >
                    <div className="baseVertFlex mt-2 w-full !items-start gap-4 tablet:gap-6">
                      <FormField
                        control={emailCommunicationsForm.control}
                        name="allowsEmailReceipts"
                        render={({ field }) => (
                          <FormItem className="baseVertFlex relative gap-2 space-y-0">
                            <div className="baseFlex ml-1 gap-4 sm:gap-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="size-4"
                                />
                              </FormControl>
                              <FormLabel className="leading-4">
                                Receive email receipts for your orders.
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailCommunicationsForm.control}
                        name="allowsOrderCompleteEmails"
                        render={({ field }) => (
                          <FormItem className="baseVertFlex relative gap-2 space-y-0">
                            <div className="baseFlex ml-1 gap-4 sm:gap-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="size-4"
                                />
                              </FormControl>
                              <FormLabel className="leading-4">
                                Receive an email when your order is ready to be
                                picked up.
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailCommunicationsForm.control}
                        name="allowsRewardAvailabilityReminderEmails"
                        render={({ field }) => (
                          <FormItem className="baseVertFlex relative gap-2 space-y-0">
                            <div className="baseFlex ml-1 gap-4 sm:gap-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="size-4"
                                />
                              </FormControl>
                              <FormLabel className="leading-4">
                                Receive reminders about the availability of your
                                rewards.
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailCommunicationsForm.control}
                        name="allowsPromotionalEmails"
                        render={({ field }) => (
                          <FormItem className="baseVertFlex relative gap-2 space-y-0">
                            <div className="baseFlex ml-1 gap-4 sm:gap-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="size-4"
                                />
                              </FormControl>
                              <FormLabel className="leading-4">
                                Receive promotional content and special menu
                                offers.
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key={"finish"}
                initial={{ opacity: 0, translateX: "25%" }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: "25%" }}
                transition={{
                  opacity: { duration: 0.1 },
                  translateX: { duration: 0.25 },
                  ease: "easeInOut",
                }}
                className="baseVertFlex mt-16 min-h-48 w-full !justify-start overflow-y-auto overflow-x-hidden"
              >
                <div className="baseFlex relative h-48 w-full shrink-0 overflow-hidden rounded-md bg-rewardsGradient shadow-md tablet:w-[75%]">
                  {/* <motion.div
                    key={"rewardsHeroMobileImageOne"}
                    initial={{
                      filter: "blur(5px)",
                      rotate: "90deg",
                      opacity: 0,
                      y: -125,
                      x: -125,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      rotate: "0deg",
                      opacity: 1,
                      y: 0,
                      x: 0,
                    }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.5,
                    }}
                    className="absolute -left-8 -top-8"
                  >
                    <Image
                      src={grilledSirloin}
                      alt={"TODO: replace with proper alt tag text"}
                      width={500}
                      height={500}
                      priority
                      className="!relative size-24 rounded-full object-cover drop-shadow-md tablet:drop-shadow-lg"
                    />
                  </motion.div>

                  <motion.div
                    key={"rewardsHeroMobileImageTwo"}
                    initial={{
                      filter: "blur(5px)",
                      rotate: "90deg",
                      opacity: 0,
                      y: 125,
                      x: -125,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      rotate: "0deg",
                      opacity: 1,
                      y: 0,
                      x: 0,
                    }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.75,
                    }}
                    className="absolute -bottom-8 -left-8"
                  >
                    <Image
                      src={roastPorkFriedRice}
                      alt={"TODO: replace with proper alt tag text"}
                      width={500}
                      height={500}
                      priority
                      className="!relative size-24 rounded-full object-cover drop-shadow-md tablet:drop-shadow-lg"
                    />
                  </motion.div> */}

                  <div className="baseVertFlex z-10 gap-4 rounded-md bg-offwhite px-8 py-4 text-primary shadow-lg">
                    <div className="text-center text-lg font-semibold">
                      Khue&apos;s Rewards
                    </div>

                    <div className="baseFlex gap-4 font-bold tracking-wider">
                      <SideAccentSwirls className="h-5 scale-x-[-1] fill-primary" />

                      <div className="baseVertFlex">
                        <AnimatedNumbers
                          value={initialRewardsPoints}
                          fontSize={viewportLabel.includes("mobile") ? 18 : 24}
                          padding={0}
                        />
                        <p className="font-semibold tracking-normal">points</p>
                      </div>

                      <SideAccentSwirls className="h-5 fill-primary" />
                    </div>
                  </div>

                  {/* <motion.div
                    key={"rewardsHeroMobileImageThree"}
                    initial={{
                      filter: "blur(5px)",
                      rotate: "90deg",
                      opacity: 0,
                      y: -125,
                      x: 125,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      rotate: "0deg",
                      opacity: 1,
                      y: 0,
                      x: 0,
                    }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.95,
                    }}
                    className="absolute -right-8 -top-8"
                  >
                    <Image
                      src={affogato}
                      alt={"TODO: replace with proper alt tag text"}
                      width={500}
                      height={500}
                      priority
                      className="!relative size-24 rounded-full object-cover drop-shadow-md tablet:drop-shadow-lg"
                    />
                  </motion.div>

                  <motion.div
                    key={"rewardsHeroMobileImageFour"}
                    initial={{
                      filter: "blur(5px)",
                      rotate: "90deg",
                      opacity: 0,
                      y: 125,
                      x: 125,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      rotate: "0deg",
                      opacity: 1,
                      y: 0,
                      x: 0,
                    }}
                    transition={{
                      opacity: { duration: 0.2 },
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.6,
                    }}
                    className="absolute -bottom-8 -right-8"
                  >
                    <Image
                      src={thaiTeaTresLeches}
                      alt={"TODO: replace with proper alt tag text"}
                      width={500}
                      height={500}
                      priority
                      className="!relative size-24 rounded-full object-cover drop-shadow-md tablet:drop-shadow-lg"
                    />
                  </motion.div> */}
                </div>

                <p className="mt-8 text-center font-medium">
                  Congratulations! You have successfully created your account.
                </p>

                <p className="mb-16 mt-4 max-w-72 text-sm text-neutral-500 sm:max-w-96 tablet:mb-0">
                  As a token of our appreciation, enjoy a head start of{" "}
                  {initialRewardsPoints} free rewards points. Visit your rewards
                  page in your profile to browse meals you can redeem your
                  points for.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="baseFlex w-full !justify-between border-t p-1 pt-4 tablet:mt-8 desktop:mt-8">
            <Button
              variant={"text"}
              onClick={() => setStep(step - 1)}
              className={`
                ${
                  step === 1 || saveButtonText === "Saving"
                    ? "pointer-events-none opacity-50"
                    : "text-stone-500"
                }`}
            >
              Back
            </Button>
            <Button
              disabled={saveButtonText === "Saving"}
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
                } else if (step === 3) {
                  void emailCommunicationsForm.handleSubmit(
                    onEmailCommunicationsFormSubmit,
                  )();
                } else {
                  if (!clerkUser) return;

                  setSaveButtonText("Saving");

                  const utcDate = getMidnightCSTInUTC(
                    new Date(mainFormValues!.birthday),
                  );

                  createUser({
                    userId,
                    email: clerkUser.primaryEmailAddress!.emailAddress, // guaranteed to exist
                    ...mainFormValues!,
                    ...dietaryRestrictionsValues!,
                    birthday: utcDate,
                    currentOrder: orderDetails,
                    rewardsPointsBeingRedeemed,
                    ...emailCommunicationsValues!,
                  });
                }
              }}
            >
              <AnimatePresence mode="wait">
                {renderSaveButtonText()}
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
        className="absolute inset-0 rounded-full bg-primary/40"
      />

      <motion.div
        initial={false}
        variants={{
          inactive: {
            backgroundColor: "#fffcf5", // offwhite
            borderColor: "#e5e5e5", // neutral-200
            color: "#a3a3a3", // neutral-400
          },
          active: {
            backgroundColor: "#fffcf5", // offwhite
            borderColor: "#14522d", //  bg-primary
            color: "#14522d", //  bg-primary
          },
          complete: {
            backgroundColor: "#14522d", //  bg-primary
            borderColor: "#14522d", //  bg-primary
            color: "#14522d", //  bg-primary
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
