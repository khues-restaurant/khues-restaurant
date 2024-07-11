import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import isEqual from "lodash.isequal";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CiGift } from "react-icons/ci";
import { FaLock, FaTrashAlt, FaUserAlt } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { MdAdminPanelSettings } from "react-icons/md";
import { TfiReceipt } from "react-icons/tfi";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import AnimatedLotus from "~/components/ui/AnimatedLotus";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/components/ui/use-toast";
import useForceScrollToTopOnAsyncComponents from "~/hooks/useForceScrollToTopOnAsyncComponents";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { clearLocalStorage } from "~/utils/clearLocalStorage";
import { formatPhoneNumber } from "~/utils/formatters/formatPhoneNumber";

const formSchema = z.object({
  firstName: z
    .string({
      required_error: "First name cannot be empty",
    })
    .min(1, { message: "Must be at least 1 character" })
    .max(30, { message: "Must be at most 30 characters" })
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
    .min(1, { message: "Must be at least 1 character" })
    .max(30, { message: "Must be at most 30 characters" })
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

  dietaryRestrictions: z
    .string()
    .max(100, { message: "Must be at most 100 characters" })
    .refine((value) => /^[A-Za-z0-9\s\-';.,!?:"(){}\[\]/\\_@]*$/.test(value), {
      message: "Invalid characters were found",
    })
    .refine((value) => !/[^\u0000-\u007F]/.test(value), {
      message: "No non-ASCII characters are allowed",
    })
    .transform((value) => value.trim()) // Remove leading and trailing whitespace
    .transform((value) => value.replace(/\s+/g, " ")), // Remove consecutive spaces,,
  autoApplyDietaryRestrictions: z.boolean(),

  allowsEmailReceipts: z.boolean(),
  allowsOrderCompleteEmails: z.boolean(),
  allowsPromotionalEmails: z.boolean(),
  allowsRewardAvailabilityReminderEmails: z.boolean(),

  // these fields will be disabled but just to be safe
  email: z.string().email(),
  birthday: z.date(),
});

