import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MdOutlineMoneyOff } from "react-icons/md";
import { BsSpeedometer2 } from "react-icons/bs";
import { TfiReceipt } from "react-icons/tfi";
import { Clock, MapPin } from "lucide-react";
import { Parallax, ParallaxProvider } from "react-scroll-parallax";
import WideFancySwirls from "~/components/ui/wideFancySwirls";
import { HiOutlineNewspaper } from "react-icons/hi2";
import {
  Carousel,
  CarouselContent,
  type CarouselApi,
  CarouselItem,
} from "~/components/ui/carousel";
import { IoCalendarOutline } from "react-icons/io5";
import { Separator } from "~/components/ui/separator";
import { IoChatbox } from "react-icons/io5";
import { FaPhone } from "react-icons/fa6";
import { useMainStore } from "~/stores/MainStore";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import useHomepageIntersectionObserver from "~/hooks/useHomepageIntersectionObserver";
import StaticLotus from "~/components/ui/StaticLotus";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { useToast } from "~/components/ui/use-toast";
import { PrismaClient, type User } from "@prisma/client";
import { ToastAction } from "~/components/ui/toast";
import { getDefaultCustomizationChoices } from "~/utils/getDefaultCustomizationChoices";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { type GetStaticProps } from "next";

import topLeftHero from "/public/exterior/one.webp";
import topRightHero from "/public/food/heroOne.jpeg";
import bottomLeftHero from "/public/food/heroThree.webp";
import bottomRightHero from "/public/food/heroFour.jpg";

import khuesKitchenLogo from "/public/logos/khuesKitchenLogo.png";

import starTribuneLogo from "/public/media/starTribuneLogo.png";
import kare11Logo from "/public/media/kare11Logo.png";
import mprLogo from "/public/media/mprLogo.png";

import masonryFoodOne from "/public/food/one.jpg";
import masonryFoodTwo from "/public/food/two.webp";
import masonryFoodThree from "/public/food/three.jpg";
import masonryFoodFour from "/public/food/four.png";
import masonryFoodFive from "/public/food/five.jpg";

import rewardsPromo from "/public/homepage/rewardsPromo.jpg";
import eric from "/public/ourStory/eric.webp";
import reservations from "/public/reservations/reservations.webp";

import masonryInteriorOne from "/public/interior/one.webp";
import masonryInteriorTwo from "/public/interior/two.webp";
import masonryInteriorThree from "/public/interior/three.webp";
import masonryInteriorFour from "/public/interior/four.webp";
import masonryInteriorFive from "/public/interior/five.webp";

// interface Home {
//   ourFavoriteMenuItems: FullMenuItem[];
// }

