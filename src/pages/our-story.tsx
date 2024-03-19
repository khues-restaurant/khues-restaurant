import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import Image from "next/image";

const restaurantNamesAndBackstories = [
  {
    name: "Quang's",
    backstory:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
  },
  {
    name: "Khue's (Ghost) Kitchen",
    backstory:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
  },
  {
    name: "Khue's Kitchen @ Bar Brava",
    backstory:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
  },
  {
    name: "Khue's",
    backstory:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
  },
];

function OurStory() {
  const [selectedImageIndex, setSelectedImageIndex] = useState("item-4");

  const viewportLabel = useGetViewportLabel();

  console.log(
    restaurantNamesAndBackstories.find(
      (restaurant) => restaurant.name === selectedImageIndex,
    )?.backstory,
  );

  return (
    <motion.div
      key={"our-story"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-[6.05rem] min-h-dvh w-full !justify-start tablet:mt-32"
    >
      {/* Hero */}
      <div className="baseFlex tablet:[125vw] relative h-56 w-full tablet:h-72">
        <div className="baseFlex absolute left-0 top-0 w-full border-b-2">
          {/* wide-ish angle shot of the dining room maybe? technically could also
              do outside shot of restaurant as well! */}
          <div className="imageFiller h-56 w-full tablet:h-72"></div>
        </div>

        <div className="baseFlex z-10 rounded-md bg-white p-2 shadow-lg">
          <div className="experimentalBorder baseFlex px-8 py-4 text-xl font-semibold tablet:text-2xl">
            Our story
          </div>
        </div>
      </div>

      <div className="baseVertFlex relative w-full pb-8 tablet:w-3/4">
        {/* "Accordion" on mobile / static "slideshow" on tablet+ of images + backstory of
            Quang's, Khue's (Ghost) Kitchen, Khue's Kitchen @ Bar Brava, and Khue's */}

        {/* for "Accordion", technically can try and finagle a system where you use the same
            wide rectangle images as the desktop version, and just offset the little trigger previews
            to show eric's head/face in them, so that when opened you can do the same 50% black gradient
            with white text and have image be full trigger, but not trying that for now */}

        {/* triggers will be p-0 (image-cover?) if not selected then opacity-50? that way you can leave
            the "v/u" icon to be black? */}
        {/* TODO: probably want to end up refactoring to have "useCustomTrigger" prop on accorion to
            just take in raw string to add into className instead of just the boolean that it is now, that way
            you can have it to be right-4 top-1/2. Side note, as long as the accessibilty isn't terrible, might
            just be able to fade opacity of chevron when accordion item is active, since we are keeping min
            one accordion item open at all times.  */}
        {/* also haven't played with it but prob scroll to item on click? currently seems like it only does
            it halfway or it's janky */}
        {viewportLabel.includes("mobile") && (
          <Accordion
            type="single"
            value={selectedImageIndex}
            onValueChange={(value) => setSelectedImageIndex(value)}
            collapsible={false}
            className="h-full w-full max-w-2xl space-y-2 px-8"
          >
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger
                style={{
                  height: selectedImageIndex === "item-1" ? "350px" : "100px",
                }}
                className="relative w-full overflow-hidden !p-0 !no-underline"
              >
                <Image
                  src="/test.webp"
                  alt="Khue's"
                  fill
                  style={{
                    opacity: selectedImageIndex === "item-1" ? 1 : 0.5,
                    borderRadius:
                      selectedImageIndex === "item-1"
                        ? "0.375rem 0.375rem 0 0"
                        : "0.375rem",
                  }}
                  className="rounded-md object-cover object-center"
                />
              </AccordionTrigger>

              <AccordionContent className="rounded-md rounded-t-none border-4 border-t-0 border-primary pt-2">
                <div className="baseVertFlex !items-start gap-2 px-4 py-2">
                  <p className="text-lg font-semibold underline underline-offset-2">
                    Khues Kitchen
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-none">
              <AccordionTrigger
                style={{
                  height: selectedImageIndex === "item-2" ? "350px" : "100px",
                }}
                className="relative w-full overflow-hidden !p-0 !no-underline"
              >
                <Image
                  src="/test.webp"
                  alt="Khue's"
                  fill
                  style={{
                    opacity: selectedImageIndex === "item-2" ? 1 : 0.5,
                    borderRadius:
                      selectedImageIndex === "item-2"
                        ? "0.375rem 0.375rem 0 0"
                        : "0.375rem",
                  }}
                  className="rounded-md object-cover object-center"
                />
              </AccordionTrigger>

              <AccordionContent className="rounded-md rounded-t-none border-4 border-t-0 border-primary pt-2">
                <div className="baseVertFlex !items-start gap-2 px-4 py-2">
                  <p className="text-lg font-semibold underline underline-offset-2">
                    Khues Kitchen
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-none">
              <AccordionTrigger
                style={{
                  height: selectedImageIndex === "item-3" ? "350px" : "100px",
                }}
                className="relative w-full overflow-hidden !p-0 !no-underline"
              >
                <Image
                  src="/test.webp"
                  alt="Khue's"
                  fill
                  style={{
                    opacity: selectedImageIndex === "item-3" ? 1 : 0.5,
                    borderRadius:
                      selectedImageIndex === "item-3"
                        ? "0.375rem 0.375rem 0 0"
                        : "0.375rem",
                  }}
                  className="rounded-md object-cover object-center"
                />
              </AccordionTrigger>

              <AccordionContent className="rounded-md rounded-t-none border-4 border-t-0 border-primary pt-2">
                <div className="baseVertFlex !items-start gap-2 px-4 py-2">
                  <p className="text-lg font-semibold underline underline-offset-2">
                    Khues Kitchen
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-none">
              <AccordionTrigger
                style={{
                  height: selectedImageIndex === "item-4" ? "350px" : "100px",
                }}
                className="relative w-full overflow-hidden !p-0 !no-underline"
              >
                <Image
                  src="/test.webp"
                  alt="Khue's"
                  fill
                  style={{
                    opacity: selectedImageIndex === "item-4" ? 1 : 0.5,
                    borderRadius:
                      selectedImageIndex === "item-4"
                        ? "0.375rem 0.375rem 0 0"
                        : "0.375rem",
                  }}
                  className="rounded-md object-cover object-center"
                />
              </AccordionTrigger>

              <AccordionContent className="rounded-md rounded-t-none border-4 border-t-0 border-primary pt-2">
                <div className="baseVertFlex !items-start gap-2 px-4 py-2">
                  <p className="text-lg font-semibold underline underline-offset-2">
                    Khues Kitchen
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* TODO: will need extra state but on hover have opacity go to 1 as well  */}
        {!viewportLabel.includes("mobile") && (
          <div className="baseFlex w-full max-w-3xl gap-4">
            {/* preview images which are really just "buttons", fine to keep as images w/ onClick? */}
            <div className="baseVertFlex gap-2">
              <Image
                src="/test.webp"
                alt="Khue's"
                width={150}
                height={100}
                style={{
                  opacity: selectedImageIndex === "item-1" ? 1 : 0.5,
                }}
                className="cursor-pointer rounded-md transition-opacity duration-500"
                onClick={() => setSelectedImageIndex("item-1")}
              />
              <Image
                src="/test.webp"
                alt="Khue's"
                width={150}
                height={100}
                style={{
                  opacity: selectedImageIndex === "item-2" ? 1 : 0.5,
                }}
                className="cursor-pointer rounded-md transition-opacity duration-500"
                onClick={() => setSelectedImageIndex("item-2")}
              />
              <Image
                src="/test.webp"
                alt="Khue's"
                width={150}
                height={100}
                style={{
                  opacity: selectedImageIndex === "item-3" ? 1 : 0.5,
                }}
                className="cursor-pointer rounded-md transition-opacity duration-500"
                onClick={() => setSelectedImageIndex("item-3")}
              />
              <Image
                src="/test.webp"
                alt="Khue's"
                width={150}
                height={100}
                style={{
                  opacity: selectedImageIndex === "item-4" ? 1 : 0.5,
                }}
                className="cursor-pointer rounded-md transition-opacity duration-500"
                onClick={() => setSelectedImageIndex("item-4")}
              />
            </div>

            {/* main image + backstory */}
            <div className="baseFlex w-full">
              <AnimatePresence>
                <RestaurantAndBackstory
                  name={
                    restaurantNamesAndBackstories.find(
                      (_, index) => `item-${index + 1}` === selectedImageIndex,
                    )?.name ?? "Khue's"
                  }
                  backstory={
                    restaurantNamesAndBackstories.find(
                      (_, index) => `item-${index + 1}` === selectedImageIndex,
                    )?.backstory ?? ""
                  }
                />
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Small opening statement */}

        {/* Centerpiece of Eric */}

        {/* Q&A w/ Eric */}

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
  console.log(name, backstory);
  return (
    <motion.div
      key={`restaurant-${name}-backstory`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex relative h-[450px] w-[600px] gap-2"
    >
      <Image src="/test.webp" alt="Khue's" fill className="rounded-md" />
      <div className="baseVertFlex absolute bottom-0 left-0 !items-start gap-2 rounded-b-md bg-gradient-to-tr from-black to-black/50 p-4 text-white">
        <p className="text-lg font-semibold underline underline-offset-2">
          {name}
        </p>
        <p>{backstory}</p>
      </div>
    </motion.div>
  );
}