function Preferences() {
  const userId = useGetUserId();
  const { isSignedIn, signOut } = useAuth();
  const { openUserProfile } = useClerk();
  const { user: clerkUser } = useUser();
  const ctx = api.useUtils();
  const { asPath, push } = useRouter();

  const { orderDetails, resetStore } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    resetStore: state.resetStore,
  }));

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { mutate: updateUser } = api.user.updatePreferences.useMutation({
    onSuccess: async () => {
      await ctx.user.get.invalidate();

      setTimeout(() => {
        setSaveButtonText("Saved");

        toast({
          description: "Your preferences have been updated.",
        });
      }, 2000);

      setTimeout(() => {
        setSaveButtonText("Save changes");
      }, 4000);
    },
    onError: (error) => {
      console.log(error);
      // TODO show error toast
    },
  });

  const { mutate: deleteUser } = api.user.delete.useMutation({
    onSuccess: async () => {
      await ctx.user.invalidate();

      setTimeout(() => setDeleteButtonText("Account deleted"), 2000);

      setTimeout(() => {
        void push("/");
      }, 4000);
    },
    onError: (error) => {
      console.log(error);
      // TODO show error toast
    },
  });

  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);

  const [saveButtonText, setSaveButtonText] = useState("Save changes");
  const [deleteButtonText, setDeleteButtonText] = useState("Delete account");

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      dietaryRestrictions: user?.dietaryRestrictions ?? "",
      autoApplyDietaryRestrictions: user?.autoApplyDietaryRestrictions ?? false,
      email: user?.email ?? "",
      birthday: user?.birthday ?? new Date(),
      allowsEmailReceipts: user?.allowsEmailReceipts ?? false,
      allowsOrderCompleteEmails: user?.allowsOrderCompleteEmails ?? false,
      allowsPromotionalEmails: user?.allowsPromotionalEmails ?? false,
      allowsRewardAvailabilityReminderEmails:
        user?.allowsRewardAvailabilityReminderEmails ?? false,
    },
  });

  const { updateOrder } = useUpdateOrder();

  console.log(user?.autoApplyDietaryRestrictions);

  async function onFormSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    setSaveButtonText("Saving");

    console.log(
      "current value:",
      user.autoApplyDietaryRestrictions,
      "new value:",
      values.autoApplyDietaryRestrictions,
    );

    if (
      values.autoApplyDietaryRestrictions !== user.autoApplyDietaryRestrictions
    ) {
      const newOrderDetails = structuredClone(orderDetails);
      newOrderDetails.items.forEach((item) => {
        item.includeDietaryRestrictions = values.autoApplyDietaryRestrictions;
      });

      updateOrder({
        newOrderDetails,
      });
    }

    updateUser({
      userId: user.userId,
      ...values,
    });
  }

  useForceScrollToTopOnAsyncComponents();

  return (
    <motion.div
      key={"profile-preferences"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex baseVertFlex relative h-full min-h-[calc(100dvh-6rem-81px)]
      w-full !justify-start bg-offwhite lg:bg-body tablet:min-h-[calc(100dvh-7rem-120px)]
      "
    >
      <div className="baseFlex my-12 !hidden gap-4 rounded-lg border border-stone-400 bg-offwhite p-1 tablet:!flex">
        <Button
          variant={
            asPath.includes("/profile/preferences") ? "default" : "ghost"
          }
          asChild
        >
          <Link href="/profile/preferences" className="baseFlex w-full gap-2">
            <IoSettingsOutline className="size-5" />
            Preferences
          </Link>
        </Button>

        <Separator className="h-5 w-[1px] bg-stone-400" />

        <Button
          variant={asPath.includes("/profile/rewards") ? "default" : "ghost"}
          asChild
        >
          <Link href="/profile/rewards" className="baseFlex w-full gap-2">
            <CiGift className="size-6" />
            Rewards
          </Link>
        </Button>

        <Separator className="h-5 w-[1px] bg-stone-400" />

        <Button
          variant={asPath.includes("/profile/my-orders") ? "default" : "ghost"}
          asChild
        >
          <Link href="/profile/my-orders" className="baseFlex w-full gap-2">
            <TfiReceipt className="size-5" />
            My orders
          </Link>
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {user === undefined ? (
          <motion.div
            key={"preferencesLoadingContent"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="baseVertFlex h-full min-h-[calc(100dvh-6rem-81px)] w-full items-center justify-center tablet:min-h-[calc(100dvh-7rem-120px)]"
          >
            <AnimatedLotus className="size-16 fill-primary tablet:size-24" />
          </motion.div>
        ) : (
          <motion.div
            key={"preferencesLoadedContent"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="baseVertFlex relative mb-32 mt-8 size-full bg-offwhite lg:w-[775px] tablet:mt-0 tablet:rounded-xl tablet:border tablet:shadow-md"
          >
            <div className="baseVertFlex relative w-full !items-start p-8 transition-all tablet:mb-8 tablet:p-16 tablet:pb-0">
              {/* Personal Information */}

              <div className="baseFlex gap-4 text-lg font-semibold text-primary underline underline-offset-2">
                <FaUserAlt />
                Personal information
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onFormSubmit)}
                  className="baseVertFlex mt-8 w-full !items-start gap-2"
                >
                  <div className="baseVertFlex w-full !items-start gap-8 tablet:!grid tablet:grid-cols-2 tablet:gap-x-16">
                    <FormField
                      control={form.control}
                      name="firstName"
                      disabled={saveButtonText !== "Save changes"}
                      render={({ field, fieldState: { invalid, error } }) => (
                        <FormItem className="baseVertFlex relative w-full !items-start space-y-0">
                          <div className="baseVertFlex relative w-full max-w-80 !items-start gap-2 tablet:max-w-96">
                            <FormLabel className="font-semibold">
                              First name
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                          </div>
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
                                  marginTop: "0.5rem",
                                }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
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
                      control={form.control}
                      name="lastName"
                      disabled={saveButtonText !== "Save changes"}
                      render={({ field, fieldState: { invalid, error } }) => (
                        <FormItem className="baseVertFlex relative w-full !items-start space-y-0">
                          <div className="baseVertFlex relative w-full max-w-80 !items-start gap-2 tablet:max-w-96">
                            <FormLabel className="font-semibold">
                              Last name
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                          </div>
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
                                  marginTop: "0.5rem",
                                }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
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
                      control={form.control}
                      name="phoneNumber"
                      disabled={saveButtonText !== "Save changes"}
                      render={({
                        field: { onChange, onBlur, value, ref },
                        fieldState: { invalid, error },
                      }) => (
                        <FormItem className="baseVertFlex relative w-full !items-start space-y-0">
                          <div className="baseVertFlex relative w-full max-w-80 !items-start gap-2 tablet:max-w-96">
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
                                placeholder="(123) 456-7890"
                                type={"tel"}
                              />
                            </FormControl>
                          </div>
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
                                  marginTop: "0.5rem",
                                }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
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
                      control={form.control}
                      name="email"
                      render={({ field, fieldState: { invalid, error } }) => (
                        <FormItem className="baseVertFlex relative w-full !items-start gap-2 space-y-0">
                          <div className="baseVertFlex relative w-full max-w-80 !items-start gap-2 tablet:max-w-96">
                            <FormLabel className="font-semibold">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Email" {...field} disabled />
                            </FormControl>
                            <FaLock className="absolute bottom-3 right-2 size-3.5 text-stone-300" />
                          </div>
                          <AnimatePresence>
                            {invalid && (
                              <motion.div
                                key={"emailError"}
                                initial={{
                                  opacity: 0,
                                  height: 0,
                                  marginTop: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                  height: "auto",
                                  marginTop: "0.5rem",
                                }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
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
                      control={form.control}
                      name="birthday"
                      render={({ field, fieldState: { invalid, error } }) => (
                        <FormItem className="baseVertFlex relative w-full !items-start gap-2 space-y-0">
                          <div className="baseVertFlex relative w-full max-w-80 !items-start gap-2 tablet:max-w-96">
                            <FormLabel className="font-semibold">
                              Birthday
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={format(field.value, "PPP")}
                                disabled
                              />
                            </FormControl>

                            <FaLock className="absolute bottom-3 right-2 size-3.5 text-stone-300" />
                          </div>
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
                                  marginTop: "0.5rem",
                                }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
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

                  {/* Dietary preferences */}
                  <FormField
                    control={form.control}
                    name="dietaryRestrictions"
                    disabled={saveButtonText !== "Save changes"}
                    render={({ field, fieldState: { invalid, error } }) => (
                      <FormItem className="baseVertFlex relative mt-8 w-full max-w-lg !items-start space-y-0">
                        <div className="baseVertFlex w-full !items-start gap-2">
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
                              className="min-h-32 w-full resize-none tablet:min-h-24"
                              onChange={(e) => {
                                field.onChange(e.target.value);

                                // checkbox field below didn't automatically re-enable itself if
                                // this went from 0 to 1 characters, so we manually trigger it
                                void form.trigger("dietaryRestrictions");

                                if (e.target.value.length === 0) {
                                  form.setValue(
                                    "autoApplyDietaryRestrictions",
                                    false,
                                  );
                                }
                              }}
                            />
                          </FormControl>

                          <p className="pointer-events-none absolute bottom-2 right-4 text-xs text-stone-400 tablet:bottom-1">
                            {100 - field.value.length} characters remaining
                          </p>
                        </div>
                        <AnimatePresence>
                          {invalid && (
                            <motion.div
                              key={"dietaryRestrictionsError"}
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{
                                opacity: 1,
                                height: "auto",
                                marginTop: "0.5rem",
                              }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
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
                    control={form.control}
                    name="autoApplyDietaryRestrictions"
                    render={({ field }) => (
                      <FormItem className="baseVertFlex relative ml-1 gap-2 space-y-0">
                        <div className="baseFlex gap-[1.1rem] sm:gap-3">
                          <FormControl>
                            <Checkbox
                              disabled={
                                (form.getValues("dietaryRestrictions")
                                  ?.length ?? 0) === 0
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

                  <div className="baseFlex mt-20 gap-3.5 text-lg font-semibold text-primary underline underline-offset-2 tablet:mt-16">
                    <IoIosMail className="size-[24px]" />
                    Email communication
                  </div>

                  <div className="baseVertFlex mt-4 w-full !items-start gap-6 tablet:gap-4">
                    <FormField
                      control={form.control}
                      name="allowsEmailReceipts"
                      render={({ field }) => (
                        <FormItem className="baseVertFlex relative gap-2 space-y-0">
                          <div className="baseFlex ml-1 gap-4 sm:gap-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                disabled={saveButtonText !== "Save changes"}
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
                      control={form.control}
                      name="allowsOrderCompleteEmails"
                      render={({ field }) => (
                        <FormItem className="baseVertFlex relative gap-2 space-y-0">
                          <div className="baseFlex ml-1 gap-4 sm:gap-3">
                            <FormControl>
                              <Checkbox
                                disabled={saveButtonText !== "Save changes"}
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
                      control={form.control}
                      name="allowsPromotionalEmails"
                      render={({ field }) => (
                        <FormItem className="baseVertFlex relative gap-2 space-y-0">
                          <div className="baseFlex ml-1 gap-4 sm:gap-3">
                            <FormControl>
                              <Checkbox
                                disabled={saveButtonText !== "Save changes"}
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

                    <FormField
                      control={form.control}
                      name="allowsRewardAvailabilityReminderEmails"
                      render={({ field }) => (
                        <FormItem className="baseVertFlex relative gap-2 space-y-0">
                          <div className="baseFlex ml-1 gap-4 sm:gap-3">
                            <FormControl>
                              <Checkbox
                                disabled={saveButtonText !== "Save changes"}
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
                  </div>
                </form>
              </Form>
            </div>

            {/* Account management */}
            <Accordion
              type="single"
              collapsible
              className="w-full p-8 pt-12 tablet:px-16 tablet:pb-8 tablet:pt-8"
            >
              <AccordionItem value="item-1" className="border-none">
                {/* maybe need specific variant or just some custom code here to  */}
                <AccordionTrigger className="baseFlex !justify-start gap-2 py-2 text-lg font-semibold text-primary underline underline-offset-2">
                  <div className="baseFlex gap-2">
                    <MdAdminPanelSettings className="size-6" />
                    Account management
                  </div>
                </AccordionTrigger>
                <AccordionContent className="baseVertFlex mt-4 gap-6 p-4 tablet:!flex-row tablet:gap-8">
                  {clerkUser?.passwordEnabled && (
                    <>
                      <Button
                        variant={"link"}
                        disabled={saveButtonText !== "Save changes"}
                        onClick={() => openUserProfile()}
                      >
                        Change password
                      </Button>
                      <Separator className="h-[1px] w-1/4 tablet:h-[25px] tablet:w-[1px]" />
                    </>
                  )}

                  <Button
                    variant={"link"}
                    disabled={saveButtonText !== "Save changes"}
                    // className="mt-2 h-8"
                    onClick={async () => {
                      await signOut(async () => {
                        clearLocalStorage();
                        resetStore();
                        await push("/");
                      });
                    }}
                  >
                    Log out
                  </Button>

                  <Separator className="h-[1px] w-1/4 tablet:h-[25px] tablet:w-[1px]" />

                  <AlertDialog open={showDeleteUserDialog}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant={"link"}
                        disabled={saveButtonText !== "Save changes"}
                        className="baseFlex gap-2 !text-destructive hover:!text-destructive"
                        onClick={() => setShowDeleteUserDialog(true)}
                      >
                        <FaTrashAlt />
                        Delete account
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogTitle className="font-semibold">
                        Delete account
                      </AlertDialogTitle>

                      <AlertDialogDescription className="baseVertFlex mb-8 gap-4">
                        <p>
                          Are you sure you want to delete your account? This
                          action is
                          <span className="font-semibold italic">
                            {" "}
                            irreversible
                          </span>{" "}
                          and all of your data will be lost.*
                        </p>

                        <p className="italic">
                          * For financial and historical purposes, we will
                          retain records of your orders. However, all personal
                          information will be anonymized to protect your
                          privacy. Anonymization means that any data that could
                          identify you will be removed or altered so that you
                          cannot be identified.
                        </p>

                        <p>
                          If you would like to read more about what will happen
                          to your account data upon account deletion, please
                          refer to our
                          <Button variant={"link"} asChild>
                            <Link
                              href="/privacy"
                              target="_blank"
                              rel="noreferrer"
                              className="h-6 !p-0 !px-2"
                            >
                              Privacy Policy
                            </Link>
                          </Button>
                          .
                        </p>
                      </AlertDialogDescription>

                      <AlertDialogFooter className="baseFlex w-full !flex-row gap-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowDeleteUserDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant={"destructive"}
                          disabled={deleteButtonText !== "Delete account"}
                          className="w-full"
                          onClick={() => {
                            setDeleteButtonText("Deleting account");
                            deleteUser(userId);
                          }}
                        >
                          <AnimatePresence mode={"popLayout"} initial={false}>
                            <motion.div
                              key={deleteButtonText}
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
                              <FaTrashAlt />

                              {deleteButtonText}

                              {deleteButtonText === "Deleting account" && (
                                <div
                                  className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-offwhite"
                                  role="status"
                                  aria-label="loading"
                                >
                                  <span className="sr-only">Loading...</span>
                                </div>
                              )}
                              {deleteButtonText === "Account deleted" && (
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
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="baseFlex w-11/12 border-t py-8">
              <Button
                disabled={
                  saveButtonText !== "Save changes" ||
                  isEqual(form.getValues(), {
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    phoneNumber: user?.phoneNumber,
                    email: user?.email,
                    birthday: user?.birthday,
                    dietaryRestrictions: user?.dietaryRestrictions,
                    autoApplyDietaryRestrictions:
                      user?.autoApplyDietaryRestrictions,
                    allowsEmailReceipts: user?.allowsEmailReceipts,
                    allowsOrderCompleteEmails: user?.allowsOrderCompleteEmails,
                    allowsPromotionalEmails: user?.allowsPromotionalEmails,
                    allowsRewardAvailabilityReminderEmails:
                      user?.allowsRewardAvailabilityReminderEmails,
                  })
                }
                onClick={() => {
                  void form.handleSubmit(onFormSubmit)();
                }}
              >
                <AnimatePresence mode={"popLayout"} initial={false}>
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
                    className="baseFlex w-[122.75px] gap-2"
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
                        className="size-5 text-offwhite"
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
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="baseFlex sticky bottom-0 left-0 z-40 h-20 w-full gap-0 border-t border-stone-400 bg-offwhite tablet:hidden">
        <Button
          variant={
            asPath.includes("/profile/preferences") ? "default" : "secondary"
          }
          asChild
        >
          <Link
            href="/profile/preferences"
            className="baseVertFlex h-20 w-full gap-2 !rounded-none text-xs"
          >
            <IoSettingsOutline className="size-5" />
            Preferences
          </Link>
        </Button>

        <Separator className="h-20 w-[1px] bg-stone-400" />

        <Button
          variant={
            asPath.includes("/profile/rewards") ? "default" : "secondary"
          }
          asChild
        >
          <Link
            href="/profile/rewards"
            className="baseVertFlex h-20 w-full gap-2 !rounded-none text-xs"
          >
            <CiGift className="size-6" />
            <span className="pb-0.5">Rewards</span>
          </Link>
        </Button>

        <Separator className="h-20 w-[1px] bg-stone-400" />

        <Button
          variant={
            asPath.includes("/profile/my-orders") ? "default" : "secondary"
          }
          asChild
        >
          <Link
            href="/profile/my-orders"
            className="baseVertFlex h-20 w-full gap-2 !rounded-none text-xs"
          >
            <TfiReceipt className="size-5" />
            My orders
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

export default Preferences;
