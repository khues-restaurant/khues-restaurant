import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useEffect, useState } from "react";
import { MdOutlineMoneyOff } from "react-icons/md";
import { BsSpeedometer2 } from "react-icons/bs";
import { TfiReceipt } from "react-icons/tfi";
import { SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/router";
import WideFancySwirls from "~/components/ui/wideFancySwirls";
import LeftAccentSwirls from "~/components/ui/LeftAccentSwirls";
import RightAccentSwirls from "~/components/ui/RightAccentSwirls";
import {
  Carousel,
  CarouselContent,
  type CarouselApi,
  CarouselItem,
} from "~/components/ui/carousel";
import { useMainStore } from "~/stores/MainStore";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const { asPath } = useRouter();

  // I think we will ditch this approach and just do the hardcoded approach for now
  // due to seo + lack of need for loading skeletons while menu is being fetched
  // const { menuItems } = useMainStore((state) => ({
  //   menuItems: state.menuItems,
  // }));

  // const chefsChoiceMenuItems = Object.values(menuItems).filter(
  //   (menuItem) => menuItem.chefsChoice,
  // );

  const [pressReviewsApi, setPressReviewsApi] = useState<CarouselApi>();
  const [pressReviewsSlide, setPressReviewsSlide] = useState(0);

  const [chefSpecialsApi, setChefSpecialsApi] = useState<CarouselApi>();
  const [chefSpecialsSlide, setChefSpecialsSlide] = useState(0);

  useEffect(() => {
    if (!pressReviewsApi || !chefSpecialsApi) {
      return;
    }

    setPressReviewsSlide(pressReviewsApi.selectedScrollSnap());
    setChefSpecialsSlide(chefSpecialsApi.selectedScrollSnap());

    pressReviewsApi.on("select", () => {
      setPressReviewsSlide(pressReviewsApi.selectedScrollSnap());
    });

    chefSpecialsApi.on("select", () => {
      setChefSpecialsSlide(chefSpecialsApi.selectedScrollSnap());
    });

    chefSpecialsApi.on("resize", () => {
      setChefSpecialsSlide(0);
      chefSpecialsApi.scrollTo(0);
    });

    // eventually add proper cleanup functions here
  }, [pressReviewsApi, chefSpecialsApi]);

  // TODO: for masonry images, might want to play around with slightly vertically
  // scrolling the images as the page is scrolled? The whole footprint would stay the same,
  // but the "camera" would move up and down slightly, giving the illusion of depth.
  // I don't know if we would have to artificially "zoom in" on the images so we could scroll
  // on them per se, or just kind of use them as is and have "viewport" into image be a bit arbitrary

  return (
    <motion.div
      key={"home"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-[6.05rem] min-h-dvh w-full !justify-start tablet:mt-32"
    >
      {/* Hero */}
      {/*  hmm what does the calc trick look like here? might be what you want sometimes instead of
      h-full */}

      <div className="baseVertFlex w-full tablet:!hidden">
        <div className="imageFiller baseFlex size-full h-[65dvh]">
          Image of probably three plates of food here arranged in a triangle
          (one on top, two on bottom) on a table, probably with some fancy
          lighting going on too. alternatively we could do one dish in main area
          here, and have an image selector below, but not as big of a fan of
          this approach
        </div>
        <div className="baseVertFlex gap-1 p-8">
          <h1 className="text-2xl font-bold">Welcome to Khue&apos;s</h1>
          <h2 className="text-center text-lg">
            A modern take on classic Vietnamese cuisine.
          </h2>
          <Button asChild className="mt-4">
            <Link href="/order-now">Order now</Link>
          </Button>
        </div>
      </div>

      <div className="baseFlex relative !hidden w-full tablet:!flex tablet:h-[calc(100dvh-8rem)]">
        <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-black/50 to-transparent"></div>

        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2">
          <div className="imageFiller size-full" />
          <div className="imageFiller size-full" />
          <div className="imageFiller size-full" />
          <div className="imageFiller size-full" />
        </div>

        <div className="baseVertFlex absolute top-0 h-full tablet:left-24">
          <div className="baseVertFlex !items-start gap-1 rounded-md bg-white p-8 shadow-md">
            <h1 className="text-4xl font-bold">Welcome to Khue&apos;s</h1>
            <h2 className="text-2xl">
              A modern take on classic Vietnamese cuisine.
            </h2>
            <Button asChild className="mt-4">
              <Link href="/order-now">Order now</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Press Reviews */}
      <div className="baseVertFlex w-full gap-2 border-y-[1px] pb-4 tablet:border-t-0">
        <Carousel
          setApi={setPressReviewsApi}
          opts={{
            breakpoints: {
              "(min-width: 1000px)": {
                active: false,
              },
              "(min-height:700px)": {
                active: false,
              },
            },
            // skipSnaps: true, play around with this
          }}
        >
          <CarouselContent>
            <CarouselItem className="baseVertFlex basis-full gap-4 rounded-md p-4 tablet:basis-1/3">
              <Image
                src="/press/StarTribune.png"
                alt="Star Tribune"
                width={200}
                height={85}
              />
              <p className="text-sm italic tablet:text-base">
                &ldquo;Khue&apos;s is a must-visit for anyone in the Twin
                Cities.&rdquo;
              </p>
            </CarouselItem>
            <CarouselItem className="baseVertFlex basis-full gap-4 rounded-md p-4 tablet:basis-1/3">
              <Image
                src="/press/StarTribune.png"
                alt="Star Tribune"
                width={200}
                height={85}
              />
              <p className="text-sm italic tablet:text-base">
                &ldquo;Khue&apos;s is a must-visit for anyone in the Twin
                Cities.&rdquo;
              </p>
            </CarouselItem>
            <CarouselItem className="baseVertFlex basis-full gap-4 rounded-md p-4 tablet:basis-1/3">
              <Image
                src="/press/StarTribune.png"
                alt="Star Tribune"
                width={200}
                height={85}
              />
              <p className="text-sm italic tablet:text-base">
                &ldquo;Khue&apos;s is a must-visit for anyone in the Twin
                Cities.&rdquo;
              </p>
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        {/* (mobile-only) dots to show which review is being viewed at the moment */}
        <div className="baseFlex gap-2 tablet:hidden">
          <Button asChild>
            <div
              className={`!size-2 cursor-pointer rounded-full !p-0 ${pressReviewsSlide === 0 ? "!bg-primary" : "!bg-gray-300"}`}
              onClick={() => pressReviewsApi?.scrollTo(0)}
            />
          </Button>
          <Button asChild>
            <div
              className={`!size-2 cursor-pointer rounded-full !p-0 ${pressReviewsSlide === 1 ? "!bg-primary" : "!bg-gray-300"}`}
              onClick={() => pressReviewsApi?.scrollTo(1)}
            />
          </Button>
          <Button asChild>
            <div
              className={`!size-2 cursor-pointer rounded-full !p-0 ${pressReviewsSlide === 2 ? "!bg-primary" : "!bg-gray-300"}`}
              onClick={() => pressReviewsApi?.scrollTo(2)}
            />
          </Button>
        </div>
      </div>

      {/* wrapping (prob just for padding?) container of promo sections below */}
      <div className="baseVertFlex w-full gap-8 p-8">
        {/* masonry (w/ slight gap + rounded images) of food items + inside the restaurant. Don't be afraid to
          crop images how you feel suits them if need be */}

        {/* <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}> */}
        {/* <Masonry columnsCount={3} gutter="10px" className="max-w-[550px]">
          <div className="imageFiller h-64 w-32" />
          <div className="imageFiller h-32 w-64" />
          <div className="imageFiller h-32 w-48" />
          <div className="imageFiller h-48 w-96" />
          <div className="imageFiller h-24 w-48" />
          <div className="imageFiller h-32 w-32" />
          <div className="imageFiller h-32 w-32" />
        </Masonry> */}
        {/* </ResponsiveMasonry> */}

        {/* "Order directly through us" promo section */}
        <div className="baseVertFlex w-full rounded-md shadow-md tablet:hidden">
          <div className="imageFiller h-60 w-full tablet:h-72 tablet:w-72"></div>
          <div className="baseVertFlex gap-4 p-4">
            <p className="text-lg font-medium">
              Order directly through us to receive mouthwatering benefits
            </p>
            <div className="baseVertFlex !items-start gap-2 pl-4">
              <div className="baseFlex gap-4">
                <MdOutlineMoneyOff className="size-6" />
                <p>Shop our lowest prices</p>
              </div>
              <div className="baseFlex gap-4">
                <BsSpeedometer2 className="size-6" />
                <p>
                  Priority service: Your orders jump to the front of the line
                </p>
              </div>
              <div className="baseFlex gap-4">
                <TfiReceipt className="size-6" />
                <p className="max-w-52">
                  Rewards members earn points towards free meals with every
                  order
                </p>
              </div>
            </div>

            <Button asChild>
              <Link href="/order-now">Order now</Link>
            </Button>
          </div>
        </div>

        <div className="baseFlex !hidden w-full gap-16 py-8 tablet:!flex">
          <div className="baseVertFlex !items-start gap-4 p-4">
            <p className="text-lg font-medium">
              Order directly through us to receive mouthwatering benefits
            </p>
            <div className="baseVertFlex !items-start gap-2 pl-8">
              <div className="baseFlex gap-4">
                <MdOutlineMoneyOff className="size-6" />
                <p>Shop our lowest prices</p>
              </div>
              <div className="baseFlex gap-4">
                <BsSpeedometer2 className="size-6" />
                <p>
                  Priority service: Your orders jump to the front of the line
                </p>
              </div>
              <div className="baseFlex gap-4">
                <TfiReceipt className="size-6" />
                <p className="max-w-lg">
                  Rewards members earn points towards free meals with every
                  order
                </p>
              </div>
            </div>

            <Button asChild>
              <Link href="/order-now" className="self-center">
                Order now
              </Link>
            </Button>
          </div>

          <div className="baseFlex relative size-72">
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              viewport={{ once: true, amount: 0.75 }}
              className="imageFiller absolute left-0 top-0 h-full w-full rounded-md shadow-md"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              viewport={{ once: true, amount: 0.75 }}
              className="absolute right-4 top-4 z-[-1] h-full w-full rounded-md bg-primary"
            ></motion.div>
          </div>
        </div>

        {/* Meet the Chef promo section */}
        <div className="baseVertFlex w-full rounded-md shadow-md tablet:hidden">
          <div className="imageFiller h-60 w-full tablet:h-72 tablet:w-72"></div>
          <div className="baseVertFlex !items-start gap-4 p-4">
            <p className="text-lg font-medium">Meet the Chef</p>

            <p>
              Eric Pham is Lorem ipsum dolor sit amet, consectetur adipiscing
              elit, sed do eiusmod tempor incididunt ut labore et dolore magna
              aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>

            <Button variant={"link"} asChild>
              <Link href="/about-us">Read more</Link>
            </Button>
          </div>
        </div>

        <div className="baseFlex !hidden w-full gap-16 py-8 tablet:!flex">
          <div className="baseFlex relative size-72">
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              viewport={{ once: true, amount: 0.75 }}
              className="imageFiller absolute left-0 top-0 h-full w-full rounded-md shadow-md"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              viewport={{ once: true, amount: 0.75 }}
              className="absolute left-4 top-4 z-[-1] h-full w-full rounded-md bg-primary"
            ></motion.div>
          </div>

          <div className="baseVertFlex max-w-3xl !items-start gap-4 p-4">
            <p className="text-lg font-medium">Meet the chef</p>

            <p>
              Eric Pham is Lorem ipsum dolor sit amet, consectetur adipiscing
              elit, sed do eiusmod tempor incididunt ut labore et dolore magna
              aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>

            <Button variant={"link"} asChild>
              <Link href="/about-us">Read more</Link>
            </Button>
          </div>
        </div>

        {/* Reservation promo section */}
        <div className="baseVertFlex w-full rounded-md shadow-md tablet:hidden">
          <div className="imageFiller h-60 w-full tablet:h-72 tablet:w-72">
            image of an empty table w/ full silverware layed out, kind of angled
            down shot at the table
          </div>
          <div className="baseVertFlex !items-start gap-4 p-4">
            <p className="text-lg font-medium">
              Planning a birthday dinner or get together with your friends?
            </p>

            <p>Secure your seats ahead of time by placing a reservation.</p>

            <Button asChild>
              <a href="/resyLink">Place a reservation</a>
            </Button>
          </div>
        </div>

        <div className="baseFlex !hidden w-full gap-16 py-8  tablet:!flex">
          <div className="baseVertFlex max-w-3xl gap-4 p-4">
            <p className="text-lg font-medium">
              Planning a birthday dinner or get together with your friends?
            </p>

            <p>Secure your seats ahead of time by placing a reservation.</p>

            <Button asChild>
              <a href="/resyLink">Place a reservation</a>
            </Button>
          </div>

          <div className="baseFlex relative size-72">
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              viewport={{ once: true, amount: 0.75 }}
              className="imageFiller absolute left-0 top-0 h-full w-full rounded-md shadow-md"
            >
              {" "}
              image of an empty table w/ full silverware layed out, kind of
              angled down shot at the table
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              viewport={{ once: true, amount: 0.75 }}
              className="absolute right-4 top-4 z-[-1] h-full w-full rounded-md bg-primary"
            ></motion.div>
          </div>
        </div>

        {/* masonry but prob more of just inside/outside the restaurant */}
        {/* <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}> */}
        {/* <Masonry columnsCount={3} gutter="10px" className="max-w-[550px]">
          <div className="imageFiller h-64 w-32" />
          <div className="imageFiller h-32 w-64" />
          <div className="imageFiller h-32 w-48" />
          <div className="imageFiller h-48 w-96" />
          <div className="imageFiller h-24 w-48" />
          <div className="imageFiller h-32 w-32" />
          <div className="imageFiller h-32 w-32" />
        </Masonry> */}
        {/* </ResponsiveMasonry> */}

        {/* Rewards program promo section */}
        {isLoaded && !isSignedIn && (
          <div
            style={
              {
                // background:
                //   "linear-gradient(to right bottom, oklch(0.9 0.13 87.8 / 1) 0%, rgb(212, 175, 55) 100%)",
                // border: "4px solid transparent" /* Set the border width */,
                // borderImage:
                //   "linear-gradient(to right bottom, oklch(0.9 0.13 87.8 / 1) 0%, rgb(212, 175, 55) 100%) 1 stretch",
              }
            }
            className="baseVertFlex rewardsGoldBorder w-full max-w-2xl gap-4 rounded-md p-4 !pb-8 text-yellow-500 shadow-md tablet:p-8"
          >
            <div className="baseFlex gap-4">
              <LeftAccentSwirls />
              <p className="text-center text-xl font-medium">
                Join our rewards program today!
              </p>
              <RightAccentSwirls />
            </div>
            <p>
              As valued customers, members gain access to exclusive, limited
              time discounts, can build up to earn free meals, and get a free
              birthday dessert of their choice!
            </p>

            <WideFancySwirls />

            <SignUpButton
              mode="modal"
              afterSignUpUrl={`${
                process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
              }/postSignUpRegistration`}
              afterSignInUrl={`${
                process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""
              }${asPath}`}
            >
              <Button
                variant={"rewards"}
                // size={"lg"}
                // onClick={() => {
                //   if (asPath.includes("/create")) {
                //     localStorageTabData.set(getStringifiedTabData());
                //   }

                //   // technically can sign in from signup page and vice versa
                //   if (!userId) localStorageRedirectRoute.set(asPath);
                //   // ^^ but technically could just append it onto the postSignupRegistration route right?
                // }}
                className="px-8"
              >
                Sign up
              </Button>
            </SignUpButton>
          </div>
        )}

        {/* Explore Our Favorites section */}
        <div className="baseVertFlex max-w-[350px] gap-4 sm:max-w-md xl:!max-w-5xl tablet:max-w-2xl">
          <p className="text-lg font-medium">Explore Our Favorites</p>

          <div className="baseVertFlex w-full gap-2">
            <Carousel
              setApi={setChefSpecialsApi}
              opts={{
                breakpoints: {
                  "(min-width: 768px)": {
                    slidesToScroll: 2,
                  },
                  "(min-width: 1280px)": {
                    slidesToScroll: 4,
                  },
                },
                dragFree: true,
                // skipSnaps: true, play around with this
              }}
              className="baseFlex w-full rounded-md border"
            >
              <CarouselContent>
                <CarouselItem className="baseVertFlex basis-full !items-start gap-4 rounded-md p-4 md:basis-1/2 xl:basis-1/4">
                  <div className="imageFiller h-36 w-full rounded-md shadow-md"></div>
                  <p className="font-semibold">Appetizer One</p>
                  <p className="text-sm">
                    Silky ricotta, signature red sauce, Italian sausage,
                    mozzarella & parmesan cheeses.
                  </p>
                </CarouselItem>
                <CarouselItem className="baseVertFlex basis-full !items-start gap-4 rounded-md p-4 md:basis-1/2 xl:basis-1/4">
                  <div className="imageFiller h-36 w-full rounded-md shadow-md"></div>
                  <p className="font-semibold">Appetizer Two</p>
                  <p className="text-sm">
                    Silky ricotta, signature red sauce, Italian sausage,
                    mozzarella & parmesan cheeses.
                  </p>
                </CarouselItem>
                <CarouselItem className="baseVertFlex basis-full !items-start gap-4 rounded-md p-4 md:basis-1/2 xl:basis-1/4">
                  <div className="imageFiller h-36 w-full rounded-md shadow-md"></div>
                  <p className="font-semibold">Appetizer Three</p>
                  <p className="text-sm">
                    Silky ricotta, signature red sauce, Italian sausage,
                    mozzarella & parmesan cheeses.
                  </p>
                </CarouselItem>
                <CarouselItem className="baseVertFlex basis-full !items-start gap-4 rounded-md p-4 md:basis-1/2 xl:basis-1/4">
                  <div className="imageFiller h-36 w-full rounded-md shadow-md"></div>
                  <p className="font-semibold">Appetizer Four</p>
                  <p className="text-sm">
                    Silky ricotta, signature red sauce, Italian sausage,
                    mozzarella & parmesan cheeses.
                  </p>
                </CarouselItem>
                <CarouselItem className="baseVertFlex basis-full !items-start gap-4 rounded-md p-4 md:basis-1/2 xl:basis-1/4">
                  <div className="imageFiller h-36 w-full rounded-md shadow-md"></div>
                  <p className="font-semibold">Appetizer Five</p>
                  <p className="text-sm">
                    Silky ricotta, signature red sauce, Italian sausage,
                    mozzarella & parmesan cheeses.
                  </p>
                </CarouselItem>
                <CarouselItem className="baseVertFlex basis-full !items-start gap-4 rounded-md p-4 md:basis-1/2 xl:basis-1/4">
                  <div className="imageFiller h-36 w-full rounded-md shadow-md"></div>
                  <p className="font-semibold">Appetizer Six</p>
                  <p className="text-sm">
                    Silky ricotta, signature red sauce, Italian sausage,
                    mozzarella & parmesan cheeses.
                  </p>
                </CarouselItem>
              </CarouselContent>
            </Carousel>

            <div className="baseFlex gap-2">
              <Button asChild>
                <div
                  className={`!size-2 cursor-pointer rounded-full !p-0 ${chefSpecialsSlide === 0 ? "!bg-primary" : "!bg-gray-300"}`}
                  onClick={() => chefSpecialsApi?.scrollTo(0)}
                />
              </Button>
              <Button asChild>
                <div
                  className={`!size-2 cursor-pointer rounded-full !p-0 ${chefSpecialsSlide === 1 ? "!bg-primary" : "!bg-gray-300"}`}
                  onClick={() => chefSpecialsApi?.scrollTo(1)}
                />
              </Button>
              <Button asChild>
                <div
                  className={`!size-2 cursor-pointer rounded-full !p-0 xl:hidden ${chefSpecialsSlide === 2 ? "!bg-primary" : "!bg-gray-300"}`}
                  onClick={() => chefSpecialsApi?.scrollTo(2)}
                />
              </Button>
              <Button asChild>
                <div
                  className={`!size-2 cursor-pointer rounded-full !p-0 md:hidden ${chefSpecialsSlide === 3 ? "!bg-primary" : "!bg-gray-300"}`}
                  onClick={() => chefSpecialsApi?.scrollTo(3)}
                />
              </Button>
              <Button asChild>
                <div
                  className={`!size-2 cursor-pointer rounded-full !p-0 md:hidden ${chefSpecialsSlide === 4 ? "!bg-primary" : "!bg-gray-300"}`}
                  onClick={() => chefSpecialsApi?.scrollTo(4)}
                />
              </Button>
              <Button asChild>
                <div
                  className={`!size-2 cursor-pointer rounded-full !p-0 md:hidden ${chefSpecialsSlide === 5 ? "!bg-primary" : "!bg-gray-300"}`}
                  onClick={() => chefSpecialsApi?.scrollTo(5)}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* maybe a gallary/slideshow section? Prob not though */}
      </div>
    </motion.div>
  );
}
