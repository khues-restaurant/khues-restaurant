import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "~/components/ui/button";

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
      className="baseVertFlex mt-[6.05rem] min-h-dvh w-full !justify-start tablet:mt-32"
    >
      {/* Hero */}
      <div className="baseFlex relative h-56 w-full overflow-hidden tablet:h-72">
        <div className="tablet:baseFlex absolute left-0 top-0 grid h-full w-full grid-cols-2 grid-rows-2 border-b-2 tablet:gap-4">
          {/* desktop fading gradients */}
          <div className="absolute left-0 top-0 h-full w-screen">
            <div className="absolute left-0 top-0 hidden h-full w-1/6 bg-gradient-to-l from-transparent to-black/50 tablet:block"></div>
            <div className="absolute right-0 top-0 hidden h-full w-1/6 bg-gradient-to-r from-transparent to-black/50 tablet:block"></div>
          </div>

          <div className="imageFiller h-full w-full tablet:w-1/4">
            maybe a combination of interior/exterior shots?
          </div>
          <div className="imageFiller h-full w-full tablet:w-1/4">
            maybe a combination of interior/exterior shots?
          </div>
          <div className="imageFiller h-full w-full tablet:w-1/4">
            maybe a combination of interior/exterior shots?
          </div>
          <div className="imageFiller h-full w-full tablet:w-1/4">
            maybe a combination of interior/exterior shots?
          </div>
        </div>

        {/* prob just want to have interior/exterior images or technically also there are images with
        eric and w/e reporter was there?*/}

        <div className="baseFlex z-10 rounded-md bg-white p-2 shadow-lg">
          <div className="experimentalBorder baseFlex px-8 py-4 text-xl font-semibold tablet:text-2xl">
            Media
          </div>
        </div>
      </div>

      <div className="baseVertFlex relative w-full gap-8 pb-8 pt-16 tablet:w-3/4 tablet:!flex-row">
        <div className="baseVertFlex w-72 rounded-md border-2 border-primary shadow-md tablet:w-[350px]">
          <div className="baseVertFlex w-full gap-6 bg-primary p-4">
            <Image
              src="/press/StarTribune.png"
              alt="Star Tribune"
              width={200}
              height={85}
              className="rounded-md bg-white p-4"
            />
            <p className="self-start text-lg font-semibold text-white underline underline-offset-2">
              The Star Tribune
            </p>
          </div>

          <div className="baseVertFlex w-full !items-start gap-2 hyphens-auto p-4">
            &quot;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
            enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
            ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.&quot;
            <div className="baseFlex mt-2 w-full !justify-between">
              <Button variant={"link"} className="h-8 !p-0" asChild>
                <a href="https://www.startribune.com/">Read more</a>
              </Button>
              <p className="text-sm italic text-gray-400">12/12/2024</p>
            </div>
          </div>
        </div>

        <div className="baseVertFlex w-72 rounded-md border-2 border-primary shadow-md tablet:w-[350px]">
          <div className="baseVertFlex w-full gap-6 bg-primary p-4">
            <Image
              src="/press/StarTribune.png"
              alt="Star Tribune"
              width={200}
              height={85}
              className="rounded-md bg-white p-4"
            />
            <p className="self-start text-lg font-semibold text-white underline underline-offset-2">
              The Star Tribune
            </p>
          </div>

          <div className="baseVertFlex w-full !items-start gap-2 hyphens-auto p-4">
            &quot;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
            enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
            ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.&quot;
            <div className="baseFlex mt-2 w-full !justify-between">
              <Button variant={"link"} className="h-8 !p-0" asChild>
                <a href="https://www.startribune.com/">Read more</a>
              </Button>
              <p className="text-sm italic text-gray-400">12/12/2024</p>
            </div>
          </div>
        </div>

        <div className="baseVertFlex w-72 rounded-md border-2 border-primary shadow-md tablet:w-[350px]">
          <div className="baseVertFlex w-full gap-6 bg-primary p-4">
            <Image
              src="/press/StarTribune.png"
              alt="Star Tribune"
              width={200}
              height={85}
              className="rounded-md bg-white p-4"
            />
            <p className="self-start text-lg font-semibold text-white underline underline-offset-2">
              The Star Tribune
            </p>
          </div>

          <div className="baseVertFlex w-full !items-start gap-2 hyphens-auto p-4">
            &quot;Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
            enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
            ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.&quot;
            <div className="baseFlex mt-2 w-full !justify-between">
              <Button variant={"link"} className="h-8 !p-0" asChild>
                <a href="https://www.startribune.com/">Read more</a>
              </Button>
              <p className="text-sm italic text-gray-400">12/12/2024</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Media;
