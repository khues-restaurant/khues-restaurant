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

import { Charis_SIL } from "next/font/google";
const charis = Charis_SIL({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700"],
});

import masonryFoodOne from "/public/food/one.jpg";
import masonryFoodTwo from "/public/food/two.webp";
import masonryFoodThree from "/public/food/three.jpg";
import masonryFoodFour from "/public/food/four.png";
import masonryFoodFive from "/public/food/five.jpg";

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
            <p className="text-center text-xs italic text-stone-500 tablet:text-sm">
              <span className="not-italic">* </span>
              Consuming raw or undercooked meats, poultry, seafood, shellfish,
              or eggs may increase your risk of foodborne illness.
            </p>
            <div className="baseFlex w-full gap-2 text-stone-500 ">
              <FaWineBottle className="shrink-0 -rotate-45" />
              <p className="text-xs italic tablet:text-sm">
                All alcoholic beverages must be purchased on-site.
              </p>
            </div>
          </div>
        </motion.div>

        {/* <Button size={"lg"} asChild>
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
      {name === "Beverages" || name === "Beer" || name === "Wine" ? (
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
          <div className="grid w-full grid-cols-1 items-start justify-items-center p-1 sm:grid-cols-2 sm:gap-x-16 xl:grid-cols-3 3xl:grid-cols-4">
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
          <div className="baseFlex relative h-36 w-full !justify-end overflow-hidden rounded-md bg-offwhite shadow-md tablet:h-48">
            {/* primary diagonal bg */}
            <div className="absolute left-0 top-0 size-full rounded-md bg-gradient-to-br from-primary to-darkPrimary"></div>

            <div className="absolute left-[35%] h-full w-[65%] overflow-hidden">
              {(viewportLabel.includes("mobile") ||
                (!viewportLabel.includes("mobile") && name !== "Desserts")) && (
                <div
                  style={{
                    filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
                  }}
                  className="absolute left-[10%] top-0 h-full w-[100%] tablet:left-[2%] tablet:w-3/4"
                >
                  <Image
                    src={masonryFoodOne}
                    alt={`${name} at Khue's in St. Paul`}
                    fill
                    style={{
                      clipPath: "polygon(0 0, 35% 0, 50% 100%, 15% 100%)",
                    }}
                    className="object-cover "
                  />
                </div>
              )}

              <div
                style={{
                  filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
                }}
                className="absolute left-[50%] top-0 h-full w-[100%] tablet:left-[32.5%] tablet:w-3/4"
              >
                <Image
                  src={masonryFoodTwo}
                  alt={`${name} at Khue's in St. Paul`}
                  fill
                  style={{
                    clipPath: "polygon(0 0, 35% 0, 50% 100%, 15% 100%)",
                  }}
                  className="object-cover"
                />
              </div>

              <div
                style={{
                  filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5))",
                }}
                className="absolute top-0 hidden h-full w-[100%] tablet:left-[63%] tablet:block tablet:w-3/4"
              >
                <Image
                  src={masonryFoodFour}
                  alt={`${name} at Khue's in St. Paul`}
                  fill
                  style={{
                    clipPath: "polygon(0 0, 35% 0, 50% 100%, 15% 100%)",
                  }}
                  className="object-cover"
                />
              </div>
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
      className="relative w-full max-w-[400px] px-2"
    >
      <div
        className={`${menuItem.description ? "flex-row" : "flex-row"} flex size-full items-center !justify-between gap-4 py-1`}
      >
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
              {menuItem.isChefsChoice && (
                <p className="baseFlex size-4 rounded-full border border-black bg-offwhite p-2">
                  K
                </p>
              )}
              {menuItem.isVegetarian && <SiLeaflet className="size-4" />}
              {menuItem.isVegan && <LuVegan className="size-4" />}
              {menuItem.isGlutenFree && <p className="text-sm">GF</p>}
            </div>

            {menuItem.description && (
              <p className="text-sm text-stone-500">{menuItem.description}</p>
            )}
          </div>
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
    listOrder: 1, // was 2
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "702b5c80-7d63-43ef-a80f-948c64c21575",
        createdAt: "2024-05-15T21:32:32.217Z",
        name: "Crispy Pork Lettuce Wraps",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1500,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 1, // first in array
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
        name: "Chicken Salad",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1400,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 2,
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
        name: "Pork Eggroll",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1400,
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
        id: "7b0aa9eb-2a87-48cd-8c98-67b3f5a4b74f",
        createdAt: "2024-02-21T03:51:47.000Z",
        name: "Cream Cheese Wontons",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1200,
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
        name: "Shrimp Poppers",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1500,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 5,
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
        name: "Sticky Jicama Ribs",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1400,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 6,
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
    ],
  },
  {
    id: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
    createdAt: "2024-02-20T21:49:34.000Z",
    name: "Entrees",
    active: true,
    orderableOnline: true,
    listOrder: 3, // was 4
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "32ca68b1-ec1b-4bdc-b853-51b63d73cb26",
        createdAt: "2024-02-21T15:54:46.000Z",
        name: "Five Spice Tofu",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1900,
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
        name: "Grilled Sirloin",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 3200,
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
        showUndercookedOrRawDisclaimer: true,
        pointReward: true,
        birthdayReward: false,
        reviews: null,
        activeDiscount: null,
        customizationCategories: [],
      },
      {
        id: "1663442b-e4a2-4bac-a5ab-b7d2edb7cfd9",
        createdAt: "2024-05-15T21:36:35.209Z",
        name: "Roast Pork Fried Rice",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1700,
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
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
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
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
        price: 1700,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 4,
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
    ],
  },
  {
    id: "7abeebb9-4fce-457a-af05-adb1b89aa1b0",
    createdAt: "2024-02-20T21:50:03.000Z",
    name: "Desserts",
    active: true,
    orderableOnline: true,
    listOrder: 4, // was 5
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "3581eac7-f105-486e-97de-2aa234bb6e0c",
        createdAt: "2024-05-15T21:38:58.971Z",
        name: "Ca Phe Sua De Affogato",
        description:
          "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
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
        listOrder: 2,
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
    ],
  },
  {
    id: "afbe0627-48a5-40df-bd5d-f6bb25fd2a07",
    createdAt: "2024-02-20T21:49:55.000Z",
    name: "Beverages",
    active: true,
    orderableOnline: true,
    listOrder: 5, // was 6
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "717349d0-4829-4e4a-98ab-a9e00a67768a",
        createdAt: "2024-02-20T21:56:02.000Z",
        name: "Negroni Spritz (Non-Alcoholic)",
        description: "",
        price: 800,
        altPrice: null,
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
        name: "Ume Spritz",
        description: "",
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
        name: "United Ferments Green Tea Glass",
        description: "",
        price: 1500,
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
        id: "70fcfc51-cf3d-42ff-8454-e9cbe0a82f42",
        createdAt: "2024-02-20T21:56:45.000Z",
        name: "United Ferments Oolong Glass",
        description: "",
        price: 1500,
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
    listOrder: 6, // was 7
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "aaea55ae-8889-4d8a-81b5-0bc48f24a721",
        createdAt: "2024-03-29T16:10:10.000Z",
        name: "Bud Light",
        description: "",
        price: 600,
        altPrice: null,
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
        name: "Budweiser",
        description: "",
        price: 600,
        altPrice: null,
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
        id: "4a027a04-3fe6-440a-a860-3c0c9e0ef0a0",
        createdAt: "2024-03-29T21:09:27.000Z",
        name: "Coors",
        description: "",
        price: 600,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 3,
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
      {
        id: "8349fe66-81b0-4d04-8291-4ab60641676d",
        createdAt: "2024-03-29T21:09:27.000Z",
        name: "Coors Light",
        description: "",
        price: 600,
        altPrice: null,
        available: true,
        discontinued: false,
        listOrder: 4,
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
    listOrder: 7, // was 8
    activeDiscountId: null,
    activeDiscount: null,
    menuItems: [
      {
        id: "f8779458-2869-4d42-ac11-7770f84cea8b",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Avinyo Cava",
        description: "",
        price: 3500,
        altPrice: 1300,
        available: true,
        discontinued: false,
        listOrder: 1,
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
        id: "8e3b95a4-d6c5-4020-86a0-e88023076840",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Ciello Nero D'Avola",
        description: "",
        price: 3500,
        altPrice: 1200,
        available: true,
        discontinued: false,
        listOrder: 2,
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
        id: "2fc66d54-5fa7-468c-9157-56d0486c59c9",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Deep Down Sauvingon Blanc",
        description: "",
        price: 3500,
        altPrice: 1600,
        available: true,
        discontinued: false,
        listOrder: 2,
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
        id: "a7a43de3-9081-44fa-94bc-2809db6abfc3",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Eric Texier",
        description: "",
        price: 3500,
        altPrice: 1500,
        available: true,
        discontinued: false,
        listOrder: 2,
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
        id: "2a286186-cf76-4103-8118-19a375c815b3",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Muscadet et Maine",
        description: "",
        price: 3500,
        altPrice: 1200,
        available: true,
        discontinued: false,
        listOrder: 2,
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
        id: "d42a3968-2f38-43b2-b33f-6b1d48057e3f",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Newfound Rose",
        description: "",
        price: 3500,
        altPrice: 1400,
        available: true,
        discontinued: false,
        listOrder: 2,
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
        id: "f7a13949-af41-42ea-974d-ae8a695713be",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Night Swim Sake",
        description: "",
        price: 3500,
        altPrice: 900,
        available: true,
        discontinued: false,
        listOrder: 2,
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
        id: "928e73b3-cd40-4acd-b689-9d54753a1262",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Pfalz Chardonnay",
        description: "",
        price: 3500,
        altPrice: 1500,
        available: true,
        discontinued: false,
        listOrder: 2,
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
        id: "7704a46f-d6c3-4f89-97fa-c252b5b765dc",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Rodica Pet-Nat Rose",
        description: "",
        price: 3500,
        altPrice: 1600,
        available: true,
        discontinued: false,
        listOrder: 2,
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
        id: "19e561b0-2a8a-45b8-9907-322bf11532ad",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Torre Alle Tolfe",
        description: "",
        price: 3500,
        altPrice: 1600,
        available: true,
        discontinued: false,
        listOrder: 2,
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
        id: "e050bf5a-b75b-4eb9-975e-871c36e639bd",
        createdAt: "2024-03-29T16:10:53.000Z",
        name: "Vincenzo Skin Contact",
        description: "",
        price: 3500,
        altPrice: 1400,
        available: true,
        discontinued: false,
        listOrder: 2,
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
    ],
  },
];

const menuCategoryIndicies = {
  Starters: 0,
  Entrees: 1,
  Desserts: 2,
  Beverages: 3,
  Beer: 4,
  Wine: 5,
};
