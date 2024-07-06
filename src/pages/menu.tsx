import { PrismaClient, type Discount } from "@prisma/client";
import { motion } from "framer-motion";
import { type GetStaticProps } from "next";
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

import sampleImage from "/public/menuItems/sampleImage.webp";
import wideAngleFoodShot from "/public/menuItems/wideAngleFoodShot.webp";

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
  }, [
    currentlyInViewCategory,
    menuCategoryIndicies,
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
      className="baseVertFlex mt-24 min-h-[calc(100dvh-6rem)] w-full !justify-start tablet:mt-28 tablet:min-h-[calc(100dvh-7rem)]"
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
              <h1>Menu</h1>
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
            <h1>Menu</h1>
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
        className="baseFlex sticky left-0 top-24 z-10 size-full h-16 w-full overflow-x-hidden bg-body shadow-lg tablet:top-28 tablet:h-16 tablet:w-3/4 tablet:shadow-none"
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
      className="baseVertFlex w-full scroll-m-48 !items-start gap-4 p-2"
    >
      <div className="baseFlex relative w-full rounded-md">
        <Image
          src={wideAngleFoodShot}
          alt={name}
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
              alt={menuItem.name}
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
