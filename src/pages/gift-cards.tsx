import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { formatPrice } from "~/utils/formatters/formatPrice";
import { Loader2 } from "lucide-react";
import { useToast } from "~/components/ui/use-toast";

import giftCardFront from "public/giftCards/giftCardFront.png";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import {
  DEFAULT_GIFT_CARD_RECIPIENT_TYPE,
  giftCardRecipientTypeEnum,
} from "~/types/giftCards";

const giftCardFormBaseSchema = z.object({
  amount: z
    .number()
    .min(500, "Minimum amount is $5")
    .max(50000, "Maximum amount is $500"),
  recipientType: giftCardRecipientTypeEnum,
  recipientEmail: z.string().email("Invalid email address").optional(),
  confirmRecipientEmail: z.string().email("Invalid email address").optional(),
  recipientName: z.string().min(1, "Recipient name is required").optional(),
  senderName: z.string().min(1, "Sender name is required").optional(),
  message: z
    .string()
    .max(255, "Message must be less than 255 characters")
    .optional(),
});

const buildGiftCardFormSchema = (options: { requireSelfEmail: boolean }) =>
  giftCardFormBaseSchema.superRefine((data, ctx) => {
    const isForSomeoneElse = data.recipientType === "someoneElse";
    const shouldValidateEmails = isForSomeoneElse || options.requireSelfEmail;

    if (isForSomeoneElse) {
      if (!data.senderName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sender name is required",
          path: ["senderName"],
        });
      }

      if (!data.recipientName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Recipient name is required",
          path: ["recipientName"],
        });
      }
    }

    if (shouldValidateEmails) {
      if (!data.recipientEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: isForSomeoneElse
            ? "Recipient email is required"
            : "Email is required",
          path: ["recipientEmail"],
        });
      }

      if (!data.confirmRecipientEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please confirm the email",
          path: ["confirmRecipientEmail"],
        });
      }

      if (
        data.recipientEmail &&
        data.confirmRecipientEmail &&
        data.recipientEmail !== data.confirmRecipientEmail
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Emails do not match",
          path: ["confirmRecipientEmail"],
        });
      }
    }
  });

type GiftCardFormValues = z.infer<typeof giftCardFormBaseSchema>;