export default function Home() {
  // { ourFavoriteMenuItems }: Home
  const {
    chatIsOpen,
    setChatIsOpen,
    setMobileHeroThresholdInView,
    viewportLabel,
  } = useMainStore((state) => ({
    chatIsOpen: state.chatIsOpen,
    setChatIsOpen: state.setChatIsOpen,
    setMobileHeroThresholdInView: state.setMobileHeroThresholdInView,
    viewportLabel: state.viewportLabel,
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
      className="baseVertFlex min-h-[calc(100dvh-5rem)] w-full !justify-start tablet:min-h-[calc(100dvh-6rem)]"
    >
      {/* Hero */}
      <div
        ref={mobileHeroRef}
        className="baseVertFlex relative h-[calc(100svh-5rem)] w-full gap-4 p-4 md:!hidden tablet:h-[calc(100svh-6rem)]"
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
              src={topLeftHero}
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
              src={topRightHero}
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
                    delay={1.6}
                    className="h-[14px] scale-x-[-1] fill-offwhite"
                  />
                  Order now
                  <SideAccentSwirls
                    delay={1.6}
                    className="h-[14px] fill-offwhite"
                  />
                </Link>
              </Button>

              <Button size={"lg"} variant={"outline"} asChild>
                <Link
                  href="/order"
                  className="baseFlex mt-2 w-[186px] gap-2 !px-4 shadow-md"
                >
                  Make a reservation
                  <IoCalendarOutline className="size-4 shrink-0" />
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
              src={bottomLeftHero}
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
              src={bottomRightHero}
              alt={"TODO: fill in w/ appropriate alt text"}
              priority
              sizes="33vw"
              className="!relative !size-full rounded-md object-cover"
            />
          </motion.div>
        </div>
      </div>

      <div className="baseFlex relative !hidden h-[calc(100svh-5rem)] w-full p-4 md:!flex tablet:h-[calc(100svh-6rem)]">
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
              src={topLeftHero}
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
              src={topRightHero}
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
                <p className=" text-xl text-stone-500 tablet:text-2xl">
                  A modern take on classic Vietnamese cuisine.
                </p>

                <div className="baseFlex mt-6 gap-4">
                  <Button size={"lg"} asChild>
                    <Link
                      href="/order"
                      className="baseFlex gap-2 !px-4 !py-6 !text-lg shadow-md"
                    >
                      <SideAccentSwirls
                        delay={1.6}
                        className="h-4 scale-x-[-1] fill-offwhite"
                      />
                      Order now
                      <SideAccentSwirls
                        delay={1.6}
                        className="h-4 fill-offwhite"
                      />
                    </Link>
                  </Button>

                  <Button size={"lg"} variant={"outline"} asChild>
                    <Link
                      href="/order"
                      className="baseFlex gap-3 !px-8 !py-6 !text-lg shadow-sm"
                    >
                      Make a reservation
                      <IoCalendarOutline />
                    </Link>
                  </Button>
                </div>

                <div className="baseFlex mt-4 gap-8">
                  <div className="baseFlex gap-2">
                    <Clock className="size-5 text-primary" />
                    <p className="text-sm text-stone-500">
                      Open 4:30pm - 9:30pm Wed-Sat
                    </p>
                  </div>

                  <div className="baseFlex gap-2">
                    <MapPin className="size-5 text-primary" />
                    <p className="text-sm text-stone-500">
                      St. Anthony Park, MN
                    </p>
                  </div>
                </div>
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
              src={bottomLeftHero}
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
              src={bottomRightHero}
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

        <div className="baseFlex gap-3 rounded-md rounded-t-none border border-t-0 bg-offwhite/40 p-2 px-8 font-medium shadow-sm tablet:text-xl">
          <HiOutlineNewspaper className="size-5" />
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
          style={{
            overflow: "hidden",
            ...(viewportLabel.includes("mobile") && {
              WebkitMask:
                "linear-gradient(90deg, hsl(40deg, 100%, 99%), white 20%, white 80%, hsla(144deg, 61%, 20%, 0.1))",
              mask: "linear-gradient(90deg, transparent, white 20%, white 80%, transparent)",
            }),
          }}
        >
          <CarouselContent className="relative mb-5 mt-3 xl:w-[800px] tablet:mb-4 tablet:mt-4">
            <CarouselItem className="baseVertFlex basis-[55%] gap-4 rounded-md tablet:basis-1/3">
              <Button variant={"text"} className="!p-0" asChild>
                <a
                  href="https://www.startribune.com/how-these-moms-shaped-the-next-generation-of-great-twin-cities-restaurateurs/600273728/?refresh=true"
                  className="baseFlex"
                >
                  <Image
                    src={starTribuneLogo}
                    alt="Star Tribune's logo"
                    width={216}
                    height={91.8}
                  />
                </a>
              </Button>
            </CarouselItem>
            <CarouselItem className="baseVertFlex basis-[55%] gap-4 rounded-md tablet:basis-1/3">
              <Button variant={"text"} className="!p-0" asChild>
                <a
                  href="https://www.kare11.com/article/news/local/mpls-chef-credits-his-mom-for-inspiration/89-0f237053-85cf-48ae-96f7-8cbebb780555"
                  className="baseFlex"
                >
                  <Image
                    src={kare11Logo}
                    alt="Kare 11's logo"
                    width={150}
                    height={63.75}
                  />
                </a>
              </Button>
            </CarouselItem>
            <CarouselItem className="baseVertFlex basis-[55%] gap-4 rounded-md tablet:basis-1/3">
              <Button variant={"text"} className="!p-0" asChild>
                <a
                  href="https://www.mprnews.org/story/2023/12/27/appetites-looks-back-on-2023-restaurants-vietnamese-meatballs-and-the-secret-to-entertaining"
                  className="baseFlex"
                >
                  <Image
                    src={mprLogo}
                    alt="MPR's logo"
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
          <div className="baseVertFlex w-full max-w-sm overflow-hidden rounded-md border shadow-md tablet:hidden">
            {/* maybe have stock image of person holding a phone and you would have a proportionally
                tilted screenshot of the order page showing on their phone? think about it */}
            <div className="relative h-60 w-full overflow-hidden shadow-md">
              <Image
                src={rewardsPromo}
                alt={"TODO: fill in w/ appropriate alt text"}
                width={384}
                className="!relative !top-0 !size-full !h-96 object-cover !pb-32"
              />
            </div>
            <div className="baseVertFlex relative gap-4 overflow-hidden rounded-b-md bg-gradient-to-br from-offwhite to-primary/10 p-4 pb-8">
              <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />

              <p className="text-lg font-medium leading-6">
                Enjoy exclusive benefits when you order direct
              </p>
              <div className="baseVertFlex mt-2 !items-start gap-4 pl-1">
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
              <StaticLotus className="absolute -right-5 -top-5 size-16 rotate-[-135deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />

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
          <div className="baseVertFlex w-full max-w-sm overflow-hidden rounded-md border shadow-md tablet:hidden">
            <div className="relative h-60 w-full overflow-hidden shadow-md">
              <Image
                src={eric}
                alt={
                  "Chef Eric Pham, owner of Khue's Kitchen, standing with arms crossed and smiling in front of a rustic door."
                }
                width={384}
                className="!relative !top-0 !size-full !h-96 rounded-none object-cover !object-top !pb-16"
              />
            </div>
            <div className="baseVertFlex relative !items-start gap-4 overflow-hidden rounded-b-md bg-gradient-to-br from-offwhite to-primary/10 p-4 pb-12">
              <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />

              <p className="text-lg font-medium">Meet the chef</p>

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
                <Link aria-label="Read more about our story" href="/our-story">
                  Read more
                </Link>
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
                  alt={
                    "Chef Eric Pham, owner of Khue's Kitchen, standing with arms crossed and smiling in front of a rustic door."
                  }
                  sizes="288px"
                  className="!relative !top-0 !size-full !h-96 rounded-md object-cover object-top"
                />
              </motion.div>
            </div>

            <div className="baseVertFlex relative mt-4 max-w-2xl !items-start gap-4 overflow-hidden rounded-md border bg-gradient-to-bl from-offwhite to-primary/10 p-6 pl-12 shadow-md">
              <StaticLotus className="absolute -left-5 -top-5 size-16 rotate-[135deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />

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
                <Link aria-label="Read more about our story" href="/our-story">
                  Read more
                </Link>
              </Button>
            </div>
          </div>

          {/* Reservation promo section */}
          <div className="baseVertFlex w-full max-w-sm overflow-hidden rounded-md border shadow-md tablet:hidden">
            <div className="relative h-60 w-full overflow-hidden shadow-md">
              <Image
                src={reservations}
                alt={"TODO: fill in w/ appropriate alt text"}
                width={384}
                className="!relative !top-0 !size-full !h-96 object-cover !pb-24"
              />
            </div>
            <div className="baseVertFlex relative !items-start gap-2 overflow-hidden rounded-b-md bg-gradient-to-br from-offwhite to-primary/10 p-4 pb-8">
              <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />

              <p className="text-lg font-medium leading-6">
                Celebrate with Us!
              </p>

              <p className="mt-4">
                Whether it&apos;s a birthday dinner or a casual catch-up,
                we&apos;re ready to host. Smaller parties are generally walk-in
                friendly, however we recommend booking ahead for larger groups.
                Reserve now and let us take care of the rest!
              </p>

              <div className="baseVertFlex mt-8 w-full gap-4">
                <Button
                  className="baseFlex gap-2"
                  onClick={() => setChatIsOpen(true)}
                >
                  Make a reservation
                  <IoCalendarOutline className="size-4 drop-shadow-md" />
                </Button>
              </div>
            </div>
          </div>

          <div className="baseFlex !hidden w-full gap-16 py-8 tablet:!flex">
            <div className="baseVertFlex relative mt-4 max-w-[610px] !items-start gap-2 overflow-hidden rounded-md border bg-gradient-to-br from-offwhite to-primary/10 p-6 pr-10 shadow-md">
              <StaticLotus className="absolute -right-5 -top-5 size-16 rotate-[-135deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />

              <p className="text-left text-lg font-medium">
                Celebrate with Us!
              </p>

              <p className="mt-2 text-left">
                Whether it&apos;s a birthday dinner or a casual catch-up,
                we&apos;re ready to host. Smaller parties are generally walk-in
                friendly, however we recommend booking ahead for larger groups.
                Reserve now and let us take care of the rest!
              </p>

              <div className="baseFlex mt-8 gap-4">
                <Button
                  className="baseFlex gap-2"
                  onClick={() => setChatIsOpen(!chatIsOpen)}
                >
                  Make a reservation
                  <IoCalendarOutline className="size-4 drop-shadow-md" />
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
                }}
                className="baseFlex w-full rounded-md border bg-gradient-to-br from-offwhite to-primary/10 pt-6 shadow-md"
              >
                <CarouselContent>
                  {ourFavoriteMenuItems?.map((menuItem) => (
                    <CarouselItem
                      key={menuItem.id}
                      className="baseVertFlex relative basis-full gap-4 rounded-md p-4 px-6 md:basis-1/2 xl:basis-1/4"
                    >
                      <OurFavoriteMenuItemCard
                        menuItem={menuItem}
                        user={null}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              <StaticLotus className="absolute -right-5 -top-5 size-16 rotate-[-135deg] fill-primary/50" />
              <StaticLotus className="absolute -left-5 -top-5 size-16 rotate-[135deg] fill-primary/50" />

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

// export const getStaticProps: GetStaticProps = async (ctx) => {
//   const prisma = new PrismaClient();

//   const ourFavoriteMenuItems = await prisma.menuItem.findMany({
//     where: {
//       isChefsChoice: true,
//     },
//     include: {
//       activeDiscount: true,
//       customizationCategories: {
//         include: {
//           customizationCategory: {
//             include: {
//               customizationChoices: {
//                 orderBy: {
//                   listOrder: "asc",
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//     orderBy: {
//       listOrder: "asc",
//     },
//   });

//   return {
//     props: {
//       ourFavoriteMenuItems,
//     },
//   };
// };

interface OurFavoriteMenuItemCard {
  menuItem: FullMenuItem;
  user: User | null | undefined;
}

function OurFavoriteMenuItemCard({ menuItem, user }: OurFavoriteMenuItemCard) {
  // const { orderDetails, getPrevOrderDetails, setPrevOrderDetails } =
  //   useMainStore((state) => ({
  //     orderDetails: state.orderDetails,
  //     getPrevOrderDetails: state.getPrevOrderDetails,
  //     setPrevOrderDetails: state.setPrevOrderDetails,
  //   }));

  // const { updateOrder } = useUpdateOrder();

  // const { toast, dismiss: dismissToasts } = useToast();

  const [addToOrderText, setAddToOrderText] = useState("Add to order");

  return (
    <>
      <Image
        src={"/menuItems/sampleImage.webp"}
        alt={`${menuItem.name} at Khue's in St. Paul`}
        width={160}
        height={160}
        className="select-none self-center rounded-md drop-shadow-md tablet:drop-shadow-lg"
      />
      <p className="select-none font-semibold">{menuItem.name}</p>
      <p className="line-clamp-3 select-none text-center text-sm">
        {menuItem.description}
      </p>
      <Button
        disabled={!menuItem.available || addToOrderText === "Added to order"}
        className="w-full select-none"
      >
        <AnimatePresence mode={"popLayout"} initial={false}>
          <motion.div
            key={`${menuItem.id}-${addToOrderText}`}
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
            {addToOrderText === "Add to order" && "Add to order"}

            {addToOrderText === "Added to order" && (
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className="size-6 text-offwhite"
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
    </>
  );
}

const ourFavoriteMenuItems = [
  {
    id: "702b5c80-7d63-43ef-a80f-948c64c21575",
    createdAt: "2024-05-15T21:32:32.217Z",
    name: "Stir-fried String Beans",
    description:
      "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
    price: 1400,
    altPrice: null,
    available: true,
    discontinued: false,
    listOrder: 15,
    hasImageOfItem: true,
    menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
    activeDiscountId: null,
    isChefsChoice: false,
    isAlcoholic: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    showUndercookedOrRawDisclaimer: false,
    pointReward: false,
    birthdayReward: false,
    reviews: null,
    activeDiscount: null,
    customizationCategories: [],
  },
  {
    id: "2315135f-19f4-4ede-9af7-0ffccadd2557",
    createdAt: "2024-05-15T21:28:07.340Z",
    name: "Chili Crunch Wings",
    description:
      "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
    price: 1200,
    altPrice: null,
    available: true,
    discontinued: false,
    listOrder: 28,
    hasImageOfItem: true,
    menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
    activeDiscountId: null,
    isChefsChoice: false,
    isAlcoholic: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    showUndercookedOrRawDisclaimer: false,
    pointReward: false,
    birthdayReward: false,
    reviews: null,
    activeDiscount: null,
    customizationCategories: [],
  },
  {
    id: "77207783-b518-45f5-b43d-9c058dc0994f",
    createdAt: "2024-05-15T21:32:32.217Z",
    name: "Fresh Bread",
    description:
      "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
    price: 1200,
    altPrice: null,
    available: true,
    discontinued: false,
    listOrder: 12,
    hasImageOfItem: true,
    menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
    activeDiscountId: null,
    isChefsChoice: false,
    isAlcoholic: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    showUndercookedOrRawDisclaimer: false,
    pointReward: false,
    birthdayReward: false,
    reviews: null,
    activeDiscount: null,
    customizationCategories: [],
  },
  {
    id: "7b0aa9eb-2a87-48cd-8c98-67b3f5a4b74f",
    createdAt: "2024-02-21T03:51:47.000Z",
    name: "Vietnamese Bar Nuts",
    description:
      "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
    price: 1200,
    altPrice: null,
    available: true,
    discontinued: false,
    listOrder: 1,
    hasImageOfItem: true,
    menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
    activeDiscountId: null,
    isChefsChoice: false,
    isAlcoholic: false,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    showUndercookedOrRawDisclaimer: false,
    pointReward: true,
    birthdayReward: false,
    reviews: null,
    activeDiscount: null,
    customizationCategories: [],
  },
  {
    id: "bca28f28-839f-4891-a147-95176dec9341",
    createdAt: "2024-05-15T11:32:32.000Z",
    name: "Crispy Pork Bao",
    description:
      "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
    price: 1400,
    altPrice: null,
    available: true,
    discontinued: false,
    listOrder: 14,
    hasImageOfItem: true,
    menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
    activeDiscountId: null,
    isChefsChoice: false,
    isAlcoholic: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    showUndercookedOrRawDisclaimer: false,
    pointReward: false,
    birthdayReward: false,
    reviews: null,
    activeDiscount: null,
    customizationCategories: [],
  },
  {
    id: "cab3e737-7b07-423f-9d9c-8bce07a9e3e2",
    createdAt: "2024-02-20T15:53:09.000Z",
    name: "Cream Cheese Wontons",
    description:
      "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
    price: 1100,
    altPrice: null,
    available: true,
    discontinued: false,
    listOrder: 2,
    hasImageOfItem: true,
    menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
    activeDiscountId: null,
    isChefsChoice: true,
    isAlcoholic: false,
    isVegetarian: false,
    isVegan: true,
    isGlutenFree: true,
    showUndercookedOrRawDisclaimer: false,
    pointReward: true,
    birthdayReward: false,
    reviews: null,
    activeDiscount: null,
    customizationCategories: [],
  },
  {
    id: "d531e6f4-7625-46c4-9fd2-c30d912c9025",
    createdAt: "2024-02-21T15:53:33.000Z",
    name: "Egg Rolls",
    description:
      "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
    price: 800,
    altPrice: null,
    available: true,
    discontinued: false,
    listOrder: 3,
    hasImageOfItem: true,
    menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
    activeDiscountId: null,
    isChefsChoice: false,
    isAlcoholic: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    showUndercookedOrRawDisclaimer: false,
    pointReward: false,
    birthdayReward: false,
    reviews: null,
    activeDiscount: null,
    customizationCategories: [],
  },
  {
    id: "d6fce425-ebd9-4022-99a4-babe0a5a81b1",
    createdAt: "2024-05-15T21:32:32.217Z",
    name: "Chicken Salad",
    description:
      "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
    price: 1400,
    altPrice: null,
    available: true,
    discontinued: false,
    listOrder: 13,
    hasImageOfItem: true,
    menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
    activeDiscountId: null,
    isChefsChoice: false,
    isAlcoholic: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    showUndercookedOrRawDisclaimer: false,
    pointReward: false,
    birthdayReward: false,
    reviews: null,
    activeDiscount: null,
    customizationCategories: [],
  },
  {
    id: "f61bf41d-ef94-428f-8a27-e979d8218690",
    createdAt: "2024-05-15T21:32:32.217Z",
    name: "Fried Shrimp",
    description:
      "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
    price: 1200,
    altPrice: null,
    available: true,
    discontinued: false,
    listOrder: 11,
    hasImageOfItem: true,
    menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
    activeDiscountId: null,
    isChefsChoice: false,
    isAlcoholic: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    showUndercookedOrRawDisclaimer: false,
    pointReward: false,
    birthdayReward: false,
    reviews: null,
    activeDiscount: null,
    customizationCategories: [],
  },
  {
    id: "f651ed75-a596-4a9f-8ba8-6dafd8ddd9de",
    createdAt: "2024-05-15T21:32:32.217Z",
    name: "Asian Fries",
    description:
      "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
    price: 1200,
    altPrice: null,
    available: true,
    discontinued: false,
    listOrder: 10,
    hasImageOfItem: true,
    menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
    activeDiscountId: null,
    isChefsChoice: false,
    isAlcoholic: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    showUndercookedOrRawDisclaimer: false,
    pointReward: false,
    birthdayReward: false,
    reviews: null,
    activeDiscount: null,
    customizationCategories: [],
  },
];
