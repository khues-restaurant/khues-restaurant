import { motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HiOutlineNewspaper } from "react-icons/hi2";
import { IoCalendarOutline } from "react-icons/io5";
import { Parallax, ParallaxProvider } from "react-scroll-parallax";
import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/components/ui/carousel";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import StaticLotus from "~/components/ui/StaticLotus";
import useHomepageIntersectionObserver from "~/hooks/useHomepageIntersectionObserver";
import { useMainStore } from "~/stores/MainStore";

import khuesKitchenLogo from "public/logos/khuesKitchenLogo.png";

import topLeftHero from "public/ourStory/cropped-khues-kitchen.png";
import topRightHero from "public/menuItems/spicy-chicken-sando.jpg";
import bottomLeftHero from "public/miscFood/patio-trio.jpg";
import bottomRightHero from "public/interior/three.jpg";

import kare11Logo from "public/media/kare11Logo.png";
import mprLogo from "public/media/mprLogo.png";
import starTribuneLogo from "public/media/starTribuneLogo.png";
import WCCOLogo from "public/media/WCCOLogo";
import heavyTableLogo from "public/media/heavyTableLogo.png";
import theTastingNotesLogo from "public/media/theTastingNotesLogo.png";
import mspMagLogo from "public/media/mspMagLogo.png";

import top30StarTribune from "public/media/top30StarTribune.jpg";
import eric from "public/ourStory/eric.webp";
import ericUpscaled from "public/ourStory/ericUpscaled.jpg";
import reservations from "public/interior/reservations.jpg";

import masonryFoodOne from "public/menuItems/sticky-jicama-ribs.png";
import masonryFoodTwo from "public/menuItems/cream-cheese-wantons.png";
import masonryFoodThree from "public/menuItems/coffee.png";
import masonryFoodFour from "public/menuItems/thai-tea-tres-leches.png";
import masonryFoodFive from "public/menuItems/roast-pork-fried-rice.png";
import masonryFoodSix from "public/menuItems/affogato.png";

import masonryInteriorSix from "public/interior/one.jpg";
import masonryInteriorEight from "public/interior/two.jpg";
import masonryInteriorTen from "public/interior/three.jpg";
import masonryInteriorNine from "public/interior/four.jpg";
import masonryInteriorSeven from "public/exterior/three.jpg";

