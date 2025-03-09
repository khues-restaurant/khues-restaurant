import { motion, useAnimation } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/components/ui/carousel";
import { useMainStore } from "~/stores/MainStore";

import { Charis_SIL } from "next/font/google";
const charis = Charis_SIL({
  subsets: ["latin"],
  weight: ["400", "700"],
});

import khuesKitchen from "/public/ourStory/khuesKitchen.webp";
import khues from "/public/ourStory/khues.jpg";

import eric from "/public/ourStory/eric.webp";

import mpr from "/public/media/mpr.jpg";
import starTribune from "/public/media/starTribune.jpg";

// const TWEEN_FACTOR_BASE = 0.2;

const restaurantNamesAndBackstories = [
  {
    name: "Quang (2013 - 2018)",
    backstory:
      "During these formative years, Eric Pham honed his culinary skills at the family restaurant, Quang, under the watchful eye of his mother, Khue. Here, he absorbed traditional Vietnamese cooking techniques and learned the importance of dedication and hard work. This period laid the foundation for Eric's culinary journey, instilling in him a deep appreciation for his heritage and the craft of cooking.",
    altText:
      "Khue Pham, lead chef at Quang Restaurant, smiling and posing with her young son, Eric Pham, both dressed formally.",
  },
  {
    name: "Khue's Kitchen (2021 - 2022)",
    backstory:
      "In 2020, after a rigorous year at the prestigious Spoon and Stable, Eric launched Khue's Kitchen as a ghost kitchen. This venture was the first tangible step toward his dream of honoring his mother by creating a restaurant named after her. Despite its virtual nature, Khue's Kitchen was a significant milestone, allowing Eric to experiment with his vision and bring his innovative takes on Vietnamese cuisine to life.",
    altText:
      "Khue Pham, lead chef at Quang Restaurant, smiling and posing with her son, Eric Pham, in a professional kitchen.",
  },
  {
    name: "Khue's Kitchen @ Bar Brava (2022 - 2023)",
    backstory:
      "Eric's culinary journey progressed as he brought Khue's Kitchen to Bar Brava in downtown Minneapolis. This move allowed him to reach a broader audience and further refine his menu. The collaboration with Bar Brava not only expanded his culinary reach but also enriched his experience, enabling him to blend traditional Vietnamese flavors with contemporary dining trends.",
    altText:
      "Chef Eric Pham, owner of Khue's Kitchen, smiling while cooking in a professional kitchen.",
  },
  {
    name: "Khue's (2025 - Present)",
    backstory:
      "Now, Eric is on the brink of a new chapter with the opening of Khue's in St. Paul. This establishment marks the culmination of his dream: a dedicated space to celebrate his mother's legacy and showcase his unique interpretation of Vietnamese cuisine. Eric is poised to honor Khue Pham's enduring influence, ensuring her legacy continues to inspire and delight the community.",
    altText:
      "Khue Pham, lead chef at Quang Restaurant, smiling and posing with her son, Eric Pham, in front of his new restaurant, Khue's.",
  },
];

