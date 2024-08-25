import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF } from "react-icons/fa6";
import { IoLogoInstagram } from "react-icons/io";
import { LuExternalLink } from "react-icons/lu";
import { MdOutlineMail } from "react-icons/md";
import StaticLotus from "~/components/ui/StaticLotus";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import buildingFireImage from "/public/exterior/buildingFire.jpg";
import eric from "/public/ourStory/eric.webp";
import bringMeTheNewsLogo from "/public/media/bringMeTheNewsLogo.jpg";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/utils/api";

const formSchema = z.object({
  email: z.string().email(),
});

function TempHomepage() {
  const { mutate: addUserToMailingList } =
    api.temporaryCustomerEmailSignUp.create.useMutation({
      onSuccess: async () => {
        setTimeout(() => {
          setSignUpButtonText("Thank you!");
        }, 2000);

        setTimeout(() => {
          setSignUpButtonText("Sign up");
          form.reset();
        }, 4000);
      },
      onError: (error) => {
        if (error.message === "Email already in use") {
          setTimeout(() => {
            setSignUpButtonText("Sign up");

            form.setError("email", {
              type: "manual",
              message: "Email has already been signed up",
            });
          }, 2000);
        }
      },
    });

  const [signUpButtonText, setSignUpButtonText] = useState("Sign up");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      email: "",
    },
  });

  async function onFormSubmit(values: z.infer<typeof formSchema>) {
    setSignUpButtonText("Signing up");
    addUserToMailingList({
      emailAddress: values.email,
    });
  }

  return (
    <motion.div
      key={"main"}
      initial={{ opacity: 0.01 }} // trying to get around lighthouse opacity content detection issue
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex min-h-[100dvh] w-full"
    >
      <div className="baseVertFlex m-8 !justify-start rounded-lg border shadow-md md:max-w-3xl">
        {/* image */}
        <div className="relative h-96 w-full">
          <Image
            src={buildingFireImage}
            alt="Khue's Kitchen building on fire"
            priority
            fill
            className="!relative !h-96 !w-full rounded-t-lg border-b border-stone-300 object-cover"
          />
        </div>

        <div className="baseVertFlex !justify-start rounded-b-lg bg-offwhite sm:!flex-row sm:!items-start">
          {/* main text content */}
          <div className="baseVertFlex relative !items-start !justify-start gap-4 bg-offwhite p-4 sm:max-h-[480px] sm:overflow-y-auto">
            <h1 className="text-xl font-bold tracking-tight tablet:text-2xl">
              Help Rebuild Khue&apos;s Kitchen After Devastating Fire
            </h1>
            <p className="">
              Khue&apos;s Kitchen, a new restaurant in St. Paul, was set to open
              its doors on August 27th, after months of dedicated preparation by
              owner Eric Pham and his team. Tragically, on the night of August
              11th, an electrical fire tore through the dining room and upper
              floors, causing severe damage and leaving the space unsalvageable.
            </p>

            <p>
              The team is grateful to the St. Paul Fire Department for their
              courageous efforts to contain the fire and ensure everyone&apos;s
              safety. Now, Eric and his team are asking for your support to help
              rebuild what was lost. Donations will go toward replacing
              essential tools and equipment, and helping Khue&apos;s Kitchen
              recover from this devastating setback.
            </p>

            <div className="baseVertFlex w-full !items-start gap-4 sm:!flex-row sm:!items-center sm:!justify-between">
              <Button variant={"outline"} size={"lg"} asChild>
                <Link
                  href="https://bringmethenews.com/minnesota-lifestyle/heartbreaking-fire-destroys-khues-kitchen-days-before-opening-but-chef-eric-pham-is-moving-forward"
                  className="baseFlex !shrink-0 gap-2 tracking-tight"
                >
                  <Image
                    src={bringMeTheNewsLogo}
                    alt="Bring Me The News logo"
                    priority
                    fill
                    unoptimized
                    className="!relative !h-8 !w-8"
                  />
                  Read the full story
                  <LuExternalLink className="mb-[1px]" />
                </Link>
              </Button>

              <Button size={"lg"} asChild>
                <Link
                  href="https://www.gofundme.com/f/help-rebuild-khues-kitchen-after-devastating-fire"
                  className="baseFlex !shrink-0 gap-2 tracking-tight"
                >
                  Visit our GoFundMe
                  <LuExternalLink className="mb-[1px]" />
                </Link>
              </Button>
            </div>
          </div>

          <Separator className="my-4 h-[1px] w-full bg-stone-300 sm:my-0 sm:h-[480px] sm:w-[1px]" />

          {/* side bar/bottom area */}
          <div className="baseVertFlex relative h-[500px] w-full !justify-start gap-2 rounded-b-lg rounded-br-lg bg-offwhite p-4 sm:h-[480px] sm:rounded-bl-none">
            <div className="absolute left-0 top-0 size-full overflow-hidden">
              <StaticLotus className="absolute bottom-[-31px] right-[-31px] size-24 rotate-[-45deg] fill-primary/50" />
            </div>

            <div className="baseVertFlex !items-start gap-2">
              <div className="relative h-[300px] w-[250px] rounded-lg sm:h-[250px] sm:w-[200px]">
                {/* image of eric */}
                <Image
                  src={eric}
                  alt="Chef Eric Pham, owner of Khue's Kitchen, standing with arms crossed and smiling in front of a rustic door."
                  priority
                  fill
                  className="!h-[300px] !w-[250px] rounded-lg border object-cover object-top sm:!h-[250px] sm:!w-[200px]"
                />
              </div>

              <p className="font-semibold tracking-tight sm:text-sm">
                Chef Eric Pham
              </p>

              <div className="baseVertFlex w-full !items-start gap-1">
                <div className="baseFlex gap-2">
                  <MdOutlineMail className="size-[18px]" />
                  <Button variant="link" className="h-8 px-1" asChild>
                    <a href="mailto:khueskitchen@gmail.com">
                      khueskitchen@gmail.com
                    </a>
                  </Button>
                </div>

                {/* socials */}
                <div className="baseFlex gap-2">
                  <IoLogoInstagram className="ml-[-1px] size-5" />
                  <Button variant="link" className="h-8 px-1" asChild>
                    <a
                      aria-label="Visit our Instagram page"
                      href="https://www.instagram.com/khueskitchen"
                      className="baseFlex gap-2"
                    >
                      Visit our Instagram
                      <LuExternalLink className="mb-[1px]" />
                    </a>
                  </Button>
                </div>

                <div className="baseFlex gap-2">
                  <FaFacebookF className="ml-[-1px] size-[18px]" />
                  <Button variant="link" className="ml-[2px] h-8 px-1" asChild>
                    <a
                      aria-label="Visit our Facebook page"
                      href="https://www.facebook.com/khueskitchen/"
                      className="baseFlex gap-2"
                    >
                      Visit our Facebook
                      <LuExternalLink className="mb-[1px]" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="baseVertFlex relative m-8 mt-0 !justify-start overflow-hidden rounded-lg border bg-offwhite p-4 shadow-md md:max-w-3xl">
        <StaticLotus className="absolute bottom-[-31px] right-[-31px] size-24 rotate-[-45deg] fill-primary/50" />

        <div className="baseVertFlex !items-start gap-4">
          <p className="text-lg font-semibold">
            Stay Connected with Khue&apos;s Kitchen
          </p>

          <p className="text-sm sm:text-base">
            Sign up for our email list and be among the first to receive updates
            on the restoration of Khue&apos;s Kitchen, upcoming events, and
            more. We appreciate your continued support!
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onFormSubmit)}
              className="baseVertFlex my-4 !items-start gap-4 tablet:!flex-row"
            >
              <div className="baseVertFlex w-full !items-start gap-8">
                <FormField
                  control={form.control}
                  name="email"
                  disabled={signUpButtonText !== "Sign up"}
                  render={({ field, fieldState: { invalid, error } }) => (
                    <FormItem className="baseVertFlex relative w-full !items-start space-y-0">
                      <div className="baseVertFlex relative w-full min-w-64 max-w-80 !items-start gap-2 tablet:max-w-96 tablet:!flex-row tablet:!items-center">
                        <FormLabel className="font-semibold">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email address"
                            {...field}
                          />
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
                            className="ml-1 text-sm font-medium text-red-500 tablet:ml-12"
                          >
                            {error?.message}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                disabled={signUpButtonText !== "Sign up"}
                onClick={() => {
                  void form.handleSubmit(onFormSubmit)();
                }}
              >
                <AnimatePresence mode={"popLayout"} initial={false}>
                  <motion.div
                    key={signUpButtonText}
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
                    {signUpButtonText}
                    {signUpButtonText === "Signing up" && (
                      <div
                        className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-offwhite"
                        role="status"
                        aria-label="loading"
                      >
                        <span className="sr-only">Loading...</span>
                      </div>
                    )}
                    {signUpButtonText === "Thank you!" && (
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
            </form>
          </Form>
        </div>
      </div>
    </motion.div>
  );
}

export default TempHomepage;
