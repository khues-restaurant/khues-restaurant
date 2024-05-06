import { useAuth } from "@clerk/nextjs";
import { type Discount } from "@prisma/client";
import { format } from "date-fns";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { LuVegan } from "react-icons/lu";
import { SiLeaflet } from "react-icons/si";
import Sticky from "react-stickynode";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { calculateRelativeTotal } from "~/utils/calculateRelativeTotal";
import { formatPrice } from "~/utils/formatPrice";

const mixedDrinkItems = [
  "Sunset Mojito - $8.50",
  "Velvet Martini - $9.00",
  "Sapphire Gin Fizz - $7.50",
  "Tropical Rum Punch - $8.00",
  "Midnight Espresso Martini - $10.00",
  "Citrus Whiskey Sour - $7.00",
  "Cherry Blossom Cocktail - $9.50",
  "Frosty Mint Julep - $8.00",
  "Cucumber Vodka Spritz - $7.50",
  "Caribbean Blue Margarita - $8.50",
  "Spiced Apple Cider Rum - $9.00",
  "Lavender Lemonade Vodka - $7.50",
  "Smoked Maple Bourbon - $10.00",
  "Ginger Peach Sangria - $8.00",
  "Blackberry Bramble - $9.00",
  "Fiery Tequila Sunrise - $8.00",
  "Pineapple Coconut Daiquiri - $7.50",
  "Golden Rush - $9.50",
  "Berry Blast Mimosa - $8.00",
  "Almond Joy Martini - $10.00",
];

// - fyi as a performance optimization, we might want to dynamically import the <Dialog> and
//   <Drawer> components and have them only conditionally be rendered based on dimensions

