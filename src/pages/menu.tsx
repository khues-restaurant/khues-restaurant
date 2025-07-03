import { type Discount } from "@prisma/client";
import { motion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { FaWineBottle } from "react-icons/fa";
import { IoIosWine } from "react-icons/io";
import { LuVegan } from "react-icons/lu";
import { SiLeaflet } from "react-icons/si";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { FaPepperHot } from "react-icons/fa6";
import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/components/ui/carousel";
import { Separator } from "~/components/ui/separator";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import {
  type FilteredMenuCategory,
  type FullMenuItem,
} from "~/server/api/routers/menuCategory";
import { useMainStore } from "~/stores/MainStore";
import { formatPrice } from "~/utils/formatters/formatPrice";
import { calculateRelativeTotal } from "~/utils/priceHelpers/calculateRelativeTotal";

import { Charis_SIL } from "next/font/google";
const charis = Charis_SIL({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700"],
});

import headerThaiTeaTresLeches from "/public/miscFood/header-thai-tea-tres-leches.png";
import headerBanhMiXiuMai from "/public/miscFood/header-banh-mi-xiu-mai.png";

import creamCheeseWantons from "/public/menuItems/cream-cheese-wantons.png";
import roastPorkFriedRice from "/public/menuItems/roast-pork-fried-rice.png";
import spicyChickenSando from "/public/menuItems/spicy-chicken-sando.jpg";
import stickyJicamaRibs from "/public/menuItems/sticky-jicama-ribs.png";
import grilledSirloin from "/public/menuItems/grilled-sirloin.png";
import affogato from "/public/menuItems/affogato.png";
import thaiTeaTresLeches from "/public/menuItems/thai-tea-tres-leches.png";
import { IoCalendarOutline } from "react-icons/io5";

function Menu() {
  const [scrollProgress, setScrollProgress] = useState(0);

  const [currentlyInViewCategory, setCurrentlyInViewCategory] = useState("");
  const [categoryScrollYValues, setCategoryScrollYValues] = useState<
    Record<string, number>
  >({});
  const [programmaticallyScrolling, setProgrammaticallyScrolling] =
    useState(false);

  const [stickyCategoriesApi, setStickyCategoriesApi] = useState<CarouselApi>();

  // Effect to set category scroll Y values
  useEffect(() => {
    if (!menuCategoryIndicies) return;

    function getCategoryScrollYValues() {
      const scrollYValues = Object.keys(menuCategoryIndicies).map(
        (categoryName) => {
          const categoryContainer = document.getElementById(
            `${categoryName}Container`,
          );
          return categoryContainer?.offsetTop ?? 0;
        },
      );

      const categoryScrollYValues: Record<string, number> = {};
      Object.keys(menuCategoryIndicies).forEach((categoryName, index) => {
        categoryScrollYValues[categoryName] = scrollYValues[index] ?? 0;
      });

      setCategoryScrollYValues(categoryScrollYValues);
    }

    getCategoryScrollYValues();
    window.addEventListener("resize", getCategoryScrollYValues);

    return () => {
      window.removeEventListener("resize", getCategoryScrollYValues);
    };
  }, []);

  // Effect to dynamically set currently in view category
  useEffect(() => {
    if (Object.keys(categoryScrollYValues).length === 0) return;

    function dynamicallySetCurrentlyInViewCategory() {
      const scrollPosition = window.scrollY;
      const categoryNames = Object.keys(categoryScrollYValues);
      let categoryNameInView = categoryNames[0];

      for (const categoryName of categoryNames) {
        const categoryScrollYValue = categoryScrollYValues[categoryName];

        if (categoryScrollYValue === undefined) continue;

        if (scrollPosition >= categoryScrollYValue) {
          categoryNameInView = categoryName;
        } else {
          break;
        }
      }

      if (
        categoryNameInView &&
        categoryNameInView !== currentlyInViewCategory
      ) {
        setCurrentlyInViewCategory(categoryNameInView);
      }
    }

    dynamicallySetCurrentlyInViewCategory();

    window.addEventListener("scroll", dynamicallySetCurrentlyInViewCategory);
    window.addEventListener("resize", dynamicallySetCurrentlyInViewCategory);
    window.addEventListener("focus", dynamicallySetCurrentlyInViewCategory);

    return () => {
      window.removeEventListener(
        "scroll",
        dynamicallySetCurrentlyInViewCategory,
      );
      window.removeEventListener(
        "resize",
        dynamicallySetCurrentlyInViewCategory,
      );
      window.removeEventListener(
        "focus",
        dynamicallySetCurrentlyInViewCategory,
      );
    };
  }, [categoryScrollYValues, currentlyInViewCategory]);

  useEffect(() => {
    if (programmaticallyScrolling || currentlyInViewCategory === "") return;

    const currentlyInViewCategoryListOrderIndex =
      menuCategoryIndicies[currentlyInViewCategory];

    if (currentlyInViewCategoryListOrderIndex === undefined) return;

    setTimeout(() => {
      stickyCategoriesApi?.scrollTo(currentlyInViewCategoryListOrderIndex);
    }, 0);
  }, [currentlyInViewCategory, programmaticallyScrolling, stickyCategoriesApi]);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      const totalDocScrollLength = docHeight - windowHeight;
      const scrolled = (scrollPosition / totalDocScrollLength) * 100;

      setScrollProgress(scrolled);
    };

    window.addEventListener("scroll", updateScrollProgress);
    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
    };
  }, []);

  return (
    <motion.div
      key={"menu"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex min-h-[calc(100dvh-5rem)] w-full !justify-start tablet:min-h-[calc(100dvh-6rem)]"
    >
      {/* Hero */}
      {/* <div
        ref={heroRef}
        className="baseFlex relative h-56 w-full overflow-hidden tablet:h-72"
      >
        <div className="baseFlex absolute left-0 top-0 size-full bg-gradient-to-br from-primary to-darkPrimary tablet:gap-8 desktop:gap-16">
          <Image
            src={sampleImage}
            alt={"TODO: fill in w/ appropriate alt text"}
            width={204}
            height={204}
            className="!relative rounded-md drop-shadow-lg tablet:!hidden"
          />

          <Image
            src={foodOne}
            alt={"TODO: fill in w/ appropriate alt text"}
            sizes="(max-width: 1000px) 160px, 192px"
            className="!relative !hidden !size-40 rounded-md object-cover drop-shadow-xl tablet:!block desktop:!size-48"
          />
          <Image
            src={foodTwo}
            alt={"TODO: fill in w/ appropriate alt text"}
            sizes="(max-width: 1000px) 160px, 192px"
            className="!relative !hidden !size-40 rounded-md object-cover drop-shadow-xl tablet:!block desktop:!size-48"
          />
          <div className="baseFlex z-10 mx-8 !hidden rounded-md bg-offwhite p-2 shadow-heroContainer tablet:!flex">
            <div className="baseFlex gap-2 font-semibold text-primary tablet:p-2 tablet:text-xl desktop:text-2xl">
              <SideAccentSwirls className="h-5 scale-x-[-1] fill-primary" />
              <h1 className={`${charis.className}`}>Menu</h1>
              <SideAccentSwirls className="h-5 fill-primary" />
            </div>
          </div>
          <Image
            src={foodThree}
            alt={"TODO: fill in w/ appropriate alt text"}
            sizes="(max-width: 1000px) 160px, 192px"
            className="!relative !hidden !size-40 rounded-md object-cover drop-shadow-xl tablet:!block desktop:!size-48"
          />
          <Image
            src={foodFour}
            alt={"TODO: fill in w/ appropriate alt text"}
            sizes="(max-width: 1000px) 160px, 192px"
            className="!relative !hidden !size-40 rounded-md object-cover drop-shadow-xl tablet:!block desktop:!size-48"
          />
        </div>

        <div className="baseFlex z-10 mx-8 rounded-md bg-offwhite p-4 shadow-heroContainer tablet:!flex">
          <div className="baseFlex gap-2 text-xl font-semibold text-primary tablet:p-2 desktop:text-2xl">
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary desktop:h-5" />
            <h1 className={`${charis.className}`}>Menu</h1>
            <SideAccentSwirls className="h-4 fill-primary desktop:h-5" />
          </div>
        </div>
      </div> */}

      {/* testing hero */}
      {/* <div className="baseFlex relative h-56 w-full overflow-hidden bg-darkPrimary shadow-md md:bg-gradient-to-br md:from-primary md:to-darkPrimary tablet:h-72">
        <div className="absolute inset-0 grid h-56 w-full grid-cols-2 grid-rows-2 gap-4 p-4 md:grid-cols-[1fr_1fr_auto_1fr_1fr] md:grid-rows-1 md:gap-8 md:p-8 tablet:h-72">
          <Image
            src={foodOne}
            alt="Chef Eric Pham, owner of Khue's Kitchen, with KARE 11's Jennifer Austin in a kitchen studio. Chef Eric Pham whips up a delicious, hot and juicy fried chicken sandwich with Jennifer Austin."
            fill
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
            style={{
              filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
            }}
            className="!relative !size-full rounded-2xl object-cover object-top opacity-35 md:opacity-100"
          />
          <Image
            src={foodTwo}
            alt="Khue Pham, lead chef at Quang Restaurant in Minneapolis, converses with her two sons in the kitchen."
            fill
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
            style={{
              filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
            }}
            className="!relative !size-full rounded-2xl object-cover object-top opacity-35 md:opacity-100"
          />
          <div className="baseFlex z-10 mx-8 !hidden self-center justify-self-center rounded-md bg-offwhite p-4 shadow-heroContainer md:!flex">
            <div className="baseFlex gap-2 text-xl font-semibold text-primary tablet:p-2 desktop:text-2xl">
              <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary desktop:h-5" />
              <h1 className={`${charis.className}`}>Menu</h1>
              <SideAccentSwirls className="h-4 fill-primary desktop:h-5" />
            </div>
          </div>
          <Image
            src={foodThree}
            alt="Khue Pham, lead chef at Quang Restaurant, smiling and posing with her young son, Eric Pham, both dressed formally."
            fill
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
            style={{
              filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
            }}
            className="!relative !size-full rounded-2xl object-cover object-top opacity-35 md:opacity-100"
          />
          <Image
            src={foodFour}
            alt="Chef Eric Pham, owner of Khue's Kitchen, smiling while cooking in a professional kitchen."
            fill
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
            style={{
              filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
            }}
            className="!relative !size-full rounded-2xl object-cover object-top opacity-35 md:opacity-100"
          />
        </div>

        <div className="baseFlex z-10 mx-8 rounded-md bg-offwhite p-4 shadow-heroContainer md:!hidden">
          <div className="baseFlex gap-2 text-xl font-semibold text-primary tablet:p-2 desktop:text-2xl">
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary desktop:h-5" />
            <h1 className={`${charis.className}`}>Menu</h1>
            <SideAccentSwirls className="h-4 fill-primary desktop:h-5" />
          </div>
        </div>
      </div> */}

      <div className="baseFlex relative h-56 w-full overflow-hidden bg-darkPrimary shadow-md md:bg-gradient-to-br md:from-primary md:to-darkPrimary tablet:h-72">
        <div className="absolute inset-0 grid h-56 w-full grid-cols-2 grid-rows-2 gap-4 p-4 md:grid-cols-[1fr_1fr_auto_1fr_1fr] md:grid-rows-1 md:gap-0 md:px-8 md:py-0 tablet:h-72 tablet:gap-12">
          <div
            style={{
              filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
            }}
          >
            <Image
              src={roastPorkFriedRice}
              alt="Roast Pork Fried Rice at Khue's in St. Paul"
              fill
              // sizes="(max-width: 1000px) 400px, 320px"
              priority
              className="!relative !size-full rounded-md object-cover object-center opacity-35 md:rounded-none md:opacity-100 md:[clip-path:polygon(0_0,85%_0,100%_100%,15%_100%)]"
            />
          </div>
          <div
            style={{
              filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
            }}
          >
            <Image
              src={spicyChickenSando}
              alt="Spicy Chicken Sando at Khue's in St. Paul"
              // sizes="(max-width: 1000px) 400px, 320px"
              priority
              className="!relative !size-full rounded-md object-cover object-center opacity-35 md:rounded-none md:opacity-100 md:[clip-path:polygon(0_0,85%_0,100%_100%,15%_100%)]"
            />
          </div>

          <div className="baseFlex z-10 mx-8 !hidden self-center justify-self-center rounded-md bg-offwhite p-4 shadow-heroContainer md:!flex">
            <div className="baseFlex gap-2 text-xl font-semibold text-primary tablet:p-2 desktop:text-2xl">
              <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary desktop:h-5" />
              <h1 className={`${charis.className}`}>Menu</h1>
              <SideAccentSwirls className="h-4 fill-primary desktop:h-5" />
            </div>
          </div>

          <div
            style={{
              filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
            }}
          >
            <Image
              src={headerBanhMiXiuMai}
              alt="Bánh Mì Xíu Mại at Khue's in St. Paul"
              fill
              // sizes="(max-width: 1000px) 400px, 320px"
              priority
              className="!relative !size-full rounded-md object-cover object-center opacity-35 md:rounded-none md:opacity-100 md:[clip-path:polygon(100%_0,15%_0,0%_100%,85%_100%)]"
            />
          </div>
          <div
            style={{
              filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
            }}
          >
            <Image
              src={headerThaiTeaTresLeches}
              alt="Thai Tea Tres Leches at Khue's in St. Paul"
              fill
              // sizes="(max-width: 1000px) 400px, 320px"
              priority
              className="!relative !size-full rounded-md object-cover object-top opacity-35 md:rounded-none md:opacity-100 md:[clip-path:polygon(100%_0,15%_0,0%_100%,85%_100%)]"
            />
          </div>
        </div>

        <div className="baseFlex z-10 mx-8 rounded-md bg-offwhite p-4 shadow-heroContainer md:!hidden">
          <div className="baseFlex gap-2 text-xl font-semibold text-primary tablet:p-2 desktop:text-2xl">
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary desktop:h-5" />
            <h1 className={`${charis.className}`}>Menu</h1>
            <SideAccentSwirls className="h-4 fill-primary desktop:h-5" />
          </div>
        </div>
      </div>

      <motion.div
        key={"menuStickyHeader"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        // bg is background color of the <body>, 1% off from what bg-offwhite is
        className="baseFlex sticky left-0 top-20 z-10 size-full h-16 w-full overflow-x-hidden bg-body shadow-lg tablet:top-24 tablet:h-16 tablet:w-3/4 tablet:shadow-none"
      >
        <Carousel
          setApi={setStickyCategoriesApi}
          opts={{
            breakpoints: {
              "(min-width: 1000px)": {
                active: false,
              },
            },
            dragFree: true,
            align: "end",
          }}
          className="baseFlex mb-1 h-12 w-full"
        >
          <CarouselContent className="h-12">
            {menuCategories?.map((category) => {
              return (
                <Fragment key={category.id}>
                  {/* {category.name === "Sparkling" && (
                    <Separator
                      orientation="vertical"
                      className="ml-2 mr-2 mt-2 h-8 w-[2px]"
                    />
                  )} */}
                  <CarouselItem className="baseFlex basis-auto first:ml-2 last:mr-2">
                    <MenuCategoryButton
                      name={category.name}
                      listOrder={menuCategoryIndicies[category.name] ?? 0}
                      currentlyInViewCategory={currentlyInViewCategory}
                      setProgrammaticallyScrolling={
                        setProgrammaticallyScrolling
                      }
                    />
                  </CarouselItem>
                </Fragment>
              );
            })}
          </CarouselContent>
        </Carousel>

        {/* Custom scrollbar indicating scroll progress */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-stone-200 tablet:rounded-lg">
          <div
            style={{ width: `${scrollProgress}%` }}
            className="h-1 bg-primary tablet:rounded-lg"
          ></div>
        </div>
      </motion.div>

      <div className="baseVertFlex relative w-full pb-8 tablet:w-3/4">
        <motion.div
          key={"menuContent"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="baseVertFlex mb-8 mt-8 size-full gap-8 tablet:mt-6 tablet:gap-16"
        >
          {menuCategories?.map((category) => (
            <MenuCategory
              key={category.id}
              name={category.name}
              activeDiscount={category.activeDiscount}
              menuItems={category.menuItems}
              listOrder={menuCategoryIndicies[category.name]!}
            />
          ))}

          <div className="baseVertFlex order-[999] mt-8 w-full gap-4 px-4 ">
            <div className="baseFlex w-full flex-wrap gap-4 text-sm tablet:text-base">
              {/* <div className="baseFlex gap-2">
                <p className="baseFlex size-4 rounded-full border border-black bg-offwhite p-2">
                  K
                </p>
                -<p>Chef&apos;s Choice</p>
              </div>
              | */}
              <div className="baseFlex gap-2">
                <SiLeaflet className="size-4" />-<p>Vegetarian</p>
              </div>
              |
              <div className="baseFlex gap-2">
                <LuVegan className="size-4" />-<p>Vegan</p>
              </div>
              |
              <div className="baseFlex gap-2">
                <span>GF</span>-<span>Gluten Free</span>
              </div>
              |
              <div className="baseFlex gap-2">
                <span>DF</span>-<span>Dairy Free</span>
              </div>
              |
              <div className="baseFlex gap-2">
                <FaPepperHot className="size-4" />-<p>Spicy</p>
              </div>
            </div>
            <p className="text-center text-xs italic text-stone-500 tablet:text-sm">
              <span className="not-italic">* </span>
              Consuming raw or undercooked meats, poultry, seafood, shellfish,
              or eggs may increase your risk of foodborne illness.
            </p>
            {/* <div className="baseFlex w-full gap-2 text-stone-500 ">
              <FaWineBottle className="shrink-0 -rotate-45" />
              <p className="text-xs italic tablet:text-sm">
                All alcoholic beverages must be purchased on-site.
              </p>
            </div> */}
          </div>
        </motion.div>

        {/* <Button size={"lg"} asChild>
          <Link
          prefetch={false}
            href="/order"
            style={{
              opacity: ableToShowOrderNowButton ? 1 : 0,
              boxShadow:
                "rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px",
            }}
            className="baseFlex !sticky bottom-8 gap-2 !px-4 !py-6 !text-lg transition-all tablet:bottom-10 tablet:!mb-2"
          >
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-offwhite" />
            Order now
            <SideAccentSwirls className="h-4 fill-offwhite" />
          </Link>
        </Button> */}
      </div>
    </motion.div>
  );
}

export default Menu;

// export const getStaticProps: GetStaticProps = async (ctx) => {
//   const prisma = new PrismaClient();

//   const menuCategories = await prisma.menuCategory.findMany({
//     where: {
//       active: true,
//     },
//     include: {
//       activeDiscount: true,
//       menuItems: {
//         include: {
//           activeDiscount: true,
//           customizationCategories: {
//             include: {
//               customizationCategory: {
//                 include: {
//                   customizationChoices: {
//                     orderBy: {
//                       listOrder: "asc",
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//     orderBy: {
//       listOrder: "asc",
//     },
//   });

//   // filter out the "extra" field for "customizationCategory" for each menu item
//   const filteredMenuCategories = menuCategories.map((category) => {
//     return {
//       ...category,
//       menuItems: category.menuItems.map((item) => {
//         return {
//           ...item,
//           customizationCategories: item.customizationCategories.map(
//             (category) => {
//               return category.customizationCategory;
//             },
//           ),
//         };
//       }),
//     };
//   });

//   const categoryIndicies: Record<string, number> = {};
//   let currentIndex = 0;

//   menuCategories.forEach((category) => {
//     categoryIndicies[category.name] = currentIndex;
//     currentIndex++;
//   });

//   return {
//     props: {
//       menuCategories: filteredMenuCategories,
//       menuCategoryIndicies: categoryIndicies,
//     },
//   };
// };

interface MenuCategoryButton {
  currentlyInViewCategory: string;
  name: string;
  listOrder: number;
  setProgrammaticallyScrolling: Dispatch<SetStateAction<boolean>>;
}

function MenuCategoryButton({
  currentlyInViewCategory,
  name,
  listOrder,
  setProgrammaticallyScrolling,
}: MenuCategoryButton) {
  return (
    <motion.div
      key={`${name}CategoryButton`}
      id={`${name}Button`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        order: listOrder,
      }}
      className="flex-none shrink-0 snap-center text-center"
      onClick={() => {
        const categoryContainer = document.getElementById(`${name}Container`);

        if (categoryContainer) {
          setProgrammaticallyScrolling(true);

          categoryContainer.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });

          setTimeout(() => {
            setProgrammaticallyScrolling(false);
          }, 600);
        }
      }}
    >
      <Button
        variant={currentlyInViewCategory === name ? "default" : "outline"}
        size="sm"
        className="border" // not ideal, but keeps same height for all buttons
      >
        {name}
      </Button>
    </motion.div>
  );
}