function OurStory() {
  const { viewportLabel } = useMainStore((state) => ({
    viewportLabel: state.viewportLabel,
  }));

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [carouselSlide, setCarouselSlide] = useState(0);

  const ericImageControls = useAnimation();
  const ericBackdropControls = useAnimation();

  const ericImageRef = useRef<HTMLImageElement>(null);
  const ericBackdropRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && scrollDir === "down") {
            void ericImageControls.start({
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            });
          } else if (entry.boundingClientRect.top < 0 && scrollDir === "up") {
            void ericImageControls.start({
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            });
          }
        });
      },
      { threshold: 0.75 },
    );

    if (ericImageRef.current) {
      observer.observe(ericImageRef.current);
    }

    const internalEricImageRef = ericImageRef.current;

    return () => {
      if (internalEricImageRef) {
        observer.unobserve(internalEricImageRef);
      }
    };
  }, [ericImageControls, scrollDir]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && scrollDir === "down") {
            void ericBackdropControls.start({ opacity: 1, y: 0 });
          } else if (entry.boundingClientRect.top < 0 && scrollDir === "up") {
            void ericBackdropControls.start({ opacity: 1, y: 0 });
          }
        });
      },
      { threshold: 0.33 },
    );

    if (ericBackdropRef.current) {
      observer.observe(ericBackdropRef.current);
    }

    const internalEricBackdropRef = ericBackdropRef.current;

    return () => {
      if (internalEricBackdropRef) {
        observer.unobserve(internalEricBackdropRef);
      }
    };
  }, [ericBackdropControls, scrollDir]);

  useEffect(() => {
    if (!carouselApi) return;

    setCarouselSlide(carouselApi.selectedScrollSnap());

    carouselApi.on("select", () => {
      setCarouselSlide(carouselApi.selectedScrollSnap());
    });

    // eventually add proper cleanup functions here
  }, [carouselApi]);

  return (
    <motion.div
      key={"our-story"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex min-h-[calc(100dvh-5rem)] w-full !justify-start tablet:min-h-[calc(100dvh-6rem)]"
    >
      {/* Hero */}
      <div className="baseFlex relative h-56 w-full overflow-hidden bg-darkPrimary shadow-md tablet:h-72">
        <div className="absolute inset-0 grid h-56 w-full grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1 tablet:h-72">
          <Image
            src={starTribune}
            alt="Khue Pham, lead chef at Quang Restaurant, smiling and posing with her young son, Eric Pham, both dressed formally."
            fill
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
            className="!relative !size-full object-cover object-top opacity-20"
          />
          <Image
            src={khuesKitchen}
            alt="Khue Pham, lead chef at Quang Restaurant, smiling and posing with her son, Eric Pham, in a professional kitchen."
            fill
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
            className="!relative !size-full object-cover object-top opacity-20"
          />
          <Image
            src={mpr}
            alt="Chef Eric Pham, owner of Khue's Kitchen, smiling while cooking in a professional kitchen."
            fill
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
            className="!relative !size-full object-cover object-top opacity-20"
          />
          <Image
            src={khues}
            alt="Khue Pham, lead chef at Quang Restaurant, smiling and posing with her son, Eric Pham, in front of his new restaurant, Khue's."
            fill
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
            className="!relative !size-full object-cover opacity-20"
          />
        </div>

        <div className="baseFlex z-10 mx-8 rounded-md bg-offwhite p-4 shadow-heroContainer tablet:!flex">
          <div className="baseFlex gap-2 text-xl font-semibold text-primary tablet:p-2 desktop:text-2xl">
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary desktop:h-5" />
            <h1 className={`${charis.className}`}>Our story</h1>
            <SideAccentSwirls className="h-4 fill-primary desktop:h-5" />
          </div>
        </div>
      </div>

      <div className="baseVertFlex relative w-full pb-24 tablet:w-3/4">
        <div className="baseVertFlex mt-12 gap-4 tablet:!flex-row-reverse tablet:!items-start">
          <Carousel
            setApi={setCarouselApi}
            orientation={
              viewportLabel.includes("mobile") ? "horizontal" : "vertical"
            }
            opts={{
              align: "center",
              breakpoints: {
                "(min-width: 0px)": {
                  axis: "x",
                },
                "(min-width: 1000px)": {
                  axis: "y",
                },
              },
              loop: true,
            }}
            className="baseFlex rounded-md sm:-mt-2 sm:p-0 tablet:!flex-col"
          >
            <CarouselContent className="baseFlex max-w-[350px] !items-start !justify-start sm:h-[450px] sm:w-[600px] sm:max-w-full tablet:h-[500px] tablet:!flex-col tablet:!items-center tablet:!justify-start">
              <CarouselItem className="mb-2 flex justify-center px-2 sm:!items-start tablet:px-0 tablet:pt-2">
                <RestaurantAndBackstory
                  name={restaurantNamesAndBackstories[0]!.name}
                  backstory={restaurantNamesAndBackstories[0]!.backstory}
                  image={starTribune}
                  altText={restaurantNamesAndBackstories[0]!.altText}
                />
              </CarouselItem>
              <CarouselItem className="mb-2 flex justify-center px-2 sm:!items-start tablet:px-0 tablet:pt-2">
                <RestaurantAndBackstory
                  name={restaurantNamesAndBackstories[1]!.name}
                  backstory={restaurantNamesAndBackstories[1]!.backstory}
                  image={khuesKitchen}
                  altText={restaurantNamesAndBackstories[1]!.altText}
                />
              </CarouselItem>
              <CarouselItem className="mb-2 flex justify-center px-2 sm:!items-start tablet:px-0 tablet:pt-2">
                <RestaurantAndBackstory
                  name={restaurantNamesAndBackstories[2]!.name}
                  backstory={restaurantNamesAndBackstories[2]!.backstory}
                  image={mpr}
                  altText={restaurantNamesAndBackstories[2]!.altText}
                />
              </CarouselItem>
              <CarouselItem className="mb-2 flex justify-center px-2 sm:!items-start tablet:px-0 tablet:pt-2">
                <RestaurantAndBackstory
                  name={restaurantNamesAndBackstories[3]!.name}
                  backstory={restaurantNamesAndBackstories[3]!.backstory}
                  image={khues}
                  altText={restaurantNamesAndBackstories[3]!.altText}
                />
              </CarouselItem>
            </CarouselContent>
          </Carousel>

          {/* max-w-80 necessary? */}
          <div className="baseFlex relative size-full gap-2 sm:max-w-full tablet:!flex-col">
            <Button
              variant={"ghost"}
              className={`relative !size-20 rounded-md !p-0 opacity-50 hover:opacity-100 tablet:!size-24 ${carouselSlide === 0 ? "!opacity-100" : ""}`}
            >
              <Image
                src={starTribune}
                alt={
                  "Khue Pham, lead chef at Quang Restaurant, smiling and posing with her young son, Eric Pham, both dressed formally."
                }
                // sizes="(max-width: 1000px) 80px, 96px"
                unoptimized
                className="!relative !size-[80px] rounded-md object-cover tablet:!size-24"
                onClick={() => carouselApi?.scrollTo(0)}
              />
            </Button>
            <Button
              variant={"ghost"}
              className={`relative !size-20 rounded-md !p-0 opacity-50 hover:opacity-100 tablet:!size-24 ${carouselSlide === 1 ? "!opacity-100" : ""}`}
            >
              <Image
                src={khuesKitchen}
                alt={
                  "Khue Pham, lead chef at Quang Restaurant, smiling and posing with her son, Eric Pham, in a professional kitchen."
                }
                // sizes="100vw"
                // quality={100}
                unoptimized
                className="!relative !size-[80px] rounded-md object-cover tablet:!size-24"
                onClick={() => carouselApi?.scrollTo(1)}
              />
            </Button>
            <Button
              variant={"ghost"}
              className={`relative !size-20 rounded-md !p-0 opacity-50 hover:opacity-100 tablet:!size-24 ${carouselSlide === 2 ? "!opacity-100" : ""}`}
            >
              <Image
                src={mpr}
                alt={
                  "Chef Eric Pham, owner of Khue's Kitchen, smiling while cooking in a professional kitchen."
                }
                // sizes="100vw"
                // quality={100}
                unoptimized
                className="!relative !size-[80px] rounded-md object-cover tablet:!size-24"
                onClick={() => carouselApi?.scrollTo(2)}
              />
            </Button>
            <Button
              variant={"ghost"}
              className={`relative !size-20 rounded-md !p-0 opacity-50 hover:opacity-100 tablet:!size-24 ${carouselSlide === 3 ? "!opacity-100" : ""}`}
            >
              <Image
                src={khues}
                alt={
                  "Khue Pham, lead chef at Quang Restaurant, smiling and posing with her son, Eric Pham, in front of his new restaurant, Khue's."
                }
                // sizes="100vw"
                // quality={100}
                unoptimized
                className="!relative !size-[80px] rounded-md object-cover tablet:!size-24"
                onClick={() => carouselApi?.scrollTo(3)}
              />
            </Button>
          </div>
        </div>

        {/* Small opening statement */}
        <div className="mt-16 h-[1px] w-48 rounded-md bg-primary tablet:w-72"></div>
        <p className="mt-16 max-w-72 text-sm tracking-wide sm:max-w-lg tablet:max-w-xl tablet:text-base">
          Khue&apos;s is a lifelong project dedicated to and inspired by Khue
          Pham&apos;s legacy. For the last 30 years, Khue&apos;s devotion to
          flavor, creativity and tradition has touched the lives of friends,
          family and eaters across the Midwest. Today, her son, chef/owner Eric
          Pham is honoring the memories and experiences of his mom&apos;s
          artistry through Khue&apos;s. Using bold Vietnamese flavors, Eric
          blends influential and traditional dishes from his childhood with a
          modern perspective to reimagine Vietnamese cuisine.
        </p>

        {/* Centerpiece of Eric */}
        <div className="mt-16 h-[1px] w-48 rounded-md bg-primary tablet:w-72"></div>
        <div className="baseVertFlex w-full gap-2 pt-16">
          <p className="text-2xl font-semibold text-primary">Meet the Chef</p>
          <p className="text-xl">Eric Pham</p>
        </div>
        <div className="baseFlex relative w-full px-4 pb-8 pt-16 tablet:max-w-4xl">
          <motion.div
            ref={ericBackdropRef}
            initial={{ opacity: 0, y: 50 }}
            animate={ericBackdropControls}
            transition={{
              opacity: { duration: 0.2 },
              type: "spring",
              stiffness: 100,
              damping: 20,
              mass: 0.75,
            }}
            className="absolute bottom-0 left-0 h-3/4 w-full bg-gradient-to-br from-primary to-darkPrimary shadow-md tablet:rounded-md"
          ></motion.div>

          <motion.div
            ref={ericImageRef}
            initial={{ opacity: 0, y: -75, filter: "blur(3px)" }}
            animate={ericImageControls}
            transition={{
              opacity: { duration: 0.2 },
              type: "spring",
              stiffness: 100,
              damping: 20,
              mass: 0.75,
            }}
            className="relative h-[425px] w-[300px] rounded-md shadow-md tablet:h-[525px] tablet:w-[350px]"
          >
            <Image
              src={eric}
              alt="Chef Eric Pham, owner of Khue's Kitchen, standing with arms crossed and smiling in front of a rustic door."
              fill
              className="rounded-md"
            />
          </motion.div>
        </div>

        {/* Q&A w/ Eric */}
        <div className="mt-16 w-48 text-center text-lg italic xs:w-auto">
          Q/A Session with Chef/Owner Eric Pham
        </div>

        <div className="baseVertFlex mt-8 !items-start gap-8">
          <p className="pt-8 text-lg font-semibold">Why Cooking?</p>
          <p className="max-w-72 tracking-wide sm:max-w-xl">
            &quot;I never truly appreciated the well-made home cooked meals. I
            was in my teens when I realized food was more than sustenance. Mom
            showed us affection in different ways. She always asked us, “Are you
            hungry?” For us, food is another form of communication. A medium in
            which we can show love without speech. While watching food
            documentaries, there was this episode on East Asian cuisine in
            America, and the story revolved around how the best way to champion
            your culture is to share it. Those 47 minutes made me think about
            how my mom has been serving Vietnamese food for over 40 years.
            Through her, people have grown to love Vietnamese food and culture.
            Her dedication to the craft inspired me to follow in her
            footsteps.&quot;
          </p>
          <p className="pt-8 text-lg font-semibold">
            Where did you learn how to cook?
          </p>
          <p className="max-w-72 tracking-wide sm:max-w-xl">
            Where did you learn how to cook? In my teens, my parents wanted me
            to appreciate their hard work. I started working at Quang at an
            early age to gain some perspective. The only ordering system I knew
            was auntie shouting, “one mango large and a regular jasmine.” I
            didn&apos;t fully commit to cooking until I was 19. I had just
            applied to Spoon and Stable and figured my upbringing would
            translate well due to my years at Quang. I was wrong. The chefs
            there pushed me to my limits every day. A culture of competition for
            the sake of competition. The team at Spoon built my culinary
            foundation. That 2-year mentorship gave me the confidence to
            reimagine the dishes I had loved so much at Quang.
          </p>

          <p className="pt-8 text-lg font-semibold">
            Any hobbies outside of cooking?
          </p>
          <p className="max-w-72 tracking-wide sm:max-w-xl">
            Eating. When I&apos;m not cooking, I&apos;m usually trying other
            peoples&apos; cooking. There&apos;s nothing better than planning an
            entire day with friends around finding which restaurant has the best
            pizza. A bunch of guys eating pizza for science.
          </p>
        </div>

        <div className="mt-16 h-[1px] w-48 rounded-md bg-primary tablet:w-72"></div>
      </div>
    </motion.div>
  );
}

export default OurStory;

interface RestaurantAndBackstory {
  name: string;
  backstory: string;
  image: StaticImageData;
  altText: string;
}

function RestaurantAndBackstory({
  name,
  backstory,
  image,
  altText,
}: RestaurantAndBackstory) {
  return (
    <div className="baseVertFlex relative rounded-md border shadow-md sm:rounded-md sm:border-none">
      <Image
        src={image}
        alt={altText}
        sizes="(max-width: 400px) 350px, (max-width: 1000px) 600px, 33vw"
        priority
        className="!relative !h-[235px] !w-[350px] select-none rounded-t-md object-cover shadow-sm sm:!h-[450px] sm:!w-[600px] sm:rounded-md sm:shadow-none"
      />

      <div className="baseVertFlex w-full max-w-[350px] select-none !items-start gap-2 rounded-b-md p-4 sm:absolute sm:bottom-0 sm:left-0 sm:max-w-lg sm:!items-start sm:rounded-br-none sm:rounded-tr-md sm:bg-gradient-to-tr sm:from-black sm:to-black/50 sm:text-offwhite">
        <p className="font-semibold underline underline-offset-2">{name}</p>
        <p className="text-sm">{backstory}</p>
      </div>
    </div>
  );
}