function Menu() {
  const { isLoaded, isSignedIn } = useAuth();

  const { data: menuCategories } = api.menuCategory.getAll.useQuery();

  const [scrollProgress, setScrollProgress] = useState(0);
  const menuCategoriesContainerRef = useRef<HTMLDivElement | null>(null);

  const [currentlyInViewCategory, setCurrentlyInViewCategory] = useState("");
  const [programmaticallyScrolling, setProgrammaticallyScrolling] =
    useState(false);

  const [menuCategoryIndicies, setMenuCategoryIndicies] = useState<
    Record<string, number> | undefined
  >();

  useEffect(() => {
    if (menuCategories === undefined) return;

    const categoryIndicies: Record<string, number> = {};
    let currentIndex = 0;

    menuCategories.forEach((category) => {
      categoryIndicies[category.name] = currentIndex;
      currentIndex++;
    });

    // add mixed drinks category/any other similar ones here
    categoryIndicies["Mixed Drinks"] = currentIndex;

    setMenuCategoryIndicies(categoryIndicies);
  }, [menuCategories]);

  const [stickyCategoriesApi, setStickyCategoriesApi] = useState<CarouselApi>();

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
      <Head>
        <title>Menu | Khue&apos;s</title>
        <meta
          name="description"
          content="Explore the vibrant menu at Khue's, featuring innovative Vietnamese dishes crafted with fresh ingredients and bold flavors."
        />
        <meta property="og:title" content="Menu | Khue's"></meta>
        <meta property="og:url" content="www.khueskitchen.com/menu" />
        <meta
          property="og:description"
          content="Explore the vibrant menu at Khue's, featuring innovative Vietnamese dishes crafted with fresh ingredients and bold flavors."
        />
        <meta property="og:type" content="website" />
        {/* <meta
          property="og:image"
          content="https://www.autostrum.com/opengraphScreenshots/explore.png"
        ></meta> */}
        {/* <meta
          property="og:image:alt"
          content="TODO: A description of what is in the image (not a caption). If the page specifies an og:image it should specify og:image:alt"
        ></meta> */}
      </Head>

      {/* Hero */}
      <div className="baseFlex relative h-56 w-full overflow-hidden tablet:h-72">
        <div className="baseFlex absolute left-0 top-0 size-full border-b-2 bg-gradient-to-br from-primary to-darkPrimary tablet:gap-8 desktop:gap-16">
          <Image
            src={"/menuItems/sampleImage.webp"}
            alt={"TODO: fill in w/ appropriate alt text"}
            width={204}
            height={204}
            className="!relative rounded-md tablet:!hidden"
          />

          <Image
            src={"/menuItems/sampleImage.webp"}
            alt={"TODO: fill in w/ appropriate alt text"}
            fill
            className="!relative !hidden !size-40 rounded-md tablet:!block desktop:!size-48"
          />
          <Image
            src={"/menuItems/sampleImage.webp"}
            alt={"TODO: fill in w/ appropriate alt text"}
            fill
            className="!relative !hidden !size-40 rounded-md tablet:!block desktop:!size-48"
          />
          <div className="baseFlex z-10 mx-8 !hidden rounded-md bg-offwhite p-2 shadow-lg tablet:!flex">
            <div className="baseFlex gap-2 font-semibold text-primary tablet:p-2 tablet:text-xl desktop:text-2xl">
              <SideAccentSwirls className="h-5 scale-x-[-1] fill-primary" />
              Menu
              <SideAccentSwirls className="h-5 fill-primary" />
            </div>
          </div>
          <Image
            src={"/menuItems/sampleImage.webp"}
            alt={"TODO: fill in w/ appropriate alt text"}
            fill
            className="!relative !hidden !size-40 rounded-md tablet:!block desktop:!size-48"
          />
          <Image
            src={"/menuItems/sampleImage.webp"}
            alt={"TODO: fill in w/ appropriate alt text"}
            fill
            className="!relative !hidden !size-40 rounded-md tablet:!block desktop:!size-48"
          />
        </div>

        <div className="baseFlex z-10 rounded-md bg-offwhite p-2 shadow-lg tablet:hidden">
          <div className="baseFlex gap-2 p-2 text-xl font-semibold text-primary tablet:px-8 tablet:py-3 tablet:text-2xl">
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary" />
            Menu
            <SideAccentSwirls className="h-4 fill-primary" />
          </div>
        </div>
      </div>

      <div className="baseVertFlex relative w-full pb-8 tablet:w-3/4">
        <AnimatePresence mode="popLayout">
          {!menuCategories || menuCategoryIndicies === undefined ? (
            // idk if we need to make the skeleton sticky as well?
            <motion.div
              key={"loadingMenuCategoriesPicker"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="baseFlex w-full gap-4 border-b-2 p-2"
            >
              <Skeleton className="h-10 w-full" index={0} />
              <Skeleton className="h-10 w-full" index={1} />
              <Skeleton className="h-10 w-full" index={2} />
              <Skeleton className="h-10 w-full" index={3} />
            </motion.div>
          ) : (
            <motion.div
              key={"menuCategoriesPicker"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="baseFlex z-10 size-full bg-offwhite shadow-lg tablet:shadow-none"
            >
              {/* unsure of why container increases in size a bit on desktop when sticky becomes active..  */}
              <Sticky
                top={"#header"}
                activeClass="bg-offwhite h-16"
                innerActiveClass="bg-offwhite px-2 pt-4 h-16"
                innerClass="bg-offwhite w-full h-12"
                className="baseFlex w-full p-2"
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
                    align: "start",
                  }}
                  className="baseFlex w-full"
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
                            <CarouselItem className="baseFlex basis-1/5 tablet:basis-auto">
                              <MenuCategoryButton
                                key={category.id}
                                name={category.name}
                                listOrder={menuCategoryIndicies.Beer!}
                                currentlyInViewCategory={
                                  currentlyInViewCategory
                                }
                                setProgrammaticallyScrolling={
                                  setProgrammaticallyScrolling
                                }
                                stickyCategoriesApi={stickyCategoriesApi}
                              />
                            </CarouselItem>
                          </div>
                        );
                      }

                      return (
                        <CarouselItem
                          className="baseFlex basis-1/5 tablet:basis-auto"
                          key={category.id}
                        >
                          <MenuCategoryButton
                            name={category.name}
                            listOrder={menuCategoryIndicies[category.name] ?? 0}
                            currentlyInViewCategory={currentlyInViewCategory}
                            setProgrammaticallyScrolling={
                              setProgrammaticallyScrolling
                            }
                            stickyCategoriesApi={stickyCategoriesApi}
                          />
                        </CarouselItem>
                      );
                    })}

                    <CarouselItem className="baseFlex basis-1/5 tablet:basis-auto">
                      <MenuCategoryButton
                        name={"Mixed Drinks"}
                        listOrder={menuCategoryIndicies["Mixed Drinks"]!}
                        currentlyInViewCategory={currentlyInViewCategory}
                        setProgrammaticallyScrolling={
                          setProgrammaticallyScrolling
                        }
                        stickyCategoriesApi={stickyCategoriesApi}
                      />
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>

                {/* Custom scrollbar indicating scroll progress */}

                {/* ah we want relative + -b-4 when not sticky
                    and then absolute -b-0 or w/e when sticky */}

                <div className="absolute bottom-0 left-0 h-1 w-full bg-stone-200">
                  <div
                    style={{ width: `${scrollProgress}%` }}
                    className="h-1 bg-primary"
                  ></div>
                </div>
              </Sticky>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {!menuCategories || menuCategoryIndicies === undefined ? (
            <motion.div
              key={"loadingMenuContent"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="baseVertFlex mt-8 w-full gap-4 p-2"
            >
              <div className="baseVertFlex w-full !items-start gap-2">
                <Skeleton className="h-8 w-24" index={0} />
                <Skeleton className="h-48 w-full" index={1} />
              </div>
              <div className="baseVertFlex w-full !items-start gap-2">
                <Skeleton className="h-8 w-24" index={2} />
                <Skeleton className="h-48 w-full" index={3} />
              </div>
              <div className="baseVertFlex w-full !items-start gap-2">
                <Skeleton className="h-8 w-24" index={4} />
                <Skeleton className="h-48 w-full" index={5} />
              </div>
              <div className="baseVertFlex w-full !items-start gap-2">
                <Skeleton className="h-8 w-24" index={6} />
                <Skeleton className="h-48 w-full" index={7} />
              </div>
            </motion.div>
          ) : (
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
                  menuItems={category.menuItems as FullMenuItem[]}
                  listOrder={menuCategoryIndicies[category.name]!}
                  currentlyInViewCategory={currentlyInViewCategory}
                  setCurrentlyInViewCategory={setCurrentlyInViewCategory}
                  programmaticallyScrolling={programmaticallyScrolling}
                  stickyCategoriesApi={stickyCategoriesApi}
                />
              ))}

              <NotInDatabaseCategory
                name={"Mixed Drinks"}
                menuItems={mixedDrinkItems}
                listOrder={menuCategoryIndicies["Mixed Drinks"]!}
                currentlyInViewCategory={currentlyInViewCategory}
                setCurrentlyInViewCategory={setCurrentlyInViewCategory}
                programmaticallyScrolling={programmaticallyScrolling}
                stickyCategoriesApi={stickyCategoriesApi}
              />

              <div className="baseFlex order-[999] mt-8 w-full gap-2">
                <Image
                  src="/logo.svg"
                  alt="Khue's header logo"
                  width={24}
                  height={24}
                  priority
                  className="!size-[24px]"
                />
                -<span>Chef&apos;s choice</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button size={"lg"} asChild>
          <Link
            href="/order-now"
            className="fixed bottom-5 !text-lg !shadow-xl tablet:bottom-10"
          >
            Order now
          </Link>
        </Button>
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
  stickyCategoriesApi: CarouselApi;
}

