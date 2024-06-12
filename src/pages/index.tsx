import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MdOutlineMoneyOff } from "react-icons/md";
import { BsSpeedometer2 } from "react-icons/bs";
import { TfiReceipt } from "react-icons/tfi";
import { SignUpButton, useAuth } from "@clerk/nextjs";
import { Parallax, ParallaxProvider } from "react-scroll-parallax";
import WideFancySwirls from "~/components/ui/wideFancySwirls";
import { HiOutlineNewspaper } from "react-icons/hi2";
import {
  Carousel,
  CarouselContent,
  type CarouselApi,
  CarouselItem,
} from "~/components/ui/carousel";
import { Separator } from "~/components/ui/separator";
import { IoChatbox } from "react-icons/io5";
import { FaPhone } from "react-icons/fa6";

import mobileHero from "/public/homepage/mobileHero.webp";
import topLeftTabletHero from "/public/homepage/heroTwo.webp";
import topRightTabletHero from "/public/homepage/heroOne.jpeg";
import bottomLeftTabletHero from "/public/homepage/heroThree.webp";
import bottomRightTabletHero from "/public/homepage/heroFour.jpg";

import khuesKitchenLogo from "/public/khuesKitchenLogo.png";

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
import { useMainStore } from "~/stores/MainStore";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import useHomepageIntersectionObserver from "~/hooks/useHomepageIntersectionObserver";
import StaticLotus from "~/components/ui/StaticLotus";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { useToast } from "~/components/ui/use-toast";
import { PrismaClient } from "@prisma/client";
import { ToastAction } from "~/components/ui/toast";
import { getDefaultCustomizationChoices } from "~/utils/getDefaultCustomizationChoices";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { type GetStaticProps } from "next";

interface Home {
  ourFavoriteMenuItems: FullMenuItem[];
}

