import { Clock, MapPin } from "lucide-react";
import Image from "next/image";

import khuesKitchenLogo from "/public/logos/khuesKitchenLogo.png";

import first from "/public/openGraph/first.jpg";
import second from "/public/openGraph/second.jpg";
import third from "/public/openGraph/third.webp";
import fourth from "/public/openGraph/fourth.webp";

function OpenGraphTemplate() {
  return (
    <div className="baseVertFlex relative h-[630px] w-[1200px] ">
      <div className="z-1 absolute left-0 top-0 grid size-full grid-cols-2 grid-rows-2">
        <div className="relative">
          <Image
            src={first}
            alt={"TODO: fill in w/ appropriate alt text"}
            priority
            fill
            className="object-cover"
          />
        </div>

        <div className="relative">
          <Image
            src={second}
            alt={"TODO: fill in w/ appropriate alt text"}
            priority
            fill
            className="object-cover"
          />
        </div>

        <div className="relative">
          <Image
            src={third}
            alt={"TODO: fill in w/ appropriate alt text"}
            priority
            fill
            className="object-cover"
          />
        </div>

        <div className="relative">
          <Image
            src={fourth}
            alt={"TODO: fill in w/ appropriate alt text"}
            priority
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="z-2 absolute left-0 top-0 size-full bg-gradient-to-br from-primary/60 to-darkPrimary/60"></div>

      <div className="baseFlex z-3 relative gap-12 rounded-md border bg-offwhite px-12 py-8 shadow-lightHeroContainer">
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
          <p className=" w-[350px] text-xl text-stone-500 tablet:text-2xl">
            A modern take on classic Vietnamese cuisine.
          </p>

          {/* <div className="baseFlex mt-6 gap-4">
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
                <SideAccentSwirls delay={1.6} className="h-4 fill-offwhite" />
              </Link>
            </Button>

            <Button size={"lg"} variant={"outline"} asChild>
              <a
                href="https://www.exploretock.com/khues-kitchen-at-midcity-kitchen-saint-paul"
                className="baseFlex gap-3 !px-8 !py-6 !text-lg shadow-sm"
              >
                Make a reservation
                <IoCalendarOutline />
              </a>
            </Button>
          </div> */}

          <div className="baseVertFlex mt-4 !items-start gap-4">
            <div className="baseFlex gap-2">
              <Clock className="size-5 text-primary" />
              <p className="text-sm text-stone-500">
                Open 4:30pm - 9:30pm Wed-Sun
              </p>
            </div>

            <div className="baseFlex gap-2">
              <MapPin className="size-5 text-primary" />
              <p className="text-sm text-stone-500">St. Anthony Park, MN</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpenGraphTemplate;