function MenuCategoryButton({
  currentlyInViewCategory,
  name,
  listOrder,
  setProgrammaticallyScrolling,
  stickyCategoriesApi,
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

          stickyCategoriesApi?.scrollTo(listOrder);
          categoryContainer.scrollIntoView({ behavior: "smooth" });

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
  currentlyInViewCategory: string;
  setCurrentlyInViewCategory: Dispatch<SetStateAction<string>>;
  programmaticallyScrolling: boolean;
  stickyCategoriesApi: CarouselApi;
}

function MenuCategory({
  name,
  activeDiscount,
  menuItems,
  listOrder,
  currentlyInViewCategory,
  setCurrentlyInViewCategory,
  programmaticallyScrolling,
  stickyCategoriesApi,
}: MenuCategory) {
  const menuCategoryRef = useRef(null);
  const isInView = useInView(menuCategoryRef, {
    amount: 0.5,
    // margin: "192px 0px 0px 0px"
  });

  useEffect(() => {
    if (!isInView || programmaticallyScrolling) return;

    setCurrentlyInViewCategory(name);

    setTimeout(() => {
      stickyCategoriesApi?.scrollTo(listOrder);
    }, 0);
  }, [
    isInView,
    name,
    setCurrentlyInViewCategory,
    currentlyInViewCategory,
    programmaticallyScrolling,
    stickyCategoriesApi,
    listOrder,
  ]);

  return (
    <motion.div
      ref={menuCategoryRef}
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
          src={"/menuItems/wideAngleFoodShot.webp"}
          alt={name}
          fill
          style={{
            objectFit: "cover",
          }}
          className="!relative !h-48 rounded-md"
        />

        <div className="baseVertFlex absolute bottom-4 left-4 !items-start gap-2 rounded-md bg-offwhite px-4 py-2 shadow-heavyInner tablet:!flex-row tablet:!items-center tablet:gap-4">
          <p className="ml-1 text-xl font-semibold underline underline-offset-2">
            {name}
          </p>

          {activeDiscount && (
            <div className="rewardsGoldBorder baseFlex gap-1 rounded-md bg-primary px-4 py-0.5 text-sm font-medium text-yellow-500">
              <span>{activeDiscount.name}</span>
              <span>
                until {format(activeDiscount.expirationDate, "MM/dd")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* wrapping container for each food item in the category */}
      <div className="grid w-full grid-cols-1 place-items-center p-1 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3 2xl:grid-cols-4">
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

interface NotInDatabaseCategory {
  name: string;
  menuItems: string[];
  listOrder: number;
  currentlyInViewCategory: string;
  setCurrentlyInViewCategory: Dispatch<SetStateAction<string>>;
  programmaticallyScrolling: boolean;
  stickyCategoriesApi: CarouselApi;
}

function NotInDatabaseCategory({
  name,
  menuItems,
  listOrder,
  currentlyInViewCategory,
  setCurrentlyInViewCategory,
  programmaticallyScrolling,
  stickyCategoriesApi,
}: NotInDatabaseCategory) {
  const menuCategoryRef = useRef(null);
  const isInView = useInView(menuCategoryRef, {
    amount: 0.5,
    // margin: "192px 0px 0px 0px"
  });

  useEffect(() => {
    if (!isInView || programmaticallyScrolling) return;

    setCurrentlyInViewCategory(name);

    setTimeout(() => {
      stickyCategoriesApi?.scrollTo(listOrder);
    }, 0);
  }, [
    isInView,
    name,
    setCurrentlyInViewCategory,
    currentlyInViewCategory,
    programmaticallyScrolling,
    stickyCategoriesApi,
    listOrder,
  ]);

  return (
    <motion.div
      ref={menuCategoryRef}
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
          src={"/menuItems/wideAngleFoodShot.webp"}
          alt={name}
          fill
          style={{
            objectFit: "cover",
          }}
          className="!relative !h-48 rounded-md"
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
      <div className="grid w-full grid-cols-2 gap-4 p-1 text-sm sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 tablet:gap-8">
        {menuItems.slice(0, 10).map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="link"
            className="h-8 self-center !p-0 tablet:self-start"
          >{`View all ${name}`}</Button>
        </DialogTrigger>
        <DialogContent>
          <div className="baseVertFlex !items-start gap-8">
            <div className="baseFlex relative w-full rounded-md">
              {/* TODO: one image w/ 3 dishes from category on mobile, three separate images on desktop
            so image isn't distorted */}
              <div className="imageFiller h-48 w-full rounded-md"></div>
              <div className="baseVertFlex absolute bottom-4 left-4 !items-start gap-2 rounded-md border-2 border-primary bg-offwhite px-4 py-2 shadow-md tablet:!flex-row tablet:!items-center tablet:gap-4">
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
            <ul className="baseVertFlex max-h-[300px] w-full gap-2 overflow-y-auto tablet:max-h-[500px]">
              {menuItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
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
      // format: Glass - $8.00 | Bottle - $30.00
      <p className="text-sm">
        Glass -{" "}
        {formatPrice(
          calculateRelativeTotal({
            items: [
              {
                price: menuItem.altPrice ?? menuItem.price,
                quantity: 1,
                discountId: null, //activeDiscount?.id ?? null,

                // only necessary to fit Item shape
                id: menuItem.id,
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
        )}{" "}
        | Bottle -{" "}
        {formatPrice(
          calculateRelativeTotal({
            items: [
              {
                price: menuItem.price,
                quantity: 1,
                discountId: null, //activeDiscount?.id ?? null,

                // only necessary to fit Item shape
                id: menuItem.id,
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
      </p>
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
              id: menuItem.id,
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
  const { orderDetails, customizationChoices, discounts } = useMainStore(
    (state) => ({
      orderDetails: state.orderDetails,
      customizationChoices: state.customizationChoices,
      discounts: state.discounts,
    }),
  );

  return (
    <div
      style={{
        order: listOrder + 1,
      }}
      className="relative w-full max-w-96 px-2"
    >
      <div className="baseFlex size-full gap-4 py-6">
        <Image
          src={"/menuItems/sampleImage.webp"}
          alt={menuItem.name}
          width={96}
          height={96}
          className="rounded-md"
        />

        <div className="baseVertFlex size-full !items-start">
          <div className="baseFlex w-full !justify-between">
            <div className="baseVertFlex !items-start gap-1">
              <p className="text-wrap text-left text-lg font-medium underline underline-offset-2">
                {menuItem.name}
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

              <p className="max-w-72 text-wrap text-left text-sm text-stone-400">
                {menuItem.description}
              </p>
            </div>
          </div>

          <div className="mt-4 self-end">
            {formatMenuItemPrice(
              categoryName,
              menuItem,
              activeDiscount,
              customizationChoices,
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
