import { type Discount } from "@prisma/client";
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
import { useMainStore } from "~/stores/MainStore";

type FullMenuItem = {
  id: string;
  createdAt: string;
  name: string;
  description: string;
  price: number;
  altPrice: number | null;
  available: boolean;
  discontinued: boolean;
  listOrder: number;
  hasImageOfItem: boolean;
  menuCategoryId: string;
  activeDiscountId: string | null;
  isChefsChoice: boolean;
  isAlcoholic: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  showUndercookedOrRawDisclaimer: boolean;
  pointReward: boolean;
  birthdayReward: boolean;
  reviews: unknown;
  activeDiscount: Discount | null;
  customizationCategories: unknown[];
  // Optional properties (not present on all items)
  isWeekendSpecial?: boolean;
  isDairyFree?: boolean;
  isSpicy?: boolean;
  askServerForAvailability?: boolean;
};

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
      menuCategoryIndicies[
        currentlyInViewCategory as keyof typeof menuCategoryIndicies
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
      <div className="baseFlex relative h-56 w-full overflow-hidden bg-darkPrimary shadow-md md:bg-gradient-to-br md:from-primary md:to-darkPrimary xl:h-72">
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
                      listOrder={
                        menuCategoryIndicies[
                          category.name as keyof typeof menuCategoryIndicies
                        ] ?? 0
                      }
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
              menuItems={category.menuItems}
              listOrder={
                menuCategoryIndicies[
                  category.name as keyof typeof menuCategoryIndicies
                ]
              }
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
  menuItems: FullMenuItem[];
  listOrder: number;
  viewportLabel: string;
}

