import React, { useState } from "react";
import TopProfileNavigationLayout from "~/components/layouts/TopProfileNavigationLayout";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@clerk/nextjs";
import { FaTrashAlt } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import useGetUserId from "~/hooks/useGetUserId";
import { MdOutlineMail } from "react-icons/md";
import { Checkbox } from "~/components/ui/checkbox";
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
  FormMessage,
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
import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import isEqual from "lodash.isequal";
import { Button } from "~/components/ui/button";
import { FaUserAlt } from "react-icons/fa";
import { useRouter } from "next/router";
import { Separator } from "~/components/ui/separator";

function Preferences() {
  const userId = useGetUserId();
  const { isSignedIn } = useAuth();
  const ctx = api.useUtils();
  const { push } = useRouter();

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(userId && isSignedIn),
  });

  const { mutate: updateUser } = api.user.updatePreferences.useMutation({
    onSuccess: async () => {
      await ctx.user.invalidate();

      setTimeout(() => setSaveButtonText("Saved"), 2000);

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

  const viewportLabel = useGetViewportLabel();
  const [showChangePasswordDialog, setShowChangePasswordDialog] =
    useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);

  const [saveButtonText, setSaveButtonText] = useState("Save changes");
  const [deleteButtonText, setDeleteButtonText] = useState("Delete account");

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

    // these fields will be disabled but just to be safe
    email: z.string().email(),
    birthday: z.date(),
  });

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
    },
  });

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
      <div className="baseVertFlex relative w-full !items-start p-8 transition-all tablet:my-8 tablet:p-16 tablet:pb-0">
        {/* Personal Information */}

        <div className="baseFlex gap-4 text-lg font-semibold text-primary underline underline-offset-2">
          <FaUserAlt />
          Personal information
        </div>

        <Form {...form}>
          <form className="baseVertFlex mt-8 w-full !items-start gap-2">
            <div className="baseVertFlex w-full !items-start gap-8 tablet:!grid tablet:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field, fieldState: { invalid } }) => (
                  <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                    <div className="baseVertFlex !items-start gap-2">
                      <FormLabel className="font-semibold">
                        First name
                      </FormLabel>
                      <Input placeholder="First name" {...field} />
                    </div>
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
                control={form.control}
                name="lastName"
                render={({ field, fieldState: { invalid } }) => (
                  <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                    <div className="baseVertFlex !items-start gap-2">
                      <FormLabel className="font-semibold">Last name</FormLabel>
                      <Input placeholder="Last name" {...field} />
                    </div>
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

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field, fieldState: { invalid } }) => (
                  <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                    <div className="baseVertFlex !items-start gap-2">
                      <FormLabel className="font-semibold">
                        Phone number
                      </FormLabel>
                      <Input placeholder="(123) 456-7890" {...field} />
                    </div>
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
                control={form.control}
                name="email"
                render={({ field, fieldState: { invalid } }) => (
                  <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                    <div className="baseVertFlex relative !items-start gap-2">
                      <FormLabel className="font-semibold">Email</FormLabel>
                      <Input placeholder="Email" {...field} disabled />
                      <FaLock className="absolute bottom-3 right-2 size-3.5 text-gray-300" />
                    </div>
                    <AnimatePresence>
                      {invalid && (
                        <motion.div
                          key={"emailError"}
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
                control={form.control}
                name="birthday"
                render={({ field, fieldState: { invalid } }) => (
                  <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                    <div className="baseVertFlex relative !items-start gap-2">
                      <FormLabel className="font-semibold">Birthday</FormLabel>
                      <Input
                        {...field}
                        value={format(field.value, "PPP")}
                        disabled
                      />
                      <FaLock className="absolute bottom-3 right-2 size-3.5 text-gray-300" />
                    </div>
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

            {/* Dietary preferences */}
            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field, fieldState: { invalid } }) => (
                <FormItem className="baseVertFlex relative mt-8 !items-start gap-2 space-y-0">
                  <div className="baseVertFlex !items-start gap-2">
                    <FormLabel className="font-semibold">
                      Dietary preferences
                    </FormLabel>
                    <FormDescription>
                      Please list any allergies or dietary restrictions you may
                      have.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        maxLength={100}
                        placeholder="I am allergic to..."
                        className="max-h-32 w-full"
                        {...field}
                      />
                    </FormControl>

                    <p className="pointer-events-none absolute bottom-2 right-4 text-xs text-gray-400 tablet:bottom-1">
                      {100 - field.value.length} characters remaining
                    </p>
                  </div>
                  <AnimatePresence>
                    {invalid && (
                      <motion.div
                        key={"dietaryRestrictionsError"}
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

            <div className="baseFlex mt-8 gap-4 text-lg font-semibold text-primary underline underline-offset-2">
              <MdOutlineMail />
              Email communication
            </div>

            <div className="baseVertFlex mt-4 w-full !items-start gap-6 tablet:gap-4">
              <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                <div className="baseFlex !items-start gap-2">
                  <FormControl>
                    <Checkbox
                      id="allowsEmailReceipts"
                      {...form.register("allowsEmailReceipts")}
                    />
                  </FormControl>
                  <Label htmlFor="allowsEmailReceipts" className="leading-4">
                    Receive email receipts for your orders.
                  </Label>
                </div>
              </FormItem>

              <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                <div className="baseFlex !items-start gap-2">
                  <FormControl>
                    <Checkbox
                      id="allowsOrderCompleteEmails"
                      {...form.register("allowsOrderCompleteEmails")}
                    />
                  </FormControl>
                  <Label
                    htmlFor="allowsOrderCompleteEmails"
                    className="leading-4"
                  >
                    Receive an email when your order is ready to be picked up.
                  </Label>
                </div>
              </FormItem>

              <FormItem className="baseVertFlex relative !items-start gap-2 space-y-0">
                <div className="baseFlex !items-start gap-2">
                  <FormControl>
                    <Checkbox
                      id="allowsPromotionalEmails"
                      {...form.register("allowsPromotionalEmails")}
                    />
                  </FormControl>
                  <Label
                    htmlFor="allowsPromotionalEmails"
                    className="leading-4"
                  >
                    Receive promotional content and special menu offers.
                  </Label>
                </div>
              </FormItem>
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
                  className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-white"
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
              )}
            </motion.div>
          </AnimatePresence>
        </Button>
      )}

      {/* Account management */}
      <Accordion
        type="single"
        collapsible
        className="w-full p-8 pt-2 tablet:px-16 tablet:pb-8 tablet:pt-0"
      >
        <AccordionItem value="item-1" className="border-none">
          {/* maybe need specific variant or just some custom code here to  */}
          <AccordionTrigger className="baseFlex !justify-start gap-2 py-2 text-lg font-semibold text-primary underline underline-offset-2">
            Account management
          </AccordionTrigger>
          <AccordionContent className="baseVertFlex mt-4 gap-8 p-4 tablet:!flex-row">
            {/* if user is not signed in with oauth (aka they have a password for their account), show button to change/reset password */}

            <Button
              variant={"secondary"}
              onClick={() => {
                // TODO
              }}
            >
              Change password
              {/* TODO: looks like you need to create your own jsx for this, shouldn't be terrible
                but prob just open up an alert dialog to do this in? seems most reasonable/safe */}
            </Button>

            <Separator className="h-[1px] w-1/2 tablet:h-[25px] tablet:w-[1px]" />

            <AlertDialog open={showDeleteUserDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant={"ghost"}
                  className="baseFlex gap-2 border-destructive text-destructive"
                  onClick={() => setShowDeleteUserDialog(true)}
                >
                  <FaTrashAlt />
                  Delete account
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogDescription>
                  Are you sure you want to delete your account? This action is
                  <span className="font-semibold italic">
                    {" "}
                    irreversible
                  </span>{" "}
                  and all of your data will be lost.
                </AlertDialogDescription>

                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button
                      variant="secondary"
                      onClick={() => setShowDeleteUserDialog(false)}
                    >
                      Cancel
                    </Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
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
                              className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-white"
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
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </Button>
                  </AlertDialogAction>
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
                allowsOrderCompleteEmails: user?.allowsOrderCompleteEmails,
                allowsPromotionalEmails: user?.allowsPromotionalEmails,
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
                    className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-white"
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
                )}
              </motion.div>
            </AnimatePresence>
          </Button>
        </div>
      )}
    </motion.div>
  );
}

Preferences.PageLayout = TopProfileNavigationLayout;

export default Preferences;
