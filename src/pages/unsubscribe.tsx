import { PrismaClient } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { type GetServerSideProps } from "next";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

function Unsubscribe({ email }: { email?: string }) {
  const ctx = api.useUtils();

  const { mutate: unsubscribeUser } = api.blacklistedEmail.create.useMutation({
    onSuccess: async () => {
      await ctx.user.invalidate();

      setTimeout(() => setUnsubscribeButtonText("Unsubscribed"), 2000);
    },
    onError: (error) => {
      console.log(error);
      // TODO show error toast
    },
  });

  const [unsubscribeButtonText, setUnsubscribeButtonText] =
    useState("Unsubscribe");

  return (
    <motion.div
      key={"unsubscribe"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="baseVertFlex mt-24 min-h-[calc(100dvh-6rem)] w-full tablet:mt-28 tablet:min-h-[calc(100dvh-7rem)]"
    >
      <div className="baseVertFlex mb-24 max-w-80 gap-6 rounded-md border bg-offwhite p-4 tablet:max-w-3xl tablet:gap-8 tablet:p-8">
        <p className="text-center text-xl font-semibold">
          Unsubscribe from all emails
        </p>

        {email ? (
          <div className="baseVertFlex !items-start gap-2">
            <p className="mt-8 text-center text-lg font-semibold text-stone-400">
              If you wish to no longer receive email communications from us, and
              your email is correctly listed below, please click the unsubscribe
              button below.
            </p>

            <p className="text-center">
              Email address: <span className="font-medium">{email}</span>
            </p>

            <Button
              disabled={unsubscribeButtonText !== "Unsubscribe"}
              className="absolute right-4 top-4"
              onClick={() => {
                setUnsubscribeButtonText("Unsubscribing");
                unsubscribeUser({ emailAddress: email });
              }}
            >
              <AnimatePresence mode={"popLayout"} initial={false}>
                <motion.div
                  key={unsubscribeButtonText}
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
                  {unsubscribeButtonText}
                  {unsubscribeButtonText === "Unsubscribing" && (
                    <div
                      className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-offwhite"
                      role="status"
                      aria-label="loading"
                    >
                      <span className="sr-only">Loading...</span>
                    </div>
                  )}
                  {unsubscribeButtonText === "Unsubscribed" && (
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
        ) : (
          <div className="baseVertFlex gap-4">
            <p className="mt-4 max-w-72 text-center font-medium sm:max-w-max">
              We were unable to authenticate your request for unsubscribing from
              our email list.
            </p>

            <p className="mt-4 underline underline-offset-2">
              Troubleshooting tips:
            </p>
            <ul className="baseVertFlex mt-2 max-w-96 pl-4 text-start text-sm">
              <li className="my-1 list-disc">
                Please ensure your URL doesn&apos;t have any typos and matches
                the unsubscription link provided in your last email from us.
              </li>
              <li className="my-1 list-disc">
                Make sure the unsubscription link you clicked hasn&apos;t
                expired. Links are only valid for 3 months.
              </li>
              <li className="my-1 list-disc">
                If you are still having trouble, please feel free to reach out
                to us at{" "}
                <Button variant="link" asChild>
                  <a href="mailto:example@example.com" className="h-5 !p-0">
                    example@example.com
                  </a>
                </Button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Unsubscribe;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.query.token) {
    return {
      props: {
        email: undefined,
      },
    };
  }

  const prisma = new PrismaClient();

  const email = await prisma.emailUnsubscriptionToken.findUnique({
    where: {
      id: ctx.query.token as string,
    },
  });

  return {
    props: {
      email: email?.emailAddress,
    },
  };
};