export default function GiftCardsPage() {
  const { toast } = useToast();
  const [customAmount, setCustomAmount] = useState<string>("");
  const [checkBalanceCode, setCheckBalanceCode] = useState("");
  const [balanceResult, setBalanceResult] = useState<number | null>(null);
  const { user: clerkUser, isSignedIn } = useUser();
  const userEmailAddress = clerkUser?.primaryEmailAddress?.emailAddress ?? "";

  const [checkoutButtonText, setCheckoutButtonText] = useState(
    "Proceed to Checkout",
  );
  const [slideCheckoutArrow, setSlideCheckoutArrow] = useState(false);

  const createCheckoutSession = api.giftCard.createCheckoutSession.useMutation({
    onSuccess: async (sessionUrl) => {
      if (!sessionUrl) {
        toast({
          title: "Error",
          description: "Failed to create checkout session.",
          variant: "destructive",
        });
        setCheckoutButtonText("Proceed to Checkout");
        return;
      }

      window.location.href = sessionUrl;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const checkBalance = api.giftCard.checkBalance.useMutation({
    onSuccess: (balance) => {
      setBalanceResult(balance);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setBalanceResult(null);
    },
  });

  const formSchema = useMemo(
    () => buildGiftCardFormSchema({ requireSelfEmail: !isSignedIn }),
    [isSignedIn],
  );
  const formResolver = useMemo(() => zodResolver(formSchema), [formSchema]);

  const form = useForm<GiftCardFormValues>({
    resolver: formResolver,
    shouldUnregister: true,
    defaultValues: {
      amount: 2500,
      recipientType: DEFAULT_GIFT_CARD_RECIPIENT_TYPE,
      recipientEmail: "",
      confirmRecipientEmail: "",
      recipientName: "",
      senderName: "",
      message: "",
    },
  });

  const recipientType = form.watch("recipientType");
  const isForSelf = recipientType === "myself";
  const shouldShowRecipientDetails = !isForSelf;
  const shouldShowEmailFields = !isSignedIn;
  const watchedAmount = form.watch("amount") ?? 0;

  const onSubmit = (data: GiftCardFormValues) => {
    const fallbackEmail = userEmailAddress;
    const finalRecipientEmail =
      data.recipientEmail ?? (isForSelf ? fallbackEmail : undefined);
    const selfName =
      clerkUser?.fullName?.trim() ||
      clerkUser?.firstName?.trim() ||
      clerkUser?.username?.trim();

    if (!finalRecipientEmail) {
      toast({
        title: "Email required",
        description:
          "Please provide an email address so we know where to send the gift card.",
        variant: "destructive",
      });
      return;
    }

    createCheckoutSession.mutate({
      amount: data.amount,
      recipientType: data.recipientType,
      recipientEmail: finalRecipientEmail,
      recipientName: shouldShowRecipientDetails
        ? (data.recipientName?.trim() ?? "")
        : selfName,
      senderName: shouldShowRecipientDetails
        ? (data.senderName?.trim() ?? "")
        : selfName,
      message: shouldShowRecipientDetails ? data.message?.trim() : undefined,
      purchaserUserId:
        isSignedIn && isForSelf ? (clerkUser?.id ?? undefined) : undefined,
    });
    setCheckoutButtonText("Loading");
  };

  const handleAmountClick = (amount: number) => {
    form.setValue("amount", amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Regex: Allow empty string OR strictly digits
    if (val === "" || /^\d+$/.test(val)) {
      const numVal = parseFloat(val);

      if (numVal > 500) {
        return;
      }

      setCustomAmount(val);

      if (!isNaN(numVal)) {
        let amountToStore = numVal;

        if (amountToStore < 5) {
          amountToStore = 5;
        }

        if (amountToStore > 500) {
          amountToStore = 500;
        }

        // converting to cents
        form.setValue("amount", Math.round(amountToStore * 100));
      }
    }
  };

  const handleCheckBalance = () => {
    if (!checkBalanceCode) return;
    checkBalance.mutate({ code: checkBalanceCode });
  };

  return (
    <motion.div
      key={"gift-cards"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      // className="min-h-screen bg-stone-50 "
      className="baseVertFlex min-h-[calc(100dvh-5rem)] w-full px-4 py-12 md:px-8 lg:px-16 tablet:min-h-[calc(100dvh-6rem)]"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left Column: Preview & Check Balance */}
          <div className="flex flex-col gap-8">
            <div className="overflow-hidden rounded-xl border bg-white shadow-lg">
              <div className="baseFlex relative w-full bg-stone-900 text-offwhite">
                <Image
                  src={giftCardFront}
                  alt={"Khue's Restaurant Gift Card"}
                  sizes="1600px"
                  className="!relative !top-0 !size-full object-cover object-top"
                />

                <div className="absolute bottom-4 right-4 z-10  text-right">
                  <p className="text-4xl font-bold">
                    {formatPrice(watchedAmount)}
                  </p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-stone-600">
                  Khue&apos;s Kitchen gift cards are the perfect way to treat
                  your friends and family to a memorable dining experience.
                  Delivered instantly via email.
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-xl font-semibold text-stone-900">
                Check Gift Card Balance
              </h3>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter gift card code..."
                  value={checkBalanceCode}
                  onChange={(e) => setCheckBalanceCode(e.target.value)}
                  className="bg-transparent"
                />
                <Button
                  onClick={handleCheckBalance}
                  disabled={checkBalance.isLoading || !checkBalanceCode}
                >
                  {checkBalance.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Check"
                  )}
                </Button>
              </div>
              {balanceResult !== null && (
                <div className="mt-4 rounded-md bg-stone-100 p-4">
                  <p className="text-sm text-stone-600">Current Balance:</p>
                  <p className="text-2xl font-bold text-stone-900">
                    {formatPrice(balanceResult)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Purchase Form */}
          <div className="h-min rounded-xl border bg-white p-6 shadow-lg md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="recipientType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Who is this gift card for?</FormLabel>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { label: "For someone else", value: "someoneElse" },
                          { label: "For myself", value: "myself" },
                        ].map((option) => (
                          <Button
                            key={option.value}
                            type="button"
                            variant={
                              field.value === option.value
                                ? "default"
                                : "outline"
                            }
                            onClick={() => field.onChange(option.value)}
                            className="min-w-[150px]"
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                {/* Amount Selection */}
                <div className="space-y-4">
                  <FormLabel>Select Amount</FormLabel>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[2500, 5000, 10000, 20000].map((amt) => (
                      <Button
                        key={amt}
                        type="button"
                        variant={
                          watchedAmount === amt && !customAmount
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handleAmountClick(amt)}
                        className={`w-full ${watchedAmount !== amt || customAmount ? "bg-transparent" : ""}`}
                      >
                        {formatPrice(amt)}
                      </Button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
                      $
                    </span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Custom Amount ($5 - $500)"
                      className="bg-transparent pl-8"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                    />
                  </div>
                  <FormMessage>
                    {form.formState.errors.amount?.message}
                  </FormMessage>
                </div>

                {shouldShowRecipientDetails && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="senderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sender&apos;s Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your name"
                              {...field}
                              className="bg-transparent"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="recipientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient&apos;s Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Their name"
                              {...field}
                              className="bg-transparent"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {shouldShowEmailFields && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="recipientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {isForSelf && !isSignedIn
                              ? "Your Email"
                              : "Recipient's Email"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="friend@example.com"
                              {...field}
                              className="bg-transparent"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmRecipientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="friend@example.com"
                              {...field}
                              className="bg-transparent"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {shouldShowRecipientDetails && (
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add a personal note..."
                            className="resize-none bg-transparent"
                            maxLength={255}
                            {...field}
                          />
                        </FormControl>
                        <div className="text-right text-xs text-stone-400">
                          {field.value?.length || 0} / 255
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button
                  disabled={createCheckoutSession.isLoading}
                  type="submit"
                  className="w-full py-6"
                  onPointerEnter={() => {
                    setSlideCheckoutArrow(true);
                  }}
                  onPointerLeave={() => {
                    setSlideCheckoutArrow(false);
                  }}
                  onPointerCancel={() => {
                    setSlideCheckoutArrow(false);
                  }}
                >
                  <AnimatePresence mode={"popLayout"} initial={false}>
                    <motion.div
                      key={`cartDrawer-${checkoutButtonText}`}
                      // layout
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{
                        duration: 0.25,
                      }}
                      // static width to prevent layout shift
                      className="baseFlex !w-full gap-2"
                    >
                      {checkoutButtonText}

                      {checkoutButtonText === "Loading" ? (
                        <div
                          className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-offwhite"
                          role="status"
                          aria-label="loading"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : (
                        <FaArrowRight
                          style={{
                            transform: slideCheckoutArrow
                              ? "translateX(3px)"
                              : "translateX(0)",
                          }}
                          className="size-3 transition-all"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