export default function Home() {
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

  useEffect(() => {
    if (!pressReviewsApi) {
      return;
    }

    setPressReviewsSlide(pressReviewsApi.selectedScrollSnap());

    pressReviewsApi.on("select", () => {
      setPressReviewsSlide(pressReviewsApi.selectedScrollSnap());
    });

    // eventually add proper cleanup functions here
  }, [pressReviewsApi]);

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
      {/* Mobile Hero */}
      <div
        ref={mobileHeroRef}
        className="baseVertFlex relative h-[calc(100svh-5rem)] w-full gap-4 p-4 md:!hidden tablet:h-[calc(100svh-6rem)]"
      >
        <div className="relative grid size-full min-h-0 flex-1 grid-cols-3 grid-rows-1 gap-4">
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
              alt={
                "Khue Pham, lead chef at Quang Restaurant, smiling and posing with her son, Eric Pham, in a professional kitchen."
              }
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
              alt={"Spicy Chicken Sandwich at Khue's in St. Paul"}
              priority
              sizes="66vw"
              fetchPriority="high"
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
          <section className="baseFlex w-full rounded-md border bg-gradient-to-br from-offwhite to-primary/10 py-4 pl-6 shadow-sm">
            <Image
              src={khuesKitchenLogo}
              alt={"Khue's Kitchen logo"}
              priority
              className="h-[152px] w-[80.5px] drop-shadow-md sm:h-[190px] sm:w-[100.625px]"
            />
            <div className="baseVertFlex gap-1 rounded-md">
              <h1 className="text-center text-xl font-bold text-stone-800 sm:text-2xl">
                Welcome to Khue&apos;s
              </h1>
              <p className="w-64 text-center text-base leading-5 text-stone-500 sm:w-72 sm:text-lg sm:leading-6">
                A modern take on classic Vietnamese cuisine.
              </p>

              <Button size={"lg"} asChild>
                <Link
                  prefetch={false}
                  href="/menu"
                  className="baseFlex mt-4 gap-2 !px-4 shadow-md"
                >
                  <SideAccentSwirls
                    delay={1.6}
                    className="h-[12px] scale-x-[-1] fill-offwhite"
                  />
                  View our menu
                  <SideAccentSwirls
                    delay={1.6}
                    className="h-[12px] fill-offwhite"
                  />
                </Link>
              </Button>

              <Button size={"lg"} variant={"outline"} asChild>
                <a
                  href="https://tables.toasttab.com/restaurants/85812ed5-ec36-4179-a993-a278cfcbbc55/findTime"
                  // TODO: was 186px width btw
                  className="baseFlex mt-2 w-[206px] gap-2 !px-4 shadow-md"
                >
                  Make a reservation
                  <IoCalendarOutline className="size-4 shrink-0" />
                </a>
              </Button>
            </div>
          </section>
        </motion.div>

        <div className="relative grid size-full min-h-0 flex-1 grid-cols-3 grid-rows-1 gap-4">
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
              alt={
                "Close-up of our Grilled Ribeye, next to a bowl of Bún Chay and a tall glass of Cà Phê Sữa Đá Coffee, set on our outdoor patio with tables and chairs in the background."
              }
              priority
              sizes="66vw"
              className="!relative !size-full rounded-md object-cover object-[50%_25%]"
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
              alt={
                "Interior view of Khue's, located on 693 Raymond Ave in St. Paul, MN"
              }
              priority
              sizes="33vw"
              className="!relative !size-full rounded-md object-cover"
            />
          </motion.div>
        </div>
      </div>

      {/* Desktop Hero */}
      <div className="baseFlex relative !hidden h-[calc(100svh-5rem)] w-full p-4 md:!flex tablet:h-[calc(100svh-6rem)]">
        <div
          style={{
            gridTemplateColumns: "33% 66%",
            gridTemplateRows: "64% 34%",
          }}
          className="relative grid size-full gap-4"
        >
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
              alt={
                "Khue Pham, lead chef at Quang Restaurant, smiling and posing with her son, Eric Pham, in a professional kitchen."
              }
              quality={100}
              priority
              sizes="33vw"
              className="!relative !size-full rounded-md object-cover object-[50%_35%]"
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
            className="relative col-start-2 row-span-1 size-full overflow-hidden rounded-md shadow-md"
          >
            <Image
              src={topRightHero}
              alt={"Spicy Chicken Sandwich at Khue's in St. Paul"}
              priority
              sizes="66vw"
              fetchPriority="high"
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
                alt={"Khue's Kitchen logo"}
                priority
                className="h-[228px] w-[120.75px] drop-shadow-md"
              />
              <div className="baseVertFlex !items-start gap-1 rounded-md">
                {/* experimenting with stone-800 instead of black */}
                <h1 className="text-3xl font-bold text-stone-800 tablet:text-4xl">
                  Welcome to Khue&apos;s
                </h1>
                <p className="text-xl text-stone-500 tablet:text-2xl">
                  A modern take on classic Vietnamese cuisine.
                </p>

                <div className="baseFlex mt-6 gap-4">
                  <Button size={"lg"} asChild>
                    <Link
                      prefetch={false}
                      href="/menu"
                      className="baseFlex gap-2 !px-4 !py-6 !text-lg shadow-md"
                    >
                      <SideAccentSwirls
                        delay={1.6}
                        className="h-4 scale-x-[-1] fill-offwhite"
                      />
                      View our menu
                      <SideAccentSwirls
                        delay={1.6}
                        className="h-4 fill-offwhite"
                      />
                    </Link>
                  </Button>

                  <Button size={"lg"} variant={"outline"} asChild>
                    <a
                      href="https://tables.toasttab.com/restaurants/85812ed5-ec36-4179-a993-a278cfcbbc55/findTime"
                      className="baseFlex gap-3 !px-8 !py-6 !text-lg shadow-sm"
                    >
                      Make a reservation
                      <IoCalendarOutline />
                    </a>
                  </Button>
                </div>

                <div className="baseFlex mt-4 gap-4">
                  <div className="baseFlex !items-start gap-2 text-sm text-stone-500">
                    <Clock className="size-5 text-primary" />
                    Open Wednesday through Sunday
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
            className="relative !top-0 col-span-1 row-start-2 size-full overflow-hidden rounded-md shadow-md"
          >
            <Image
              src={bottomLeftHero}
              alt={
                "Close-up of our Grilled Ribeye, next to a bowl of Bún Chay and a tall glass of Cà Phê Sữa Đá Coffee, set on our outdoor patio with tables and chairs in the background."
              }
              priority
              sizes="33vw"
              className="!relative size-full rounded-md object-cover object-[50%_30%]"
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
            className="relative !top-0 col-start-2 row-start-2 size-full overflow-hidden rounded-md shadow-md"
          >
            <Image
              src={bottomRightHero}
              alt={
                "Interior view of Khue's, located on 693 Raymond Ave in St. Paul, MN"
              }
              priority
              sizes="66vw"
              className="!relative !size-full rounded-md object-cover object-bottom"
            />
          </motion.div>
        </div>
      </div>

      {/* Press Reviews */}
      <div className="baseVertFlex relative w-full overflow-hidden border-y-[1px] bg-gradient-to-br from-offwhite to-primary/10 pb-4">
        <StaticLotus className="absolute right-[-30px] top-[-30px] size-[90px] rotate-[-135deg] fill-primary/50 sm:-right-8 sm:-top-8 sm:size-24" />
        <StaticLotus className="absolute bottom-[-30px] left-[-30px] size-[90px] rotate-[45deg] fill-primary/50 sm:-bottom-8 sm:-left-8 sm:size-24" />

        <div className="baseFlex gap-2 rounded-md rounded-t-none border border-t-0 bg-offwhite/40 p-2 px-8 font-medium shadow-sm xl:text-[18px]">
          <HiOutlineNewspaper className="size-5 xl:mb-0.5" />
          Find us on
        </div>
        <Carousel
          setApi={setPressReviewsApi}
          opts={{
            breakpoints: {
              "(min-width: 1250px)": {
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
          <CarouselContent className="relative mb-5 mt-3 xl:mb-4 xl:mt-4 xl:w-[1250px]">
            <CarouselItem className="baseVertFlex basis-[55%] rounded-md md:basis-[35%] xl:basis-[15.9%]">
              <Button variant={"text"} className="!p-0" asChild>
                <a
                  href="https://www.startribune.com/khues-kitchen-st-paul-best-new-restauarant-quang-minneapolis/601533607"
                  className="baseFlex"
                >
                  <Image
                    src={starTribuneLogo}
                    alt="Star Tribune's logo"
                    width={216}
                    height={91.8}
                    className="mb-2"
                  />
                </a>
              </Button>
            </CarouselItem>
            <CarouselItem className="baseVertFlex basis-[55%] rounded-md md:basis-[35%] xl:basis-[15.9%]">
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
            <CarouselItem className="baseVertFlex basis-[55%] rounded-md md:basis-[35%] xl:basis-[15.9%]">
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
            <CarouselItem className="baseVertFlex basis-[55%] rounded-md md:basis-[35%] xl:basis-[15.9%]">
              <Button variant={"text"} className="!p-0" asChild>
                <a
                  href="https://www.cbsnews.com/minnesota/news/khues-kitchen-reopens-midcity-kitchen/"
                  aria-label="CBS News Logo"
                  className="baseFlex"
                >
                  <WCCOLogo className="h-[63.75px] w-[150px]" />
                </a>
              </Button>
            </CarouselItem>
            <CarouselItem className="baseVertFlex basis-[40%] rounded-md md:basis-[30%] xl:basis-[12.5%]">
              <Button variant={"text"} className="!p-0" asChild>
                <a
                  href="https://heavytable.substack.com/i/160888645/now-open-up-to-months"
                  className="baseFlex"
                >
                  <Image
                    src={heavyTableLogo}
                    alt="Heavy Table's logo"
                    width={98}
                    height={42}
                  />
                </a>
              </Button>
            </CarouselItem>
            <CarouselItem className="baseVertFlex basis-[35%] rounded-md md:basis-[25%] xl:basis-[8%]">
              <Button variant={"text"} className="!p-0" asChild>
                <a
                  href="https://mspmag.com/eat-and-drink/restaurant-review-homecoming-khues-kitchen/"
                  className="baseFlex"
                >
                  <Image
                    src={mspMagLogo}
                    alt="Mpls.St.Paul Magazine's logo"
                    width={50.5}
                    height={34.5}
                  />
                </a>
              </Button>
            </CarouselItem>
            <CarouselItem className="baseVertFlex basis-[50%] rounded-md md:basis-[35%] xl:basis-[15.9%]">
              <Button variant={"text"} className="!p-0" asChild>
                <a
                  href="https://thetastingnotes.co/khues-kitchen-resilience-and-flavor-in-equal-measure/"
                  className="baseFlex"
                >
                  <Image
                    src={theTastingNotesLogo}
                    alt="The Tasting Note's logo"
                    width={180}
                    height={100}
                  />
                </a>
              </Button>
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        {/* (below xl breakpoint only) dots to show which review is being viewed at the moment */}
        <div className="baseFlex gap-2 xl:hidden">
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
          <Button asChild>
            <div
              className={`!size-2 cursor-pointer rounded-full !p-0 ${pressReviewsSlide === 3 ? "!bg-primary" : "!bg-stone-300"}`}
              onClick={() => pressReviewsApi?.scrollTo(3)}
            />
          </Button>
          <Button asChild>
            <div
              className={`!size-2 cursor-pointer rounded-full !p-0 ${pressReviewsSlide === 4 ? "!bg-primary" : "!bg-stone-300"}`}
              onClick={() => pressReviewsApi?.scrollTo(4)}
            />
          </Button>
          <Button asChild>
            <div
              className={`!size-2 cursor-pointer rounded-full !p-0 ${pressReviewsSlide === 5 ? "!bg-primary" : "!bg-stone-300"}`}
              onClick={() => pressReviewsApi?.scrollTo(5)}
            />
          </Button>
          <Button asChild>
            <div
              className={`!size-2 cursor-pointer rounded-full !p-0 ${pressReviewsSlide === 6 ? "!bg-primary" : "!bg-stone-300"}`}
              onClick={() => pressReviewsApi?.scrollTo(6)}
            />
          </Button>
        </div>
      </div>

      <ParallaxProvider scrollAxis="vertical">
        {/* wrapping (prob just for padding?) container of promo sections below */}
        <div className="baseVertFlex mt-8 w-full gap-16 p-8 pb-16">
          {/* masonry of featured food items */}
          <div className="homepageFoodMasonry h-[700px] w-full max-w-sm tablet:h-[450px] tablet:max-w-4xl">
            <div className="firstMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
              <Parallax
                speed={-3}
                className="!absolute !top-[-1rem] !size-[120%]"
              >
                <Image
                  src={masonryFoodOne}
                  alt={"Sticky Jicama Ribs at Khue's in St. Paul"}
                  sizes="(max-width: 1000px) 384px, 500px"
                  className="!relative !size-full rounded-md object-cover object-[50%_75%] pr-16"
                />
              </Parallax>
            </div>

            <div className="secondMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
              <Parallax
                speed={-3}
                className="!absolute !top-[-1rem] !size-[100%]"
              >
                <Image
                  src={masonryFoodTwo}
                  alt={"Cream Cheese Wantons at Khue's in St. Paul"}
                  sizes="(max-width: 1000px) 159px, 500px"
                  className="!relative !h-[120%] !w-full rounded-md object-cover object-[60%_50%]"
                />
              </Parallax>
            </div>

            <div className="thirdMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
              <Parallax
                speed={-3}
                className="!absolute !top-[-1rem] !size-[100%]"
              >
                <Image
                  src={masonryFoodThree}
                  alt={"Cà Phê Sữa Đá Coffee at Khue's in St. Paul"}
                  sizes="(max-width: 1000px) 159px, 500px"
                  className="!relative !h-[110%] !w-full rounded-md object-cover object-[33%_50%]"
                />
              </Parallax>
            </div>

            <div className="fourthMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
              <Parallax
                speed={-3}
                className="!absolute !top-[-1rem] !size-[100%]"
              >
                <Image
                  src={masonryFoodFour}
                  alt={"Thai Tea Tres Leches at Khue's in St. Paul"}
                  sizes="(max-width: 1000px) 159px, 500px"
                  className="!relative !h-[120%] !w-full rounded-md object-cover !object-[52%_50%]"
                />
              </Parallax>
            </div>

            <div className="fifthMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
              <Parallax
                speed={-3}
                className="!absolute !top-[-1rem] !size-[100%]"
              >
                <Image
                  src={masonryFoodFive}
                  priority // I feel like this shouldn't be necessary, but the image wasn't auto-loading
                  // when it came into the viewport otherwise
                  alt={"Roast Pork Fried Rice at Khue's in St. Paul"}
                  sizes="(max-width: 1000px) 384px, 500px"
                  className="!relative !h-[120%] !w-full rounded-md object-cover object-[50%_100%]"
                />
              </Parallax>
            </div>

            <div className="sixthMasonryFood relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
              <Parallax
                speed={-3}
                className="!absolute !top-[-1rem] !size-[100%]"
              >
                <Image
                  src={masonryFoodSix}
                  priority // I feel like this shouldn't be necessary, but the image wasn't auto-loading
                  // when it came into the viewport otherwise
                  alt={"Cà Phê Sữa Đá Affogato at Khue's in St. Paul"}
                  sizes="(max-width: 1000px) 384px, 500px"
                  className="!relative !h-[120%] !w-full rounded-md object-cover"
                />
              </Parallax>
            </div>
          </div>

          {/* Star Tribune Award Section */}
          <div className="baseVertFlex w-full max-w-sm overflow-hidden rounded-md border shadow-md tablet:hidden">
            <div className="relative h-60 w-full overflow-hidden shadow-md">
              <Image
                src={top30StarTribune}
                alt={"Sticky Jicama Ribs at Khue's Kitchen."}
                width={384}
                className="!relative !bottom-0 !size-full !h-96 object-cover !pb-36"
              />
            </div>
            <div className="baseVertFlex relative !items-start gap-2 overflow-hidden rounded-b-md bg-gradient-to-br from-offwhite to-primary/10 p-4 pb-8">
              <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />

              <div className="baseVertFlex !items-start gap-1">
                <Button variant={"text"} className="!p-0" asChild>
                  <a
                    href="https://www.startribune.com/khues-kitchen-st-paul-best-new-restauarant-quang-minneapolis/601533607"
                    className="baseFlex"
                  >
                    <Image
                      src={starTribuneLogo}
                      alt="Star Tribune's logo"
                      width={150}
                      height={35}
                      className="-ml-5 mb-2"
                    />
                  </a>
                </Button>

                <p className="text-lg font-semibold text-stone-800">
                  Best New Restaurant of 2025
                </p>
              </div>

              <p className="mt-2">
                We are truly humbled to be recognized by the Star Tribune as the
                Best New Restaurant of 2025. This honor is a testament to the
                passion of our incredible team and the support of our wonderful
                community. Thank you for believing in our vision and for making
                Khue's a place you call home. We couldn't have reached this
                milestone without you!
              </p>

              <Button className="baseFlex mb-2 mt-6 gap-2 self-center" asChild>
                <a
                  href="https://www.startribune.com/khues-kitchen-st-paul-best-new-restauarant-quang-minneapolis/601533607"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HiOutlineNewspaper className="size-5" />
                  Read the article
                </a>
              </Button>
            </div>
          </div>

          <div className="baseFlex !hidden w-full gap-16 py-8 tablet:!flex">
            <div className="baseVertFlex relative mt-4 max-w-[610px] !items-start gap-2 overflow-hidden rounded-md border bg-gradient-to-br from-offwhite to-primary/10 p-6 pr-10 shadow-md">
              <StaticLotus className="absolute -right-5 -top-5 size-16 rotate-[-135deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />

              <div className="baseVertFlex !items-start gap-1">
                <Button variant={"text"} className="!p-0" asChild>
                  <a
                    href="https://www.startribune.com/khues-kitchen-st-paul-best-new-restauarant-quang-minneapolis/601533607"
                    className="baseFlex"
                  >
                    <Image
                      src={starTribuneLogo}
                      alt="Star Tribune's logo"
                      width={150}
                      height={35}
                      className="-ml-5 mb-2"
                    />
                  </a>
                </Button>

                <p className="text-xl font-semibold">
                  Best New Restaurant of 2025
                </p>
              </div>

              <p className="mt-4">
                We are truly humbled to be recognized by the Star Tribune as the
                Best New Restaurant of 2025. This honor is a testament to the
                passion of our incredible team and the support of our wonderful
                community. Thank you for believing in our vision and for making
                Khue's a place you call home. We couldn't have reached this
                milestone without you!
              </p>

              <Button className="baseFlex mt-6 gap-2" asChild>
                <a
                  href="https://www.startribune.com/khues-kitchen-st-paul-best-new-restauarant-quang-minneapolis/601533607"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HiOutlineNewspaper className="size-5" />
                  Read the article
                </a>
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
                  src={top30StarTribune}
                  alt={"Sticky Jicama Ribs at Khue's Kitchen."}
                  sizes="750px"
                  className="!relative !bottom-0 !size-full !h-96 rounded-md object-cover !pb-20"
                />
              </motion.div>
            </div>
          </div>

          {/* Meet the Chef promo section */}
          <div className="baseVertFlex w-full max-w-sm overflow-hidden rounded-md border shadow-md tablet:hidden">
            <div className="relative h-60 w-full overflow-hidden shadow-md">
              <Image
                src={ericUpscaled}
                alt={
                  "Chef Eric Pham, owner of Khue's Kitchen, standing with arms crossed and smiling in front of a rustic door."
                }
                // width={384}
                unoptimized
                className="!relative !top-0 !size-full rounded-none object-cover !object-top"
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
                <Link
                  prefetch={false}
                  aria-label="Read more about our story"
                  href="/media"
                >
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
                  sizes="324px"
                  className="!relative !top-0 !size-full rounded-md object-cover object-top"
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
                <Link
                  prefetch={false}
                  aria-label="Read more about our story"
                  href="/media"
                >
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
                alt={
                  "Table ready for a party of twelve at Khue's in St. Paul, MN"
                }
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

              <p className="mt-3">
                Whether it&apos;s a birthday dinner or a casual catch-up,
                we&apos;re ready to host. Smaller parties are generally walk-in
                friendly, however we recommend booking ahead for larger groups.
                Reserve now and let us take care of the rest!
              </p>

              <div className="baseVertFlex mb-2 mt-6 w-full gap-4">
                <Button
                  className="baseFlex gap-2"
                  onClick={() => setChatIsOpen(true)}
                  asChild
                >
                  <a href="https://tables.toasttab.com/restaurants/85812ed5-ec36-4179-a993-a278cfcbbc55/findTime">
                    Make a reservation
                    <IoCalendarOutline className="size-4 drop-shadow-md" />
                  </a>
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
                  asChild
                >
                  <a href="https://tables.toasttab.com/restaurants/85812ed5-ec36-4179-a993-a278cfcbbc55/findTime">
                    Make a reservation
                    <IoCalendarOutline className="size-4 drop-shadow-md" />
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
                  alt={
                    "Table ready for a party of twelve at Khue's in St. Paul, MN"
                  }
                  sizes="750px"
                  className="!relative !top-0 !size-full !h-96 rounded-md object-cover !pb-16"
                />
              </motion.div>
            </div>
          </div>

          {/* masonry but prob more of just inside/outside the restaurant */}
          <div className="homepageInteriorMasonry h-[700px] w-full max-w-sm tablet:h-[450px] tablet:max-w-4xl">
            <div className="firstMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
              <Parallax
                speed={-3}
                className="!absolute !top-[-1rem] !size-[100%]"
              >
                <Image
                  src={masonryInteriorSix} /* horiz rectangle */
                  alt={
                    "Bright industrial-chic dining space featuring a long wooden table, cross-back chairs, exposed brick walls, and lush green plants."
                  }
                  sizes="(max-width: 1000px) 384px, 500px"
                  className="!relative !h-[120%] !w-full rounded-md object-cover object-bottom"
                />
              </Parallax>
            </div>

            <div className="secondMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
              <Parallax
                speed={-3}
                className="!absolute !top-[-1rem] !size-[100%]"
              >
                <Image
                  src={masonryInteriorSeven} /* square */
                  alt={
                    "Two bowls of food on a metal patio table beside a white potted orchid with white flowers, on the outdoor patio with wooden chairs, tables, and benches in the background on a sunny day."
                  }
                  sizes="(max-width: 1000px) 159px, 500px"
                  className="!relative !h-[120%] !w-full rounded-md object-cover object-[50%_100%]"
                />
              </Parallax>
            </div>

            <div className="thirdMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
              <Parallax
                speed={-3}
                className="!absolute !top-[-1rem] !size-[100%]"
              >
                <Image
                  src={masonryInteriorTen} /* vert rectangle */
                  alt={
                    "Sunlit corner inside the restaurant featuring wooden tables, red chairs, a wall-mounted floral art piece, and potted greenery."
                  }
                  sizes="(max-width: 1000px) 159px, 500px"
                  className="!relative !h-[110%] !w-full rounded-md object-cover object-bottom"
                />
              </Parallax>
            </div>

            <div className="fourthMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
              <Parallax
                speed={-3}
                className="!absolute !top-[-1rem] !size-[100%]"
              >
                <Image
                  src={masonryInteriorNine} /* square */
                  alt={
                    "Cozy dining area with wooden tables, matching chairs, warm lighting, and a few potted plants along the wall."
                  }
                  sizes="(max-width: 1000px) 159px, 500px"
                  className="!relative !h-[120%] !w-full rounded-md object-cover object-bottom"
                />
              </Parallax>
            </div>

            <div className="fifthMasonryInterior relative left-0 top-0 size-full overflow-hidden rounded-md shadow-md">
              <Parallax
                speed={-3}
                className="!absolute !top-[-1rem] !size-[100%]"
              >
                <Image
                  src={masonryInteriorEight} /* horiz rectangle */
                  alt={
                    "Contemporary bar area with a sleek countertop, stylish liquor display, and tall potted plants adding a touch of greenery."
                  }
                  sizes="(max-width: 1000px) 384px, 500px"
                  className="!relative !h-[125%] !w-full rounded-md object-cover object-bottom"
                />
              </Parallax>
            </div>
          </div>

          {/* maybe a gallary/slideshow section? Prob not though */}
        </div>
      </ParallaxProvider>
    </motion.div>
  );
}