interface MenuCategory {
  name: string;
  activeDiscount: Discount | null;
  menuItems: FullMenuItem[];
  listOrder: number;
}

function MenuCategory({
  name,
  activeDiscount,
  menuItems,
  listOrder,
}: MenuCategory) {
  const { viewportLabel } = useMainStore((state) => ({
    viewportLabel: state.viewportLabel,
  }));

  return (
    <motion.div
      key={`${name}MenuCategory`}
      id={`${name}Container`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        order: listOrder,
      }}
      className={`baseVertFlex w-full scroll-m-48 !items-start p-2 ${name === "Beverages" || name === "Beer" || name === "Wine" ? "gap-0" : "gap-0 tablet:gap-4"}`}
    >
      {name === "Starters" || name === "Entrees" || name === "Desserts" ? (
        <>
          <div className="baseFlex relative h-36 w-full !justify-end overflow-hidden rounded-md bg-gradient-to-br from-primary to-darkPrimary shadow-md tablet:h-48">
            <div className="absolute left-[30%] h-full w-[70%] overflow-hidden">
              {/* {(viewportLabel.includes("mobile") ||
              (!viewportLabel.includes("mobile") && name !== "Desserts")) && ( */}

              {/* Right-most */}
              {menuItemCategoryImages[name]!.length >= 1 && (
                <div
                  style={{
                    filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
                  }}
                  className="absolute left-[52%] top-0 h-full w-[40%] tablet:left-[62%] tablet:w-1/3"
                >
                  <Image
                    src={menuItemCategoryImages[name]![0] ?? ""}
                    alt={`${name} at Khue's in St. Paul`}
                    fill
                    style={{
                      clipPath: "polygon(0 0, 85% 0, 100% 100%, 15% 100%)",
                    }}
                    className="object-cover"
                  />
                </div>
              )}

              {/* // )} */}

              {/* Middle */}
              {menuItemCategoryImages[name]!.length >= 2 && (
                <div
                  style={{
                    filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
                  }}
                  className="absolute left-[10%] top-0 h-full w-[40%] tablet:left-[31%] tablet:w-1/3"
                >
                  <Image
                    src={menuItemCategoryImages[name]![1]!}
                    alt={`${name} at Khue's in St. Paul`}
                    fill
                    style={{
                      clipPath: "polygon(0 0, 85% 0, 100% 100%, 15% 100%)",
                    }}
                    className="object-cover"
                  />
                </div>
              )}

              {/* Left-most */}
              {menuItemCategoryImages[name]!.length >= 3 && (
                <div
                  style={{
                    filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
                  }}
                  className="absolute left-[10%] top-0 hidden h-full w-[40%] tablet:left-[0%] tablet:block tablet:w-1/3"
                >
                  <Image
                    src={menuItemCategoryImages[name]![2]!}
                    alt={`${name} at Khue's in St. Paul`}
                    fill
                    style={{
                      clipPath: "polygon(0 0, 85% 0, 100% 100%, 15% 100%)",
                    }}
                    className="object-cover "
                  />
                </div>
              )}
            </div>

            <div className="baseFlex absolute bottom-4 left-4 gap-4 rounded-md bg-offwhite px-4 py-2">
              <div
                className={`${charis.className} baseFlex gap-2 text-xl font-medium italic tablet:text-2xl`}
              >
                {name}
              </div>
            </div>
          </div>

          {/* wrapping container for each food item in the category */}
          <div className="grid w-full grid-cols-1 items-start justify-items-center p-1 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3">
            {menuItems.map((item) => (
              <MenuItemPreview
                key={item.id}
                categoryName={name}
                menuItem={item}
                activeDiscount={activeDiscount} // TODO: should prob also add ?? item.activeDiscount too right? was giving type error w/ createdAt but 99% sure this should be on there
                listOrder={item.listOrder}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* category header */}
          <div className="baseVertFlex w-full !items-start border-b-2 border-primary">
            <p
              className={`${charis.className} baseFlex gap-2 pl-3 text-xl font-medium italic tablet:text-2xl`}
            >
              {name}
            </p>
          </div>

          {/* wrapping container for each food item in the category */}
          <div className="grid w-full grid-cols-1 items-start justify-items-center p-1 sm:grid-cols-2 sm:gap-3 sm:gap-x-16 xl:grid-cols-3 3xl:grid-cols-4">
            {menuItems.map((item) => (
              <MenuItemPreview
                key={item.id}
                categoryName={name}
                menuItem={item}
                activeDiscount={activeDiscount} // TODO: should prob also add ?? item.activeDiscount too right? was giving type error w/ createdAt but 99% sure this should be on there
                listOrder={item.listOrder}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

function formatMenuItemPrice(
  categoryName: string,
  menuItem: FullMenuItem,
  activeDiscount: Discount | null,
  customizationChoices: Record<string, CustomizationChoiceAndCategory>,
) {
  // if (categoryName === "Wine") {
  //   return (
  //     <div className="baseFlex gap-2 text-sm">
  //       <div className="baseFlex gap-2">
  //         <IoIosWine className="size-[18px]" />
  //         {formatPrice(
  //           calculateRelativeTotal({
  //             items: [
  //               {
  //                 price: menuItem.altPrice ?? menuItem.price,
  //                 quantity: 1,
  //                 discountId: null, //activeDiscount?.id ?? null,

  //                 // only necessary to fit Item shape
  //                 id: 0,
  //                 itemId: menuItem.id,
  //                 customizations: {}, // not necessary since all default choices are already included in price
  //                 includeDietaryRestrictions: false,
  //                 name: menuItem.name,
  //                 specialInstructions: "",
  //                 isChefsChoice: menuItem.isChefsChoice,
  //                 isAlcoholic: menuItem.isAlcoholic,
  //                 isVegetarian: menuItem.isVegetarian,
  //                 isVegan: menuItem.isVegan,
  //                 isGlutenFree: menuItem.isGlutenFree,
  //                 showUndercookedOrRawDisclaimer:
  //                   menuItem.showUndercookedOrRawDisclaimer,
  //                 hasImageOfItem: menuItem.hasImageOfItem,
  //                 birthdayReward: false,
  //                 pointReward: false,
  //               },
  //             ],
  //             customizationChoices,
  //             discounts: {}, // TODO: do we want to show discount prices on menu? I feel like we should keep it
  //             // to just the regular prices..
  //           }),
  //         )}
  //       </div>
  //       |
  //       <div className="baseFlex gap-2">
  //         <FaWineBottle className="-rotate-45" />
  //         {formatPrice(
  //           calculateRelativeTotal({
  //             items: [
  //               {
  //                 price: menuItem.price,
  //                 quantity: 1,
  //                 discountId: null, //activeDiscount?.id ?? null,

  //                 // only necessary to fit Item shape
  //                 id: 0,
  //                 itemId: menuItem.id,
  //                 customizations: {}, // not necessary since all default choices are already included in price
  //                 includeDietaryRestrictions: false,
  //                 name: menuItem.name,
  //                 specialInstructions: "",
  //                 isChefsChoice: menuItem.isChefsChoice,
  //                 isAlcoholic: menuItem.isAlcoholic,
  //                 isVegetarian: menuItem.isVegetarian,
  //                 isVegan: menuItem.isVegan,
  //                 isGlutenFree: menuItem.isGlutenFree,
  //                 showUndercookedOrRawDisclaimer:
  //                   menuItem.showUndercookedOrRawDisclaimer,
  //                 hasImageOfItem: menuItem.hasImageOfItem,
  //                 birthdayReward: false,
  //                 pointReward: false,
  //               },
  //             ],
  //             customizationChoices,
  //             discounts: {},
  //           }),
  //         )}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="baseFlex gap-2 self-end text-base">
      <p>{formatPrice(menuItem.price, true)}</p>
      {menuItem.altPrice && (
        <>
          <Separator className="h-4 w-[1px] bg-black" />
          {formatPrice(menuItem.altPrice, true)}
        </>
      )}
    </div>
  );
}

interface MenuItemPreview {
  categoryName: string;
  menuItem: FullMenuItem;
  activeDiscount: Discount | null;
  listOrder: number;
}

function MenuItemPreview({
  categoryName,
  menuItem,
  activeDiscount,
  listOrder,
}: MenuItemPreview) {
  const { customizationChoices } = useMainStore((state) => ({
    customizationChoices: state.customizationChoices,
  }));

  return (
    <div
      style={{
        order: listOrder + 1,
      }}
      className="relative w-full max-w-[400px] px-2"
    >
      <div
        className={`${menuItem.description ? "flex-row" : "flex-row"} flex size-full items-center !justify-between gap-4 py-1`}
      >
        <div className="baseFlex mt-4 w-full !items-start gap-4 tablet:mt-0">
          {menuItem.hasImageOfItem && (
            <Image
              // src={"/menuItems/sampleImage.webp"}
              src={menuItemImages[menuItem.name] ?? ""}
              alt={`${menuItem.name} at Khue's in St. Paul`}
              width={500}
              height={500}
              // layout="intrinsic"
              quality={100}
              // unoptimized
              className="mt-1 !size-28 shrink-0 !self-start rounded-2xl object-cover drop-shadow-md sm:!size-32"
            />
          )}

          <div className="baseVertFlex w-full !items-start gap-1">
            <div className="baseFlex w-full !items-baseline !justify-between gap-4">
              <p className="whitespace-normal text-left font-medium supports-[text-wrap]:text-wrap tablet:text-lg ">
                <span
                  className={`${menuItem.description ? "underline underline-offset-2" : ""}`}
                >
                  {menuItem.name}
                </span>
                {menuItem.showUndercookedOrRawDisclaimer ? "*" : ""}
              </p>
              <div>
                {formatMenuItemPrice(
                  categoryName,
                  menuItem,
                  activeDiscount,
                  customizationChoices,
                )}
              </div>
            </div>

            <div className="baseFlex !justify-start gap-1">
              {menuItem.isWeekendSpecial && (
                <div className="baseFlex w-full !justify-start gap-1 text-sm ">
                  <IoCalendarOutline className="size-4 shrink-0" />
                  Only available Fri/Sat
                  <Separator
                    orientation="vertical"
                    className="mx-2 h-4 w-[1px] bg-black"
                  />
                </div>
              )}
              {menuItem.isChefsChoice && (
                <p className="baseFlex size-4 rounded-full border border-black bg-offwhite p-2">
                  K
                </p>
              )}
              {menuItem.isVegetarian && <SiLeaflet className="size-4" />}
              {menuItem.isVegan && <LuVegan className="size-4" />}
              {menuItem.isDairyFree && <p className="text-sm">DF</p>}
              {menuItem.isGlutenFree && <p className="text-sm">GF</p>}
              {menuItem.isSpicy && <FaPepperHot className="size-4" />}
            </div>

            {menuItem.description && (
              <p className="text-sm text-stone-500">{menuItem.description}</p>
            )}

            {menuItem.askServerForAvailability && (
              <div className="baseFlex gap-1">
                {/* <Separator className="my-1 h-[1px] w-4 bg-stone-400" /> */}
                <span className="text-primary">*</span>
                <p className="text-sm text-primary">
                  By the Bottle - Ask server for availability
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const menuItemCategoryImages: Record<string, StaticImageData[]> = {
  Starters: [creamCheeseWantons],
  Entrees: [roastPorkFriedRice, spicyChickenSando, grilledSirloin],
  Desserts: [affogato, thaiTeaTresLeches],
};

const menuItemImages: Record<string, StaticImageData> = {
  "Cream Cheese Wontons": creamCheeseWantons,
  "Roast Pork Fried Rice": roastPorkFriedRice,
  "Bánh Mì Xíu Mại": headerBanhMiXiuMai,
  "Spicy Chicken Sando": spicyChickenSando,
  "Sticky Jicama Ribs": stickyJicamaRibs,
  "Grilled Sirloin": grilledSirloin,
  "Cà Phê Sữa Đá Affogato": affogato,
  "Thai Tea Tres Leches": thaiTeaTresLeches,
};

const menuCategories = [
  {
    id: "60f90b72-e44a-4775-b071-97ed5dc020d3",
    createdAt: "2024-02-21T03:48:14.000Z",
    name: "Starters",
    active: true,
    orderableOnline: true,
    listOrder: 1, // was 2
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "7b0aa9eb-2a87-48cd-8c98-67b3f5a4b74f",
        createdAt: "2024-02-21T03:51:47.000Z",
        name: "Cream Cheese Wontons",
        description: "Savory cream cheese, sweet and sour sauce",
        price: 1200,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 1,
        hasImageOfItem: true,
        menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: true,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "702b5c80-7d63-43ef-a80f-948c64c21575",
        createdAt: "2024-05-15T21:32:32.217Z",
        name: "Crispy Pork Lettuce Wraps",
        description:
          "Vietnamese roast pork, woven noodles, butter lettuce, cucumbers, herb salad, fish sauce vinaigrette",
        price: 1500,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 2, // first in array
        hasImageOfItem: false,
        menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
        activeDiscountId: null,
        isWeekendSpecial: true,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "2315135f-19f4-4ede-9af7-0ffccadd2557",
        createdAt: "2024-05-15T21:28:07.340Z",
        name: "Chicken Salad",
        description:
          "Taiwanese cabbage, rau ram, thai chilis, fish sauce vinaigrette, crushed peanuts",
        price: 1400,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 3,
        hasImageOfItem: false,
        menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isSpicy: true,
        isDairyFree: true,
        isGlutenFree: true,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
    ],
  },
  {
    id: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
    createdAt: "2024-02-20T21:49:34.000Z",
    name: "Entrees",
    active: true,
    orderableOnline: true,
    listOrder: 2,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "1663442b-e4a2-4bac-a5ab-b7d2edb7cfd9",
        createdAt: "2024-05-15T21:36:35.209Z",
        name: "Roast Pork Fried Rice",
        description:
          "Scallion oil, crispy pork, lap xuong, fried egg, chili crunch. Can be vegetarian.",
        price: 1500,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 1,
        hasImageOfItem: true,
        menuCategoryId: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isDairyFree: true,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: true,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "a44bfc71-facd-4ce6-a576-afbac6e2b2f3",
        createdAt: "2024-05-15T16:36:35.000Z",
        name: "Spicy Chicken Sando",
        description:
          "Brioche bun, lettuce, tomato, house pickles, herb aioli, chili crunch",
        price: 1700,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 2,
        hasImageOfItem: true,
        menuCategoryId: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "cab3e737-7b07-423f-9d9c-8bce07a9e3e2",
        createdAt: "2024-02-20T15:53:09.000Z",
        name: "Sticky Jicama Ribs",
        description:
          "Marinated tofu, fried jicama, soy glaze, toasted sesame seeds, mint, scallions",
        price: 2000,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 4,
        hasImageOfItem: true,
        menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: true,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "7bd980fe-a447-401d-8880-03ec4773a9b2",
        createdAt: "2024-02-20T21:54:12.000Z",
        name: "Grilled Sirloin",
        description:
          "Traditional Vietnamese marinade, jasmine rice, yu choy, scallions",
        price: 3700,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 3,
        hasImageOfItem: true,
        menuCategoryId: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isDairyFree: true,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: true,
        pointReward: true,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "a776d637-bb2d-4e48-ab52-2c7fe70d16e4",
        createdAt: "2024-02-21T15:54:46.000Z",
        name: "Chili Crunch Wings",
        description: "Green garlic ranch, house pickles",
        price: 1600,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 5,
        hasImageOfItem: false,
        menuCategoryId: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "1d338b9c-947d-4fb5-9da5-34dfac2d030b",
        createdAt: "2024-02-21T15:54:46.000Z",
        name: "Five Spice Tofu",
        description:
          "Battered tofu, jasmine rice, five spice glaze, kimchi, herb salad. Can be vegan.",
        price: 1900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 6,
        hasImageOfItem: false,
        menuCategoryId: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "32ca68b1-ec1b-4bdc-b853-51b63d73cb26",
        createdAt: "2024-02-21T15:54:46.000Z",
        name: "Grilled Pork Chop",
        description:
          "Peppercorn marinade, jasmine rice, scallion oil, nước mắm salad, fried egg",
        price: 2600,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 7,
        hasImageOfItem: false,
        menuCategoryId: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isDairyFree: true,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: true,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
    ],
  },
  {
    id: "7abeebb9-4fce-457a-af05-adb1b89aa1b0",
    createdAt: "2024-02-20T21:50:03.000Z",
    name: "Desserts",
    active: true,
    orderableOnline: true,
    listOrder: 3,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "3581eac7-f105-486e-97de-2aa234bb6e0c",
        createdAt: "2024-05-15T21:38:58.971Z",
        name: "Cà Phê Sữa Đá Affogato",
        description:
          "Vietnamese coffee, vanilla ice cream, black sesame coconut tuile. * Contains hazelnut",
        price: 900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 1,
        hasImageOfItem: true,
        menuCategoryId: "7abeebb9-4fce-457a-af05-adb1b89aa1b0",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: true,
        showUndercookedOrRawDisclaimer: false,
        pointReward: true,
        birthdayReward: true,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "3dad69fb-2607-4563-aeca-79515f93e06d",
        createdAt: "2024-02-21T09:58:09.000Z",
        name: "Thai Tea Tres Leches",
        description:
          "Milk-soaked chiffon cake, whipped cream, coconut crumble, brown sugar boba",
        price: 1100,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 2,
        hasImageOfItem: true,
        menuCategoryId: "7abeebb9-4fce-457a-af05-adb1b89aa1b0",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: true,
        birthdayReward: true,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
    ],
  },
  // {
  //   id: "a7403e9f-35b7-48f6-add7-a5d9121a5f6d",
  //   createdAt: "2024-03-29T16:03:43.000Z",
  //   name: "Sparkling",
  //   active: true,
  //   orderableOnline: false,
  //   listOrder: 4,
  //   activeDiscountId: null,
  //   activeDiscount: null,
  //   menuItems: [
  //     {
  //       id: "06eb8dce-1e9d-4053-a843-4dec5c217f14",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "Rodica",
  //       description: "Sparkling Rosé, Pét-Nat, Refošk, Slovenia",
  //       price: 1600,
  //       altPrice: 5800,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "a7403e9f-35b7-48f6-add7-a5d9121a5f6d",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //     {
  //       id: "a48bf6eb-c185-49b9-9d53-d1651015ae4f",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "Avinyó",
  //       description:
  //         "Sparkling Pét-Nat, Muscat Frontignan, Macabeo, Catalonia, Spain",
  //       price: 1300,
  //       altPrice: 4700,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "a7403e9f-35b7-48f6-add7-a5d9121a5f6d",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //   ],
  // },
  // {
  //   id: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
  //   createdAt: "2024-03-29T16:03:43.000Z",
  //   name: "White",
  //   active: true,
  //   orderableOnline: false,
  //   listOrder: 5,
  //   activeDiscountId: null,
  //   activeDiscount: null,
  //   menuItems: [
  //     {
  //       id: "a6c44c03-de7f-431f-acee-305fc9ee0c9a",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "Schafer-Frohlich",
  //       description: "Müller-Thurgau 2022, Franken, Germany",
  //       price: 1600,
  //       altPrice: 6000,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //     {
  //       id: "86b82c5c-f764-4041-b2b8-70e60b80ba5d",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "Madson",
  //       description: "Chardonnay 2022, Central Coast, California",
  //       price: 1800,
  //       altPrice: 7500,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //     {
  //       id: "36ee18b8-5aff-4a56-be1a-f1ed53f7ed83",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "Salvatore Marino",
  //       description: '"Turi" 2022, Sicily, Italy',
  //       price: 1500,
  //       altPrice: 5500,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //     {
  //       id: "ee0bcc63-541c-4dca-a8b1-b2459508af26",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "La Pepie",
  //       description: "Muscadet, Loire Valley, France",
  //       price: 4400,
  //       altPrice: null,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //       askServerForAvailability: true,
  //     },
  //     {
  //       id: "aec7c3aa-db17-4829-bb81-dbe6beb64976",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "Deep Down",
  //       description: "Sauvignon Blanc, Marlborough, New Zealand",
  //       price: 5800,
  //       altPrice: null,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //       askServerForAvailability: true,
  //     },
  //     {
  //       id: "b8324c59-a00a-4019-b3d4-3eb49e50618f",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "Koehler-Ruprecht",
  //       description: "Chardonnay, Pfalz, Germany",
  //       price: 5400,
  //       altPrice: null,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //       askServerForAvailability: true,
  //     },
  //   ],
  // },
  // {
  //   id: "6b21a3e1-97b4-45d7-9a93-25547c0990d6",
  //   createdAt: "2024-03-29T16:03:43.000Z",
  //   name: "Orange / Rosé",
  //   active: true,
  //   orderableOnline: false,
  //   listOrder: 6,
  //   activeDiscountId: null,
  //   activeDiscount: null,
  //   menuItems: [
  //     {
  //       id: "afdbd5a9-431e-4bc0-9488-7cc44e30fa48",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: `Maloof, "Where Ya PJ's At"`,
  //       description: "Gewürztraminer, Riesling, Pinot Gris",
  //       price: 1600,
  //       altPrice: 6000,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "6b21a3e1-97b4-45d7-9a93-25547c0990d6",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //     {
  //       id: "13ae4b38-92c7-42ab-bc94-ca2edd01049d",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "Ioppa",
  //       description: "Nebbiolo Rosé, Piedmont, Italy",
  //       price: 1200,
  //       altPrice: 4500,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "6b21a3e1-97b4-45d7-9a93-25547c0990d6",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //     {
  //       id: "9107f0e1-dc76-4ccb-91c7-a7fa7e24a578",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "Fattoria Di Vaira",
  //       description: "Orange, Falanghina, Trebbiano, Molise, Italy",
  //       price: 5000,
  //       altPrice: null,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "6b21a3e1-97b4-45d7-9a93-25547c0990d6",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //       askServerForAvailability: true,
  //     },
  //     {
  //       id: "b7e2d082-dc96-4e19-a705-5c5fab95a210",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "New Found",
  //       description: "Mourvèdre, Grenache, Rosé, California",
  //       price: 5000,
  //       altPrice: null,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "6b21a3e1-97b4-45d7-9a93-25547c0990d6",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //       askServerForAvailability: true,
  //     },
  //   ],
  // },
  // {
  //   id: "86c7aa2a-64f1-488a-a87e-8efc3a79447f",
  //   createdAt: "2024-03-29T16:03:43.000Z",
  //   name: "Red",
  //   active: true,
  //   orderableOnline: false,
  //   listOrder: 7, // was 8
  //   activeDiscountId: null,
  //   activeDiscount: null,
  //   menuItems: [
  //     {
  //       id: "35daaaa0-b891-46fa-8f86-f7a3a36984a0",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "Chat Fout, Éric Texier",
  //       description: "Grenache, White Varietals, Rhône Valley, France",
  //       price: 1600,
  //       altPrice: 5800,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "86c7aa2a-64f1-488a-a87e-8efc3a79447f",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //     {
  //       id: "761ce095-71f9-43e0-be42-890d5171c5c5",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "Hervé Viellemade",
  //       description: "Gamay 2022, Loire Valley, France",
  //       price: 1600,
  //       altPrice: 5800,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "86c7aa2a-64f1-488a-a87e-8efc3a79447f",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //     {
  //       id: "83ee68f5-8bac-4105-8b88-c6158a2f47d2",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "Torre alle Tolfe",
  //       description: "Chianti, Tuscany, Italy",
  //       price: 1700,
  //       altPrice: 6100,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "86c7aa2a-64f1-488a-a87e-8efc3a79447f",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //     {
  //       id: "b44615b1-8c31-475c-bc86-6b32e305994b",
  //       createdAt: "2024-03-29T16:10:53.000Z",
  //       name: "Ciello, Nero d'Avola Rosso",
  //       description: "Nero d'Avola, Sicily, Italy",
  //       price: 4400,
  //       altPrice: null,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "86c7aa2a-64f1-488a-a87e-8efc3a79447f",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //       askServerForAvailability: true,
  //     },
  //   ],
  // },
  // {
  //   id: "bc6ad82c-c33c-4e91-93bb-610ac4ecc026",
  //   createdAt: "2024-03-29T16:02:56.000Z",
  //   name: "Sake / Beer",
  //   active: true,
  //   orderableOnline: false,
  //   listOrder: 8,
  //   activeDiscountId: null,
  //   activeDiscount: null,
  //   menuItems: [
  //     {
  //       id: "aaea55ae-8889-4d8a-81b5-0bc48f24a721",
  //       createdAt: "2024-03-29T16:10:10.000Z",
  //       name: "Crane of Paradise",
  //       description: "Producer: Kawatsuru / Grade: Junmai",
  //       price: 1600,
  //       altPrice: 6500,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 1,
  //       hasImageOfItem: false,
  //       menuCategoryId: "bc6ad82c-c33c-4e91-93bb-610ac4ecc026",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //     {
  //       id: "dcb19f40-b0d1-4bb1-95aa-60912b76c385",
  //       createdAt: "2024-03-29T16:09:49.000Z",
  //       name: "Forgotten Fortune",
  //       description: "Producer: Fukucho / Grade: Junmai",
  //       price: 1800,
  //       altPrice: 7200,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 2,
  //       hasImageOfItem: false,
  //       menuCategoryId: "bc6ad82c-c33c-4e91-93bb-610ac4ecc026",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: true,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //     {
  //       id: "4a027a04-3fe6-440a-a860-3c0c9e0ef0a0",
  //       createdAt: "2024-03-29T21:09:27.000Z",
  //       name: "Fulton Chill City Chugger",
  //       description: "Crisp, clean, smooth American lager",
  //       price: 600,
  //       altPrice: null,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 3,
  //       hasImageOfItem: false,
  //       menuCategoryId: "bc6ad82c-c33c-4e91-93bb-610ac4ecc026",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: false,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //     {
  //       id: "8349fe66-81b0-4d04-8291-4ab60641676d",
  //       createdAt: "2024-03-29T21:09:27.000Z",
  //       name: "Lagunitas IPA",
  //       description: "Hoppy, citrus, pine, caramel malt",
  //       price: 700,
  //       altPrice: null,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 4,
  //       hasImageOfItem: false,
  //       menuCategoryId: "bc6ad82c-c33c-4e91-93bb-610ac4ecc026",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: false,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //     {
  //       id: "17130954-3dcc-47d9-806a-b222a458a9c7",
  //       createdAt: "2024-03-29T21:09:27.000Z",
  //       name: "Indeed Flavorwave IPA",
  //       description: "Juicy, tropical, citrus, bold bitterness",
  //       price: 800,
  //       altPrice: null,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 5,
  //       hasImageOfItem: false,
  //       menuCategoryId: "bc6ad82c-c33c-4e91-93bb-610ac4ecc026",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: false,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //     {
  //       id: "516bae9a-48d8-4d0a-9dae-8d8ae8a5e827",
  //       createdAt: "2024-03-29T21:09:27.000Z",
  //       name: "Left Hand Nitro Milk Stout",
  //       description: "Creamy, chocolate, coffee, smooth finish",
  //       price: 800,
  //       altPrice: null,
  //       available: true,
  //       discontinued: false,
  //       listOrder: 6,
  //       hasImageOfItem: false,
  //       menuCategoryId: "bc6ad82c-c33c-4e91-93bb-610ac4ecc026",
  //       activeDiscountId: null,
  //       isChefsChoice: false,
  //       isAlcoholic: false,
  //       isVegetarian: false,
  //       isVegan: false,
  //       isGlutenFree: false,
  //       showUndercookedOrRawDisclaimer: false,
  //       pointReward: false,
  //       birthdayReward: false,
  //       reviews: null,
  //       activeDiscount: null,
  //       customizationCategories: [],
  //     },
  //   ],
  // },
  {
    id: "afbe0627-48a5-40df-bd5d-f6bb25fd2a07",
    createdAt: "2024-02-20T21:49:55.000Z",
    name: "Beverages", // FYI: change to "N/A Beverages" when alcohol issues are sorted
    active: true,
    orderableOnline: true,
    listOrder: 9,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "717349d0-4829-4e4a-98ab-a9e00a67768a",
        createdAt: "2024-02-20T21:56:02.000Z",
        name: "Unified Ferments",
        description: "Fermented, Oolong Tea or Jasmine Green Tea",
        price: 1500,
        altPrice: 5400,
        available: true,
        discontinued: false,
        listOrder: 1,
        hasImageOfItem: false,
        menuCategoryId: "afbe0627-48a5-40df-bd5d-f6bb25fd2a07",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "b883736a-314d-4b19-a9e2-582a2a543790",
        createdAt: "2024-02-20T21:57:13.000Z",
        name: "Aplós (N/A Cocktail)", // FYI: drop "N/A" when alcohol issues are sorted
        description: "Negroni or Ume Spritz",
        price: 800,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 2,
        hasImageOfItem: false,
        menuCategoryId: "afbe0627-48a5-40df-bd5d-f6bb25fd2a07",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "f5adc265-dc7c-47ad-aead-cdad3d111de8",
        createdAt: "2024-02-20T21:56:45.000Z",
        name: "Lagunitas Hoppy Refresher",
        description: "Crisp, citrusy, zero alcohol hop sparkle",
        price: 700,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 3,
        hasImageOfItem: false,
        menuCategoryId: "afbe0627-48a5-40df-bd5d-f6bb25fd2a07",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: true,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
    ],
  },
];

const menuCategoryIndicies = {
  Starters: 0,
  Entrees: 1,
  Desserts: 2,
  // Sparkling: 3,
  // White: 4,
  // "Orange / Rosé": 5,
  // Red: 6,
  // "Sake / Beer": 7,
  Beverages: 8, // FYI: change to "N/A Beverages" when alcohol issues are sorted
};
