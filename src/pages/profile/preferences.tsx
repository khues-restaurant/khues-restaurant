import { useEffect, useState } from "react";
import TopProfileNavigationLayout from "~/components/layouts/TopProfileNavigationLayout";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@clerk/nextjs";
import { FaTrashAlt } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import useGetUserId from "~/hooks/useGetUserId";
import { IoIosMail } from "react-icons/io";
import { Checkbox } from "~/components/ui/checkbox";
import { MdAdminPanelSettings } from "react-icons/md";
import { api } from "~/utils/api";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { FaLock } from "react-icons/fa";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { format } from "date-fns";
import { Textarea } from "~/components/ui/textarea";
import isEqual from "lodash.isequal";
import { Button } from "~/components/ui/button";
import { FaUserAlt } from "react-icons/fa";
import { useRouter } from "next/router";
import { Separator } from "~/components/ui/separator";
import { formatPhoneNumber } from "~/utils/formatPhoneNumber";
import { clearLocalStorage } from "~/utils/clearLocalStorage";
import { useMainStore } from "~/stores/MainStore";
import Head from "next/head";
import AnimatedLotus from "~/components/ui/AnimatedLotus";
import { useToast } from "~/components/ui/use-toast";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import Link from "next/link";

function Preferences() {
  const userId = useGetUserId();
  const { isSignedIn, signOut } = useAuth();
  const ctx = api.useUtils();
  const { push } = useRouter();

  const { resetStore, viewportLabel } = useMainStore((state) => ({
    resetStore: state.resetStore,
    viewportLabel: state.viewportLabel,
  }));

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { mutate: updateUser } = api.user.updatePreferences.useMutation({
    onSuccess: async () => {
      await ctx.user.invalidate();

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

  const [showChangePasswordDialog, setShowChangePasswordDialog] =
    useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);

  const [saveButtonText, setSaveButtonText] = useState("Save changes");
  const [deleteButtonText, setDeleteButtonText] = useState("Delete account");

  const { toast } = useToast();

  const formSchema = z.object({
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

    dietaryRestrictions: z
      .string()
      .max(100, { message: "Must be at most 100 characters" }),

    allowsEmailReceipts: z.boolean(),
    allowsOrderCompleteEmails: z.boolean(),
    allowsPromotionalEmails: z.boolean(),
    allowsRewardAvailabilityReminderEmails: z.boolean(),

    // these fields will be disabled but just to be safe
    email: z.string().email(),
    birthday: z.date(),
  });

  useEffect(() => {
    setTimeout(() => {
      window.scroll({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }, 100);
  }, []);
  // should be able to remove ?. and ?? from these now since we are using getServerSideProps
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      dietaryRestrictions: user?.dietaryRestrictions ?? "",
      email: user?.email ?? "",
      birthday: user?.birthday ?? new Date(),
      allowsEmailReceipts: user?.allowsEmailReceipts ?? false,
      allowsOrderCompleteEmails: user?.allowsOrderCompleteEmails ?? false,
      allowsPromotionalEmails: user?.allowsPromotionalEmails ?? false,
      allowsRewardAvailabilityReminderEmails:
        user?.allowsRewardAvailabilityReminderEmails ?? false,
    },
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      dietaryRestrictions: user?.dietaryRestrictions ?? "",
      email: user?.email ?? "",
      birthday: user?.birthday ?? new Date(),
      allowsEmailReceipts: user?.allowsEmailReceipts ?? false,
      allowsOrderCompleteEmails: user?.allowsOrderCompleteEmails ?? false,
      allowsPromotionalEmails: user?.allowsPromotionalEmails ?? false,
      allowsRewardAvailabilityReminderEmails:
        user?.allowsRewardAvailabilityReminderEmails ?? false,
    },
  });

  // do we need a useEffect w/ mainForm.watch() to update the form values when the user changes?
  // on god it looks like we do. Weird that we either didn't notice this before or it came up randomly

  async function onFormSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    setSaveButtonText("Saving");

    updateUser({
      ...user,
      ...values,
    });
  }

  return (
    <motion.div
      key={"profile-preferences"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex relative my-8 w-full tablet:mt-0"
    >
      <Head>
        <title>Preferences | Khue&apos;s</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta property="og:title" content="Preferences | Khue's"></meta>
        <meta
          property="og:url"
          content="www.khueskitchen.com/profile/preferences"
        />
        <meta property="og:type" content="website" />
        <script
          dangerouslySetInnerHTML={{
            __html: 'history.scrollRestoration = "manual"',
          }}
        />
      </Head>

      <AnimatePresence mode="wait">
        {user === undefined ? (
          <motion.div
            key={"preferencesLoadingContent"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="baseVertFlex h-full min-h-[calc(100dvh-6rem-63px)] w-full items-center justify-center tablet:min-h-[calc(100dvh-7rem-120px)] "
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
            className="baseVertFlex w-full"
          >
            <div className="baseVertFlex relative w-full !items-start p-8 transition-all tablet:my-8 tablet:p-16 tablet:pb-0">
              {/* Personal Information */}

              <div className="baseFlex gap-4 text-lg font-semibold text-primary underline underline-offset-2">
                <FaUserAlt />
                Personal information
              </div>

              <Form {...form}>
                <form className="baseVertFlex mt-8 w-full !items-start gap-2">
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
                            <Input placeholder="First name" {...field} />
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
                                className="text-sm font-medium text-red-500"
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
                            <Input placeholder="Last name" {...field} />
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
                                className="text-sm font-medium text-red-500"
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
                                className="text-sm font-medium text-red-500"
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
                            <Input placeholder="Email" {...field} disabled />
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
                                className="text-sm font-medium text-red-500"
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
                            <Input
                              {...field}
                              value={format(field.value, "PPP")}
                              disabled
                            />
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
                                className="text-sm font-medium text-red-500"
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
                              className="min-h-32 w-full resize-none tablet:min-h-24"
                              {...field}
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
                              className="text-sm font-medium text-red-500"
                            >
                              {error?.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                          <div className="baseFlex ml-1 gap-[1.15rem]">
                            <FormControl>
                              <Checkbox
                                id="allowsEmailReceipts"
                                checked={field.value}
                                disabled={saveButtonText !== "Save changes"}
                                onCheckedChange={field.onChange}
                                className="size-4"
                              />
                            </FormControl>
                            <Label
                              htmlFor="allowsEmailReceipts"
                              className="leading-4"
                            >
                              Receive email receipts for your orders.
                            </Label>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowsOrderCompleteEmails"
                      render={({ field }) => (
                        <FormItem className="baseVertFlex relative gap-2 space-y-0">
                          <div className="baseFlex ml-1 gap-[1.15rem]">
                            <FormControl>
                              <Checkbox
                                id="allowsOrderCompleteEmails"
                                disabled={saveButtonText !== "Save changes"}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="size-4"
                              />
                            </FormControl>
                            <Label
                              htmlFor="allowsOrderCompleteEmails"
                              className="leading-4"
                            >
                              Receive an email when your order is ready to be
                              picked up.
                            </Label>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowsPromotionalEmails"
                      render={({ field }) => (
                        <FormItem className="baseVertFlex relative gap-2 space-y-0">
                          <div className="baseFlex ml-1 gap-[1.15rem]">
                            <FormControl>
                              <Checkbox
                                id="allowsPromotionalEmails"
                                disabled={saveButtonText !== "Save changes"}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="size-4"
                              />
                            </FormControl>
                            <Label
                              htmlFor="allowsPromotionalEmails"
                              className="leading-4"
                            >
                              Receive promotional content and special menu
                              offers.
                            </Label>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowsRewardAvailabilityReminderEmails"
                      render={({ field }) => (
                        <FormItem className="baseVertFlex relative gap-2 space-y-0">
                          <div className="baseFlex ml-1 gap-[1.15rem]">
                            <FormControl>
                              <Checkbox
                                id="allowsRewardAvailabilityReminderEmails"
                                disabled={saveButtonText !== "Save changes"}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="size-4"
                              />
                            </FormControl>
                            <Label
                              htmlFor="allowsRewardAvailabilityReminderEmails"
                              className="leading-4"
                            >
                              Receive reminders about the availability of your
                              rewards.
                            </Label>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </div>

            {/* Save changes button/card */}

            {!viewportLabel.includes("mobile") && (
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
                    allowsEmailReceipts: user?.allowsEmailReceipts,
                    allowsOrderCompleteEmails: user?.allowsOrderCompleteEmails,
                    allowsPromotionalEmails: user?.allowsPromotionalEmails,
                    allowsRewardAvailabilityReminderEmails:
                      user?.allowsRewardAvailabilityReminderEmails,
                  })
                }
                className="absolute right-4 top-4"
                onClick={() => {
                  void form.handleSubmit(onFormSubmit)();
                }}
              >
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
              </Button>
            )}

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
                <AccordionContent className="baseVertFlex mt-4 gap-8 p-4 tablet:!flex-row">
                  {/* if user is not signed in with oauth (aka they have a password for their account), show button to change/reset password */}

                  <Button
                    variant={"secondary"}
                    disabled={saveButtonText !== "Save changes"}
                    onClick={() => {
                      // TODO
                    }}
                  >
                    Change password
                    {/* TODO: looks like you need to create your own jsx for this, shouldn't be terrible
                but prob just open up an alert dialog to do this in? seems most reasonable/safe */}
                  </Button>

                  <Button
                    variant={"secondary"}
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

                  <Separator className="h-[1px] w-1/2 tablet:h-[25px] tablet:w-[1px]" />

                  <AlertDialog open={showDeleteUserDialog}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant={"ghost"}
                        disabled={saveButtonText !== "Save changes"}
                        className="baseFlex gap-2 border-destructive text-destructive"
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
                          *For financial and historical purposes, we will retain
                          records of your orders. However, all personal
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
                            <Link href="/privacy" className="h-6 !p-0 !px-2">
                              Privacy Policy
                            </Link>
                          </Button>
                          .
                        </p>
                      </AlertDialogDescription>

                      <AlertDialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteUserDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant={"destructive"}
                          disabled={deleteButtonText !== "Delete account"}
                          onClick={() => {
                            setDeleteButtonText("Deleting account");
                            deleteUser(userId);
                          }}
                        >
                          <AnimatePresence mode={"popLayout"}>
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

            {viewportLabel.includes("mobile") && (
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
                      allowsEmailReceipts: user?.allowsEmailReceipts,
                      allowsOrderCompleteEmails:
                        user?.allowsOrderCompleteEmails,
                      allowsPromotionalEmails: user?.allowsPromotionalEmails,
                      allowsRewardAvailabilityReminderEmails:
                        user?.allowsRewardAvailabilityReminderEmails,
                    })
                  }
                  onClick={() => {
                    void form.handleSubmit(onFormSubmit)();
                  }}
                >
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
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

Preferences.PageLayout = TopProfileNavigationLayout;

export default Preferences;
