import { motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { Button } from "~/components/ui/button";

import kare11InTheKitchen from "/public/media/kare11InTheKitchen.jpg";
import kare11MothersDay from "/public/media/kare11MothersDay.jpg";
import starTribune from "/public/media/starTribune.jpg";
import mpr from "/public/media/mpr.jpg";
import kare11Logo from "/public/media/kare11Logo.png";
import starTribuneLogo from "/public/media/starTribuneLogo.png";
import mprLogo from "/public/media/mprLogo.png";

function Media() {
  return (
    <motion.div
      key={"media"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-24 min-h-[calc(100dvh-6rem)] w-full !justify-start tablet:mt-28 tablet:min-h-[calc(100dvh-7rem)]"
    >
      <Head>
        <title>Media | Khue&apos;s</title>
        <meta
          name="description"
          content="Explore Khue's Kitchen in the media, featuring interviews, articles, and videos showcasing Chef Eric Pham's culinary journey and Vietnamese cuisine."
        />
        <meta property="og:title" content="Media | Khue's"></meta>
        <meta property="og:url" content="www.khueskitchen.com/media" />
        <meta
          property="og:description"
          content="Explore Khue's Kitchen in the media, featuring interviews, articles, and videos showcasing Chef Eric Pham's culinary journey and Vietnamese cuisine."
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

      {/* if doing images in hero, maybe only darkPrimary as singular color w/o a gradient? 
      
      bg-gradient-to-br from-darkPrimary  via-primary to-darkPrimary
      */}
      <div className="baseFlex relative h-56 w-full overflow-hidden bg-darkPrimary shadow-md tablet:h-72">
        {/* below: pick one or the other, or neither but they can't work together for sure */}

        <div className="absolute inset-0 grid h-56 w-full grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1 tablet:h-72">
          <Image
            src={kare11InTheKitchen}
            alt="TODO"
            fill
            // sizes="(min-width: 1000px) 400px, 320px"
            className="!relative !size-full object-cover object-top opacity-20"
          />
          <Image
            src={kare11MothersDay}
            alt="TODO"
            fill
            // sizes="(min-width: 1000px) 400px, 320px"
            className="!relative !size-full object-cover object-top opacity-20"
          />
          <Image
            src={starTribune}
            alt="TODO"
            fill
            // sizes="(min-width: 1000px) 400px, 320px"
            className="!relative !size-full object-cover object-top opacity-20"
          />
          <Image
            src={mpr}
            alt="TODO"
            fill
            // sizes="(min-width: 1000px) 400px, 320px"
            className="!relative !size-full object-cover object-top opacity-20"
          />
        </div>

        {/* <div className="pointer-events-none absolute inset-0">
          <div
            // top left
            className="absolute left-0 top-0 h-3/4 w-1/6 bg-black opacity-50"
            style={{
              clipPath: "polygon(0 0, 100% 0, 0 100%)",
            }}
          ></div>
          <div
            // top right
            className="absolute right-0 top-0 h-3/4 w-1/6 bg-black opacity-50"
            style={{
              clipPath: "polygon(100% 0, 100% 100%, 0 0)",
            }}
          ></div>
          <div
            // bottom left
            className="absolute bottom-0 left-0 h-3/4 w-1/6 bg-black opacity-50"
            style={{
              clipPath: "polygon(0 0, 0 100%, 100% 100%)",
            }}
          ></div>
          <div
            // bottom right
            className="absolute bottom-0 right-0 h-3/4 w-1/6 bg-black opacity-50"
            style={{
              clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
            }}
          ></div>
        </div> */}

        <div className="baseFlex z-10 mx-8 rounded-md bg-offwhite p-4 shadow-lg tablet:!flex">
          <div className="baseFlex gap-2 text-xl font-semibold text-primary tablet:p-2 desktop:text-2xl">
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary desktop:h-5" />
            <h1>Media</h1>
            <SideAccentSwirls className="h-4 fill-primary desktop:h-5" />
          </div>
        </div>
      </div>

      <div className="relative grid w-80 grid-cols-1 gap-8 py-16 pb-24 tablet:w-[900px] tablet:grid-cols-2 tablet:gap-16 desktop:w-[1200px] desktop:grid-cols-3">
        <div className="baseVertFlex h-min w-full !justify-start rounded-md border-2 border-primary shadow-md">
          <div className="baseVertFlex relative w-full bg-primary shadow-md">
            <a
              href="https://www.kare11.com/video/life/food/recipes/kare-in-the-kitchen-fried-chicken-sandwiches-with-eric-pham-from-khues-kitchen/89-ad173b59-cea7-4fdf-b05a-3711b8c97553"
              className="relative size-full"
            >
              <Image
                src={kare11InTheKitchen}
                alt="TODO"
                sizes="(min-width: 1000px) 400px, 320px"
                className="!relative rounded-t-sm bg-offwhite transition-all hover:brightness-90 active:brightness-75"
              />
            </a>
          </div>

          <div className="baseVertFlex w-full !items-start gap-2 hyphens-auto p-4 pt-3">
            <Button variant={"text"} className="!p-0" asChild>
              <a href="https://www.kare11.com/">
                <Image
                  src={kare11Logo}
                  alt="Kare 11 Logo"
                  width={86}
                  height={40}
                />
              </a>
            </Button>
            <p className="text-lg font-semibold">
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

        <div className="baseVertFlex h-min w-full !justify-start rounded-md border-2 border-primary shadow-md">
          <div className="baseVertFlex relative w-full bg-primary shadow-md">
            <a
              href="https://www.kare11.com/article/news/local/mpls-chef-credits-his-mom-for-inspiration/89-0f237053-85cf-48ae-96f7-8cbebb780555"
              className="relative size-full"
            >
              <Image
                src={kare11MothersDay}
                alt="TODO"
                sizes="(min-width: 1000px) 400px, 320px"
                className="!relative rounded-t-sm bg-offwhite transition-all hover:brightness-90 active:brightness-75"
              />
            </a>
          </div>

          <div className="baseVertFlex w-full !items-start gap-2 hyphens-auto p-4 pt-3">
            <Button variant={"text"} className="!p-0" asChild>
              <a href="https://www.kare11.com/">
                <Image
                  src={kare11Logo}
                  alt="Kare 11 Logo"
                  width={86}
                  height={40}
                />
              </a>
            </Button>
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
                <a href="https://www.kare11.com/article/news/local/mpls-chef-credits-his-mom-for-inspiration/89-0f237053-85cf-48ae-96f7-8cbebb780555">
                  Read more
                </a>
              </Button>
              <p className="text-sm italic text-stone-400">10/14/2023</p>
            </div>
          </div>
        </div>

        <div className="baseVertFlex h-min w-full !justify-start rounded-md border-2 border-primary shadow-md">
          <div className="baseVertFlex relative w-full bg-primary shadow-md">
            <a
              href="https://www.startribune.com/how-these-moms-shaped-the-next-generation-of-great-twin-cities-restaurateurs/600273728/?refresh=true"
              className="relative size-full"
            >
              <Image
                src={starTribune}
                alt="TODO"
                sizes="(min-width: 1000px) 400px, 320px"
                className="!relative rounded-t-sm bg-offwhite transition-all hover:brightness-90 active:brightness-75"
              />
            </a>
          </div>

          <div className="baseVertFlex w-full !items-start gap-2 hyphens-auto p-4 pt-2">
            <Button variant={"text"} className="!p-0" asChild>
              <a href="https://www.startribune.com/">
                <Image
                  src={starTribuneLogo}
                  alt="TODO"
                  width={150}
                  height={35}
                  className="-ml-5"
                />
              </a>
            </Button>
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
                <a href="https://www.startribune.com/how-these-moms-shaped-the-next-generation-of-great-twin-cities-restaurateurs/600273728/?refresh=true">
                  Read more
                </a>
              </Button>
              <p className="text-sm italic text-stone-400">10/10/2023</p>
            </div>
          </div>
        </div>

        <div className="baseVertFlex h-min w-full !justify-start rounded-md border-2 border-primary shadow-md">
          <div className="baseVertFlex relative w-full bg-primary shadow-md">
            <a
              href="https://www.mprnews.org/story/2023/12/27/appetites-looks-back-on-2023-restaurants-vietnamese-meatballs-and-the-secret-to-entertaining"
              className="relative size-full"
            >
              <Image
                src={mpr}
                alt="TODO"
                sizes="(min-width: 1000px) 400px, 320px"
                className="!relative rounded-t-sm bg-offwhite transition-all hover:brightness-90 active:brightness-75"
              />
            </a>
          </div>

          <div className="baseVertFlex w-full !items-start gap-2 hyphens-auto p-4">
            <Button variant={"text"} className="!p-0" asChild>
              <a href="https://www.mprnews.org/">
                <Image
                  src={mprLogo}
                  alt="TODO"
                  width={110}
                  height={85}
                  className="mb-3"
                />
              </a>
            </Button>
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
                <a href="https://www.mprnews.org/story/2023/12/27/appetites-looks-back-on-2023-restaurants-vietnamese-meatballs-and-the-secret-to-entertaining">
                  Read more
                </a>
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
