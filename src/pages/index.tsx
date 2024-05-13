import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MdOutlineMoneyOff } from "react-icons/md";
import { BsSpeedometer2 } from "react-icons/bs";
import { TfiReceipt } from "react-icons/tfi";
import { SignUpButton, useAuth } from "@clerk/nextjs";
import { Parallax } from "react-scroll-parallax";
import { useRouter } from "next/router";
import WideFancySwirls from "~/components/ui/wideFancySwirls";
import {
  Carousel,
  CarouselContent,
  type CarouselApi,
  CarouselItem,
} from "~/components/ui/carousel";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import Head from "next/head";

import mobileHero from "/public/homepage/mobileHero.webp";
import topLeftTabletHero from "/public/homepage/heroTwo.webp";
import topRightTabletHero from "/public/homepage/heroOne.jpeg";
import bottomLeftTabletHero from "/public/homepage/heroThree.webp";
import bottomRightTabletHero from "/public/homepage/heroFour.jpg";

import starTribuneLogo from "/public/media/starTribuneLogo.png";
import kare11Logo from "/public/media/kare11Logo.png";
import mprLogo from "/public/media/mprLogo.png";

import masonryFoodOne from "/public/masonryFood/one.jpg";
import masonryFoodTwo from "/public/masonryFood/two.webp";
import masonryFoodThree from "/public/masonryFood/three.jpg";
import masonryFoodFour from "/public/masonryFood/four.png";
import masonryFoodFive from "/public/masonryFood/five.jpg";

import rewardsPromo from "/public/rewardsPromo.jpg";
import eric from "/public/eric.webp";
import reservations from "/public/reservations.webp";

