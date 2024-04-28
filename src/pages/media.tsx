import { motion } from "framer-motion";
import Image from "next/image";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { Button } from "~/components/ui/button";

// TODO: import these images so you don't have to declare the
// width and height for <Images>? seems like a free win

function Media() {
  // don't see why you wouldn't want to have the title of the publication be a link
  // to their website

  return (
    <motion.div
      key={"media"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-24 min-h-[calc(100dvh-6rem)] w-full !justify-start tablet:mt-28 tablet:min-h-[calc(100dvh-7rem)]"
    >
      {/* Hero */}
      <div className="baseFlex relative h-56 w-full overflow-hidden bg-gradient-to-br from-primary to-darkPrimary tablet:h-72">
        <div className="baseFlex z-10 mx-8 rounded-md bg-offwhite p-2 shadow-lg tablet:!flex">
          <div className="baseFlex gap-2 text-xl font-semibold text-primary tablet:p-2 desktop:text-2xl">
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary desktop:h-5" />
            Media
            <SideAccentSwirls className="h-4 fill-primary desktop:h-5" />
          </div>
        </div>
      </div>

      <div className="relative grid w-80 grid-cols-1 gap-8 py-16 tablet:w-[900px] tablet:grid-cols-2 tablet:gap-16">
        <div className="baseVertFlex h-min w-full !justify-start rounded-md border-2 border-primary shadow-md">
          <div className="baseVertFlex relative w-full bg-primary">
            <Image
              src="/media/kare11InTheKitchen.jpg"
              alt="TODO"
              // width={200}
              // height={85}
              fill
              sizes="(min-width: 1000px) 400px, 320px"
              className="!relative rounded-t-sm bg-offwhite"
            />
          </div>

          <div className="baseVertFlex w-full !items-start gap-2 hyphens-auto p-4">
            <Image
              src="/press/StarTribune.png"
              alt="TODO"
              width={200}
              height={85}
              className="mb-4"
            />
            <p className="text-lg font-semibold">
              KARE in the Kitchen: Fried chicken sandwiches with Eric Pham from
              Khue&apos;s Kitchen
            </p>
            &quot;Chef Eric Pham, the chef and owner behind Khue&apos;s Kitchen,
            whips up a delicious, hot and juicy fried chicken sandwich with KARE
            11&apos;s Jennifer Austin.&quot;
            <div className="baseFlex mt-2 w-full !justify-between">
              <Button variant={"link"} className="h-8 !p-0" asChild>
                <a href="https://www.startribune.com/">Read more</a>
              </Button>
              <p className="text-sm italic text-stone-400">8/13/2022</p>
            </div>
          </div>
        </div>

        <div className="baseVertFlex h-min w-full !justify-start rounded-md border-2 border-primary shadow-md">
          <div className="baseVertFlex relative w-full bg-primary">
            <Image
              src="/media/kare11MothersDay.jpg"
              alt="TODO"
              // width={200}
              // height={85}
              fill
              sizes="(min-width: 1000px) 400px, 320px"
              className="!relative rounded-t-sm bg-offwhite"
            />
          </div>

          <div className="baseVertFlex w-full !items-start gap-2 hyphens-auto p-4">
            <Image
              src="/press/StarTribune.png"
              alt="TODO"
              width={200}
              height={85}
              className="mb-4"
            />
            <p className="text-lg font-semibold">
              Minneapolis chef credits his mom for inspiration
            </p>
            &quot;The Quang Restaurant is synonymous with Eat Street. The
            popular Vietnamese restaurant located in Minneapolis has been
            serving authentic Vietnamese cuisine for over 30 years. It was
            opened by the Pham family, who immigrated to the U.S. after the
            Vietnam War...&quot;
            <div className="baseFlex mt-2 w-full !justify-between">
              <Button variant={"link"} className="h-8 !p-0" asChild>
                <a href="https://www.startribune.com/">Read more</a>
              </Button>
              <p className="text-sm italic text-stone-400">10/14/2023</p>
            </div>
          </div>
        </div>

        <div className="baseVertFlex h-min w-full !justify-start rounded-md border-2 border-primary shadow-md">
          <div className="baseVertFlex relative w-full bg-primary">
            <Image
              src="/media/starTribune.jpg"
              alt="TODO"
              // width={200}
              // height={85}
              fill
              sizes="(min-width: 1000px) 400px, 320px"
              className="!relative rounded-t-sm bg-offwhite"
            />
          </div>

          <div className="baseVertFlex w-full !items-start gap-2 hyphens-auto p-4">
            <Image
              src="/press/StarTribune.png"
              alt="TODO"
              width={200}
              height={85}
              className="mb-4"
            />
            <p className="text-lg font-semibold">
              These 4 Twin Cities area restaurateurs learned from the best: Mom
            </p>
            &quot;For Khue Pham, the restaurant business is inextricable from
            sacrifice. Her mother, Lung Tran, was just 36 when her father,
            Quang, died unexpectedly. With six kids to raise, there was little
            time to sit in her grief. Instead, she built a restaurant that
            endures as an iconic Minneapolis institution: Quang. &ldquo;I
            remember sleeping on a cot in the restaurant because I was so tired
            I couldn&apos;t drive,&rdquo; said Khue. She and her...&quot;
            <div className="baseFlex mt-2 w-full !justify-between">
              <Button variant={"link"} className="h-8 !p-0" asChild>
                <a href="https://www.startribune.com/">Read more</a>
              </Button>
              <p className="text-sm italic text-stone-400">10/10/2023</p>
            </div>
          </div>
        </div>

        <div className="baseVertFlex h-min w-full !justify-start rounded-md border-2 border-primary shadow-md">
          <div className="baseVertFlex relative w-full bg-primary">
            <Image
              src="/media/mpr.jpg"
              alt="TODO"
              // width={200}
              // height={85}
              fill
              sizes="(min-width: 1000px) 400px, 320px"
              className="!relative rounded-t-sm bg-offwhite"
            />
          </div>

          <div className="baseVertFlex w-full !items-start gap-2 hyphens-auto p-4">
            <Image
              src="/press/StarTribune.png"
              alt="TODO"
              width={200}
              height={85}
              className="mb-4"
            />
            <p className="text-lg font-semibold">
              Eric Pham of the Quang Restaurant family
            </p>
            &quot;Eric Pham grew up in Minneapolis&apos; Quang Restaurant
            family. Now a chef in his own right, he talked to Tom Crann about
            opening his own place — Khue&apos;s Kitchen, named for his mom Khue
            Pham — and showed us how he makes his favorite dish: bánh mì xíu
            mại, Vietnamese meatball sandwiches.&quot;
            <div className="baseFlex mt-2 w-full !justify-between">
              <Button variant={"link"} className="h-8 !p-0" asChild>
                <a href="https://www.startribune.com/">Read more</a>
              </Button>
              <p className="text-sm italic text-stone-400">12/27/2023</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Media;
