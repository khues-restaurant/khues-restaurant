import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Parallax } from "react-scroll-parallax";
import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/components/ui/carousel";

const restaurantNamesAndBackstories = [
  {
    name: "Quang's (2013 - 2018)",
    backstory:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
  },
  {
    name: "Khue's Kitchen (2021 - 2022)",
    backstory:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
  },
  {
    name: "Khue's Kitchen @ Bar Brava (2022 - 2023)",
    backstory:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
  },
  {
    name: "Khue's (2024 - Present)",
    backstory:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
  },
];

function OurStory() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [carouselSlide, setCarouselSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;

    setCarouselSlide(carouselApi.selectedScrollSnap());

    carouselApi.on("select", () => {
      setCarouselSlide(carouselApi.selectedScrollSnap());
    });

    // eventually add proper cleanup functions here
  }, [carouselApi]);

  console.log("carousel", carouselApi?.scrollSnapList());

  return (
    <motion.div
      key={"our-story"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-24 min-h-[calc(100dvh-6rem)] w-full !justify-start tablet:mt-28 tablet:min-h-[calc(100dvh-7rem)]"
    >
      {/* Hero */}
      <div className="baseFlex relative h-56 w-full overflow-hidden border-b-2 tablet:h-72">
        {/* wide-ish angle shot of the dining room maybe? technically could also
              do outside shot of restaurant as well! also obv just a collage of images of eric could work well
              too, but maybe save those for below in the actual content of this page? */}
        <Parallax
          speed={-10}
          className="!absolute !-top-10 !left-0 !h-56 !w-full tablet:!h-72"
        >
          <Image
            src={"/interior/seven.webp"}
            alt={"TODO: Alt text"}
            fill
            style={{
              objectFit: "cover",
            }}
            className={`!relative !h-56 !w-full tablet:!h-72`}
          />
        </Parallax>

        <div className="baseFlex z-10 rounded-md bg-white p-2 shadow-lg">
          <div className="experimentalBorder baseFlex px-8 py-4 text-xl font-semibold tablet:text-2xl">
            Our story
          </div>
        </div>
      </div>

      <div className="baseVertFlex relative w-full pb-8 tablet:w-3/4">
        <div className="baseVertFlex mt-12 gap-4 tablet:!flex-row-reverse">
          <Carousel
            setApi={setCarouselApi}
            // this was just not working at all for us on the first attempt, seems to be fine as is
            // orientation={
            //   viewportLabel.includes("mobile") ? "horizontal" : "vertical"
            // }
            opts={{
              align: "start",
              breakpoints: {
                "(min-width: 0px)": {
                  axis: "x",
                },
                "(min-width: 1000px)": {
                  axis: "y",
                },
              },
              loop: true,
              // skipSnaps: true, play around with this
            }}
            className="baseFlex rounded-md tablet:!flex-col tablet:p-0"
          >
            {/* touch-pan-x tablet:touch-pan-y*/}

            {/* recently added !items-start and max-w-80 and tried to add bandaid fixes at higher viewport
              but there are a few hiccups. Test and fix */}
            <CarouselContent className="baseFlex max-w-80 !items-start !justify-start sm:max-w-full tablet:h-[500px] tablet:w-[600px] tablet:!flex-col  tablet:!items-center tablet:!justify-start">
              <CarouselItem className="flex justify-center px-0 tablet:!items-start tablet:pt-2">
                <RestaurantAndBackstory
                  name={restaurantNamesAndBackstories[0]!.name}
                  backstory={restaurantNamesAndBackstories[0]!.backstory}
                />
              </CarouselItem>
              <CarouselItem className="flex justify-center px-0 tablet:!items-start tablet:pt-2">
                <RestaurantAndBackstory
                  name={restaurantNamesAndBackstories[1]!.name}
                  backstory={restaurantNamesAndBackstories[1]!.backstory}
                />
              </CarouselItem>
              <CarouselItem className="flex justify-center px-0 tablet:!items-start tablet:pt-2">
                <RestaurantAndBackstory
                  name={restaurantNamesAndBackstories[2]!.name}
                  backstory={restaurantNamesAndBackstories[2]!.backstory}
                />
              </CarouselItem>
              <CarouselItem className="flex justify-center px-0 tablet:!items-start tablet:pt-2">
                <RestaurantAndBackstory
                  name={restaurantNamesAndBackstories[3]!.name}
                  backstory={restaurantNamesAndBackstories[3]!.backstory}
                />
              </CarouselItem>
            </CarouselContent>
          </Carousel>

          {/* max-w-80 necessary? */}
          <div className="baseFlex relative size-full max-w-80 gap-2 sm:max-w-full tablet:!flex-col">
            <Button
              variant={"ghost"}
              className={`!size-20 rounded-md opacity-50 hover:opacity-100 tablet:!size-24 ${carouselSlide === 0 ? "!opacity-100" : ""}`}
            >
              <Image
                src={"/test.webp"}
                alt={"Quang's"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="rounded-md"
                onClick={() => carouselApi?.scrollTo(0)}
              />
            </Button>
            <Button
              variant={"ghost"}
              className={`!size-20 rounded-md opacity-50 hover:opacity-100 tablet:!size-24 ${carouselSlide === 1 ? "!opacity-100" : ""}`}
            >
              <Image
                src={"/test.webp"}
                alt={"Quang's"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="rounded-md"
                onClick={() => carouselApi?.scrollTo(1)}
              />
            </Button>
            <Button
              variant={"ghost"}
              className={`!size-20 rounded-md opacity-50 hover:opacity-100 tablet:!size-24 ${carouselSlide === 2 ? "!opacity-100" : ""}`}
            >
              <Image
                src={"/test.webp"}
                alt={"Quang's"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="rounded-md"
                onClick={() => carouselApi?.scrollTo(2)}
              />
            </Button>
            <Button
              variant={"ghost"}
              className={`!size-20 rounded-md opacity-50 hover:opacity-100 tablet:!size-24 ${carouselSlide === 3 ? "!opacity-100" : ""}`}
            >
              <Image
                src={"/test.webp"}
                alt={"Quang's"}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="rounded-md"
                onClick={() => carouselApi?.scrollTo(3)}
              />
            </Button>
          </div>
        </div>

        {/* Small opening statement */}
        <div className="mt-16 h-[1px] w-48 rounded-md bg-primary tablet:w-72"></div>
        <p className="mt-16 max-w-72 text-sm tracking-wide sm:max-w-lg tablet:max-w-xl tablet:text-base">
          Khue&apos;s Kitchen is a lifelong project dedicated to and inspired by
          Khue Pham&apos;s legacy. For the last 30 years, Khue&apos;s devotion
          to flavor, creativity and tradition has touched the lives of friends,
          family and eaters across the Midwest. Today, her son, chef/owner Eric
          Pham is honoring the memories and experiences of his mom&apos;s
          artistry through Khue&apos;s Kitchen. Using bold Vietnamese flavors,
          Eric blends influential and traditional dishes from his childhood with
          a modern perspective to reimagine Vietnamese cuisine.
        </p>
        {/* Centerpiece of Eric */}
        <div className="mt-16 h-[1px] w-48 rounded-md bg-primary tablet:w-72"></div>
        <div className="baseVertFlex w-full gap-2 pt-16">
          <p className="text-2xl font-semibold text-primary">Meet the Chef</p>
          {/* toy around with ideas of some kind of animated underline here. Either a real simple
              left to right one, or some kind of animated svg path for a stylized underline. Look
              for examples online of what could be considered a "fancy" underline */}
          <p className="text-xl">Eric Pham</p>
        </div>
        <div className="baseFlex relative w-full px-4 pb-8 pt-16 tablet:max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              opacity: { duration: 0.2 },
              type: "spring",
              stiffness: 200,
              damping: 20,
              mass: 0.75,
            }}
            viewport={{ once: true, amount: 0.75 }}
            className="relative h-[425px] w-[300px] rounded-md tablet:h-[525px] tablet:w-[350px]"
          >
            <Image src="/eric.webp" alt="Eric" fill className="rounded-md" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              opacity: { duration: 0.2 },
              type: "spring",
              stiffness: 200,
              damping: 20,
              mass: 0.75,
            }}
            viewport={{ once: true, amount: 0.35 }}
            className="absolute bottom-0 left-0 z-[-1] h-3/4 w-full bg-primary tablet:rounded-md"
          ></motion.div>
        </div>
        {/* Q&A w/ Eric */}
        <div className="mt-16 text-lg italic">
          Q/A Session with Chef/Owner Eric Pham
        </div>

        <div className="baseVertFlex mt-8 !items-start gap-8">
          <p className="pt-8 text-lg font-semibold">Why Cooking?</p>
          <p className="max-w-72 tracking-wide tablet:max-w-xl">
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
          <p className="max-w-72 tracking-wide tablet:max-w-xl">
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
          <p className="max-w-72 tracking-wide tablet:max-w-xl">
            Eating. When I&apos;m not cooking, I&apos;m usually trying other
            peoples&apos; cooking. There&apos;s nothing better than planning an
            entire day with friends around finding which restaurant has the best
            pizza. A bunch of guys eating pizza for science.
          </p>
        </div>

        <div className="mt-16 h-[1px] w-48 rounded-md bg-primary tablet:w-72"></div>

        {/* TODO: should we add a section for "Our team", and have a left-justified list
            of "Firstname Lastname - Role"? and if so, would it be *everyone*? including
            the servers and dishwashers? */}
      </div>
    </motion.div>
  );
}

export default OurStory;

interface RestaurantAndBackstory {
  name: string;
  backstory: string;
}

function RestaurantAndBackstory({ name, backstory }: RestaurantAndBackstory) {
  return (
    <div className="baseVertFlex relative rounded-md border sm:pt-4 tablet:rounded-none tablet:border-none  tablet:pt-0 ">
      <Image
        src="/test.webp"
        alt="Khue's"
        fill
        className="!relative !w-80 rounded-t-md sm:!w-96 tablet:!h-[450px] tablet:!w-[600px] tablet:rounded-md"
      />

      <div className="baseVertFlex w-full max-w-80 gap-2 rounded-b-md p-4 sm:max-w-md tablet:absolute tablet:bottom-0 tablet:left-0 tablet:!items-start tablet:rounded-br-none tablet:rounded-tr-md tablet:bg-gradient-to-tr tablet:from-black tablet:to-black/50 tablet:text-white">
        <p className="font-semibold underline underline-offset-2">{name}</p>
        <p className="text-sm">{backstory}</p>
      </div>
    </div>
  );
}
