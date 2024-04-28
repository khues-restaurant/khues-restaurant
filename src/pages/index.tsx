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
      {/* Hero */}
      <div className="baseVertFlex w-full text-primary tablet:!hidden">
        {/* <div className="imageFiller baseFlex size-full h-[65dvh]">
          Image of probably three plates of food here arranged in a triangle
          (one on top, two on bottom) on a table, probably with some fancy
          lighting going on too. alternatively we could do one dish in main area
          here, and have an image selector below, but not as big of a fan of
          this approach
        </div> */}

        <div className="baseFlex relative size-full h-[65dvh]">
          <Image
            src={"/homepage/mobileHero.webp"}
            alt={"TODO: fill in w/ appropriate alt text"}
            priority
            fill
            style={{
              objectFit: "cover",
            }}
            className="!relative !size-full"
          />
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

      <div className="baseFlex relative !hidden w-full p-4 tablet:!flex tablet:h-[calc(100dvh-7rem)]">
        <div className="relative grid size-full grid-cols-3 grid-rows-3 gap-4">
          {/* top left */}
          <div className="relative col-span-1 row-span-2 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-10} className="!absolute !top-0 !size-full">
              <Image
                src={"/homepage/heroTwo.webp"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="!relative !size-full rounded-md"
              />
            </Parallax>
          </div>

          {/* top right */}
          <div className="relative col-span-2 row-span-2 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-10} className="!absolute !top-0 !size-full">
              <Image
                src={"/homepage/heroOne.jpeg"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="!relative !size-full rounded-md"
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
                src={"/homepage/heroThree.webp"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="!relative !size-full rounded-md !pb-16"
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
                src={"/homepage/heroFour.jpg"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="!relative !size-full rounded-md"
              />
            </Parallax>
          </div>
        </div>

        <div className="baseVertFlex absolute top-0 h-full xl:!left-24 tablet:left-8">
          <div className="baseVertFlex !items-start gap-1 rounded-md bg-offwhite p-8 text-primary shadow-md">
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
      <div className="baseVertFlex w-full gap-2 border-y-[1px] pb-4">
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
          <CarouselContent className="xl:w-[1200px] 2xl:w-[1500px]">
            <CarouselItem className="baseVertFlex basis-full gap-4 rounded-md p-4 tablet:basis-1/3">
              <Image
                src="/press/StarTribune.png"
                alt="Star Tribune"
                width={200}
                height={85}
              />
              <p className="text-center text-sm italic tablet:text-base">
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
              <p className="text-center text-sm italic tablet:text-base">
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
              <p className="text-center text-sm italic tablet:text-base">
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

        <div className="homepageFoodMasonry h-[500px] w-full max-w-sm tablet:h-[300px] tablet:max-w-2xl">
          <div className="firstMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[150%]">
              <Image
                src={"/masonryFood/one.jpg"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="!relative !size-full rounded-md"
              />
            </Parallax>
          </div>

          <div className="secondMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[150%]">
              <Image
                src={"/masonryFood/two.webp"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="!relative !size-full rounded-md"
              />
            </Parallax>
          </div>

          <div className="thirdMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[150%]">
              <Image
                src={"/masonryFood/three.jpg"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="!relative !size-full rounded-md"
              />
            </Parallax>
          </div>

          <div className="fourthMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[150%]">
              <Image
                src={"/masonryFood/four.jpg"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="!relative !size-full rounded-md"
              />
            </Parallax>
          </div>

          <div className="fifthMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[150%]">
              <Image
                src={"/masonryFood/five.jpg"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="!relative !size-full rounded-md"
              />
            </Parallax>
          </div>
        </div>

        {/* "Order directly through us" promo section */}
        <div className="baseVertFlex w-full max-w-sm rounded-md shadow-md tablet:hidden">
          {/* maybe have stock image of person holding a phone and you would have a proportionally
                tilted screenshot of the order page showing on their phone? think about it */}
          <div className="relative h-60 w-full overflow-hidden rounded-t-md">
            <Image
              src={"/rewardsPromo.jpg"}
              alt={"TODO: fill in w/ appropriate alt text"}
              fill
              style={{
                objectFit: "cover",
              }}
              className="!relative !top-0 !size-full !h-96 rounded-md !pb-32"
            />
          </div>
          <div className="baseVertFlex gap-4 p-4">
            <p className="text-lg font-medium">
              Order directly through us to receive mouthwatering benefits
            </p>
            <div className="baseVertFlex !items-start gap-4 pl-4">
              <div className="baseFlex gap-4">
                <MdOutlineMoneyOff className="size-6 shrink-0" />
                <p>Shop our lowest prices</p>
              </div>
              <div className="baseFlex gap-4">
                <BsSpeedometer2 className="size-6 shrink-0" />
                <p>
                  Priority service: Your orders jump to the front of the line
                </p>
              </div>
              <div className="baseFlex gap-4">
                <TfiReceipt className="size-6 shrink-0" />
                <p>
                  Rewards members earn points towards free meals with every
                  order
                </p>
              </div>
            </div>

            <Button asChild>
              <Link href="/order-now" className="my-4">
                Order now
              </Link>
            </Button>
          </div>
        </div>

        <div className="baseFlex !hidden w-full gap-16 py-8 tablet:!flex">
          <div className="baseVertFlex gap-4 p-4">
            <p className="text-lg font-medium">
              Order directly through us to receive mouthwatering benefits
            </p>
            <div className="baseVertFlex !items-start gap-4 pl-6">
              <div className="baseFlex gap-4">
                <MdOutlineMoneyOff className="size-6 shrink-0" />
                <p>Shop our lowest prices</p>
              </div>
              <div className="baseFlex gap-4">
                <BsSpeedometer2 className="size-6 shrink-0" />
                <p>
                  Priority service: Your orders jump to the front of the line
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
              <Link href="/order-now" className="mt-4 self-center">
                Order now
              </Link>
            </Button>
          </div>

          <div className="baseFlex relative size-72">
            {/* maybe have stock image of person holding a phone and you would have a proportionally
                tilted screenshot of the order page showing on their phone? think about it */}
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
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              viewport={{ once: true, amount: 0.5 }}
              className="absolute right-4 top-4 z-[-1] size-full rounded-md bg-primary"
            ></motion.div>
          </div>
        </div>

        {/* Meet the Chef promo section */}
        <div className="baseVertFlex w-full max-w-sm rounded-md shadow-md  tablet:hidden">
          <div className="relative h-60 w-full overflow-hidden rounded-t-md">
            <Image
              src={"/eric.webp"}
              alt={"TODO: fill in w/ appropriate alt text"}
              fill
              style={{
                objectFit: "cover",
                objectPosition: "top",
              }}
              className="!relative !top-0 !size-full !h-96 rounded-md !pb-16"
            />
          </div>
          <div className="baseVertFlex !items-start gap-4 p-4">
            <p className="text-lg font-medium">Meet the Chef</p>

            <p>
              Eric Pham is Lorem ipsum dolor sit amet, consectetur adipiscing
              elit, sed do eiusmod tempor incididunt ut labore et dolore magna
              aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>

            <Button variant={"link"} className="h-8 !p-0" asChild>
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
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              viewport={{ once: true, amount: 0.5 }}
              className="absolute left-4 top-4 z-[-1] size-full rounded-md bg-primary"
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
              <Link href="/about-us">Read more</Link>
            </Button>
          </div>
        </div>

        {/* Reservation promo section */}
        <div className="baseVertFlex w-full max-w-sm rounded-md shadow-md  tablet:hidden">
          <div className="relative h-60 w-full overflow-hidden rounded-t-md">
            <Image
              src={"/reservations.webp"}
              alt={"TODO: fill in w/ appropriate alt text"}
              fill
              style={{
                objectFit: "cover",
              }}
              className="!relative !top-0 !size-full !h-96 rounded-md !pb-24"
            />
          </div>
          <div className="baseVertFlex !items-start gap-2 p-4">
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
              initial={{ opacity: 0, y: -100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 200,
                damping: 20,
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
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.2 },
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              viewport={{ once: true, amount: 0.5 }}
              className="absolute right-4 top-4 z-[-1] size-full rounded-md bg-primary"
            ></motion.div>
          </div>
        </div>

        {/* masonry but prob more of just inside/outside the restaurant */}
        <div className="homepageInteriorMasonry h-[500px] w-full max-w-sm tablet:h-[300px] tablet:max-w-2xl">
          <div className="firstMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[115%]">
              <Image
                src={"/interior/one.webp"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "bottom",
                }}
                className="!relative !size-full rounded-md"
              />
            </Parallax>
          </div>

          <div className="secondMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[115%]">
              <Image
                src={"/interior/two.webp"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "bottom",
                }}
                className="!relative !size-full rounded-md"
              />
            </Parallax>
          </div>

          <div className="thirdMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[115%]">
              <Image
                src={"/interior/three.webp"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "bottom",
                }}
                className="!relative !size-full rounded-md"
              />
            </Parallax>
          </div>

          <div className="fourthMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[115%]">
              <Image
                src={"/interior/four.webp"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "bottom",
                }}
                className="!relative !size-full rounded-md"
              />
            </Parallax>
          </div>

          <div className="fifthMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
            <Parallax speed={-3} className="!absolute !top-0 !size-[125%]">
              <Image
                src={"/interior/five.webp"}
                alt={"TODO: fill in w/ appropriate alt text"}
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "bottom",
                }}
                className="!relative !size-full rounded-md"
              />
            </Parallax>
          </div>
        </div>

        {/* Rewards program promo section */}
        {isLoaded && !isSignedIn && (
          // <div
          //   style={
          //     {
          //       // background:
          //       //   "linear-gradient(to right bottom, oklch(0.9 0.13 87.8 / 1) 0%, rgb(212, 175, 55) 100%)",
          //       // border: "4px solid transparent" /* Set the border width */,
          //       // borderImage:
          //       //   "linear-gradient(to right bottom, oklch(0.9 0.13 87.8 / 1) 0%, rgb(212, 175, 55) 100%) 1 stretch",
          //     }
          //   }
          //   className="baseVertFlex rewardsGoldBorder w-full max-w-sm gap-4 rounded-md p-4 !pb-8 text-yellow-500 shadow-md tablet:max-w-2xl tablet:p-8"
          // >
          //   <div className="baseFlex gap-4">
          //     <SideAccentSwirls className="h-5 scale-x-[-1] fill-yellow-500" />

          //     <p className="text-center font-semibold tablet:text-lg">
          //       Join our rewards program today!
          //     </p>
          //     <SideAccentSwirls className="h-5 fill-yellow-500" />
          //   </div>

          //   {/* idk both left/justified and text-center look off here */}
          //   <p className="text-center">
          //     Valued customers enjoy exclusive rewards: earn points with every
          //     order to redeem for complimentary meals, gain early access to new
          //     dishes, and celebrate your birthday with a free dessert of your
          //     choice!
          //   </p>

          //   <WideFancySwirls />

          // </div>

          <div className="baseVertFlex mb-16 mt-8 max-w-xl gap-8 border-y-4 border-b-borderGold border-t-borderGold !p-6 text-primary shadow-md sm:!p-8 tablet:rounded-sm">
            <p className="text-center">
              Valued customers enjoy exclusive rewards: earn points with every
              order to redeem for complimentary meals, gain early access to new
              dishes, and celebrate your birthday with a free dessert of your
              choice!
            </p>

            <SignUpButton
              mode="modal"
              afterSignUpUrl={`${process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""}`}
              afterSignInUrl={`${process.env.NEXT_PUBLIC_DOMAIN_URL ?? ""}`}
            >
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
                    fill
                    className="!relative !h-36 !w-auto self-center rounded-md"
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
                    fill
                    className="!relative !h-36 !w-auto self-center rounded-md"
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
                    fill
                    className="!relative !h-36 !w-auto self-center rounded-md"
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
                    fill
                    className="!relative !h-36 !w-auto self-center rounded-md"
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
                    fill
                    className="!relative !h-36 !w-auto self-center rounded-md"
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
                    fill
                    className="!relative !h-36 !w-auto self-center rounded-md"
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
