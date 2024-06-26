import Image from "next/image";

import khuesKitchenLogo from "/public/logos/khuesKitchenLogo.png";
import masonryFoodOne from "/public/food/one.jpg";
import masonryFoodTwo from "/public/food/two.webp";
import masonryFoodThree from "/public/food/three.jpg";
import masonryFoodFour from "/public/food/four.png";
import masonryFoodFive from "/public/food/five.jpg";

function ogImageTemplate() {
  return (
    <div className="baseFlex relative mb-64 h-[630px] w-[1200px] overflow-hidden bg-darkPrimary">
      {/* below: pick one or the other, or neither but they can't work together for sure */}

      <div className="absolute inset-0 grid h-full w-full grid-cols-2 grid-rows-2">
        <Image
          src={masonryFoodOne}
          alt="TODO"
          fill
          // sizes="(max-width: 1000px) 400px, 320px"
          priority
          className="!relative !size-full object-cover object-top opacity-20"
        />
        <Image
          src={masonryFoodTwo}
          alt="TODO"
          fill
          // sizes="(max-width: 1000px) 400px, 320px"
          priority
          className="!relative !size-full object-cover object-top opacity-20"
        />
        <Image
          src={masonryFoodFive}
          alt="TODO"
          fill
          // sizes="(max-width: 1000px) 400px, 320px"
          priority
          className="!relative !size-full object-cover object-top opacity-20"
        />
        <Image
          src={masonryFoodFour}
          alt="TODO"
          fill
          // sizes="(max-width: 1000px) 400px, 320px"
          priority
          className="!relative !size-full object-cover object-top opacity-20"
        />
      </div>

      <div className="baseFlex z-50 gap-12 rounded-xl border bg-gradient-to-br from-offwhite to-offwhite/75 py-8 pl-12 pr-16 shadow-lightHeroContainer">
        <Image
          src={khuesKitchenLogo}
          alt={"TODO: fill in w/ appropriate alt text"}
          priority
          className="h-[228px] w-[120.75px] drop-shadow-md"
        />
        <div className="baseVertFlex !items-start gap-2 rounded-md">
          {/* experimenting with stone-800 instead of black */}
          <h1 className="text-3xl font-bold text-stone-800 tablet:text-4xl">
            Welcome to Khue&apos;s
          </h1>
          <p className="w-72 text-xl text-stone-500 tablet:text-2xl">
            A modern take on classic Vietnamese cuisine.
          </p>

          {/* <Button size={"lg"} asChild>
              <Link
                href="/order"
                className="baseFlex mt-6 gap-2 !px-4 !py-6 !text-lg shadow-md "
              >
                <SideAccentSwirls
                  delay={1.75}
                  className="h-4 scale-x-[-1] fill-offwhite"
                />
                Order now
                <SideAccentSwirls delay={1.75} className="h-4 fill-offwhite" />
              </Link>
            </Button> */}
        </div>
      </div>
    </div>
  );
}

export default ogImageTemplate;
