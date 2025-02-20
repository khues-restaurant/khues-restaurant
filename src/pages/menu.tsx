import { type Discount } from "@prisma/client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
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

import { STIX_Two_Text } from "next/font/google";
const stix = STIX_Two_Text({
  subsets: ["latin"],
});

import { Charis_SIL } from "next/font/google";
const charis = Charis_SIL({
  subsets: ["latin"],
  weight: ["400", "700"],
});

import sampleImage from "/public/menuItems/sampleImage.webp";
import wideAngleFoodShot from "/public/menuItems/wideAngleFoodShot.webp";

function Menu() {
  const [scrollProgress, setScrollProgress] = useState(0);

  const [currentlyInViewCategory, setCurrentlyInViewCategory] = useState("");
  const [categoryScrollYValues, setCategoryScrollYValues] = useState<
    Record<string, number>
  >({});
  const [programmaticallyScrolling, setProgrammaticallyScrolling] =
    useState(false);

  const [stickyCategoriesApi, setStickyCategoriesApi] = useState<CarouselApi>();

  const [ableToShowOrderNowButton, setAbleToShowOrderNowButton] =
    useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAbleToShowOrderNowButton(!entry?.isIntersecting ?? false);
      },
      {
        root: null,
        rootMargin: "0px 0px 0px 0px",
        threshold: 0.5,
      },
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    const internalHeroRef = heroRef.current;

    return () => {
      if (internalHeroRef) {
        observer.unobserve(internalHeroRef);
      }

      setAbleToShowOrderNowButton(false);
    };
  }, []);

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
  }, [menuCategoryIndicies]);

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
      <div
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
            src={sampleImage}
            alt={"TODO: fill in w/ appropriate alt text"}
            sizes="(max-width: 1000px) 160px, 192px"
            className="!relative !hidden !size-40 rounded-md drop-shadow-xl tablet:!block desktop:!size-48"
          />
          <Image
            src={sampleImage}
            alt={"TODO: fill in w/ appropriate alt text"}
            sizes="(max-width: 1000px) 160px, 192px"
            className="!relative !hidden !size-40 rounded-md drop-shadow-xl tablet:!block desktop:!size-48"
          />
          <div className="baseFlex z-10 mx-8 !hidden rounded-md bg-offwhite p-2 shadow-heroContainer tablet:!flex">
            <div className="baseFlex gap-2 font-semibold text-primary tablet:p-2 tablet:text-xl desktop:text-2xl">
              <SideAccentSwirls className="h-5 scale-x-[-1] fill-primary" />
              <h1 className={`${charis.className}`}>Menu</h1>
              <SideAccentSwirls className="h-5 fill-primary" />
            </div>
          </div>
          <Image
            src={sampleImage}
            alt={"TODO: fill in w/ appropriate alt text"}
            sizes="(max-width: 1000px) 160px, 192px"
            className="!relative !hidden !size-40 rounded-md drop-shadow-xl tablet:!block desktop:!size-48"
          />
          <Image
            src={sampleImage}
            alt={"TODO: fill in w/ appropriate alt text"}
            sizes="(max-width: 1000px) 160px, 192px"
            className="!relative !hidden !size-40 rounded-md drop-shadow-xl tablet:!block desktop:!size-48"
          />
        </div>

        <div className="baseFlex z-10 rounded-md bg-offwhite p-2 shadow-heroContainer tablet:hidden">
          <div className="baseFlex gap-2 p-2 text-xl font-semibold text-primary tablet:px-8 tablet:py-3 tablet:text-2xl">
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary" />
            <h1 className={`${charis.className}`}>Menu</h1>
            <SideAccentSwirls className="h-4 fill-primary" />
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
          className="baseFlex mb-1 w-full"
        >
          <CarouselContent>
            {menuCategories?.map((category) => {
              if (category.name === "Beer") {
                return (
                  <div key={category.id} className="baseFlex gap-2">
                    <Separator
                      orientation="vertical"
                      className="ml-4 mr-2 h-full w-[2px]"
                    />
                    <CarouselItem className="baseFlex basis-auto first:ml-2">
                      <MenuCategoryButton
                        key={category.id}
                        name={category.name}
                        listOrder={menuCategoryIndicies.Beer!}
                        currentlyInViewCategory={currentlyInViewCategory}
                        setProgrammaticallyScrolling={
                          setProgrammaticallyScrolling
                        }
                      />
                    </CarouselItem>
                  </div>
                );
              }

              return (
                <CarouselItem
                  className="baseFlex basis-auto first:ml-2 last:mr-2"
                  key={category.id}
                >
                  <MenuCategoryButton
                    name={category.name}
                    listOrder={menuCategoryIndicies[category.name] ?? 0}
                    currentlyInViewCategory={currentlyInViewCategory}
                    setProgrammaticallyScrolling={setProgrammaticallyScrolling}
                  />
                </CarouselItem>
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
          className="baseVertFlex mb-8 mt-8 size-full gap-8 tablet:mt-0"
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
              <div className="baseFlex gap-2">
                <p className="baseFlex size-4 rounded-full border border-black bg-offwhite p-2">
                  K
                </p>
                -<p>Chef&apos;s Choice</p>
              </div>
              |
              <div className="baseFlex gap-2">
                <SiLeaflet className="size-4" />
                <p>Vegetarian</p>
              </div>
              |
              <div className="baseFlex gap-2">
                <LuVegan className="size-4" />-<p>Vegan</p>
              </div>
              |
              <div className="baseFlex gap-2">
                <span>GF</span>-<span>Gluten Free</span>
              </div>
            </div>
            <p className="text-center text-xs italic text-stone-400 tablet:text-sm">
              <span className="not-italic">* </span>
              Consuming raw or undercooked meats, poultry, seafood, shellfish,
              or eggs may increase your risk of foodborne illness.
            </p>
            <div className="baseFlex w-full gap-2 text-stone-400 ">
              <FaWineBottle className="shrink-0 -rotate-45" />
              <p className="text-xs italic tablet:text-sm">
                All alcoholic beverages must be purchased on-site.
              </p>
            </div>
          </div>
        </motion.div>

        <Button size={"lg"} asChild>
          <Link
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
        </Button>
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
  return (
    <motion.div
      key={`${name}MenuCategory`}
      id={`${name}Container`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        order: listOrder,
      }}
      className="baseVertFlex w-full scroll-m-48 !items-start gap-4 p-2"
    >
      <div className="baseFlex relative w-full rounded-md">
        <Image
          src={wideAngleFoodShot}
          alt={`A wide angle shot of a variety of ${name.toLowerCase()}`}
          sizes="(max-width: 1000px) 90vw, 75vw"
          priority={listOrder === 0} // only want the first category to be a priority
          className="!relative !h-48 w-full rounded-md object-cover shadow-md"
        />

        <div className="baseVertFlex absolute bottom-4 left-4 !items-start gap-2 rounded-md bg-offwhite px-4 py-2 shadow-heavyInner tablet:!flex-row tablet:!items-center tablet:gap-4">
          <p className="ml-1 text-xl font-semibold underline underline-offset-2">
            {name}
          </p>

          {/* {activeDiscount && (
            <div className="rewardsGoldBorder baseFlex gap-1 rounded-md bg-primary px-4 py-0.5 text-sm font-medium text-yellow-500">
              <span>{activeDiscount.name}</span>
              <span>
                until {format(activeDiscount.expirationDate, "MM/dd")}
              </span>
            </div>
          )} */}
        </div>
      </div>

      {/* wrapping container for each food item in the category */}
      <div className="grid w-full grid-cols-1 items-start justify-items-center p-1 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3 3xl:grid-cols-4">
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
    </motion.div>
  );
}

function formatMenuItemPrice(
  categoryName: string,
  menuItem: FullMenuItem,
  activeDiscount: Discount | null,
  customizationChoices: Record<string, CustomizationChoiceAndCategory>,
) {
  if (categoryName === "Wine") {
    return (
      <div className="baseFlex gap-2 text-sm">
        <div className="baseFlex gap-2">
          <IoIosWine className="size-[18px]" />
          {formatPrice(
            calculateRelativeTotal({
              items: [
                {
                  price: menuItem.altPrice ?? menuItem.price,
                  quantity: 1,
                  discountId: null, //activeDiscount?.id ?? null,

                  // only necessary to fit Item shape
                  id: 0,
                  itemId: menuItem.id,
                  customizations: {}, // not necessary since all default choices are already included in price
                  includeDietaryRestrictions: false,
                  name: menuItem.name,
                  specialInstructions: "",
                  isChefsChoice: menuItem.isChefsChoice,
                  isAlcoholic: menuItem.isAlcoholic,
                  isVegetarian: menuItem.isVegetarian,
                  isVegan: menuItem.isVegan,
                  isGlutenFree: menuItem.isGlutenFree,
                  showUndercookedOrRawDisclaimer:
                    menuItem.showUndercookedOrRawDisclaimer,
                  hasImageOfItem: menuItem.hasImageOfItem,
                  birthdayReward: false,
                  pointReward: false,
                },
              ],
              customizationChoices,
              discounts: {}, // TODO: do we want to show discount prices on menu? I feel like we should keep it
              // to just the regular prices..
            }),
          )}
        </div>
        |
        <div className="baseFlex gap-2">
          <FaWineBottle className="-rotate-45" />
          {formatPrice(
            calculateRelativeTotal({
              items: [
                {
                  price: menuItem.price,
                  quantity: 1,
                  discountId: null, //activeDiscount?.id ?? null,

                  // only necessary to fit Item shape
                  id: 0,
                  itemId: menuItem.id,
                  customizations: {}, // not necessary since all default choices are already included in price
                  includeDietaryRestrictions: false,
                  name: menuItem.name,
                  specialInstructions: "",
                  isChefsChoice: menuItem.isChefsChoice,
                  isAlcoholic: menuItem.isAlcoholic,
                  isVegetarian: menuItem.isVegetarian,
                  isVegan: menuItem.isVegan,
                  isGlutenFree: menuItem.isGlutenFree,
                  showUndercookedOrRawDisclaimer:
                    menuItem.showUndercookedOrRawDisclaimer,
                  hasImageOfItem: menuItem.hasImageOfItem,
                  birthdayReward: false,
                  pointReward: false,
                },
              ],
              customizationChoices,
              discounts: {},
            }),
          )}
        </div>
      </div>
    );
  }

  return (
    <p className="self-end text-base">
      {formatPrice(
        calculateRelativeTotal({
          items: [
            {
              price: menuItem.price,
              quantity: 1,
              discountId: null, //activeDiscount?.id ?? null,

              // only necessary to fit Item shape
              id: 0,
              itemId: menuItem.id,
              customizations: {}, // not necessary since all default choices are already included in price
              includeDietaryRestrictions: false,
              name: menuItem.name,
              specialInstructions: "",
              isChefsChoice: menuItem.isChefsChoice,
              isAlcoholic: menuItem.isAlcoholic,
              isVegetarian: menuItem.isVegetarian,
              isVegan: menuItem.isVegan,
              isGlutenFree: menuItem.isGlutenFree,
              showUndercookedOrRawDisclaimer:
                menuItem.showUndercookedOrRawDisclaimer,
              hasImageOfItem: menuItem.hasImageOfItem,
              birthdayReward: false,
              pointReward: false,
            },
          ],
          customizationChoices,
          discounts: {},
        }),
      )}
    </p>
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
      className="relative w-full max-w-96 px-2"
    >
      <div className="baseVertFlex size-full !justify-between gap-4 py-1 tablet:py-4">
        <div className="baseFlex mt-4 w-full gap-4 tablet:mt-0">
          {menuItem.hasImageOfItem && (
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={`${menuItem.name} at Khue's in St. Paul`}
              width={96}
              height={96}
              className="mt-2 !size-24 !self-start rounded-md drop-shadow-lg"
            />
          )}

          <div className="baseVertFlex size-full !items-start">
            <div className="baseFlex w-full !justify-between">
              <div className="baseVertFlex !items-start gap-1">
                <p className="whitespace-normal text-left text-lg font-medium supports-[text-wrap]:text-wrap ">
                  <span className="underline underline-offset-2">
                    {menuItem.name}
                  </span>
                  {menuItem.showUndercookedOrRawDisclaimer ? "*" : ""}
                </p>

                <div className="baseFlex !justify-start gap-1">
                  {menuItem.isChefsChoice && (
                    <p className="baseFlex size-4 rounded-full border border-black bg-offwhite p-2">
                      K
                    </p>
                  )}
                  {menuItem.isVegetarian && <SiLeaflet className="size-4" />}
                  {menuItem.isVegan && <LuVegan className="size-4" />}
                  {menuItem.isGlutenFree && <p className="text-sm">GF</p>}
                </div>

                <p className="max-w-72 whitespace-normal text-left text-sm text-stone-400 supports-[text-wrap]:text-wrap">
                  {menuItem.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="self-end">
          {formatMenuItemPrice(
            categoryName,
            menuItem,
            activeDiscount,
            customizationChoices,
          )}
        </div>
      </div>
    </div>
  );
}

const menuCategories = [
  {
    id: "60f90b72-e44a-4775-b071-97ed5dc020d3",
    createdAt: "2024-02-21T03:48:14.000Z",
    name: "Starters",
    active: true,
    orderableOnline: true,
    listOrder: 2,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "702b5c80-7d63-43ef-a80f-948c64c21575",
        createdAt: "2024-05-15T21:32:32.217Z",
        name: "Stir-fried String Beans",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1400,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 15,
        hasImageOfItem: true,
        menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
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
        id: "2315135f-19f4-4ede-9af7-0ffccadd2557",
        createdAt: "2024-05-15T21:28:07.340Z",
        name: "Chili Crunch Wings",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1200,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 28,
        hasImageOfItem: true,
        menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
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
        id: "77207783-b518-45f5-b43d-9c058dc0994f",
        createdAt: "2024-05-15T21:32:32.217Z",
        name: "Fresh Bread",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1200,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 12,
        hasImageOfItem: true,
        menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
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
        id: "7b0aa9eb-2a87-48cd-8c98-67b3f5a4b74f",
        createdAt: "2024-02-21T03:51:47.000Z",
        name: "Vietnamese Bar Nuts",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
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
        isGlutenFree: true,
        showUndercookedOrRawDisclaimer: false,
        pointReward: true,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "bca28f28-839f-4891-a147-95176dec9341",
        createdAt: "2024-05-15T11:32:32.000Z",
        name: "Crispy Pork Bao",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1400,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 14,
        hasImageOfItem: true,
        menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
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
        name: "Cream Cheese Wontons",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1100,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 2,
        hasImageOfItem: true,
        menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
        activeDiscountId: null,
        isChefsChoice: true,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: true,
        isGlutenFree: true,
        showUndercookedOrRawDisclaimer: false,
        pointReward: true,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "d531e6f4-7625-46c4-9fd2-c30d912c9025",
        createdAt: "2024-02-21T15:53:33.000Z",
        name: "Egg Rolls",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 800,
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
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "d6fce425-ebd9-4022-99a4-babe0a5a81b1",
        createdAt: "2024-05-15T21:32:32.217Z",
        name: "Chicken Salad",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1400,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 13,
        hasImageOfItem: true,
        menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
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
        id: "f61bf41d-ef94-428f-8a27-e979d8218690",
        createdAt: "2024-05-15T21:32:32.217Z",
        name: "Fried Shrimp",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1200,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 11,
        hasImageOfItem: true,
        menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
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
        id: "f651ed75-a596-4a9f-8ba8-6dafd8ddd9de",
        createdAt: "2024-05-15T21:32:32.217Z",
        name: "Asian Fries",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1200,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 10,
        hasImageOfItem: true,
        menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
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
    ],
  },
  {
    id: "d500046e-b7d2-44a4-973e-568a143c48f0",
    createdAt: "2024-02-20T21:50:11.000Z",
    name: "Soups",
    active: true,
    orderableOnline: true,
    listOrder: 3,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "49b2da70-97e3-49ca-ae7c-876ad32522d7",
        createdAt: "2024-02-21T16:01:22.000Z",
        name: "Chicken Pho",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 15,
        hasImageOfItem: true,
        menuCategoryId: "d500046e-b7d2-44a4-973e-568a143c48f0",
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
        id: "60cdfd99-7970-4ce1-9032-6918f4dfcfec",
        createdAt: "2024-02-21T04:01:02.000Z",
        name: "Xiu Mai",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 14,
        hasImageOfItem: true,
        menuCategoryId: "d500046e-b7d2-44a4-973e-568a143c48f0",
        activeDiscountId: null,
        isChefsChoice: true,
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
        id: "8330d52d-a54d-4435-992c-22b8404533ae",
        createdAt: "2024-02-21T10:00:43.000Z",
        name: "Yellow Curry",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 13,
        hasImageOfItem: true,
        menuCategoryId: "d500046e-b7d2-44a4-973e-568a143c48f0",
        activeDiscountId: null,
        isChefsChoice: true,
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
    ],
  },
  {
    id: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
    createdAt: "2024-02-20T21:49:34.000Z",
    name: "Entrees",
    active: true,
    orderableOnline: true,
    listOrder: 4,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "32ca68b1-ec1b-4bdc-b853-51b63d73cb26",
        createdAt: "2024-02-21T15:54:46.000Z",
        name: "Grilled Chicken Vermicelli",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1900,
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
        id: "52eb5f2d-4eac-4cde-b27f-8b35810fa098",
        createdAt: "2024-05-15T21:36:35.209Z",
        name: "Pork Ribs",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 11,
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
        id: "1663442b-e4a2-4bac-a5ab-b7d2edb7cfd9",
        createdAt: "2024-05-15T21:36:35.209Z",
        name: "Grilled Ribeye",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 13,
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
        id: "7bd980fe-a447-401d-8880-03ec4773a9b2",
        createdAt: "2024-02-20T21:54:12.000Z",
        name: "Grilled Pork Vermicelli",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 4,
        hasImageOfItem: true,
        menuCategoryId: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: true,
        pointReward: true,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "a44bfc71-facd-4ce6-a576-afbac6e2b2f3",
        createdAt: "2024-05-15T16:36:35.000Z",
        name: "Hainanese Chicken",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 10,
        hasImageOfItem: true,
        menuCategoryId: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
        activeDiscountId: null,
        isChefsChoice: true,
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
        id: "d809597c-803b-4bbb-b8b9-65d57b5a3577",
        createdAt: "2024-02-20T15:55:13.000Z",
        name: "Chicken Sandwich",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 6,
        hasImageOfItem: true,
        menuCategoryId: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
        activeDiscountId: null,
        isChefsChoice: true,
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
        id: "f13337f6-9a13-472a-bdd6-2ed29eb47e43",
        createdAt: "2024-05-15T21:36:35.209Z",
        name: "Five Spice Tofu",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 12,
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
    ],
  },
  {
    id: "7abeebb9-4fce-457a-af05-adb1b89aa1b0",
    createdAt: "2024-02-20T21:50:03.000Z",
    name: "Desserts",
    active: true,
    orderableOnline: true,
    listOrder: 5,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "3581eac7-f105-486e-97de-2aa234bb6e0c",
        createdAt: "2024-05-15T21:38:58.971Z",
        name: "Toffee Chocolate Chip Cookie",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1100,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 10,
        hasImageOfItem: true,
        menuCategoryId: "7abeebb9-4fce-457a-af05-adb1b89aa1b0",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
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
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1100,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 11,
        hasImageOfItem: true,
        menuCategoryId: "7abeebb9-4fce-457a-af05-adb1b89aa1b0",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: true,
        birthdayReward: true,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "417cfb26-a279-4de1-966b-b314a0486905",
        createdAt: "2024-02-21T09:57:48.000Z",
        name: "Gelato Affogato",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1100,
        altPrice: null,
        available: false,
        discontinued: false,
        listOrder: 10,
        hasImageOfItem: true,
        menuCategoryId: "7abeebb9-4fce-457a-af05-adb1b89aa1b0",
        activeDiscountId: null,
        isChefsChoice: true,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: true,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "53e5cbb4-1fa4-4328-b9e2-80b6003f19a7",
        createdAt: "2024-02-21T09:59:11.000Z",
        name: "Sesame Balls",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1100,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 12,
        hasImageOfItem: true,
        menuCategoryId: "7abeebb9-4fce-457a-af05-adb1b89aa1b0",
        activeDiscountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: true,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
    ],
  },
  {
    id: "afbe0627-48a5-40df-bd5d-f6bb25fd2a07",
    createdAt: "2024-02-20T21:49:55.000Z",
    name: "Drinks",
    active: true,
    orderableOnline: true,
    listOrder: 6,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "717349d0-4829-4e4a-98ab-a9e00a67768a",
        createdAt: "2024-02-20T21:56:02.000Z",
        name: "Drink One",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 300,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 7,
        hasImageOfItem: true,
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
        customizationCategories: [
          {
            id: "d58f86b3-d769-468e-9b5c-3e207438701f",
            name: "Size",
            description: "Select a size",
            defaultChoiceId: "e1f38eae-c3d1-41e4-9069-a84a76d456cc",
            internalName: "",
            customizationChoices: [
              {
                id: "27f847cc-676a-4617-aa34-8895627dab2f",
                name: "Small",
                description: "12oz",
                priceAdjustment: -175,
                isAvailable: true,
                listOrder: 1,
                customizationCategoryId: "d58f86b3-d769-468e-9b5c-3e207438701f",
              },
              {
                id: "e1f38eae-c3d1-41e4-9069-a84a76d456cc",
                name: "Medium",
                description: "16oz",
                priceAdjustment: 0,
                isAvailable: true,
                listOrder: 2,
                customizationCategoryId: "d58f86b3-d769-468e-9b5c-3e207438701f",
              },
              {
                id: "dc9c85df-49f6-46a9-9055-a6de9240699a",
                name: "Large",
                description: "20oz",
                priceAdjustment: 175,
                isAvailable: true,
                listOrder: 3,
                customizationCategoryId: "d58f86b3-d769-468e-9b5c-3e207438701f",
              },
            ],
          },
        ],
      },
      {
        id: "b883736a-314d-4b19-a9e2-582a2a543790",
        createdAt: "2024-02-20T21:57:13.000Z",
        name: "Drink Three",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 400,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 9,
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
        customizationCategories: [
          {
            id: "d58f86b3-d769-468e-9b5c-3e207438701f",
            name: "Size",
            description: "Select a size",
            defaultChoiceId: "e1f38eae-c3d1-41e4-9069-a84a76d456cc",
            internalName: "",
            customizationChoices: [
              {
                id: "27f847cc-676a-4617-aa34-8895627dab2f",
                name: "Small",
                description: "12oz",
                priceAdjustment: -175,
                isAvailable: true,
                listOrder: 1,
                customizationCategoryId: "d58f86b3-d769-468e-9b5c-3e207438701f",
              },
              {
                id: "e1f38eae-c3d1-41e4-9069-a84a76d456cc",
                name: "Medium",
                description: "16oz",
                priceAdjustment: 0,
                isAvailable: true,
                listOrder: 2,
                customizationCategoryId: "d58f86b3-d769-468e-9b5c-3e207438701f",
              },
              {
                id: "dc9c85df-49f6-46a9-9055-a6de9240699a",
                name: "Large",
                description: "20oz",
                priceAdjustment: 175,
                isAvailable: true,
                listOrder: 3,
                customizationCategoryId: "d58f86b3-d769-468e-9b5c-3e207438701f",
              },
            ],
          },
        ],
      },
      {
        id: "f5adc265-dc7c-47ad-aead-cdad3d111de8",
        createdAt: "2024-02-20T21:56:45.000Z",
        name: "Drink Two",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 600,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 8,
        hasImageOfItem: true,
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
        customizationCategories: [
          {
            id: "d58f86b3-d769-468e-9b5c-3e207438701f",
            name: "Size",
            description: "Select a size",
            defaultChoiceId: "e1f38eae-c3d1-41e4-9069-a84a76d456cc",
            internalName: "",
            customizationChoices: [
              {
                id: "27f847cc-676a-4617-aa34-8895627dab2f",
                name: "Small",
                description: "12oz",
                priceAdjustment: -175,
                isAvailable: true,
                listOrder: 1,
                customizationCategoryId: "d58f86b3-d769-468e-9b5c-3e207438701f",
              },
              {
                id: "e1f38eae-c3d1-41e4-9069-a84a76d456cc",
                name: "Medium",
                description: "16oz",
                priceAdjustment: 0,
                isAvailable: true,
                listOrder: 2,
                customizationCategoryId: "d58f86b3-d769-468e-9b5c-3e207438701f",
              },
              {
                id: "dc9c85df-49f6-46a9-9055-a6de9240699a",
                name: "Large",
                description: "20oz",
                priceAdjustment: 175,
                isAvailable: true,
                listOrder: 3,
                customizationCategoryId: "d58f86b3-d769-468e-9b5c-3e207438701f",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "bc6ad82c-c33c-4e91-93bb-610ac4ecc026",
    createdAt: "2024-03-29T16:02:56.000Z",
    name: "Beer",
    active: true,
    orderableOnline: false,
    listOrder: 7,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "92e8ec25-618f-43e1-8b9e-2f985effe324",
        createdAt: "2024-03-29T16:10:10.000Z",
        name: "Beer Three",
        description: "Lorem ipsum dolor sit amet, consectetur. (16oz bottle)",
        price: 600,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 18,
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
        id: "e3a94e81-db5d-49b6-9546-d2e59902f994",
        createdAt: "2024-03-29T16:09:49.000Z",
        name: "Beer Two",
        description: "Lorem ipsum dolor sit amet, consectetur. (16oz bottle)",
        price: 500,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 17,
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
        id: "ef57412f-c533-4dce-9d96-7355555cf268",
        createdAt: "2024-03-29T21:09:27.000Z",
        name: "Beer One",
        description: "Lorem ipsum dolor sit amet, consectetur. (16oz bottle)",
        price: 500,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 16,
        hasImageOfItem: false,
        menuCategoryId: "bc6ad82c-c33c-4e91-93bb-610ac4ecc026",
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
    ],
  },
  {
    id: "05746714-f1d3-4a77-914d-75780fa98d60",
    createdAt: "2024-03-29T16:03:43.000Z",
    name: "Wine",
    active: true,
    orderableOnline: false,
    listOrder: 8,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "1e409626-05ae-4404-b089-d7b1e1748b7e",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Wine One",
        description: "Lorem ipsum dolor sit amet, consectetur. (48oz bottle)",
        price: 3200,
        altPrice: 800,
        available: true,
        discontinued: false,
        listOrder: 19,
        hasImageOfItem: false,
        menuCategoryId: "05746714-f1d3-4a77-914d-75780fa98d60",
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
        id: "66f46985-08b3-411c-9896-103cb8092c34",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Wine Three",
        description: "Lorem ipsum dolor sit amet. (64oz bottle)",
        price: 4800,
        altPrice: 1200,
        available: true,
        discontinued: false,
        listOrder: 21,
        hasImageOfItem: false,
        menuCategoryId: "05746714-f1d3-4a77-914d-75780fa98d60",
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
        id: "cd411b88-62a3-4614-9376-a0ebd641ff4c",
        createdAt: "2024-03-29T21:10:53.000Z",
        name: "Wine Two",
        description: "Lorem ipsum dolor sit amet, consectetur. (64oz bottle)",
        price: 5000,
        altPrice: 1800,
        available: true,
        discontinued: false,
        listOrder: 20,
        hasImageOfItem: false,
        menuCategoryId: "05746714-f1d3-4a77-914d-75780fa98d60",
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
    ],
  },
  {
    id: "82333451-c2ec-4540-8fd5-84cc54bef02a",
    createdAt: "2024-03-29T11:04:08.000Z",
    name: "Spirits",
    active: true,
    orderableOnline: false,
    listOrder: 9,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "8dfe23e5-e800-41a2-a6b0-82ba9b62c811",
        createdAt: "2024-03-30T02:11:46.000Z",
        name: "Spirit Three",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
        price: 1200,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 24,
        hasImageOfItem: false,
        menuCategoryId: "82333451-c2ec-4540-8fd5-84cc54bef02a",
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
        id: "9265b3c4-eb32-4601-9209-0652681ce98e",
        createdAt: "2024-03-30T02:11:46.000Z",
        name: "Spirit Two",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
        price: 700,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 23,
        hasImageOfItem: false,
        menuCategoryId: "82333451-c2ec-4540-8fd5-84cc54bef02a",
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
        id: "be96b4b7-e9fe-4b30-8e35-1de4da53c389",
        createdAt: "2024-03-30T02:11:46.000Z",
        name: "Spirit One",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
        price: 800,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 22,
        hasImageOfItem: false,
        menuCategoryId: "82333451-c2ec-4540-8fd5-84cc54bef02a",
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
    ],
  },
  {
    id: "53e7d81a-e636-4866-b7c1-8dca6b8fc7a7",
    createdAt: "2024-06-27T08:24:47.029Z",
    name: "Mixed Drinks",
    active: true,
    orderableOnline: false,
    listOrder: 10,
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "79ec8c66-679d-4572-b338-360d1baf0e3d",
        createdAt: "2024-06-27T08:28:48.410Z",
        name: "Cucumber Vodka Spritz",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
        price: 750,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 8,
        hasImageOfItem: false,
        menuCategoryId: "53e7d81a-e636-4866-b7c1-8dca6b8fc7a7",
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
        id: "8b8a0d1b-7d43-439c-9bea-a4deacf2d759",
        createdAt: "2024-06-27T08:28:48.410Z",
        name: "Sunset Mojito",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
        price: 850,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 1,
        hasImageOfItem: false,
        menuCategoryId: "53e7d81a-e636-4866-b7c1-8dca6b8fc7a7",
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
        id: "bbcd7140-90ce-4504-89ac-0b3a2bfa7fcf",
        createdAt: "2024-06-27T08:28:48.410Z",
        name: "Velvet Martini",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
        price: 900,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 2,
        hasImageOfItem: false,
        menuCategoryId: "53e7d81a-e636-4866-b7c1-8dca6b8fc7a7",
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
        id: "a19a5978-00c7-49fa-b403-c43845e00acb",
        createdAt: "2024-06-27T08:28:48.410Z",
        name: "Sapphire Gin Fizz",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
        price: 750,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 3,
        hasImageOfItem: false,
        menuCategoryId: "53e7d81a-e636-4866-b7c1-8dca6b8fc7a7",
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
        id: "3ae69dd3-352f-4e3b-8ccc-893f9ad13d8e",
        createdAt: "2024-06-27T08:28:48.410Z",
        name: "Tropical Rum Punch",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
        price: 800,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 4,
        hasImageOfItem: false,
        menuCategoryId: "53e7d81a-e636-4866-b7c1-8dca6b8fc7a7",
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
        id: "9ba150d3-ee5e-473f-a8ec-9b54a5dd8512",
        createdAt: "2024-06-27T08:28:48.410Z",
        name: "Midnight Espresso Martini",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
        price: 1000,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 5,
        hasImageOfItem: false,
        menuCategoryId: "53e7d81a-e636-4866-b7c1-8dca6b8fc7a7",
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
        id: "a3da3ea0-4920-4b46-9b35-b2c13bb25346",
        createdAt: "2024-06-27T08:28:48.410Z",
        name: "Citrus Whiskey Sour",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
        price: 700,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 6,
        hasImageOfItem: false,
        menuCategoryId: "53e7d81a-e636-4866-b7c1-8dca6b8fc7a7",
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
        id: "3e62dc50-50ff-4ff7-8a0b-0de69b861fd3",
        createdAt: "2024-06-27T08:28:48.410Z",
        name: "Cherry Blossom Cocktail",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod",
        price: 950,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 7,
        hasImageOfItem: false,
        menuCategoryId: "53e7d81a-e636-4866-b7c1-8dca6b8fc7a7",
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
    ],
  },
];

const menuCategoryIndicies = {
  Starters: 0,
  Soups: 1,
  Entrees: 2,
  Desserts: 3,
  Drinks: 4,
  Beer: 5,
  Wine: 6,
  Spirits: 7,
  "Mixed Drinks": 8,
};