function MenuCategory({
  name,
  menuItems,
  listOrder,
  viewportLabel,
}: MenuCategory) {
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
          <div className="grid w-full grid-cols-1 items-start justify-items-center p-1 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3">
            {menuItems.map((item) => (
              <MenuItemPreview
                key={item.id}
                menuItem={item}
                listOrder={item.listOrder}
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
                key={item.id}
                menuItem={item}
                listOrder={item.listOrder}
                viewportLabel={viewportLabel}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

function formatMenuItemPrice(menuItem: FullMenuItem) {
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
  menuItem: FullMenuItem;
  listOrder: number;
  viewportLabel: string;
}

function MenuItemPreview({
  menuItem,
  listOrder,
  viewportLabel,
}: MenuItemPreview) {
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
        isDairyFree: true,
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
        name: "Khue's Chicken Salad",
        description:
          "Taiwanese cabbage, rau ram, thai chiles, fish sauce vinaigrette, crushed peanuts",
        price: 1500,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 3,
        hasImageOfItem: true,
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
        price: 1600,
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
        name: "Spicy Chicken Sandwich",
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
        id: "aa7afbc1-8dad-49b8-ac9c-4c7651264dde",
        createdAt: "2024-02-20T15:53:09.000Z",
        name: "Bún Chay | Rice Noodle Salad",
        description:
          "Crispy tofu, vermicelli, soy vinaigrette, herb salad, perilla leaf, crushed peanuts",
        price: 1900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 8,
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
        id: "cab3e737-7b07-423f-9d9c-8bce07a9e3e2",
        createdAt: "2024-02-20T15:53:09.000Z",
        name: "Sticky Jicama Ribs",
        description:
          "Marinated tofu, fried jicama, jasmine rice, soy glaze, toasted sesame seeds, mint, scallions",
        price: 2100,
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
        name: "20 oz Grilled Ribeye",
        description:
          "Traditional Vietnamese marinade, jasmine rice, yu choy, scallions",
        price: 4900,
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
        id: "32ca68b1-ec1b-4bdc-b853-51b63d73cb26",
        createdAt: "2024-02-21T15:54:46.000Z",
        name: "Grilled Thick-Cut Pork Chop",
        description:
          "Peppercorn marinade, jasmine rice, scallion oil, nước mắm salad, fried egg",
        price: 2800,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 7,
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
          "Vietnamese coffee, vanilla ice cream, black sesame coconut tuile. * Contains hazelnuts",
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
          "Milk soaked chiffon cake, caramelized coconut cream, shortbread crumble, brown sugar boba",
        price: 1200,
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
  {
    id: "a7403e9f-35b7-48f6-add7-a5d9121a5f6d",
    createdAt: "2024-03-29T16:03:43.000Z",
    name: "Sparkling",
    active: true,
    orderableOnline: false,
    listOrder: 4,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "06eb8dce-1e9d-4053-a843-4dec5c217f14",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Rosa Luna",
        description: "Sparkling Red, Lambrusco, Emilia-Romagna, Italy",
        price: 1500,
        altPrice: 6000,
        available: true,
        discontinued: false,
        listOrder: 1,
        hasImageOfItem: false,
        menuCategoryId: "a7403e9f-35b7-48f6-add7-a5d9121a5f6d",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
        id: "a48bf6eb-c185-49b9-9d53-d1651015ae4f",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "J. Laurens",
        description:
          "Crémant, Chardonnay, Chenin Blanc, Mauzac, Languedoc, France",
        price: 1500,
        altPrice: 6000,
        available: true,
        discontinued: false,
        listOrder: 2,
        hasImageOfItem: false,
        menuCategoryId: "a7403e9f-35b7-48f6-add7-a5d9121a5f6d",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
    ],
  },
  {
    id: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
    createdAt: "2024-03-29T16:03:43.000Z",
    name: "White",
    active: true,
    orderableOnline: false,
    listOrder: 5,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "a6c44c03-de7f-431f-acee-305fc9ee0c9a",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Rebholz",
        description: "Pinot Blanc, Chardonnay 2022, Pfalz, Germany",
        price: 1800,
        altPrice: 7000,
        available: true,
        discontinued: false,
        listOrder: 1,
        hasImageOfItem: false,
        menuCategoryId: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
        id: "86b82c5c-f764-4041-b2b8-70e60b80ba5d",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Kühling-Gillot",
        description: "Riesling 2022, Trocken, Rheinhessen, German",
        price: 1600,
        altPrice: 6200,
        available: true,
        discontinued: false,
        listOrder: 2,
        hasImageOfItem: false,
        menuCategoryId: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
        id: "f1f0dc74-0e54-4c3e-84c0-7fc7a5f0d6fd",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Pierpaolo Pecorari",
        description: "Sauvignon Blanc 2024, Venezia Giulia, Italy",
        price: 1500,
        altPrice: 5600,
        available: true,
        discontinued: false,
        listOrder: 3,
        hasImageOfItem: false,
        menuCategoryId: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
        id: "5dc63b56-57ec-4b66-8bb4-26251e92d232",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "Martin Woods",
        description: "Aligote 2023, Chehalem Mountains, Oregon",
        price: 10000,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 4,
        hasImageOfItem: false,
        menuCategoryId: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
        askServerForAvailability: true,
      },
      {
        id: "9001c348-c05b-4ad7-a4a7-7f5b66fc9f36",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "Amevive",
        description: "Roussanne 2023, Los Olivos District, California",
        price: 8500,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 5,
        hasImageOfItem: false,
        menuCategoryId: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
        askServerForAvailability: true,
      },
      {
        id: "37db2542-a32e-4c26-b60e-f99e6b1447a5",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "Bodegas Los Bermejos",
        description: "Malvasia, Volcanica Seco, Canary Islands, Spain",
        price: 7500,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 6,
        hasImageOfItem: false,
        menuCategoryId: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
        askServerForAvailability: true,
      },
      {
        id: "65acdc9f-62dd-485a-bde0-e01d52ad0e43",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "Occhipinti",
        description: "Albanello, Muscat of Alexandria 2024, Sicily, Italy",
        price: 7000,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 7,
        hasImageOfItem: false,
        menuCategoryId: "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
        askServerForAvailability: true,
      },
    ],
  },
  {
    id: "6b21a3e1-97b4-45d7-9a93-25547c0990d6",
    createdAt: "2024-03-29T16:03:43.000Z",
    name: "Orange / Rosé",
    active: true,
    orderableOnline: false,
    listOrder: 6,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "afdbd5a9-431e-4bc0-9488-7cc44e30fa48",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Sanctum",
        description: "Skin Contact, White Blend, Styria, Slovenia",
        price: 1600,
        altPrice: 6500,
        available: true,
        discontinued: false,
        listOrder: 1,
        hasImageOfItem: false,
        menuCategoryId: "6b21a3e1-97b4-45d7-9a93-25547c0990d6",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
        id: "13ae4b38-92c7-42ab-bc94-ca2edd01049d",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Moulin de Gassac",
        description: "Rose, Grenache, Carignan, Syrah, France",
        price: 1200,
        altPrice: 4500,
        available: true,
        discontinued: false,
        listOrder: 2,
        hasImageOfItem: false,
        menuCategoryId: "6b21a3e1-97b4-45d7-9a93-25547c0990d6",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
    ],
  },
  {
    id: "86c7aa2a-64f1-488a-a87e-8efc3a79447f",
    createdAt: "2024-03-29T16:03:43.000Z",
    name: "Red",
    active: true,
    orderableOnline: false,
    listOrder: 7, // was 8
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "35daaaa0-b891-46fa-8f86-f7a3a36984a0",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Scar of the Sea",
        description: "Pinot Noir 2024, SLO Coast, California",
        price: 1800,
        altPrice: 7000,
        available: true,
        discontinued: false,
        listOrder: 1,
        hasImageOfItem: false,
        menuCategoryId: "86c7aa2a-64f1-488a-a87e-8efc3a79447f",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
        id: "95424f5e-5b4f-4960-b090-6b1827a1672c",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Montepeloso A Quo",
        description: "Sangiovese, Montepulciano, Tuscany, Italy",
        price: 1600,
        altPrice: 6200,
        available: true,
        discontinued: false,
        listOrder: 2,
        hasImageOfItem: false,
        menuCategoryId: "86c7aa2a-64f1-488a-a87e-8efc3a79447f",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
        id: "3815ff8c-e62b-44cc-94cb-f93e5843e95c",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Maloof",
        description: "Grenache, Syrah, Viognier, Tualatin Hills, Oregon",
        price: 1600,
        altPrice: 5800,
        available: true,
        discontinued: false,
        listOrder: 3,
        hasImageOfItem: false,
        menuCategoryId: "86c7aa2a-64f1-488a-a87e-8efc3a79447f",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
        id: "0dd295ca-e562-49a3-b267-7f4a00c29d6d",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "Jonata Todos",
        description: "Bordeaux Blend, Santa Ynez Valley, California",
        price: 10500,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 4,
        hasImageOfItem: false,
        menuCategoryId: "86c7aa2a-64f1-488a-a87e-8efc3a79447f",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
        askServerForAvailability: true,
      },
      {
        id: "8b1d0bce-6952-468f-b36f-62c8cce6650a",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "Santini Au Vin Rouge",
        description: "Pinot Noir, Gamay, Chardonnay, France",
        price: 9800,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 5,
        hasImageOfItem: false,
        menuCategoryId: "86c7aa2a-64f1-488a-a87e-8efc3a79447f",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
        askServerForAvailability: true,
      },
      {
        id: "568f26d5-8358-45e8-90a1-140f7ae30f16",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "Lady of the Sunshine",
        description: "Nero d'Avola, Pinot Noir 2024, Edna Valley, California",
        price: 9500,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 6,
        hasImageOfItem: false,
        menuCategoryId: "86c7aa2a-64f1-488a-a87e-8efc3a79447f",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
        askServerForAvailability: true,
      },
      {
        id: "f405b767-37d6-432a-b2ee-f265db0dc110",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "Le Fruit Du Hasard",
        description: "Carignan, Syrah, Languedoc-Roussillo, France",
        price: 6000,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 7,
        hasImageOfItem: false,
        menuCategoryId: "86c7aa2a-64f1-488a-a87e-8efc3a79447f",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
        askServerForAvailability: true,
      },
    ],
  },
  {
    id: "bc6ad82c-c33c-4e91-93bb-610ac4ecc026",
    createdAt: "2024-03-29T16:02:56.000Z",
    name: "Sake",
    active: true,
    orderableOnline: false,
    listOrder: 8,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "aaea55ae-8889-4d8a-81b5-0bc48f24a721",
        createdAt: "2024-03-29T16:10:10.000Z",
        name: "Mana 1751 True Vision",
        description:
          "Producer: Manatsuru Grade: Tokubetsu, Junmai, Yamahai, Muroka, Genshu",
        price: 1800,
        altPrice: 8500,
        available: true,
        discontinued: false,
        listOrder: 1,
        hasImageOfItem: false,
        menuCategoryId: "bc6ad82c-c33c-4e91-93bb-610ac4ecc026",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
        id: "dcb19f40-b0d1-4bb1-95aa-60912b76c385",
        createdAt: "2024-03-29T16:09:49.000Z",
        name: "Sword of the Sun",
        description: "Producer: Takatenjin / Doi Brewery, Grade: Honjozo",
        price: 1600,
        altPrice: 7500,
        available: true,
        discontinued: false,
        listOrder: 2,
        hasImageOfItem: false,
        menuCategoryId: "bc6ad82c-c33c-4e91-93bb-610ac4ecc026",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
        id: "75cf423e-f947-45cb-b80c-edb5d2ac6c48",
        createdAt: "2024-03-29T16:09:49.000Z",
        name: "Blossom of Peace",
        description: "Producer: Tozai, Plum Sake, sweet but balanced",
        price: 1400,
        altPrice: 5500,
        available: true,
        discontinued: false,
        listOrder: 3,
        hasImageOfItem: false,
        menuCategoryId: "bc6ad82c-c33c-4e91-93bb-610ac4ecc026",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
    ],
  },
  {
    id: "3e79b62f-612a-43ca-bf71-cbfa5b93dba4",
    createdAt: "2026-03-17T00:00:00.000Z",
    name: "Cider",
    active: true,
    orderableOnline: false,
    listOrder: 9,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "9e0d933a-8c4e-49f3-b644-024f7ca3fdde",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "Keepsake",
        description: "semi-sweet cider, farmhouse blend, Dundas, Minnesota",
        price: 900,
        altPrice: 3200,
        available: true,
        discontinued: false,
        listOrder: 1,
        hasImageOfItem: false,
        menuCategoryId: "3e79b62f-612a-43ca-bf71-cbfa5b93dba4",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
        id: "d45ae2ce-f759-47d0-8f45-2966a9e95f98",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "Wild State Hazy Pink Pineapple Cider",
        description: "juicy, tropical, lightly tart cider, Duluth, MN",
        price: 700,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 2,
        hasImageOfItem: false,
        menuCategoryId: "3e79b62f-612a-43ca-bf71-cbfa5b93dba4",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
    ],
  },
  {
    id: "9f62c70d-a241-4afd-a03c-ff951145eaf6",
    createdAt: "2026-03-17T00:00:00.000Z",
    name: "Beer",
    active: true,
    orderableOnline: false,
    listOrder: 10,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "bba8827a-e02f-49dd-a601-901d6e4120fa",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "Terra Lager",
        description: "crisp, clean, refreshing lager, South Korea",
        price: 600,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 1,
        hasImageOfItem: false,
        menuCategoryId: "9f62c70d-a241-4afd-a03c-ff951145eaf6",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
        id: "816fdcc3-cc18-4f2c-9534-e31b38f3f65f",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "BlackStack 'Slopes' Pilsner",
        description: "light-bodied, fresh French-style pilsner, Saint Paul, MN",
        price: 700,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 2,
        hasImageOfItem: false,
        menuCategoryId: "9f62c70d-a241-4afd-a03c-ff951145eaf6",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
        id: "b53f4dc7-a721-4e8c-ae22-8b0d56d573da",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "YOHO 'Wednesday Cat' Belgian White Ale",
        description: "bright, citrusy, smooth Belgian white ale, Japan",
        price: 900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 3,
        hasImageOfItem: false,
        menuCategoryId: "9f62c70d-a241-4afd-a03c-ff951145eaf6",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
        id: "327098b7-9fd8-4406-89e5-5abf486d8d53",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "YOHO 'Aooni' IPA",
        description: "bold, hoppy, earthy Japanese IPA, Japan",
        price: 900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 4,
        hasImageOfItem: false,
        menuCategoryId: "9f62c70d-a241-4afd-a03c-ff951145eaf6",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: true,
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
    ],
  },
  {
    id: "afbe0627-48a5-40df-bd5d-f6bb25fd2a07",
    createdAt: "2024-02-20T21:49:55.000Z",
    name: "N/A Beverages",
    active: true,
    orderableOnline: true,
    listOrder: 11,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "717349d0-4829-4e4a-98ab-a9e00a67768a",
        createdAt: "2024-02-20T21:56:02.000Z",
        name: "Unified Ferments",
        description: "Oolong Tea or Jasmine Green Tea",
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
        name: "Aplos (n.a cocktail)",
        description: "n.a negroni or n.a ume spritz",
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
        id: "c998ae56-1738-4a44-a2d0-fc7c253b9247",
        createdAt: "2026-03-17T00:00:00.000Z",
        name: "Bauhaus 'NAH' Hazy Pale Ale",
        description: "citrusy, tropical, full-bodied NA pale ale",
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
      {
        id: "896d0c0d-ee5b-4cdb-9c87-163cbc825e1d",
        createdAt: "2024-02-20T21:56:45.000Z",
        name: "Cà Phê Sữa Đá Coffee",
        description:
          "bold, sweet, creamy vietnamese coffee over ice, contains hazelnuts",
        price: 800,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 4,
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
  {
    id: "abf33b8e-670d-4e08-98bb-380799928c7f",
    createdAt: "2024-02-20T21:49:55.000Z",
    name: "Soda",
    active: true,
    orderableOnline: true,
    listOrder: 12,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "638d4427-3235-486b-b656-67a30458b05f",
        createdAt: "2024-02-20T21:56:02.000Z",
        name: "Sprite",
        description: "",
        price: 300,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 1,
        hasImageOfItem: false,
        menuCategoryId: "abf33b8e-670d-4e08-98bb-380799928c7f",
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
        id: "25db431c-2a2b-4535-b5f7-67a38a5e4fc1",
        createdAt: "2024-02-20T21:57:13.000Z",
        name: "Coke",
        description: "",
        price: 300,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 2,
        hasImageOfItem: false,
        menuCategoryId: "abf33b8e-670d-4e08-98bb-380799928c7f",
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
        id: "f82b585e-d5de-4834-a3cb-ea5e0309df28",
        createdAt: "2024-02-20T21:56:45.000Z",
        name: "Diet Coke",
        description: "",
        price: 300,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 3,
        hasImageOfItem: false,
        menuCategoryId: "abf33b8e-670d-4e08-98bb-380799928c7f",
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
      {
        id: "a85b80bc-0f0a-4de9-aacf-1bdfd3a8a557",
        createdAt: "2024-02-20T21:56:45.000Z",
        name: "Canada Dry",
        description: "",
        price: 300,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 4,
        hasImageOfItem: false,
        menuCategoryId: "abf33b8e-670d-4e08-98bb-380799928c7f",
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
      {
        id: "7a433898-4ebe-4347-b9e1-d932084422f3",
        createdAt: "2024-02-20T21:56:45.000Z",
        name: "San Pellegrino",
        description: "",
        price: 300,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 5,
        hasImageOfItem: false,
        menuCategoryId: "abf33b8e-670d-4e08-98bb-380799928c7f",
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
  Sparkling: 3,
  White: 4,
  "Orange / Rosé": 5,
  Red: 6,
  Sake: 7,
  Cider: 8,
  Beer: 9,
  "N/A Beverages": 10,
  Soda: 11,
};
