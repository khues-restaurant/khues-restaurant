import { motion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import {
  Fragment,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
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
import { IoCalendarOutline } from "react-icons/io5";
import { formatPrice } from "~/utils/formatters/formatPrice";

import { Charis_SIL } from "next/font/google";
const charis = Charis_SIL({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700"],
});

import creamCheeseWantons from "public/menuItems/cream-cheese-wantons.png";
import roastPorkFriedRice from "public/menuItems/roast-pork-fried-rice.png";
import spicyChickenSandwich from "public/menuItems/spicy-chicken-sando.jpg";
import stickyJicamaRibs from "public/menuItems/sticky-jicama-ribs.png";
import grilledRibeye from "public/menuItems/20-oz-grilled-ribeye.png";
import affogato from "public/menuItems/affogato.png";
import thaiTeaTresLeches from "public/menuItems/thai-tea-tres-leches.png";
import chiliCrunchWings from "public/menuItems/chili-crunch-wings.png";
import porkChop from "public/menuItems/pork-chop.png";
import chickenSalad from "public/menuItems/chicken-salad.png";
import bunChay from "public/menuItems/bun-chay.png";
import Calendar from "~/components/ui/Calendar";
import {
  menuCategories,
  type MenuCategory as MenuCategoryData,
  type MenuItem as MenuItemData,
} from "~/data/menu";
import { useMainStore } from "~/stores/MainStore";

const menuCategoryIndices = menuCategories.reduce<Record<string, number>>(
  (indices, category, index) => {
    indices[category.name] = index;
    return indices;
  },
  {},
);

function Menu() {
  const { viewportLabel } = useMainStore((state) => ({
    viewportLabel: state.viewportLabel,
  }));

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
    function getCategoryScrollYValues() {
      const scrollYValues = Object.keys(menuCategoryIndices).map(
        (categoryName) => {
          const categoryContainer = document.getElementById(
            `${categoryName}Container`,
          );
          return categoryContainer?.offsetTop ?? 0;
        },
      );

      const categoryScrollYValues: Record<string, number> = {};
      Object.keys(menuCategoryIndices).forEach((categoryName, index) => {
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
      menuCategoryIndices[
        currentlyInViewCategory as keyof typeof menuCategoryIndices
      ];

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
      <div className="baseFlex relative z-30 h-56 w-full overflow-hidden bg-darkPrimary shadow-md md:bg-gradient-to-br md:from-primary md:to-darkPrimary xl:h-72">
        <div className="absolute inset-0 grid h-56 w-full grid-cols-2 grid-rows-2 gap-4 p-0 md:grid-cols-[1fr_1fr_auto_1fr_1fr] md:grid-rows-1 md:gap-0 xl:h-72 xl:gap-12 xl:px-8 xl:py-0">
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
              className="!relative !size-full rounded-none object-cover opacity-35 md:rounded-none md:opacity-100 md:[clip-path:polygon(0_0,85%_0,100%_100%,15%_100%)]"
            />
          </div>
          <div
            style={{
              filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
            }}
          >
            <Image
              src={chiliCrunchWings}
              alt="Chili Crunch Wings at Khue's in St. Paul"
              // sizes="(max-width: 1000px) 400px, 320px"
              priority
              className="!relative !size-full rounded-none object-cover opacity-35 md:rounded-none md:opacity-100 md:[clip-path:polygon(0_0,85%_0,100%_100%,15%_100%)]"
            />
          </div>

          <div className="baseFlex z-10 mx-8 !hidden self-center justify-self-center rounded-md bg-offwhite p-2 shadow-heroContainer md:!flex">
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
              src={stickyJicamaRibs}
              alt="Sticky Jicama Ribs at Khue's in St. Paul"
              fill
              // sizes="(max-width: 1000px) 400px, 320px"
              priority
              className="!relative !size-full rounded-none object-cover opacity-35 md:rounded-none md:opacity-100 md:[clip-path:polygon(100%_0,15%_0,0%_100%,85%_100%)]"
            />
          </div>
          <div
            style={{
              filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
            }}
          >
            <Image
              src={thaiTeaTresLeches}
              alt="Thai Tea Tres Leches at Khue's in St. Paul"
              fill
              // sizes="(max-width: 1000px) 400px, 320px"
              priority
              className="!relative !size-full rounded-none object-cover opacity-35 md:rounded-none md:opacity-100 md:[clip-path:polygon(100%_0,15%_0,0%_100%,85%_100%)]"
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
        className="baseFlex sticky left-0 top-20 z-10 size-full h-16 w-full overflow-x-hidden bg-body shadow-lg 2xl:w-3/4 2xl:shadow-none tablet:top-24 tablet:h-16"
      >
        <Carousel
          setApi={setStickyCategoriesApi}
          opts={{
            breakpoints: {
              "(min-width: 1165px)": {
                active: false,
              },
            },
            dragFree: true,
            align: "end",
          }}
          className="baseFlex mb-1 h-12 w-full"
        >
          <CarouselContent className="h-12">
            {menuCategories.map((category, categoryIndex) => {
              return (
                <Fragment key={category.name}>
                  {(category.name === "Sparkling" ||
                    category.name === "N/A Beverages") && (
                    <Separator
                      orientation="vertical"
                      className="ml-2 mr-2 mt-2 h-8 w-[2px]"
                    />
                  )}
                  <CarouselItem className="baseFlex basis-auto first:ml-2 last:mr-2">
                    <MenuCategoryButton
                      name={category.name}
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
          {menuCategories.map((category) => (
            <MenuCategory
              key={category.name}
              name={category.name}
              menuItems={category.menuItems}
              viewportLabel={viewportLabel}
            />
          ))}

          <div className="baseVertFlex order-[999] mt-8 w-full gap-4 px-4">
            <div className="baseFlex w-full flex-wrap gap-4 text-sm tablet:text-base">
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
                <FaPepperHot className="size-[14px]" />-<p>Spicy</p>
              </div>
            </div>
            <p className="text-center text-xs italic text-stone-500 tablet:text-sm">
              <span className="not-italic">* </span>
              Consuming raw or undercooked meats, poultry, seafood, shellfish,
              or eggs may increase your risk of foodborne illness.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Menu;

interface MenuCategoryButtonProps {
  currentlyInViewCategory: string;
  name: string;
  setProgrammaticallyScrolling: Dispatch<SetStateAction<boolean>>;
}

function MenuCategoryButton({
  currentlyInViewCategory,
  name,
  setProgrammaticallyScrolling,
}: MenuCategoryButtonProps) {
  return (
    <motion.div
      key={`${name}CategoryButton`}
      id={`${name}Button`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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

interface MenuCategoryProps {
  name: string;
  menuItems: MenuCategoryData["menuItems"];
  viewportLabel: string;
}

function MenuCategory({ name, menuItems, viewportLabel }: MenuCategoryProps) {
  return (
    <motion.div
      key={`${name}MenuCategory`}
      id={`${name}Container`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="baseVertFlex w-full scroll-m-48 !items-start gap-0 p-2 tablet:gap-4"
    >
      {name === "Starters" || name === "Entrees" || name === "Desserts" ? (
        <>
          <div className="baseFlex relative h-36 w-full !justify-end overflow-hidden rounded-md bg-gradient-to-br from-primary to-darkPrimary shadow-md tablet:h-48">
            <div className="absolute left-[30%] h-full w-[70%] overflow-hidden">
              {/* Right-most */}
              {menuItemCategoryImages[name]!.length >= 1 && (
                <div
                  style={{
                    filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
                  }}
                  className="absolute left-[52%] top-0 h-full w-[45%] tablet:left-[62%] tablet:w-1/3"
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

              {/* Middle */}
              {menuItemCategoryImages[name]!.length >= 2 && (
                <div
                  style={{
                    filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
                  }}
                  className="absolute left-[10%] top-0 h-full w-[45%] tablet:left-[31%] tablet:w-1/3"
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
                  className="absolute left-[10%] top-0 hidden h-full w-[50%] tablet:left-[0%] tablet:block tablet:w-1/3"
                >
                  <Image
                    src={menuItemCategoryImages[name]![2]!}
                    alt={`${name} at Khue's in St. Paul`}
                    fill
                    style={{
                      clipPath: "polygon(0 0, 85% 0, 100% 100%, 15% 100%)",
                    }}
                    className="object-cover"
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
          <div className="grid w-full grid-cols-1 items-start justify-items-center p-1 sm:grid-cols-2 sm:gap-8 2xl:grid-cols-3">
            {menuItems.map((item) => (
              <MenuItemPreview
                key={`${name}-${item.name}`}
                menuItem={item}
                viewportLabel={viewportLabel}
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
                key={`${name}-${item.name}`}
                menuItem={item}
                viewportLabel={viewportLabel}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

function formatMenuItemPrice(menuItem: MenuItemData) {
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

interface MenuItemPreviewProps {
  menuItem: MenuItemData;
  viewportLabel: string;
}

function MenuItemPreview({ menuItem, viewportLabel }: MenuItemPreviewProps) {
  const menuItemImage = menuItemImages[menuItem.name];

  return (
    <div className="relative w-full max-w-[400px] px-2">
      <div
        className={`${menuItem.description ? "flex-row" : "flex-row"} flex size-full items-center !justify-between gap-4 py-1`}
      >
        <div className="baseFlex mt-4 w-full !items-start gap-4 tablet:mt-0">
          {menuItemImage && (
            <Image
              src={menuItemImage}
              alt={`${menuItem.name} at Khue's in St. Paul`}
              width={500}
              height={500}
              // layout="intrinsic"
              quality={90}
              // unoptimized
              className="mt-1 !size-28 shrink-0 !self-start rounded-2xl object-cover drop-shadow-md sm:!size-[136px]"
            />
          )}

          <div className="baseVertFlex w-full !items-start gap-1">
            <div className="baseFlex w-full !items-baseline !justify-between gap-4">
              <p className="whitespace-normal text-left font-medium supports-[text-wrap]:text-wrap tablet:text-lg">
                <span className="underline underline-offset-2">
                  {menuItem.name}
                </span>
                {menuItem.showUndercookedOrRawDisclaimer ? "*" : ""}
              </p>
              <div>{formatMenuItemPrice(menuItem)}</div>
            </div>

            <div className="baseFlex !justify-start gap-1">
              {menuItem.isWeekendSpecial && (
                <div className="baseFlex w-full !justify-start gap-1 text-sm">
                  {/* using below icon until chrome fixes it's rendering issues 
                  with <IoCalendarOutline> at small sizes */}
                  {viewportLabel.includes("mobile") ? (
                    <IoCalendarOutline className="size-4 shrink-0" />
                  ) : (
                    <Calendar className="size-4 shrink-0" />
                  )}
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
              {menuItem.isSpicy && <FaPepperHot className="size-[14px]" />}
            </div>

            {menuItem.description && (
              <p className="text-sm text-stone-500">{menuItem.description}</p>
            )}

            {menuItem.askServerForAvailability && (
              <div className="baseFlex !items-start gap-1">
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
  Starters: [creamCheeseWantons, chickenSalad],
  Entrees: [roastPorkFriedRice, spicyChickenSandwich, grilledRibeye],
  Desserts: [affogato, thaiTeaTresLeches],
};

const menuItemImages: Record<string, StaticImageData> = {
  "Cream Cheese Wontons": creamCheeseWantons,
  "Khue's Chicken Salad": chickenSalad,
  "Roast Pork Fried Rice": roastPorkFriedRice,
  "Chili Crunch Wings": chiliCrunchWings,
  "Grilled Thick-Cut Pork Chop": porkChop,
  "Bún Chay | Rice Noodle Salad": bunChay,
  "Spicy Chicken Sandwich": spicyChickenSandwich,
  "Sticky Jicama Ribs": stickyJicamaRibs,
  "20 oz Grilled Ribeye": grilledRibeye,
  "Cà Phê Sữa Đá Affogato": affogato,
  "Thai Tea Tres Leches": thaiTeaTresLeches,
};
