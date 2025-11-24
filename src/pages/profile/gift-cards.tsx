import { useAuth } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/router";
import { IoCardOutline } from "react-icons/io5";
import { CiGift } from "react-icons/ci";
import { IoSettingsOutline } from "react-icons/io5";
import { TfiReceipt } from "react-icons/tfi";
import giftCardFront from "public/logos/interiorSide.png";
import AnimatedLotus from "~/components/ui/AnimatedLotus";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { useToast } from "~/components/ui/use-toast";
import useForceScrollToTopOnAsyncComponents from "~/hooks/useForceScrollToTopOnAsyncComponents";
import useGetUserId from "~/hooks/useGetUserId";
import { api } from "~/utils/api";
import { formatPrice } from "~/utils/formatters/formatPrice";

const MAX_CODE_LENGTH = 16;

function MyGiftCardsPage() {
  const { isSignedIn } = useAuth();
  const userId = useGetUserId();
  const { asPath } = useRouter();
  const { toast } = useToast();
  const ctx = api.useUtils();

  const [codeInput, setCodeInput] = useState("");
  const [redeemError, setRedeemError] = useState("");

  const { data: giftCards, isLoading } = api.giftCard.getMyCards.useQuery(
    undefined,
    {
      enabled: Boolean(isSignedIn && userId),
      staleTime: 30_000,
    },
  );

  const { mutate: attachCard, isLoading: isRedeeming } =
    api.giftCard.attachToAccount.useMutation({
      onSuccess: async (card) => {
        await ctx.giftCard.getMyCards.invalidate();
        setCodeInput("");
        setRedeemError("");
        toast({
          description: `Gift card ${formatCardCode(card.code)} added to your account.`,
        });
      },
      onError: (err) => {
        setRedeemError(err.message);
      },
    });

  useForceScrollToTopOnAsyncComponents();

  const sortedCards = useMemo(() => {
    if (!giftCards) return [];
    return [...giftCards].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }, [giftCards]);

  const isLoadingState = giftCards === undefined && isLoading;

  const handleRedeem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (codeInput.length === 0) {
      setRedeemError("Enter a gift card code.");
      return;
    }

    setRedeemError("");

    attachCard({
      code: codeInput,
    });
  };

  return (
    <motion.div
      key={"profile-gift-cards"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex relative min-h-[calc(100dvh-5rem-81px)] w-full bg-offwhite lg:bg-body tablet:min-h-[calc(100dvh-6rem-120px)]"
    >
      <div className="baseFlex sticky left-0 top-20 z-40 h-14 w-full gap-0 bg-offwhite shadow-sm tablet:hidden">
        <Button
          variant={
            asPath.includes("/profile/preferences") ? "activeLink" : "text"
          }
          asChild
        >
          <Link
            prefetch={false}
            href="/profile/preferences"
            className={`baseFlex h-14 w-full gap-2 !rounded-none text-xs
            ${asPath.includes("/profile/preferences") ? "activeUnderline" : "border-b-2 border-stone-300"}`}
          >
            <IoSettingsOutline className="size-4 shrink-0" />
            Preferences
          </Link>
        </Button>

        <Button
          variant={
            asPath.includes("/profile/gift-cards") ? "activeLink" : "text"
          }
          asChild
        >
          <Link
            prefetch={false}
            href="/profile/gift-cards"
            className={`baseFlex h-14 w-full gap-2 !rounded-none text-xs
            ${asPath.includes("/profile/gift-cards") ? "activeUnderline" : "border-b-2 border-stone-300"}`}
          >
            <CiGift className="size-4 shrink-0" />
            My gift cards
          </Link>
        </Button>

        <Button
          variant={
            asPath.includes("/profile/my-orders") ? "activeLink" : "text"
          }
          asChild
        >
          <Link
            prefetch={false}
            href="/profile/my-orders"
            className={`baseFlex h-14 w-full gap-2 !rounded-none text-xs
            ${asPath.includes("/profile/my-orders") ? "activeUnderline" : "border-b-2 border-stone-300"}`}
          >
            <TfiReceipt className="size-4 shrink-0" />
            My Orders
          </Link>
        </Button>
      </div>

      <div className="baseFlex my-12 !hidden gap-4 rounded-lg border border-stone-400 bg-offwhite p-1 tablet:!flex">
        <Button
          variant={
            asPath.includes("/profile/preferences") ? "default" : "ghost"
          }
          asChild
        >
          <Link
            prefetch={false}
            href="/profile/preferences"
            className="baseFlex w-full gap-2"
          >
            <IoSettingsOutline className="size-5" />
            Preferences
          </Link>
        </Button>

        <Separator className="h-5 w-[1px] bg-stone-400" />

        <Button
          variant={asPath.includes("/profile/gift-cards") ? "default" : "ghost"}
          asChild
        >
          <Link
            prefetch={false}
            href="/profile/gift-cards"
            className="baseFlex w-full gap-2"
          >
            <IoCardOutline className="size-5" />
            My Gift Cards
          </Link>
        </Button>

        <Separator className="h-5 w-[1px] bg-stone-400" />

        <Button
          variant={asPath.includes("/profile/my-orders") ? "default" : "ghost"}
          asChild
        >
          <Link
            prefetch={false}
            href="/profile/my-orders"
            className="baseFlex w-full gap-2"
          >
            <TfiReceipt className="size-5" />
            My Orders
          </Link>
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isLoadingState ? (
          <motion.div
            key={"giftCardsLoadingContent"}
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
            key={"giftCardsLoadedContent"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="baseVertFlex relative mb-32 mt-8 w-full bg-offwhite lg:w-[775px] tablet:mt-0 tablet:rounded-xl tablet:border tablet:shadow-md"
          >
            <div className="baseVertFlex w-full !items-start gap-8 p-6 tablet:p-12">
              <div className="baseVertFlex !items-start gap-2">
                <div className="baseFlex gap-2 text-lg font-semibold text-primary underline underline-offset-2">
                  <CiGift className="size-6" />
                  My Gift Cards
                </div>
                <p className="text-sm text-stone-600">
                  View your active balances, redeem a new code, or purchase more
                  Gift Cards.
                </p>
              </div>

              <div className="baseVertFlex w-full !items-start gap-4">
                <div className="baseFlex w-full !justify-between">
                  <p className="text-base font-semibold">Saved cards</p>
                  {sortedCards.length > 0 && (
                    <span className="text-sm text-stone-500">
                      Sorted by newest first
                    </span>
                  )}
                </div>

                {sortedCards.length === 0 ? (
                  <div className="baseVertFlex w-full gap-4 rounded-lg border border-dashed border-primary/30 bg-white/70 p-6 text-center text-sm text-stone-600">
                    <p>You don&apos;t have any gift cards attached yet.</p>
                    <p>
                      Redeem a code below to add one or purchase a new card to
                      share with friends and family.
                    </p>
                  </div>
                ) : (
                  <div className="baseVertFlex w-full !items-start gap-4">
                    {sortedCards.map((card) => (
                      <div
                        key={card.id}
                        className="baseVertFlex gap-4 rounded-lg border border-stone-200 bg-white/90 p-4 shadow-sm sm:!flex-row"
                      >
                        <div className="baseVertFlex !items-start sm:!flex-row sm:gap-4">
                          <Image
                            src={giftCardFront}
                            alt="Khue's gift card"
                            width={160}
                            height={96}
                            className="h-24 w-40 rounded-md object-cover shadow"
                          />
                          <div className="baseVertFlex mt-2 !items-start">
                            <p className="font-mono text-lg tracking-[0.1em]">
                              {formatCardCode(card.code)}
                            </p>
                            <p className="text-xs text-stone-500">
                              Added {format(card.createdAt, "PPP")}
                            </p>
                            {card.lastUsedAt && (
                              <p className="text-xs text-stone-500">
                                Last used {format(card.lastUsedAt, "PPP")}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="baseVertFlex !items-start gap-0 !self-start text-right sm:!items-end sm:!self-end">
                          <p className="text-xs uppercase text-stone-500">
                            Balance
                          </p>
                          <p className="text-lg font-semibold">
                            {formatPrice(card.balance)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="baseVertFlex w-full !items-start gap-3 rounded-lg border border-stone-200 bg-white/90 p-6">
                <p className="text-base font-semibold">Redeem a Gift Card</p>
                <p className="text-sm text-stone-600">
                  Enter the 16-digit code from the back of your card. Redeemed
                  cards are instantly added to your account.
                </p>
                <form
                  onSubmit={handleRedeem}
                  className="flex w-full flex-col gap-3 sm:flex-row"
                >
                  <Input
                    value={codeInput}
                    onChange={(e) => {
                      setRedeemError("");
                      const val = e.target.value;
                      if (val.length > 16) return;

                      // only allow numbers to be entered
                      if (val === "" || /^\d+$/.test(val)) {
                        setCodeInput(val);
                      }
                    }}
                    placeholder="Enter gift card code..."
                    className="bg-transparent"
                  />

                  <Button
                    type="submit"
                    disabled={isRedeeming || codeInput.length === 0}
                    className="sm:w-40"
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div
                        key={isRedeeming ? "redeeming" : "redeem"}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="baseFlex gap-2"
                      >
                        {isRedeeming ? (
                          <div
                            className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent"
                            role="status"
                            aria-label="loading"
                          >
                            <span className="sr-only">Loading...</span>
                          </div>
                        ) : (
                          "Redeem"
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </Button>
                </form>
                {redeemError && (
                  <p className="text-sm text-red-500">{redeemError}</p>
                )}
              </div>

              <div className="baseFlex w-full !justify-center">
                <Button
                  asChild
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  <Link prefetch={false} href="/gift-cards">
                    Buy a new Gift Card
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function formatCardCode(code: string) {
  return (
    code
      .replace(/[^A-Z0-9]/gi, "")
      .match(/.{1,4}/g)
      ?.join(" ") ?? code
  );
}

export default MyGiftCardsPage;
