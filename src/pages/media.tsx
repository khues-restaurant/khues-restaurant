import { motion } from "framer-motion";
import Image from "next/image";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { Button } from "~/components/ui/button";

import { Charis_SIL } from "next/font/google";
const charis = Charis_SIL({
  subsets: ["latin"],
  weight: ["400", "700"],
});

import kare11InTheKitchen from "/public/media/kare11InTheKitchen.jpg";
import kare11MothersDay from "/public/media/kare11MothersDay.jpg";
import starTribune from "/public/media/starTribune.jpg";
import mpr from "/public/media/mpr.jpg";
import kare11Logo from "/public/media/kare11Logo.png";
import starTribuneLogo from "/public/media/starTribuneLogo.png";
import mprLogo from "/public/media/mprLogo.png";
import StaticLotus from "~/components/ui/StaticLotus";

function Media() {
  return (
    <motion.div
      key={"media"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex min-h-[calc(100dvh-5rem)] w-full !justify-start tablet:min-h-[calc(100dvh-6rem)]"
    >
      {/* Hero */}

      {/* if doing images in hero, maybe only darkPrimary as singular color w/o a gradient? 
      
      bg-gradient-to-br from-darkPrimary  via-primary to-darkPrimary
      */}
      <div className="baseFlex relative h-56 w-full overflow-hidden bg-darkPrimary shadow-md tablet:h-72">
        {/* below: pick one or the other, or neither but they can't work together for sure */}

        <div className="absolute inset-0 grid h-56 w-full grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1 tablet:h-72">
          <Image
            src={kare11InTheKitchen}
            alt="Chef Eric Pham, owner of Khue's Kitchen, with KARE 11's Jennifer Austin in a kitchen studio. Chef Eric Pham whips up a delicious, hot and juicy fried chicken sandwich with Jennifer Austin."
            fill
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
            className="!relative !size-full object-cover object-top opacity-20"
          />
          <Image
            src={kare11MothersDay}
            alt="Khue Pham, lead chef at Quang Restaurant in Minneapolis, converses with her two sons in the kitchen."
            fill
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
            className="!relative !size-full object-cover object-top opacity-20"
          />
          <Image
            src={starTribune}
            alt="Khue Pham, lead chef at Quang Restaurant, smiling and posing with her young son, Eric Pham, both dressed formally."
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
        </div>

        <div className="baseFlex z-10 mx-8 rounded-md bg-offwhite p-4 shadow-heroContainer tablet:!flex">
          <div className="baseFlex gap-2 text-xl font-semibold text-primary tablet:p-2 desktop:text-2xl">
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary desktop:h-5" />
            <h1 className={`${charis.className}`}>Media</h1>
            <SideAccentSwirls className="h-4 fill-primary desktop:h-5" />
          </div>
        </div>
      </div>

      <div className="relative grid w-80 grid-cols-1 gap-8 py-16 pb-24 md:w-[700px] md:grid-cols-2 md:gap-8 xl:!hidden">
        <div className="baseVertFlex h-min w-full !justify-start rounded-md border shadow-md">
          <Button variant={"text"} asChild>
            <a
              href="https://www.kare11.com/video/life/food/recipes/kare-in-the-kitchen-fried-chicken-sandwiches-with-eric-pham-from-khues-kitchen/89-ad173b59-cea7-4fdf-b05a-3711b8c97553"
              className="baseVertFlex relative z-10 !size-full rounded-b-none rounded-t-md bg-primary !p-0 shadow-md"
            >
              <Image
                src={kare11InTheKitchen}
                alt="Chef Eric Pham, owner of Khue's Kitchen, with KARE 11's Jennifer Austin in a kitchen studio. Chef Eric Pham whips up a delicious, hot and juicy fried chicken sandwich with Jennifer Austin."
                sizes="(max-width: 1000px) 400px, 320px"
                className="!relative rounded-t-md bg-offwhite"
              />
            </a>
          </Button>

          <div className="baseVertFlex relative w-full !items-start gap-2 overflow-hidden hyphens-auto rounded-b-md bg-offwhite p-4 pb-12 pt-3">
            <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
            <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />
            <Button variant={"text"} className="!p-0" asChild>
              <a href="https://www.kare11.com/">
                <Image
                  src={kare11Logo}
                  alt="Kare 11's logo"
                  width={86}
                  height={40}
                />
              </a>
            </Button>
            <p className="pb-2 text-lg font-semibold">
              KARE in the Kitchen: Fried chicken sandwiches with Eric Pham from
              Khue&apos;s Kitchen
            </p>
            &quot;Chef Eric Pham, the chef and owner behind Khue&apos;s Kitchen,
            whips up a delicious, hot and juicy fried chicken sandwich with KARE
            11&apos;s Jennifer Austin.&quot;
            <div className="baseFlex mt-2 w-full !justify-between">
              <Button variant={"link"} className="h-8 !p-0" asChild>
                <a href="https://www.kare11.com/video/life/food/recipes/kare-in-the-kitchen-fried-chicken-sandwiches-with-eric-pham-from-khues-kitchen/89-ad173b59-cea7-4fdf-b05a-3711b8c97553">
                  Read more
                </a>
              </Button>
              <p className="text-sm italic text-stone-400">8/13/2022</p>
            </div>
          </div>
        </div>

        <div className="baseVertFlex h-min w-full !justify-start rounded-md border shadow-md">
          <Button variant={"text"} asChild>
            <a
              href="https://www.kare11.com/article/news/local/mpls-chef-credits-his-mom-for-inspiration/89-0f237053-85cf-48ae-96f7-8cbebb780555"
              className="baseVertFlex relative z-10 !size-full rounded-b-none rounded-t-md bg-primary !p-0 shadow-md"
            >
              <Image
                src={kare11MothersDay}
                alt="Khue Pham, lead chef at Quang Restaurant in Minneapolis, converses with her two sons in the kitchen."
                sizes="(max-width: 1000px) 400px, 320px"
                className="!relative rounded-t-md bg-offwhite"
              />
            </a>
          </Button>

          <div className="baseVertFlex relative w-full !items-start gap-2 overflow-hidden hyphens-auto rounded-b-md bg-offwhite p-4 pb-12 pt-3">
            <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
            <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />
            <Button variant={"text"} className="!p-0" asChild>
              <a href="https://www.kare11.com/">
                <Image
                  src={kare11Logo}
                  alt="Kare 11's logo"
                  width={86}
                  height={40}
                />
              </a>
            </Button>
            <p className="pb-2 text-lg font-semibold">
              Minneapolis chef credits his mom for inspiration
            </p>
            &quot;The Quang Restaurant is synonymous with Eat Street. The
            popular Vietnamese restaurant located in Minneapolis has been
            serving authentic Vietnamese cuisine for over 30 years. It was
            opened by the Pham family, who immigrated to the U.S. after the
            Vietnam War...&quot;
            <div className="baseFlex mt-2 w-full !justify-between">
              <Button variant={"link"} className="h-8 !p-0" asChild>
                <a href="https://www.kare11.com/article/news/local/mpls-chef-credits-his-mom-for-inspiration/89-0f237053-85cf-48ae-96f7-8cbebb780555">
                  Read more
                </a>
              </Button>
              <p className="text-sm italic text-stone-400">10/14/2023</p>
            </div>
          </div>
        </div>

        <div className="baseVertFlex h-min w-full !justify-start rounded-md border shadow-md">
          <Button variant={"text"} asChild>
            <a
              href="https://www.startribune.com/how-these-moms-shaped-the-next-generation-of-great-twin-cities-restaurateurs/600273728/?refresh=true"
              className="baseVertFlex relative z-10 !size-full rounded-b-none rounded-t-md bg-primary !p-0 shadow-md"
            >
              <Image
                src={starTribune}
                alt="Khue Pham, lead chef at Quang Restaurant, smiling and posing with her young son, Eric Pham, both dressed formally."
                sizes="(max-width: 1000px) 400px, 320px"
                className="!relative rounded-t-md bg-offwhite"
              />
            </a>
          </Button>

          <div className="baseVertFlex relative w-full !items-start gap-2 overflow-hidden hyphens-auto rounded-b-md bg-offwhite p-4 pb-12 pt-2">
            <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
            <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />
            <Button variant={"text"} className="!p-0" asChild>
              <a href="https://www.startribune.com/">
                <Image
                  src={starTribuneLogo}
                  alt="Star Tribune's logo"
                  width={150}
                  height={35}
                  className="-ml-5"
                />
              </a>
            </Button>
            <p className="pb-2 text-lg font-semibold">
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
                <a href="https://www.startribune.com/how-these-moms-shaped-the-next-generation-of-great-twin-cities-restaurateurs/600273728/?refresh=true">
                  Read more
                </a>
              </Button>
              <p className="text-sm italic text-stone-400">10/10/2023</p>
            </div>
          </div>
        </div>

        <div className="baseVertFlex h-min w-full !justify-start rounded-md border shadow-md">
          <Button variant={"text"} asChild>
            <a
              href="https://www.mprnews.org/story/2023/12/27/appetites-looks-back-on-2023-restaurants-vietnamese-meatballs-and-the-secret-to-entertaining"
              className="baseVertFlex relative z-10 !size-full rounded-b-none rounded-t-md bg-primary !p-0 shadow-md"
            >
              <Image
                src={mpr}
                alt="Chef Eric Pham, owner of Khue's Kitchen, smiling while cooking in a professional kitchen."
                sizes="(max-width: 1000px) 400px, 320px"
                className="!relative rounded-t-md bg-offwhite"
              />
            </a>
          </Button>

          <div className="baseVertFlex relative w-full !items-start gap-2 overflow-hidden hyphens-auto rounded-b-md bg-offwhite p-4 pb-12">
            <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
            <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />
            <Button variant={"text"} className="!p-0" asChild>
              <a href="https://www.mprnews.org/">
                <Image
                  src={mprLogo}
                  alt="MPR's logo"
                  width={110}
                  height={85}
                  className="mb-3"
                />
              </a>
            </Button>
            <p className="pb-2 text-lg font-semibold">
              Eric Pham of the Quang Restaurant family
            </p>
            &quot;Eric Pham grew up in Minneapolis&apos; Quang Restaurant
            family. Now a chef in his own right, he talked to Tom Crann about
            opening his own place — Khue&apos;s Kitchen, named for his mom Khue
            Pham — and showed us how he makes his favorite dish: bánh mì xíu
            mại, Vietnamese meatball sandwiches.&quot;
            <div className="baseFlex mt-2 w-full !justify-between">
              <Button variant={"link"} className="h-8 !p-0" asChild>
                <a href="https://www.mprnews.org/story/2023/12/27/appetites-looks-back-on-2023-restaurants-vietnamese-meatballs-and-the-secret-to-entertaining">
                  Read more
                </a>
              </Button>
              <p className="text-sm italic text-stone-400">12/27/2023</p>
            </div>
          </div>
        </div>
      </div>

      <div className="baseVertFlex relative !hidden w-[1200px] gap-16 py-16 pb-24 xl:!flex">
        <div className="baseFlex h-min w-full rounded-md border shadow-md">
          <div className="baseVertFlex relative w-full !items-start gap-2 overflow-hidden hyphens-auto rounded-b-md rounded-l-md bg-offwhite p-6 pb-8 pt-3">
            <StaticLotus className="absolute -right-5 -top-5 size-16 rotate-[-135deg] fill-primary/50" />
            <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />
            <Button variant={"text"} className="!p-0" asChild>
              <a href="https://www.kare11.com/">
                <Image
                  src={kare11Logo}
                  alt="Kare 11's logo"
                  width={86}
                  height={40}
                />
              </a>
            </Button>
            <p className="pb-2 text-lg font-semibold">
              KARE in the Kitchen: Fried chicken sandwiches with Eric Pham from
              Khue&apos;s Kitchen
            </p>
            &quot;Chef Eric Pham, the chef and owner behind Khue&apos;s Kitchen,
            whips up a delicious, hot and juicy fried chicken sandwich with KARE
            11&apos;s Jennifer Austin.&quot;
            <div className="baseFlex mt-2 w-full !justify-between">
              <Button variant={"link"} className="h-8 !p-0" asChild>
                <a href="https://www.kare11.com/video/life/food/recipes/kare-in-the-kitchen-fried-chicken-sandwiches-with-eric-pham-from-khues-kitchen/89-ad173b59-cea7-4fdf-b05a-3711b8c97553">
                  Read more
                </a>
              </Button>
              <p className="text-sm italic text-stone-400">8/13/2022</p>
            </div>
          </div>

          <Button variant={"text"} asChild>
            <a
              href="https://www.kare11.com/video/life/food/recipes/kare-in-the-kitchen-fried-chicken-sandwiches-with-eric-pham-from-khues-kitchen/89-ad173b59-cea7-4fdf-b05a-3711b8c97553"
              className="baseVertFlex relative h-[232px] w-[650px] !rounded-l-none rounded-r-md bg-primary !p-0 shadow-md"
            >
              <Image
                src={kare11InTheKitchen}
                alt="Chef Eric Pham, owner of Khue's Kitchen, with KARE 11's Jennifer Austin in a kitchen studio. Chef Eric Pham whips up a delicious, hot and juicy fried chicken sandwich with Jennifer Austin."
                sizes="(max-width: 1000px) 400px, 320px"
                className="!relative rounded-r-md bg-offwhite"
              />
            </a>
          </Button>
        </div>

        <div className="baseFlex h-min w-full rounded-md border shadow-md">
          <div className="baseVertFlex relative w-full !items-start gap-2 overflow-hidden hyphens-auto rounded-l-md bg-offwhite p-6 pb-8 pt-3">
            <StaticLotus className="absolute -right-5 -top-5 size-16 rotate-[-135deg] fill-primary/50" />
            <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />
            <Button variant={"text"} className="!p-0" asChild>
              <a href="https://www.kare11.com/">
                <Image
                  src={kare11Logo}
                  alt="Kare 11's logo"
                  width={86}
                  height={40}
                />
              </a>
            </Button>
            <p className="pb-2 text-lg font-semibold">
              Minneapolis chef credits his mom for inspiration
            </p>
            &quot;The Quang Restaurant is synonymous with Eat Street. The
            popular Vietnamese restaurant located in Minneapolis has been
            serving authentic Vietnamese cuisine for over 30 years. It was
            opened by the Pham family, who immigrated to the U.S. after the
            Vietnam War...&quot;
            <div className="baseFlex mt-2 w-full !justify-between">
              <Button variant={"link"} className="h-8 !p-0" asChild>
                <a href="https://www.kare11.com/article/news/local/mpls-chef-credits-his-mom-for-inspiration/89-0f237053-85cf-48ae-96f7-8cbebb780555">
                  Read more
                </a>
              </Button>
              <p className="text-sm italic text-stone-400">10/14/2023</p>
            </div>
          </div>

          <Button variant={"text"} asChild>
            <a
              href="https://www.kare11.com/article/news/local/mpls-chef-credits-his-mom-for-inspiration/89-0f237053-85cf-48ae-96f7-8cbebb780555"
              className="baseVertFlex relative h-[256px] w-[650px] !rounded-l-none rounded-r-md bg-primary !p-0 shadow-md"
            >
              <Image
                src={kare11MothersDay}
                alt="Khue Pham, lead chef at Quang Restaurant in Minneapolis, converses with her two sons in the kitchen."
                sizes="(max-width: 1000px) 400px, 320px"
                className="!relative h-full rounded-r-md bg-offwhite"
              />
            </a>
          </Button>
        </div>

        <div className="baseFlex h-min w-full rounded-md border shadow-md">
          <div className="baseVertFlex relative w-full !items-start gap-2 overflow-hidden hyphens-auto rounded-l-md bg-offwhite p-6 pb-7 pt-3">
            <StaticLotus className="absolute -right-5 -top-5 size-16 rotate-[-135deg] fill-primary/50" />
            <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />
            <Button variant={"text"} className="!p-0" asChild>
              <a href="https://www.startribune.com/">
                <Image
                  src={starTribuneLogo}
                  alt="Star Tribune's logo"
                  width={150}
                  height={35}
                  className="-ml-5"
                />
              </a>
            </Button>
            <p className="pb-2 text-lg font-semibold">
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
                <a href="https://www.startribune.com/how-these-moms-shaped-the-next-generation-of-great-twin-cities-restaurateurs/600273728/?refresh=true">
                  Read more
                </a>
              </Button>
              <p className="text-sm italic text-stone-400">10/10/2023</p>
            </div>
          </div>

          <Button variant={"text"} asChild>
            <a
              href="https://www.startribune.com/how-these-moms-shaped-the-next-generation-of-great-twin-cities-restaurateurs/600273728/?refresh=true"
              className="baseVertFlex relative h-[300px] w-[650px] !rounded-l-none rounded-r-md bg-primary !p-0 shadow-md"
            >
              <Image
                src={starTribune}
                alt="Khue Pham, lead chef at Quang Restaurant, smiling and posing with her young son, Eric Pham, both dressed formally."
                sizes="(max-width: 1000px) 400px, 320px"
                className="!relative !h-full rounded-r-md bg-offwhite !object-cover"
              />
            </a>
          </Button>
        </div>

        <div className="baseFlex h-min w-full rounded-md border shadow-md">
          <div className="baseVertFlex relative w-full !items-start gap-2 overflow-hidden hyphens-auto rounded-l-md bg-offwhite px-6 pb-8 pt-5">
            <StaticLotus className="absolute -right-5 -top-5 size-16 rotate-[-135deg] fill-primary/50" />
            <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />
            <Button variant={"text"} className="!p-0" asChild>
              <a href="https://www.mprnews.org/">
                <Image
                  src={mprLogo}
                  alt="MPR's logo"
                  width={110}
                  height={85}
                  className="mb-2"
                />
              </a>
            </Button>
            <p className="pb-2 text-lg font-semibold">
              Eric Pham of the Quang Restaurant family
            </p>
            &quot;Eric Pham grew up in Minneapolis&apos; Quang Restaurant
            family. Now a chef in his own right, he talked to Tom Crann about
            opening his own place — Khue&apos;s Kitchen, named for his mom Khue
            Pham — and showed us how he makes his favorite dish: bánh mì xíu
            mại, Vietnamese meatball sandwiches.&quot;
            <div className="baseFlex mt-2 w-full !justify-between">
              <Button variant={"link"} className="h-8 !p-0" asChild>
                <a href="https://www.mprnews.org/story/2023/12/27/appetites-looks-back-on-2023-restaurants-vietnamese-meatballs-and-the-secret-to-entertaining">
                  Read more
                </a>
              </Button>
              <p className="text-sm italic text-stone-400">12/27/2023</p>
            </div>
          </div>

          <Button variant={"text"} asChild>
            <a
              href="https://www.mprnews.org/story/2023/12/27/appetites-looks-back-on-2023-restaurants-vietnamese-meatballs-and-the-secret-to-entertaining"
              className="baseVertFlex relative h-[288px] w-[650px] !rounded-l-none rounded-r-md bg-primary !p-0 shadow-md"
            >
              <Image
                src={mpr}
                alt="Chef Eric Pham, owner of Khue's Kitchen, smiling while cooking in a professional kitchen."
                sizes="(max-width: 1000px) 400px, 415px"
                className="!relative !h-full rounded-r-md bg-offwhite object-cover"
              />
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default Media;