import masonryInteriorOne from "/public/interior/one.webp";
import masonryInteriorTwo from "/public/interior/two.webp";
import masonryInteriorThree from "/public/interior/three.webp";
import masonryInteriorFour from "/public/interior/four.webp";
import masonryInteriorFive from "/public/interior/five.webp";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const { asPath } = useRouter();

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

  return (
    <motion.div
      key={"home"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-24 min-h-[calc(100dvh-6rem)] w-full !justify-start tablet:mt-28 tablet:min-h-[calc(100dvh-7rem)]"
    >
      <Head>
        <title>Khue&apos;s</title>
        <meta
          name="description"
          content="Discover the modern Vietnamese flavors at Khue's, where Chef Eric Pham brings a fresh perspective to traditional dishes inspired by his mother's legacy."
        />
        <meta property="og:title" content="Khue's"></meta>
        <meta property="og:url" content="www.khueskitchen.com/" />
        <meta
          property="og:description"
          content="Discover the modern Vietnamese flavors at Khue's, where Chef Eric Pham brings a fresh perspective to traditional dishes inspired by his mother's legacy."
        />
        <meta property="og:type" content="website" />
        {/* <meta
          property="og:image"
          content="https://www.autostrum.com/opengraphScreenshots/explore.png"
        ></meta> */}
        {/* <meta
          property="og:image:alt"
          content="TODO: A description of what is in the image (not a caption). If the page specifies an og:image it should specify og:image:alt"
        ></meta> */}
      </Head>

      {/* Hero */}
      <div className="baseVertFlex w-full tablet:!hidden">
        {/* <div className="imageFiller baseFlex size-full h-[65dvh]">
          Image of probably three plates of food here arranged in a triangle
          (one on top, two on bottom) on a table, probably with some fancy
          lighting going on too. alternatively we could do one dish in main area
          here, and have an image selector below, but not as big of a fan of
          this approach
        </div> */}

        <div className="baseFlex relative size-full h-[65dvh]">
          <Image
            src={mobileHero}
            alt={"TODO: fill in w/ appropriate alt text"}
            priority
            // this below is assuming you don't want to keep the relative sizing throughout all
            // viewport sizes, otherwise I think you should keep the "{number}vw" sizing. do the
            // desktop hero images next to get a better idea.
            // ^ also the parallax images should not be object-fit cover right? just static always
            // (scale up a bit for tablet+ though maybe just to break up the monotony of the
            // design?

            sizes={"(max-width: 640px) 100vw, 500px"}
            className="!relative !size-full object-cover sm:mt-4 sm:!w-[500px] sm:rounded-md"
          />
        </div>

        <section className="baseVertFlex gap-1 p-8">
          <h1 className="text-2xl font-bold">Welcome to Khue&apos;s</h1>
          <p className="text-center text-lg">
            A modern take on classic Vietnamese cuisine.
          </p>
          <Button asChild className="mt-4">
            <Link href="/order">Order now</Link>
          </Button>
        </section>
      </div>

      <div className="baseFlex relative !hidden w-full p-4 tablet:!flex tablet:h-[calc(100dvh-7rem)]">
        <div className="relative grid size-full grid-cols-3 grid-rows-3 gap-4">
          {/* top left */}
          <div className="relative col-span-1 row-span-2 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-10} className="!absolute !top-0 !size-full">
              <Image
                src={topLeftTabletHero}
                alt={"TODO: fill in w/ appropriate alt text"}
                priority
                sizes="33vw"
                className="!relative !size-full rounded-md object-cover"
              />
            </Parallax>
          </div>

          {/* top right */}
          <div className="relative col-span-2 row-span-2 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-10} className="!absolute !top-0 !size-full">
              <Image
                src={topRightTabletHero}
                alt={"TODO: fill in w/ appropriate alt text"}
                priority
                sizes="66vw"
                className="!relative !size-full rounded-md object-cover"
              />
            </Parallax>
          </div>

          {/* bottom left */}
          <div className="relative !top-0 col-span-1 row-span-1 size-full overflow-hidden rounded-md shadow-md">
            <Parallax
              speed={-10}
              className="!absolute !top-0 !h-[150%] !w-full"
              // TODO: this one is off by a bit
            >
              <Image
                src={bottomLeftTabletHero}
                alt={"TODO: fill in w/ appropriate alt text"}
                priority
                sizes="33vw"
                className="!relative !size-full rounded-md object-cover !pb-16"
              />
            </Parallax>
          </div>

          {/* bottom right */}
          <div className="relative !top-0 col-span-2 row-span-1 size-full overflow-hidden rounded-md shadow-md">
            <Parallax
              speed={-10}
              className="!absolute !top-0 !h-[150%] !w-full"
              // TODO: this one is off by a bit in the other direction
            >
              <Image
                src={bottomRightTabletHero}
                alt={"TODO: fill in w/ appropriate alt text"}
                priority
                sizes="66vw"
                className="!relative !size-full rounded-md object-cover"
              />
            </Parallax>
          </div>
        </div>

        <div className="baseVertFlex absolute top-0 h-full xl:!left-24 tablet:left-8">
          <section className="baseVertFlex !items-start gap-1 rounded-md bg-offwhite p-8 shadow-md">
            <h1 className="text-4xl font-bold">Welcome to Khue&apos;s</h1>
            <p className="text-2xl">
              A modern take on classic Vietnamese cuisine.
            </p>
            <Button asChild className="mt-4">
              <Link href="/order">Order now</Link>
            </Button>
          </section>
        </div>
      </div>

      {/* Press Reviews */}
      <div className="baseVertFlex w-full border-y-[1px] bg-gradient-to-br from-offwhite to-primary/10 pb-4">
        <p className="mt-4 font-medium tablet:text-xl">Find us on</p>
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
          }}
        >
          <CarouselContent className="mb-4 xl:w-[800px] tablet:mb-0">
            <CarouselItem className="baseVertFlex basis-full gap-4 rounded-md tablet:basis-1/3">
              <a
                href="https://www.startribune.com/how-these-moms-shaped-the-next-generation-of-great-twin-cities-restaurateurs/600273728/?refresh=true"
                className="baseFlex"
              >
                <Image
                  src={starTribuneLogo}
                  alt="Star Tribune Logo"
                  width={200}
                  height={85}
                />
              </a>
            </CarouselItem>
            <CarouselItem className="baseVertFlex basis-full gap-4 rounded-md tablet:basis-1/3">
              <a
                href="https://www.kare11.com/article/news/local/mpls-chef-credits-his-mom-for-inspiration/89-0f237053-85cf-48ae-96f7-8cbebb780555"
                className="baseFlex"
              >
                <Image
                  src={kare11Logo}
                  alt="Kare 11 Logo"
                  width={150}
                  height={63.75}
                />
              </a>
            </CarouselItem>
            <CarouselItem className="baseVertFlex basis-full gap-4 rounded-md tablet:basis-1/3">
              <a
                href="https://www.mprnews.org/story/2023/12/27/appetites-looks-back-on-2023-restaurants-vietnamese-meatballs-and-the-secret-to-entertaining"
                className="baseFlex"
              >
                <Image
                  src={mprLogo}
                  alt="MPR Logo"
                  width={150}
                  height={63.75}
                />
              </a>
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        {/* (mobile-only) dots to show which review is being viewed at the moment */}
        <div className="baseFlex gap-2 tablet:hidden">
          <Button asChild>
            <div
              className={`!size-2 cursor-pointer rounded-full !p-0 ${pressReviewsSlide === 0 ? "!bg-primary" : "!bg-stone-300"}`}
              onClick={() => pressReviewsApi?.scrollTo(0)}
            />
          </Button>
          <Button asChild>
            <div
              className={`!size-2 cursor-pointer rounded-full !p-0 ${pressReviewsSlide === 1 ? "!bg-primary" : "!bg-stone-300"}`}
              onClick={() => pressReviewsApi?.scrollTo(1)}
            />
          </Button>
          <Button asChild>
            <div
              className={`!size-2 cursor-pointer rounded-full !p-0 ${pressReviewsSlide === 2 ? "!bg-primary" : "!bg-stone-300"}`}
              onClick={() => pressReviewsApi?.scrollTo(2)}
            />
          </Button>
        </div>
      </div>

      {/* wrapping (prob just for padding?) container of promo sections below */}
      <div className="baseVertFlex w-full gap-16 p-8">
        {/* masonry of featured food items */}
        <div className="homepageFoodMasonry h-[700px] w-full max-w-sm tablet:h-[450px] tablet:max-w-4xl">
          <div className="firstMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[120%]">
              <Image
                src={masonryFoodOne}
                alt={"TODO: fill in w/ appropriate alt text"}
                sizes="(max-width: 1000px) 384px, 500px"
                className="!relative !size-full rounded-md object-cover"
              />
            </Parallax>
          </div>

          <div className="secondMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[150%] ">
              <Image
                src={masonryFoodTwo}
                alt={"TODO: fill in w/ appropriate alt text"}
                sizes="(max-width: 1000px) 159px, 500px"
                className="!relative !size-full rounded-md object-cover"
              />
            </Parallax>
          </div>

          <div className="thirdMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[150%]">
              <Image
                src={masonryFoodThree}
                alt={"TODO: fill in w/ appropriate alt text"}
                sizes="(max-width: 1000px) 159px, 500px"
                className="!relative !size-full rounded-md object-cover"
              />
            </Parallax>
          </div>

          <div className="fourthMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[150%]">
              <Image
                src={masonryFoodFour}
                alt={"TODO: fill in w/ appropriate alt text"}
                sizes="(max-width: 1000px) 159px, 500px"
                className="!relative !size-full rounded-md object-cover"
              />
            </Parallax>
          </div>

          <div className="fifthMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0">
              <Image
                src={masonryFoodFive}
                alt={"TODO: fill in w/ appropriate alt text"}
                sizes="(max-width: 1000px) 384px, 500px"
                className="!relative !size-full rounded-md object-cover"
              />
            </Parallax>
          </div>
        </div>

        {/* "Order directly through us" promo section */}
        <div className="baseVertFlex w-full max-w-sm rounded-md shadow-md tablet:hidden">
          {/* maybe have stock image of person holding a phone and you would have a proportionally
                tilted screenshot of the order page showing on their phone? think about it */}
          <div className="relative h-60 w-full overflow-hidden rounded-t-md shadow-md">
            <Image
              src={rewardsPromo}
              alt={"TODO: fill in w/ appropriate alt text"}
              width={384}
              className="!relative !top-0 !size-full !h-96 rounded-md object-cover !pb-32"
            />
          </div>
          <div className="baseVertFlex gap-4 bg-gradient-to-br from-offwhite to-primary/10 p-4">
            <p className="text-lg font-medium">
              Enjoy exclusive benefits when you order direct
            </p>
            <div className="baseVertFlex !items-start gap-4 pl-4">
              <div className="baseFlex !items-start gap-4">
                <MdOutlineMoneyOff className="size-6 shrink-0" />
                <p>Shop our lowest menu prices</p>
              </div>
              <div className="baseFlex !items-start gap-4">
                <BsSpeedometer2 className="mt-2 size-6 shrink-0" />
                <p>
                  Priority order processing over third-party delivery services
                </p>
              </div>
              <div className="baseFlex !items-start gap-4">
                <TfiReceipt className="mt-2 size-6 shrink-0" />
                <p>
                  Rewards members earn points towards free meals with every
                  order
                </p>
              </div>
            </div>

            <Button asChild>
              <Link href="/order" className="my-4">
                Order now
              </Link>
            </Button>
          </div>
        </div>

        <div className="baseFlex !hidden w-full gap-16 py-8 tablet:!flex">
          <div className="baseVertFlex !items-start gap-4 p-4">
            <p className="text-lg font-medium">
              Enjoy exclusive benefits when you order direct
            </p>
            <div className="baseVertFlex !items-start gap-4">
              <div className="baseFlex gap-4">
                <MdOutlineMoneyOff className="size-6 shrink-0" />
                <p>Shop our lowest menu prices</p>
              </div>
              <div className="baseFlex gap-4">
                <BsSpeedometer2 className="size-6 shrink-0" />
                <p>
                  Priority order processing over third-party delivery services
                </p>
              </div>
              <div className="baseFlex gap-4">
                <TfiReceipt className="size-6 shrink-0" />
                <p className="max-w-lg">
                  Rewards members earn points towards free meals with every
                  order
                </p>
              </div>
            </div>

            <Button asChild>
              <Link href="/order" className="mt-4 self-center">
                Order now
              </Link>
            </Button>
          </div>

          <div className="baseFlex relative size-72">
            {/* maybe have stock image of person holding a phone and you would have a proportionally
                tilted screenshot of the order page showing on their phone? think about it */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              viewport={{ once: true, amount: 0.75 }}
              className="absolute left-0 top-0 h-72 w-full overflow-hidden rounded-md shadow-md"
            >
              <Image
                src={"/rewardsPromo.jpg"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="!relative !top-0 !size-full !h-96 rounded-md !pb-8"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              viewport={{ once: true, amount: 0.5 }}
              className="absolute right-4 top-4 z-[-1] size-full rounded-md bg-gradient-to-br from-primary to-darkPrimary"
            ></motion.div>
          </div>
        </div>

        {/* Meet the Chef promo section */}
        <div className="baseVertFlex w-full max-w-sm rounded-md shadow-md  tablet:hidden">
          <div className="relative h-60 w-full overflow-hidden rounded-t-md">
            <Image
              src={eric}
              alt={"TODO: fill in w/ appropriate alt text"}
              width={384}
              className="!relative !top-0 !size-full !h-96 rounded-md object-cover !object-top !pb-16"
            />
          </div>
          <div className="baseVertFlex !items-start gap-4 bg-gradient-to-br from-offwhite to-primary/10 p-4">
            <p className="text-lg font-medium">Meet the Chef</p>

            <p>
              Eric Pham is Lorem ipsum dolor sit amet, consectetur adipiscing
              elit, sed do eiusmod tempor incididunt ut labore et dolore magna
              aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>

            <Button variant={"link"} className="h-8 !p-0" asChild>
              <Link href="/our-story">Read more</Link>
            </Button>
          </div>
        </div>

        <div className="baseFlex !hidden w-full gap-16 py-8 tablet:!flex">
          <div className="baseFlex relative size-72">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              viewport={{ once: true, amount: 0.75 }}
              className="absolute left-0 top-0 h-72 w-full overflow-hidden rounded-md shadow-md"
            >
              <Image
                src={"/eric.webp"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "top",
                }}
                className="!relative !top-0 !size-full !h-96 rounded-md"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              viewport={{ once: true, amount: 0.5 }}
              className="absolute left-4 top-4 z-[-1] size-full rounded-md bg-gradient-to-bl from-primary to-darkPrimary"
            ></motion.div>
          </div>

          <div className="baseVertFlex max-w-3xl !items-start gap-4 p-4">
            <p className="text-lg font-medium">Meet the chef</p>

            <p className="max-w-lg xl:max-w-full">
              Eric Pham is Lorem ipsum dolor sit amet, consectetur adipiscing
              elit, sed do eiusmod tempor incididunt ut labore et dolore magna
              aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>

            <Button variant={"link"} className="h-8 !p-0" asChild>
              <Link href="/our-story">Read more</Link>
            </Button>
          </div>
        </div>

        {/* Reservation promo section */}
        <div className="baseVertFlex w-full max-w-sm rounded-md shadow-md  tablet:hidden">
          <div className="relative h-60 w-full overflow-hidden rounded-t-md">
            <Image
              src={reservations}
              alt={"TODO: fill in w/ appropriate alt text"}
              width={384}
              className="!relative !top-0 !size-full !h-96 rounded-md object-cover !pb-24"
            />
          </div>
          <div className="baseVertFlex !items-start gap-2 bg-gradient-to-br from-offwhite to-primary/10 p-4">
            <p className="text-lg font-medium leading-6">
              Planning a birthday dinner or get together with your friends?
            </p>

            <p>Secure your seats ahead of time by placing a reservation.</p>

            <Button className="mt-4" asChild>
              <a href="/resyLink" target="_blank" rel="noreferrer">
                Place a reservation
              </a>
            </Button>
          </div>
        </div>

        <div className="baseFlex !hidden w-full gap-16 py-8  tablet:!flex">
          <div className="baseVertFlex max-w-3xl gap-2 p-4">
            <p className="text-lg font-medium">
              Planning a birthday dinner or get together with your friends?
            </p>

            <p>Secure your seats ahead of time by placing a reservation.</p>

            <Button className="mt-4" asChild>
              <a href="/resyLink" target="_blank" rel="noreferrer">
                Place a reservation
              </a>
            </Button>
          </div>

          <div className="baseFlex relative size-72">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              viewport={{ once: true, amount: 0.75 }}
              className="absolute left-0 top-0 h-72 w-full overflow-hidden rounded-md shadow-md"
            >
              <Image
                src={"/reservations.webp"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="!relative !top-0 !size-full !h-96 rounded-md !pb-16"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              viewport={{ once: true, amount: 0.5 }}
              className="absolute right-4 top-4 z-[-1] size-full rounded-md bg-gradient-to-br from-primary to-darkPrimary"
            ></motion.div>
          </div>
        </div>

        {/* masonry but prob more of just inside/outside the restaurant */}
        <div className="homepageInteriorMasonry h-[700px] w-full max-w-sm tablet:h-[450px] tablet:max-w-4xl">
          <div className="firstMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[115%]">
              <Image
                src={masonryInteriorOne}
                alt={"TODO: fill in w/ appropriate alt text"}
                sizes="(max-width: 1000px) 384px, 500px"
                className="!relative !size-full rounded-md object-cover object-bottom"
              />
            </Parallax>
          </div>

          <div className="secondMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[115%]">
              <Image
                src={masonryInteriorTwo}
                alt={"TODO: fill in w/ appropriate alt text"}
                sizes="(max-width: 1000px) 159px, 500px"
                className="!relative !size-full rounded-md object-cover object-bottom"
              />
            </Parallax>
          </div>

          <div className="thirdMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[115%]">
              <Image
                src={masonryInteriorThree}
                alt={"TODO: fill in w/ appropriate alt text"}
                sizes="(max-width: 1000px) 159px, 500px"
                className="!relative !size-full rounded-md object-cover object-bottom"
              />
            </Parallax>
          </div>

          <div className="fourthMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[115%]">
              <Image
                src={masonryInteriorFour}
                alt={"TODO: fill in w/ appropriate alt text"}
                sizes="(max-width: 1000px) 159px, 500px"
                className="!relative !size-full rounded-md object-cover object-bottom"
              />
            </Parallax>
          </div>

          <div className="fifthMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[125%]">
              <Image
                src={masonryInteriorFive}
                alt={"TODO: fill in w/ appropriate alt text"}
                sizes="(max-width: 1000px) 384px, 500px"
                className="!relative !size-full rounded-md object-cover object-bottom"
              />
            </Parallax>
          </div>
        </div>

        {/* Rewards program promo section */}
        {isLoaded && !isSignedIn && (
          <div className="baseVertFlex mb-16 mt-8 w-screen max-w-xl gap-8 border-y-4 border-y-gold !p-6 text-primary shadow-md sm:!p-8 tablet:rounded-sm">
            <span className="w-64 text-center font-semibold">
              Join Khue&apos;s Rewards and unlock exclusive benefits!
            </span>
            <span className="text-center text-sm tablet:text-base">
              With every order, you&apos;ll earn points which can be redeemed
              for complimentary meals. Plus, get early access to new dishes and
              celebrate your birthday with a free dessert of your choice!
            </span>

            <SignUpButton mode="modal">
              <Button
                variant={"rewards"}
                size={"lg"}
                className="text-base shadow-md"
              >
                Join now
              </Button>
            </SignUpButton>

            <WideFancySwirls className="h-16 fill-primary" />
          </div>
        )}

        {/* Explore Our Favorites section */}
        <div className="baseVertFlex mb-8 max-w-[350px] gap-4 sm:max-w-md xl:!max-w-5xl tablet:max-w-2xl">
          <p className="text-lg font-medium">Explore Our Favorites</p>

          <div className="baseVertFlex w-full gap-4">
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
                // dragFree: true,
                // skipSnaps: true, play around with this
              }}
              className="baseFlex w-full rounded-md border"
            >
              <CarouselContent>
                <CarouselItem className="baseVertFlex relative basis-full !items-start gap-4 rounded-md p-4 md:basis-1/2 xl:basis-1/4">
                  <Image
                    src={"/menuItems/sampleImage.webp"}
                    alt={"TODO: Fix later"}
                    width={144}
                    height={144}
                    className="self-center rounded-md"
                  />
                  <p className="font-semibold">Appetizer One</p>
                  <p className="line-clamp-3 text-sm">
                    Silky ricotta, signature red sauce, Italian sausage,
                    mozzarella & parmesan cheeses.
                  </p>
                </CarouselItem>
                <CarouselItem className="baseVertFlex relative basis-full !items-start gap-4 rounded-md p-4 md:basis-1/2 xl:basis-1/4">
                  <Image
                    src={"/menuItems/sampleImage.webp"}
                    alt={"TODO: Fix later"}
                    width={144}
                    height={144}
                    className="self-center rounded-md"
                  />
                  <p className="font-semibold">Appetizer Two</p>
                  <p className="line-clamp-3 text-sm">
                    Silky ricotta, signature red sauce, Italian sausage,
                    mozzarella & parmesan cheeses.
                  </p>
                </CarouselItem>
                <CarouselItem className="baseVertFlex relative basis-full !items-start gap-4 rounded-md p-4 md:basis-1/2 xl:basis-1/4">
                  <Image
                    src={"/menuItems/sampleImage.webp"}
                    alt={"TODO: Fix later"}
                    width={144}
                    height={144}
                    className="self-center rounded-md"
                  />
                  <p className="font-semibold">Appetizer Three</p>
                  <p className="line-clamp-3 text-sm">
                    Silky ricotta, signature red sauce, Italian sausage,
                    mozzarella & parmesan cheeses.
                  </p>
                </CarouselItem>
                <CarouselItem className="baseVertFlex relative basis-full !items-start gap-4 rounded-md p-4 md:basis-1/2 xl:basis-1/4">
                  <Image
                    src={"/menuItems/sampleImage.webp"}
                    alt={"TODO: Fix later"}
                    width={144}
                    height={144}
                    className="self-center rounded-md"
                  />
                  <p className="font-semibold">Appetizer Four</p>
                  <p className="line-clamp-3 text-sm">
                    Silky ricotta, signature red sauce, Italian sausage,
                    mozzarella & parmesan cheeses.
                  </p>
                </CarouselItem>
                <CarouselItem className="baseVertFlex relative basis-full !items-start gap-4 rounded-md p-4 md:basis-1/2 xl:basis-1/4">
                  <Image
                    src={"/menuItems/sampleImage.webp"}
                    alt={"TODO: Fix later"}
                    width={144}
                    height={144}
                    className="self-center rounded-md"
                  />
                  <p className="font-semibold">Appetizer Five</p>
                  <p className="line-clamp-3 text-sm">
                    Silky ricotta, signature red sauce, Italian sausage,
                    mozzarella & parmesan cheeses.
                  </p>
                </CarouselItem>
                <CarouselItem className="baseVertFlex relative basis-full !items-start gap-4 rounded-md p-4 md:basis-1/2 xl:basis-1/4">
                  <Image
                    src={"/menuItems/sampleImage.webp"}
                    alt={"TODO: Fix later"}
                    width={144}
                    height={144}
                    className="self-center rounded-md"
                  />
                  <p className="font-semibold">Appetizer Six</p>
                  <p className="line-clamp-3 text-sm">
                    Silky ricotta, signature red sauce, Italian sausage,
                    mozzarella & parmesan cheeses.
                  </p>
                </CarouselItem>
              </CarouselContent>
            </Carousel>

            <div className="baseFlex gap-2">
              <Button asChild>
                <div
                  className={`!size-2 cursor-pointer rounded-full !p-0 ${chefSpecialsSlide === 0 ? "!bg-primary" : "!bg-stone-300"}`}
                  onClick={() => chefSpecialsApi?.scrollTo(0)}
                />
              </Button>
              <Button asChild>
                <div
                  className={`!size-2 cursor-pointer rounded-full !p-0 ${chefSpecialsSlide === 1 ? "!bg-primary" : "!bg-stone-300"}`}
                  onClick={() => chefSpecialsApi?.scrollTo(1)}
                />
              </Button>
              <Button asChild>
                <div
                  className={`!size-2 cursor-pointer rounded-full !p-0 xl:hidden ${chefSpecialsSlide === 2 ? "!bg-primary" : "!bg-stone-300"}`}
                  onClick={() => chefSpecialsApi?.scrollTo(2)}
                />
              </Button>
              <Button asChild>
                <div
                  className={`!size-2 cursor-pointer rounded-full !p-0 md:hidden ${chefSpecialsSlide === 3 ? "!bg-primary" : "!bg-stone-300"}`}
                  onClick={() => chefSpecialsApi?.scrollTo(3)}
                />
              </Button>
              <Button asChild>
                <div
                  className={`!size-2 cursor-pointer rounded-full !p-0 md:hidden ${chefSpecialsSlide === 4 ? "!bg-primary" : "!bg-stone-300"}`}
                  onClick={() => chefSpecialsApi?.scrollTo(4)}
                />
              </Button>
              <Button asChild>
                <div
                  className={`!size-2 cursor-pointer rounded-full !p-0 md:hidden ${chefSpecialsSlide === 5 ? "!bg-primary" : "!bg-stone-300"}`}
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