export default function Home({ ourFavoriteMenuItems }: Home) {
  const { isLoaded, isSignedIn } = useAuth();

  const { chatIsOpen, setChatIsOpen, setMobileHeroThresholdInView } =
    useMainStore((state) => ({
      chatIsOpen: state.chatIsOpen,
      setChatIsOpen: state.setChatIsOpen,
      setMobileHeroThresholdInView: state.setMobileHeroThresholdInView,
    }));

  const mobileHeroRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setMobileHeroThresholdInView(entry?.isIntersecting ?? false);
      },
      {
        root: null,
        rootMargin: "0px 0px 0px 0px",
        threshold: 0.5,
      },
    );

    if (mobileHeroRef.current) {
      observer.observe(mobileHeroRef.current);
    }

    const internalMobileHeroRef = mobileHeroRef.current;

    return () => {
      if (internalMobileHeroRef) {
        observer.unobserve(internalMobileHeroRef);
      }

      setMobileHeroThresholdInView(false);
    };
  }, [setMobileHeroThresholdInView]);

  const [scrollDir, setScrollDir] = useState<"up" | "down">("down");

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollDir = () => {
      const scrollY = window.scrollY;
      if (scrollY > lastScrollY) {
        setScrollDir("down");
      } else {
        setScrollDir("up");
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener("scroll", updateScrollDir);
    return () => window.removeEventListener("scroll", updateScrollDir);
  }, []);

  // Not my favorite approach, ideally would like to have a single hook that can be used for all
  // and leverage arrays but the typing seemed to get messed up with this approach.
  const firstBackdropAnimation = useHomepageIntersectionObserver({
    threshold: 0.53,
    axis: "x",
    scrollDir,
  });
  const firstPromoImageAnimation = useHomepageIntersectionObserver({
    threshold: 0.75,
    axis: "y",
    scrollDir,
  });

  const secondBackdropAnimation = useHomepageIntersectionObserver({
    threshold: 0.53,
    axis: "x",
    scrollDir,
  });
  const secondPromoImageAnimation = useHomepageIntersectionObserver({
    threshold: 0.75,
    axis: "y",
    scrollDir,
  });

  const thirdBackdropAnimation = useHomepageIntersectionObserver({
    threshold: 0.53,
    axis: "x",
    scrollDir,
  });
  const thirdPromoImageAnimation = useHomepageIntersectionObserver({
    threshold: 0.75,
    axis: "y",
    scrollDir,
  });

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
      <div
        ref={mobileHeroRef}
        className="baseVertFlex relative h-[calc(100svh-6rem)] w-full gap-4 p-4 md:!hidden tablet:h-[calc(100svh-7rem)]"
      >
        <div className="relative grid size-full grid-cols-3 grid-rows-1 gap-4">
          {/* top left */}
          <motion.div
            initial={{ filter: "blur(5px)", opacity: 0, scale: 0.75 }}
            animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
            transition={{
              ease: "easeOut",
              delay: 0.2,
              duration: 0.7,
              scale: {
                type: "spring",
                duration: 0.7,
              },
            }}
            className="relative col-span-1 row-span-1 size-full overflow-hidden rounded-md shadow-md"
          >
            <Image
              src={topLeftTabletHero}
              alt={"TODO: fill in w/ appropriate alt text"}
              priority
              sizes="33vw"
              className="!relative !size-full rounded-md object-cover"
            />
          </motion.div>

          {/* top right */}
          <motion.div
            initial={{ filter: "blur(5px)", opacity: 0, scale: 0.75 }}
            animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
            transition={{
              ease: "easeOut",
              duration: 0.7,
              delay: 0.5,
              scale: {
                type: "spring",
                duration: 0.7,
              },
            }}
            className="relative col-span-2 row-span-1 size-full overflow-hidden rounded-md shadow-md"
          >
            <Image
              src={topRightTabletHero}
              alt={"TODO: fill in w/ appropriate alt text"}
              priority
              sizes="66vw"
              className="!relative !size-full rounded-md object-cover"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ filter: "blur(5px)", opacity: 0, scale: 0.75 }}
          animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
          transition={{
            ease: "easeOut",
            duration: 0.7,
            delay: 0.8,
            scale: {
              type: "spring",
              duration: 0.7,
            },
          }}
          className="baseVertFlex w-full"
        >
          <section className="baseFlex w-full rounded-md border bg-gradient-to-br from-offwhite to-primary/10 py-4 pl-6 shadow-sm ">
            <Image
              src={khuesKitchenLogo}
              alt={"TODO: fill in w/ appropriate alt text"}
              priority
              className="h-[152px] w-[80.5px] drop-shadow-md sm:h-[190px] sm:w-[100.625px]"
            />
            <div className="baseVertFlex gap-1 rounded-md">
              {/* experimenting with stone-800 instead of black */}
              <h1 className="text-center text-xl font-bold text-stone-800 sm:text-2xl">
                Welcome to Khue&apos;s
              </h1>
              <p className="w-64 text-center text-base leading-5 text-stone-500 sm:w-72 sm:text-lg sm:leading-6">
                A modern take on classic Vietnamese cuisine.
              </p>

              <Button size={"lg"} asChild>
                <Link
                  href="/order"
                  className="baseFlex mt-4 gap-2 !px-4 shadow-md"
                >
                  <SideAccentSwirls
                    delay={1.75}
                    className="h-[14px] scale-x-[-1] fill-offwhite"
                  />
                  Order now
                  <SideAccentSwirls
                    delay={1.75}
                    className="h-[14px] fill-offwhite"
                  />
                </Link>
              </Button>
            </div>
          </section>
        </motion.div>

        <div className="relative grid size-full grid-cols-3 grid-rows-1 gap-4">
          {/* bottom left */}
          <motion.div
            initial={{ filter: "blur(5px)", opacity: 0, scale: 0.75 }}
            animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
            transition={{
              ease: "easeOut",
              duration: 0.7,
              delay: 1.1,
              scale: {
                type: "spring",
                duration: 0.7,
              },
            }}
            className="relative !top-0 col-span-2 row-span-1 size-full overflow-hidden rounded-md shadow-md"
          >
            <Image
              src={bottomLeftTabletHero}
              alt={"TODO: fill in w/ appropriate alt text"}
              priority
              sizes="66vw"
              className="!relative !size-full rounded-md object-cover"
            />
          </motion.div>

          {/* bottom right */}
          <motion.div
            initial={{ filter: "blur(5px)", opacity: 0, scale: 0.75 }}
            animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
            transition={{
              ease: "easeOut",
              duration: 0.7,
              delay: 1.4,
              scale: {
                type: "spring",
                duration: 0.7,
              },
            }}
            className="relative !top-0 col-span-1 row-span-1 size-full overflow-hidden rounded-md shadow-md"
          >
            <Image
              src={bottomRightTabletHero}
              alt={"TODO: fill in w/ appropriate alt text"}
              priority
              sizes="33vw"
              className="!relative !size-full rounded-md object-cover"
            />
          </motion.div>
        </div>
      </div>

      <div className="baseFlex relative !hidden h-[calc(100svh-6rem)] w-full p-4 md:!flex tablet:h-[calc(100svh-7rem)]">
        <div className="relative grid size-full grid-cols-3 grid-rows-3 gap-4">
          {/* top left */}
          <motion.div
            initial={{ filter: "blur(5px)", opacity: 0, scale: 0.75 }}
            animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
            transition={{
              ease: "easeOut",
              delay: 0.2,
              duration: 0.7,
              scale: {
                type: "spring",
                duration: 0.7,
              },
            }}
            className="relative col-span-1 row-span-2 size-full overflow-hidden rounded-md shadow-md"
          >
            <Image
              src={topLeftTabletHero}
              alt={"TODO: fill in w/ appropriate alt text"}
              priority
              sizes="33vw"
              className="!relative !size-full rounded-md object-cover"
            />
          </motion.div>

          {/* top right */}
          <motion.div
            initial={{ filter: "blur(5px)", opacity: 0, scale: 0.75 }}
            animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
            transition={{
              ease: "easeOut",
              duration: 0.7,
              delay: 0.5,
              scale: {
                type: "spring",
                duration: 0.7,
              },
            }}
            className="relative col-span-2 row-span-2 size-full overflow-hidden rounded-md shadow-md"
          >
            <Image
              src={topRightTabletHero}
              alt={"TODO: fill in w/ appropriate alt text"}
              priority
              sizes="66vw"
              className="!relative !size-full rounded-md object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ filter: "blur(5px)", opacity: 0, scale: 0.75 }}
            animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
            transition={{
              ease: "easeOut",
              duration: 0.7,
              delay: 0.8,
              scale: {
                type: "spring",
                duration: 0.7,
              },
            }}
            className="baseVertFlex absolute top-0 z-10 h-full md:left-8 xl:!left-16 2xl:!left-24"
          >
            <section className="baseFlex gap-12 rounded-md border bg-offwhite bg-gradient-to-br from-offwhite to-primary/10 py-8 pl-12 pr-16 shadow-lightHeroContainer">
              <Image
                src={khuesKitchenLogo}
                alt={"TODO: fill in w/ appropriate alt text"}
                priority
                className="h-[228px] w-[120.75px] drop-shadow-md"
              />
              <div className="baseVertFlex !items-start gap-1 rounded-md">
                {/* experimenting with stone-800 instead of black */}
                <h1 className="text-3xl font-bold text-stone-800 tablet:text-4xl">
                  Welcome to Khue&apos;s
                </h1>
                <p className="w-72 text-xl text-stone-500 tablet:text-2xl">
                  A modern take on classic Vietnamese cuisine.
                </p>

                <Button size={"lg"} asChild>
                  <Link
                    href="/order"
                    className="baseFlex mt-6 gap-2 !px-4 !py-6 !text-lg shadow-md "
                  >
                    <SideAccentSwirls
                      delay={1.75}
                      className="h-4 scale-x-[-1] fill-offwhite"
                    />
                    Order now
                    <SideAccentSwirls
                      delay={1.75}
                      className="h-4 fill-offwhite"
                    />
                  </Link>
                </Button>
              </div>
            </section>
          </motion.div>

          {/* bottom left */}
          <motion.div
            initial={{ filter: "blur(5px)", opacity: 0, scale: 0.75 }}
            animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
            transition={{
              ease: "easeOut",
              duration: 0.7,
              delay: 1.1,
              scale: {
                type: "spring",
                duration: 0.7,
              },
            }}
            className="relative !top-0 col-span-1 row-span-1 size-full overflow-hidden rounded-md shadow-md"
          >
            <Image
              src={bottomLeftTabletHero}
              alt={"TODO: fill in w/ appropriate alt text"}
              priority
              sizes="33vw"
              className="!relative !size-full rounded-md object-cover "
            />
          </motion.div>

          {/* bottom right */}
          <motion.div
            initial={{ filter: "blur(5px)", opacity: 0, scale: 0.75 }}
            animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
            transition={{
              ease: "easeOut",
              duration: 0.7,
              delay: 1.4,
              scale: {
                type: "spring",
                duration: 0.7,
              },
            }}
            className="relative !top-0 col-span-2 row-span-1 size-full overflow-hidden rounded-md shadow-md"
          >
            <Image
              src={bottomRightTabletHero}
              alt={"TODO: fill in w/ appropriate alt text"}
              priority
              sizes="66vw"
              className="!relative !size-full rounded-md object-cover"
            />
          </motion.div>
        </div>
      </div>

      {/* Press Reviews */}
      <div className="baseVertFlex relative w-full overflow-hidden border-y-[1px] bg-gradient-to-br from-offwhite to-primary/10 pb-4">
        <StaticLotus className="absolute -right-8 -top-8 size-24 rotate-[-135deg] fill-primary/50 " />
        <StaticLotus className="absolute -bottom-8 -left-8 size-24 rotate-[45deg] fill-primary/50 " />

        {/* <StaticLotus className="absolute bottom-8 right-[5%] w-[8%] fill-primary/50" />
        <StaticLotus className="absolute bottom-8 left-[5%] w-[8%] fill-primary/50" /> */}

        {/* maybe somehow do an alternating pattern (reg, 180deg, reg) as the background? */}

        <div className="baseFlex gap-3 rounded-md rounded-t-none border border-t-0 bg-offwhite/40 p-2 px-8 font-medium shadow-sm tablet:text-xl">
          <HiOutlineNewspaper />
          Find us on
        </div>
        <Carousel
          setApi={setPressReviewsApi}
          opts={{
            breakpoints: {
              "(min-width: 1000px)": {
                active: false,
              },
            },
            loop: true,
          }}
        >
          <CarouselContent className="mb-5 mt-3 xl:w-[800px] tablet:mb-4 tablet:mt-4">
            <CarouselItem className="baseVertFlex basis-full gap-4 rounded-md tablet:basis-1/3">
              <Button variant={"text"} className="!p-0" asChild>
                <a
                  href="https://www.startribune.com/how-these-moms-shaped-the-next-generation-of-great-twin-cities-restaurateurs/600273728/?refresh=true"
                  className="baseFlex"
                >
                  <Image
                    src={starTribuneLogo}
                    alt="Star Tribune Logo"
                    width={216}
                    height={91.8}
                  />
                </a>
              </Button>
            </CarouselItem>
            <CarouselItem className="baseVertFlex basis-full gap-4 rounded-md tablet:basis-1/3">
              <Button variant={"text"} className="!p-0" asChild>
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
              </Button>
            </CarouselItem>
            <CarouselItem className="baseVertFlex basis-full gap-4 rounded-md tablet:basis-1/3">
              <Button variant={"text"} className="!p-0" asChild>
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
              </Button>
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

      <ParallaxProvider scrollAxis="vertical">
        {/* wrapping (prob just for padding?) container of promo sections below */}
        <div className="baseVertFlex w-full gap-16 p-8 pb-16">
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
                  priority // I feel like this shouldn't be necessary, but the image wasn't auto-loading
                  // when it came into the viewport otherwise
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
            <div className="baseVertFlex relative gap-4 overflow-hidden bg-gradient-to-br from-offwhite to-primary/10 p-4 pb-8">
              <StaticLotus className="absolute -bottom-6 -right-4 h-16 w-16 rotate-[-45deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-6 -left-4 h-16 w-16 rotate-[45deg] fill-primary/50" />

              <p className="text-lg font-medium">
                Enjoy exclusive benefits when you order direct
              </p>
              <div className="baseVertFlex mt-2 !items-start gap-4 pl-4">
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

              <Button size={"lg"} asChild>
                <Link
                  href="/order"
                  className="baseFlex my-2 mt-4 gap-2 !px-4 !text-base shadow-md"
                >
                  <SideAccentSwirls className="h-[14px] scale-x-[-1] fill-offwhite" />
                  Order now
                  <SideAccentSwirls className="h-[14px] fill-offwhite" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="baseFlex !hidden w-full gap-16 py-8 tablet:!flex">
            <div className="baseVertFlex relative mt-6 !items-start gap-4 overflow-hidden rounded-md border bg-gradient-to-br from-offwhite to-primary/10 p-6 shadow-md">
              <StaticLotus className="absolute -right-4 -top-6 h-16 w-16 rotate-[-135deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-6 -right-4 h-16 w-16 rotate-[-45deg] fill-primary/50" />

              <p className="text-lg font-medium">
                Enjoy exclusive benefits when you order direct
              </p>
              <div className="baseVertFlex mt-2 !items-start gap-4">
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

              <Button size={"lg"} asChild>
                <Link
                  href="/order"
                  className="baseFlex mt-4 gap-2 self-center !px-4 !text-base shadow-md"
                >
                  <SideAccentSwirls className="h-[14px] scale-x-[-1] fill-offwhite" />
                  Order now
                  <SideAccentSwirls className="h-[14px] fill-offwhite" />
                </Link>
              </Button>
            </div>

            <div className="baseFlex relative size-72">
              <motion.div
                ref={firstBackdropAnimation.elementRef}
                initial={{ opacity: 0, x: 50 }}
                animate={firstBackdropAnimation.controls}
                transition={{
                  opacity: { duration: 0.2 },
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
                className="absolute right-4 top-4 size-full rounded-md bg-gradient-to-br from-primary to-darkPrimary"
              ></motion.div>

              {/* maybe have stock image of person holding a phone and you would have a proportionally
                tilted screenshot of the order page showing on their phone? think about it */}
              <motion.div
                ref={firstPromoImageAnimation.elementRef}
                initial={{ opacity: 0, y: -50, filter: "blur(5px)" }}
                animate={firstPromoImageAnimation.controls}
                transition={{
                  opacity: { duration: 0.2 },
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
                className="absolute left-0 top-0 h-72 w-full overflow-hidden rounded-md shadow-md"
              >
                <Image
                  src={rewardsPromo}
                  alt={"TODO: fill in w/ appropriate alt text"}
                  sizes="500px"
                  className="!relative !top-0 !size-full !h-96 rounded-md object-cover !pb-8"
                />
              </motion.div>
            </div>
          </div>

          {/* Meet the Chef promo section */}
          <div className="baseVertFlex w-full max-w-sm rounded-md shadow-md tablet:hidden">
            <div className="relative h-60 w-full overflow-hidden rounded-t-md">
              <Image
                src={eric}
                alt={"TODO: fill in w/ appropriate alt text"}
                width={384}
                className="!relative !top-0 !size-full !h-96 rounded-md object-cover !object-top !pb-16"
              />
            </div>
            <div className="baseVertFlex relative !items-start gap-4 overflow-hidden bg-gradient-to-br from-offwhite to-primary/10 p-4 pb-12">
              <StaticLotus className="absolute -bottom-6 -right-4 h-16 w-16 rotate-[-45deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-6 -left-4 h-16 w-16 rotate-[45deg] fill-primary/50" />

              <p className="text-lg font-medium">Meet the Chef</p>

              <p>
                Eric Pham, chef and owner of Khue&apos;s, carries forward the
                culinary legacy of his mother, Khue Pham, by reimagining
                Vietnamese cuisine with bold, traditional flavors and modern
                techniques. Shaped by his early experiences at his family&apos;s
                restaurant and rigorous training at Spoon and Stable, Eric is
                dedicated to honoring his cultural heritage and sharing it with
                a new generation of diners.
              </p>

              <Button variant={"link"} className="h-8 !p-0" asChild>
                <Link href="/our-story">Read more</Link>
              </Button>
            </div>
          </div>

          <div className="baseFlex !hidden w-full gap-16 py-8 tablet:!flex">
            <div className="baseFlex relative size-72">
              <motion.div
                ref={secondBackdropAnimation.elementRef}
                initial={{ opacity: 0, x: -50 }}
                animate={secondBackdropAnimation.controls}
                transition={{
                  opacity: { duration: 0.2 },
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
                className="absolute left-4 top-4 size-full rounded-md bg-gradient-to-bl from-primary to-darkPrimary"
              ></motion.div>

              <motion.div
                ref={secondPromoImageAnimation.elementRef}
                initial={{ opacity: 0, y: -50, filter: "blur(5px)" }}
                animate={secondPromoImageAnimation.controls}
                transition={{
                  opacity: { duration: 0.2 },
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
                className="absolute left-0 top-0 h-72 w-full overflow-hidden rounded-md shadow-md"
              >
                <Image
                  src={eric}
                  alt={"TODO: fill in w/ appropriate alt text"}
                  sizes="288px"
                  className="!relative !top-0 !size-full !h-96 rounded-md object-cover object-top"
                />
              </motion.div>
            </div>

            <div className="baseVertFlex relative mt-4 max-w-2xl !items-start gap-4 overflow-hidden rounded-md border bg-gradient-to-bl from-offwhite to-primary/10 p-6 pl-12 shadow-md">
              <StaticLotus className="absolute -left-4 -top-6 h-16 w-16 rotate-[135deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-6 -left-4 h-16 w-16 rotate-[45deg] fill-primary/50" />

              <p className="text-lg font-medium">Meet the chef</p>

              <p className="max-w-lg xl:max-w-full">
                Eric Pham, chef and owner of Khue&apos;s, carries forward the
                culinary legacy of his mother, Khue Pham, by reimagining
                Vietnamese cuisine with bold, traditional flavors and modern
                techniques. Shaped by his early experiences at his family&apos;s
                restaurant and rigorous training at Spoon and Stable, Eric is
                dedicated to honoring his cultural heritage and sharing it with
                a new generation of diners.
              </p>

              <Button variant={"link"} className="h-8 !p-0" asChild>
                <Link href="/our-story">Read more</Link>
              </Button>
            </div>
          </div>

          {/* Reservation promo section */}
          <div className="baseVertFlex w-full max-w-sm rounded-md shadow-md tablet:hidden">
            <div className="relative h-60 w-full overflow-hidden rounded-t-md">
              <Image
                src={reservations}
                alt={"TODO: fill in w/ appropriate alt text"}
                width={384}
                className="!relative !top-0 !size-full !h-96 rounded-md object-cover !pb-24"
              />
            </div>
            <div className="baseVertFlex relative !items-start gap-2 overflow-hidden bg-gradient-to-br from-offwhite to-primary/10 p-4 pb-8">
              <StaticLotus className="absolute -bottom-6 -right-4 h-16 w-16 rotate-[-45deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-6 -left-4 h-16 w-16 rotate-[45deg] fill-primary/50" />

              <p className="text-lg font-medium leading-6">
                Planning a birthday dinner or get together with your friends?
              </p>

              <p className="mt-4">
                Secure your spot for larger parties. For parties of 4 or less,
                reservations are usually not needed. However, to guarantee your
                seats for larger groups, please get in touch with us.
              </p>

              <div className="baseVertFlex mt-8 w-full gap-4">
                <Button
                  className="baseFlex gap-2"
                  onClick={() => setChatIsOpen(true)}
                >
                  Send us a message
                  <IoChatbox className="size-5 drop-shadow-md" />
                </Button>

                <Separator
                  orientation="vertical"
                  className="mt-2 h-[1px] w-1/2 bg-stone-400"
                />

                <Button variant="link" className="h-8 px-1" asChild>
                  <a href="tel:+1234567890" className="baseFlex gap-2">
                    <FaPhone size={"0.75rem"} />
                    (234) 567-8900
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="baseFlex !hidden w-full gap-16 py-8  tablet:!flex">
            <div className="baseVertFlex relative mt-4 max-w-[600px] gap-2 overflow-hidden rounded-md border bg-gradient-to-br from-offwhite to-primary/10 p-6 pr-8 shadow-md">
              <StaticLotus className="absolute -right-4 -top-6 h-16 w-16 rotate-[-135deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-6 -right-4 h-16 w-16 rotate-[-45deg] fill-primary/50" />

              <p className="text-lg font-medium">
                Planning a birthday dinner or get together with your friends?
              </p>

              <p className="mt-2 text-center">
                Secure your spot for larger parties. For parties of 4 or less,
                reservations are usually not needed. However, to guarantee your
                seats for larger groups, please get in touch with us.
              </p>

              <div className="baseFlex mt-8 gap-4">
                <Button
                  className="baseFlex gap-2"
                  onClick={() => setChatIsOpen(!chatIsOpen)}
                >
                  Send us a message
                  <IoChatbox className="size-5 drop-shadow-md" />
                </Button>

                <Separator
                  orientation="vertical"
                  className="h-6 w-[1px] bg-stone-400"
                />

                <Button variant="link" className="h-8 px-1" asChild>
                  <a href="tel:+1234567890" className="baseFlex gap-2">
                    <FaPhone size={"0.75rem"} />
                    (234) 567-8900
                  </a>
                </Button>
              </div>
            </div>

            <div className="baseFlex relative size-72">
              <motion.div
                ref={thirdBackdropAnimation.elementRef}
                initial={{ opacity: 0, x: 50 }}
                animate={thirdBackdropAnimation.controls}
                transition={{
                  opacity: { duration: 0.2 },
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
                className="absolute right-4 top-4 size-full rounded-md bg-gradient-to-br from-primary to-darkPrimary"
              ></motion.div>

              <motion.div
                ref={thirdPromoImageAnimation.elementRef}
                initial={{ opacity: 0, y: -50, filter: "blur(5px)" }}
                animate={thirdPromoImageAnimation.controls}
                transition={{
                  opacity: { duration: 0.2 },
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
                className="absolute left-0 top-0 h-72 w-full overflow-hidden rounded-md shadow-md"
              >
                <Image
                  src={reservations}
                  alt={"TODO: fill in w/ appropriate alt text"}
                  sizes="750px"
                  className="!relative !top-0 !size-full !h-96 rounded-md object-cover !pb-16"
                />
              </motion.div>
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
            <div className="baseVertFlex relative mb-16 mt-8 w-screen max-w-xl gap-8 overflow-hidden border-y-4 border-y-gold bg-offwhite !p-6 text-primary shadow-md sm:rounded-sm sm:!p-8">
              <StaticLotus className="absolute -right-4 -top-6 h-16 w-16 rotate-[-135deg] fill-gold/80" />
              <StaticLotus className="absolute -left-4 -top-6 h-16 w-16 rotate-[135deg] fill-gold/80" />
              <StaticLotus className="absolute -bottom-6 -right-4 h-16 w-16 rotate-[-45deg] fill-gold/80" />
              <StaticLotus className="absolute -bottom-6 -left-4 h-16 w-16 rotate-[45deg] fill-gold/80" />

              <span className="w-64 text-center font-semibold sm:w-auto">
                Join Khue&apos;s Rewards and unlock exclusive benefits!
              </span>
              <span className="text-center text-sm tablet:text-base">
                With every order, you&apos;ll earn points which can be redeemed
                for complimentary meals. Plus, get early access to new dishes
                and celebrate your birthday with a free dessert of your choice!
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

              <WideFancySwirls className="h-14 fill-primary sm:h-16" />
            </div>
          )}

          {/* Explore Our Favorites section */}
          <div className="baseVertFlex mb-8 max-w-[350px] gap-4 sm:max-w-md xl:!max-w-6xl tablet:max-w-2xl">
            <p className="text-lg font-medium tablet:text-xl">
              Explore Our Favorites
            </p>

            <div className="baseVertFlex relative w-full gap-4 overflow-hidden rounded-md">
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
                className="baseFlex w-full rounded-md border bg-gradient-to-br from-offwhite to-primary/10 shadow-md"
              >
                <CarouselContent>
                  {ourFavoriteMenuItems?.map((menuItem) => (
                    <CarouselItem
                      key={menuItem.id}
                      className="baseVertFlex relative basis-full gap-4 rounded-md p-4 px-6 md:basis-1/2 xl:basis-1/4"
                    >
                      <OurFavoriteMenuItemCard menuItem={menuItem} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              <StaticLotus className="absolute -right-4 -top-6 h-16 w-16 rotate-[-135deg] fill-primary/50" />
              <StaticLotus className="absolute -left-4 -top-6 h-16 w-16 rotate-[135deg] fill-primary/50" />

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
      </ParallaxProvider>
    </motion.div>
  );
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const prisma = new PrismaClient();

  const ourFavoriteMenuItems = await prisma.menuItem.findMany({
    where: {
      isChefsChoice: true,
    },
    include: {
      activeDiscount: true,
      customizationCategories: {
        include: {
          customizationCategory: {
            include: {
              customizationChoices: {
                orderBy: {
                  listOrder: "asc",
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      listOrder: "asc",
    },
  });

  return {
    props: {
      ourFavoriteMenuItems,
    },
  };
};

interface OurFavoriteMenuItemCard {
  menuItem: FullMenuItem;
}

function OurFavoriteMenuItemCard({ menuItem }: OurFavoriteMenuItemCard) {
  const { orderDetails, getPrevOrderDetails, setPrevOrderDetails } =
    useMainStore((state) => ({
      orderDetails: state.orderDetails,
      getPrevOrderDetails: state.getPrevOrderDetails,
      setPrevOrderDetails: state.setPrevOrderDetails,
    }));

  const { updateOrder } = useUpdateOrder();

  const { toast, dismiss: dismissToasts } = useToast();

  return (
    <>
      <Image
        src={"/menuItems/sampleImage.webp"}
        alt={"TODO: Fix later"}
        width={160}
        height={160}
        className="select-none self-center rounded-md drop-shadow-md tablet:drop-shadow-lg"
      />
      <p className="select-none font-semibold">{menuItem.name}</p>
      <p className="line-clamp-3 select-none text-center text-sm">
        {menuItem.description}
      </p>
      <Button
        disabled={!menuItem.available}
        className="w-full select-none"
        onClick={() => {
          // set prev order details so we can revert if necessary
          // with toast's undo button
          setPrevOrderDetails(orderDetails);

          toast({
            description: `${menuItem.name} was added to your order.`,
            action: (
              <ToastAction
                altText={`Undo the addition of ${menuItem.name} to your order.`}
                onClick={() => {
                  updateOrder({
                    newOrderDetails: getPrevOrderDetails(),
                  });
                }}
              >
                Undo
              </ToastAction>
            ),
          });

          // directly add to order w/ defaults + trigger toast notification

          updateOrder({
            newOrderDetails: {
              ...orderDetails,
              items: [
                ...orderDetails.items,
                {
                  id:
                    orderDetails.items.length === 0
                      ? 0
                      : orderDetails.items.at(-1)!.id + 1,
                  itemId: menuItem.id,
                  name: menuItem.name,
                  customizations: getDefaultCustomizationChoices(menuItem),
                  specialInstructions: "",
                  includeDietaryRestrictions: false,
                  quantity: 1,
                  price: menuItem.price,
                  isChefsChoice: menuItem.isChefsChoice,
                  isAlcoholic: menuItem.isAlcoholic,
                  isVegetarian: menuItem.isVegetarian,
                  isVegan: menuItem.isVegan,
                  isGlutenFree: menuItem.isGlutenFree,
                  showUndercookedOrRawDisclaimer:
                    menuItem.showUndercookedOrRawDisclaimer,
                  discountId: menuItem.activeDiscount?.id ?? null,
                  birthdayReward: false,
                  pointReward: false,
                },
              ],
            },
          });
        }}
      >
        Add to order
      </Button>
    </>
  );
}
