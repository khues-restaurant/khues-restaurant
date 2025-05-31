import { type GetStaticProps } from "next";
import { PrismaClient, type Discount } from "@prisma/client";
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
import { menuItemImagePaths } from "~/utils/menuItemImagePaths";

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
import { FaPepperHot } from "react-icons/fa6";

const menuItemCategoryImages: Record<string, StaticImageData[]> = {
  Starters: [creamCheeseWantons],
  Entrees: [roastPorkFriedRice, spicyChickenSando, grilledSirloin],
  Desserts: [affogato, thaiTeaTresLeches],
};

interface Menu {
  menuCategories: FilteredMenuCategory[];
  menuCategoryIndicies: Record<string, number>;
}

function Menu({ menuCategories, menuCategoryIndicies }: Menu) {
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
        setAbleToShowOrderNowButton(!entry?.isIntersecting);
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
  }, [
    menuCategoryIndicies,
    currentlyInViewCategory,
    programmaticallyScrolling,
    stickyCategoriesApi,
  ]);

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
        className="baseFlex relative h-56 w-full overflow-hidden bg-darkPrimary shadow-md md:bg-gradient-to-br md:from-primary md:to-darkPrimary tablet:h-72"
      >
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
                  {category.name === "Sparkling" && (
                    <Separator
                      orientation="vertical"
                      className="ml-2 mr-2 mt-2 h-8 w-[2px]"
                    />
                  )}
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
            <div className="baseFlex w-full gap-2 text-stone-500 ">
              <FaWineBottle className="shrink-0 -rotate-45" />
              <p className="text-xs italic tablet:text-sm">
                All alcoholic beverages must be purchased on-site.
              </p>
            </div>
          </div>
        </motion.div>

        <Button size={"lg"} asChild>
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
        </Button>
      </div>
    </motion.div>
  );
}

export default Menu;

export const getStaticProps: GetStaticProps = async (ctx) => {
  const prisma = new PrismaClient();

  const menuCategories = await prisma.menuCategory.findMany({
    where: {
      active: true,
    },
    include: {
      activeDiscount: true,
      menuItems: {
        include: {
          activeDiscount: true,
          customizationCategories: {
            include: {
              customizationCategory: {
                include: {
                  customizationChoices: {
                    orderBy: {
                      listOrder: "asc",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      listOrder: "asc",
    },
  });

  // filter out the "extra" field for "customizationCategory" for each menu item
  const filteredMenuCategories = menuCategories.map((category) => {
    return {
      ...category,
      menuItems: category.menuItems.map((item) => {
        return {
          ...item,
          customizationCategories: item.customizationCategories.map(
            (category) => {
              return category.customizationCategory;
            },
          ),
        };
      }),
    };
  });

  const categoryIndicies: Record<string, number> = {};
  let currentIndex = 0;

  menuCategories.forEach((category) => {
    categoryIndicies[category.name] = currentIndex;
    currentIndex++;
  });

  return {
    props: {
      menuCategories: filteredMenuCategories,
      menuCategoryIndicies: categoryIndicies,
    },
  };
};

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

  // return (
  //   <p className="self-end text-base">
  //     {formatPrice(
  //       calculateRelativeTotal({
  //         items: [
  //           {
  //             price: menuItem.price,
  //             quantity: 1,
  //             discountId: null, //activeDiscount?.id ?? null,

  //             // only necessary to fit Item shape
  //             id: 0,
  //             itemId: menuItem.id,
  //             customizations: {}, // not necessary since all default choices are already included in price
  //             includeDietaryRestrictions: false,
  //             name: menuItem.name,
  //             specialInstructions: "",
  //             isChefsChoice: menuItem.isChefsChoice,
  //             isAlcoholic: menuItem.isAlcoholic,
  //             isVegetarian: menuItem.isVegetarian,
  //             isVegan: menuItem.isVegan,
  //             isGlutenFree: menuItem.isGlutenFree,
  //             showUndercookedOrRawDisclaimer:
  //               menuItem.showUndercookedOrRawDisclaimer,
  //             hasImageOfItem: menuItem.hasImageOfItem,
  //             birthdayReward: false,
  //             pointReward: false,
  //           },
  //         ],
  //         customizationChoices,
  //         discounts: {},
  //       }),
  //       true,
  //     )}
  //   </p>
  // );

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
              src={menuItemImagePaths[menuItem.name] ?? ""}
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
