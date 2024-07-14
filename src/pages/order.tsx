import { useAuth } from "@clerk/nextjs";
import { type User, type Discount } from "@prisma/client";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { FaRedo } from "react-icons/fa";
import { FaWineBottle } from "react-icons/fa6";
import { IoMdHeart } from "react-icons/io";
import { LuPlus, LuVegan } from "react-icons/lu";
import { SiLeaflet } from "react-icons/si";
import ItemCustomizationDialog from "~/components/itemCustomization/ItemCustomizationDialog";
import ItemCustomizationDrawer from "~/components/itemCustomization/ItemCustomizationDrawer";
import AnimatedLotus from "~/components/ui/AnimatedLotus";
import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { Sheet, SheetContent } from "~/components/ui/sheet";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import StaticLotus from "~/components/ui/StaticLotus";
import { ToastAction } from "~/components/ui/toast";
import { useToast } from "~/components/ui/use-toast";
import useForceScrollToTopOnAsyncComponents from "~/hooks/useForceScrollToTopOnAsyncComponents";
import useGetUserId from "~/hooks/useGetUserId";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { type DBOrderSummary } from "~/server/api/routers/order";
import { useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";
import { getFirstValidMidnightDate } from "~/utils/dateHelpers/getFirstValidMidnightDate";
import { formatPrice } from "~/utils/formatters/formatPrice";
import { getDefaultCustomizationChoices } from "~/utils/getDefaultCustomizationChoices";
import { calculateRelativeTotal } from "~/utils/priceHelpers/calculateRelativeTotal";

import sampleImage from "/public/menuItems/sampleImage.webp";
import wideAngleFoodShot from "/public/menuItems/wideAngleFoodShot.webp";

function OrderNow() {
  const { isLoaded, isSignedIn } = useAuth();
  const userId = useGetUserId();

  const { userFavoriteItemIds, viewportLabel } = useMainStore((state) => ({
    userFavoriteItemIds: state.userFavoriteItemIds,
    viewportLabel: state.viewportLabel,
  }));

  const { data: user } = api.user.get.useQuery(userId, {
    enabled: Boolean(isSignedIn && userId),
  });

  const { data: menuCategories } = api.menuCategory.getAll.useQuery({
    onlyOnlineOrderable: true,
  });

  const { data: userRecentOrders } = api.order.getUsersOrders.useQuery(
    { userId, limitToFirstSix: true },
    {
      enabled: Boolean(userId && isSignedIn),
    },
  );

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentlyInViewCategory, setCurrentlyInViewCategory] = useState("");
  const [categoryScrollYValues, setCategoryScrollYValues] = useState<
    Record<string, number>
  >({});
  const [programmaticallyScrolling, setProgrammaticallyScrolling] =
    useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [itemToCustomize, setItemToCustomize] = useState<FullMenuItem | null>(
    null,
  );

  const [menuCategoryIndicies, setMenuCategoryIndicies] = useState<
    Record<string, number> | undefined
  >();

  // Effect to set menu category indices
  useEffect(() => {
    if (
      !menuCategories ||
      menuCategoryIndicies !== undefined ||
      (isSignedIn && userRecentOrders === undefined)
      // ^ waiting for userRecentOrders to be fetched
      // (if the user is signed in)
    )
      return;

    const categoryIndicies: Record<string, number> = {};
    let currentIndex = 0;

    if (userFavoriteItemIds.length > 0) {
      categoryIndicies.Favorites = currentIndex;
      currentIndex++;
    }

    if (userRecentOrders && userRecentOrders.length > 0) {
      categoryIndicies["Recent orders"] = currentIndex;
      currentIndex++;
    }

    menuCategories.forEach((category) => {
      categoryIndicies[category.name] = currentIndex;
      currentIndex++;
    });

    setMenuCategoryIndicies(categoryIndicies);
  }, [
    menuCategories,
    userFavoriteItemIds.length,
    userRecentOrders,
    currentlyInViewCategory,
    menuCategoryIndicies,
    isSignedIn,
  ]);

  // Effect to set category scroll Y values
  useEffect(() => {
    if (!menuCategoryIndicies) return;

    function getCategoryScrollYValues() {
      const scrollYValues = Object.keys(menuCategoryIndicies!).map(
        (categoryName) => {
          const categoryContainer = document.getElementById(
            `${categoryName}Container`,
          );
          return categoryContainer?.offsetTop ?? 0;
        },
      );

      const categoryScrollYValues: Record<string, number> = {};
      Object.keys(menuCategoryIndicies!).forEach((categoryName, index) => {
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

  const [stickyCategoriesApi, setStickyCategoriesApi] = useState<CarouselApi>();

  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth);
    }

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  useEffect(() => {
    if (programmaticallyScrolling || currentlyInViewCategory === "") return;

    const currentlyInViewCategoryListOrderIndex =
      menuCategoryIndicies![currentlyInViewCategory];

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

  useForceScrollToTopOnAsyncComponents();

  function ableToRenderMainContent() {
    if (menuCategories === undefined || menuCategoryIndicies === undefined) {
      return false;
    }

    if (userId !== "" && isSignedIn) {
      if (userRecentOrders === undefined) {
        return false;
      }
    }

    if (!isSignedIn && !isLoaded) {
      return false;
    }

    return true;
  }

  return (
    <motion.div
      key={"order"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex min-h-[calc(100dvh-6rem)] w-full !justify-start tablet:min-h-[calc(100dvh-7rem)]"
    >
      {/* Hero */}
      <div className="baseFlex relative h-56 w-full overflow-hidden shadow-md tablet:h-72">
        <div className="baseFlex absolute left-0 top-0 size-full bg-gradient-to-br from-primary to-darkPrimary tablet:gap-8 desktop:gap-16">
          {/* assuming you can get the bowls/plates to line up perfectly w/ the actual images,
              I think having a combo of pretty varied items would look great for the mobile hero.
              ^ implied, but this means you need to edit the images to line up into one cohesive image
              with some software
              
              also obv have different dishes displayed between /menu and /order
              */}

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
              <h1>Order</h1>
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
            <h1>Order</h1>
            <SideAccentSwirls className="h-4 fill-primary" />
          </div>
        </div>
      </div>

      <div className="baseVertFlex relative size-full tablet:w-3/4">
        <AnimatePresence mode="popLayout">
          {ableToRenderMainContent() ? (
            <>
              <motion.div
                key={"orderStickyHeader"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                // bg is background color of the <body>, 1% off from what bg-offwhite is
                className="baseFlex sticky left-0 top-24 z-10 size-full h-16 w-full overflow-x-hidden bg-body shadow-lg tablet:top-28 tablet:h-16 tablet:shadow-none"
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
                    {userFavoriteItemIds.length > 0 && (
                      <CarouselItem className="baseFlex basis-auto first:ml-2">
                        <MenuCategoryButton
                          name={"Favorites"}
                          listOrder={menuCategoryIndicies!.Favorites!}
                          currentlyInViewCategory={currentlyInViewCategory}
                          setProgrammaticallyScrolling={
                            setProgrammaticallyScrolling
                          }
                          programmaticallyScrolling={programmaticallyScrolling}
                        />
                      </CarouselItem>
                    )}

                    {userRecentOrders && userRecentOrders.length > 0 && (
                      <CarouselItem className="baseFlex basis-auto first:ml-2">
                        <MenuCategoryButton
                          name={"Recent orders"}
                          listOrder={menuCategoryIndicies!["Recent orders"]!}
                          currentlyInViewCategory={currentlyInViewCategory}
                          setProgrammaticallyScrolling={
                            setProgrammaticallyScrolling
                          }
                          programmaticallyScrolling={programmaticallyScrolling}
                        />
                      </CarouselItem>
                    )}

                    {(userFavoriteItemIds.length > 0 ||
                      (userRecentOrders && userRecentOrders.length > 0)) && (
                      <Separator
                        orientation="vertical"
                        className="mx-2 h-[35px] w-[2px]"
                      />
                    )}

                    {menuCategories?.map((category) => (
                      <CarouselItem
                        className="baseFlex basis-auto first:ml-2 last:mr-2"
                        key={category.id}
                      >
                        <MenuCategoryButton
                          name={category.name}
                          listOrder={menuCategoryIndicies![category.name] ?? 0}
                          currentlyInViewCategory={currentlyInViewCategory}
                          setProgrammaticallyScrolling={
                            setProgrammaticallyScrolling
                          }
                          programmaticallyScrolling={programmaticallyScrolling}
                        />
                      </CarouselItem>
                    ))}
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

              <motion.div
                key={"orderContent"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="baseVertFlex mb-8 size-full gap-8 p-4 pb-16 tablet:p-0 tablet:pb-8"
              >
                {userFavoriteItemIds.length > 0 && (
                  <FavoriteItems
                    setIsDrawerOpen={setIsDrawerOpen}
                    setIsDialogOpen={setIsDialogOpen}
                    setItemToCustomize={setItemToCustomize}
                    viewportWidth={viewportWidth}
                    user={user}
                  />
                )}

                {userRecentOrders && userRecentOrders.length > 0 && (
                  <RecentOrders
                    userRecentOrders={userRecentOrders}
                    viewportWidth={viewportWidth}
                    user={user}
                  />
                )}

                {menuCategories?.map((category) => (
                  <MenuCategory
                    key={category.id}
                    name={category.name}
                    activeDiscount={category.activeDiscount}
                    menuItems={category.menuItems}
                    listOrder={menuCategoryIndicies![category.name]!}
                    setIsDrawerOpen={setIsDrawerOpen}
                    setIsDialogOpen={setIsDialogOpen}
                    setItemToCustomize={setItemToCustomize}
                    user={user}
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
                    Consuming raw or undercooked meats, poultry, seafood,
                    shellfish, or eggs may increase your risk of foodborne
                    illness.
                  </p>
                  <div className="baseFlex w-full gap-2 text-stone-400 ">
                    <FaWineBottle className="shrink-0 -rotate-45" />
                    <p className="text-xs italic tablet:text-sm">
                      All alcoholic beverages must be purchased on-site.
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div
              key={"loadingMenuContent"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="baseVertFlex h-[calc(100dvh-6rem-14rem)] w-full tablet:h-[calc(100dvh-7rem-18rem)]"
            >
              <AnimatedLotus className="size-16 fill-primary tablet:size-24" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {viewportLabel.includes("mobile") ? (
        <Sheet
          open={Boolean(isDrawerOpen && itemToCustomize)}
          onOpenChange={(open) => {
            if (!open) {
              setIsDrawerOpen(false);
              setItemToCustomize(null);
            }
          }}
        >
          <SheetContent side={"bottom"}>
            <VisuallyHidden>
              <DialogTitle>
                Customize {itemToCustomize?.name ?? "item"}
              </DialogTitle>
              <DialogDescription>
                Customize your item with additional options
              </DialogDescription>
            </VisuallyHidden>
            <AnimatePresence>
              {itemToCustomize && (
                <ItemCustomizationDrawer
                  setIsDrawerOpen={setIsDrawerOpen}
                  itemToCustomize={itemToCustomize}
                />
              )}
            </AnimatePresence>
          </SheetContent>
        </Sheet>
      ) : (
        <ItemCustomizationDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          itemToCustomize={itemToCustomize}
          setItemToCustomize={setItemToCustomize}
        />
      )}
    </motion.div>
  );
}

export default OrderNow;

interface MenuCategoryButton {
  currentlyInViewCategory: string;
  name: string;
  listOrder: number;
  setProgrammaticallyScrolling: Dispatch<SetStateAction<boolean>>;
  programmaticallyScrolling: boolean;
}

function MenuCategoryButton({
  currentlyInViewCategory,
  name,
  listOrder,
  setProgrammaticallyScrolling,
  programmaticallyScrolling,
}: MenuCategoryButton) {
  return (
    <Button
      // key={`${name}CategoryButton`}
      id={`${name}Button`}
      variant={
        programmaticallyScrolling
          ? "outline"
          : currentlyInViewCategory === name
            ? "default"
            : "outline"
      }
      size="sm"
      style={{
        order: listOrder,
      }}
      className="baseFlex gap-2 border" // not ideal, but keeps same height for all buttons
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
      {name === "Favorites" && <IoMdHeart className="size-3" />}
      {name === "Recent orders" && <FaRedo className="size-3" />}
      {name}
    </Button>
  );
}

interface MenuCategory {
  name: string;
  activeDiscount: Discount | null;
  menuItems: FullMenuItem[];
  listOrder: number;
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  setItemToCustomize: Dispatch<SetStateAction<FullMenuItem | null>>;
  user: User | null | undefined;
}

function MenuCategory({
  name,
  activeDiscount,
  menuItems,
  listOrder,
  setIsDrawerOpen,
  setIsDialogOpen,
  setItemToCustomize,
  user,
}: MenuCategory) {
  return (
    <motion.div
      key={`${name}Category`}
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
      <div className="grid w-full grid-cols-1 items-start justify-items-center gap-4 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
        {menuItems.map((item) => (
          <MenuItemPreviewButton
            key={item.id}
            menuItem={item}
            activeDiscount={activeDiscount} // TODO: should prob also add ?? item.activeDiscount too right? was giving type error w/ createdAt but 99% sure this should be on there
            listOrder={item.listOrder}
            setIsDialogOpen={setIsDialogOpen}
            setIsDrawerOpen={setIsDrawerOpen}
            setItemToCustomize={setItemToCustomize}
            user={user}
          />
        ))}
      </div>
    </motion.div>
  );
}

interface MenuItemPreviewButton {
  menuItem: FullMenuItem;
  activeDiscount: Discount | null;
  listOrder: number;
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  setItemToCustomize: Dispatch<SetStateAction<FullMenuItem | null>>;
  user: User | null | undefined;
}

function MenuItemPreviewButton({
  menuItem,
  activeDiscount,
  listOrder,
  setIsDialogOpen,
  setIsDrawerOpen,
  setItemToCustomize,
  user,
}: MenuItemPreviewButton) {
  const {
    orderDetails,
    getPrevOrderDetails,
    setPrevOrderDetails,
    customizationChoices,
    discounts,
    viewportLabel,
  } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    getPrevOrderDetails: state.getPrevOrderDetails,
    setPrevOrderDetails: state.setPrevOrderDetails,
    customizationChoices: state.customizationChoices,
    discounts: state.discounts,
    viewportLabel: state.viewportLabel,
  }));

  const [showCheckmark, setShowCheckmark] = useState(false);

  const { updateOrder } = useUpdateOrder();

  const { toast, dismiss: dismissToasts } = useToast();

  return (
    <div
      style={{
        order: listOrder,
      }}
      className="relative w-full max-w-96"
    >
      <Button
        variant="outline"
        disabled={!menuItem.available}
        className="baseVertFlex size-full !justify-between gap-4 border border-stone-300 !p-4"
        onClick={() => {
          dismissToasts();

          setItemToCustomize(menuItem);

          // open up the customizer for the item
          if (viewportLabel.includes("mobile")) {
            setIsDrawerOpen(true);
          } else {
            setIsDialogOpen(true);
          }
        }}
      >
        <div className="baseFlex mt-4 w-full !justify-start gap-4 tablet:mt-0">
          {menuItem.hasImageOfItem && (
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={`${menuItem.name} - ${menuItem.description}`}
              width={96}
              height={96}
              className="mt-2 !size-24 !self-start rounded-md drop-shadow-lg"
            />
          )}

          <div
            className={`baseVertFlex h-full !items-start ${menuItem.hasImageOfItem ? "w-48" : "w-72"}`}
          >
            <div className="baseVertFlex !items-start gap-2">
              <div className="baseVertFlex !items-start gap-1">
                <p className="max-w-36 whitespace-normal text-left text-lg font-medium underline underline-offset-2 supports-[text-wrap]:text-wrap">
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
              </div>

              <p
                className={`line-clamp-3 whitespace-normal text-left text-stone-400 supports-[text-wrap]:text-wrap ${menuItem.hasImageOfItem ? "max-w-48" : "max-w-72"}`}
              >
                {menuItem.description}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`baseFlex w-full gap-4 
          ${!menuItem.available ? "!justify-between" : "!justify-end"}
        `}
        >
          {!menuItem.available && (
            <div className="rounded-md bg-stone-200 px-2 py-0.5 text-stone-600">
              <p className="text-xs italic">Currently unavailable</p>
            </div>
          )}
          <p
            className={`text-base ${activeDiscount ? "rounded-md bg-rewardsGradient !py-0.5 px-4 text-offwhite" : ""}`}
          >
            {formatPrice(
              calculateRelativeTotal({
                items: [
                  {
                    price: menuItem.price,
                    quantity: 1,
                    discountId: activeDiscount?.id ?? null,

                    // only necessary to fit Item shape
                    id:
                      orderDetails.items.length === 0
                        ? 0
                        : orderDetails.items.at(-1)!.id + 1,
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
                discounts,
              }),
            )}
          </p>
        </div>
      </Button>

      {menuItem.available && (
        <Button
          variant={"outline"}
          size={"icon"}
          disabled={showCheckmark}
          className="baseFlex absolute right-0 top-0 h-10 w-10 rounded-none rounded-bl-md rounded-tr-md border border-stone-300 text-primary"
          onClick={async () => {
            // set prev order details so we can revert if necessary
            // with toast's undo button
            setPrevOrderDetails(orderDetails);

            const pluralize = (await import("pluralize")).default;
            const isPlural = pluralize.isPlural(menuItem.name);
            const contextAwarePlural = isPlural ? "were" : "was";

            toast({
              description: `${menuItem.name} ${contextAwarePlural} added to your order.`,
              action: (
                <ToastAction
                  altText={`Undo the addition of ${menuItem.name} to your order.`}
                  onClick={() => {
                    updateOrder({ newOrderDetails: getPrevOrderDetails() });
                  }}
                >
                  Undo
                </ToastAction>
              ),
            });

            // directly add to order w/ defaults + trigger toast notification
            setShowCheckmark(true);

            updateOrder({
              newOrderDetails: {
                ...orderDetails,
                items: [
                  ...orderDetails.items,
                  {
                    id:
                      orderDetails.items.length === 0
                        ? 0
                        : orderDetails.items.at(-1)!.id + 1,
                    itemId: menuItem.id,
                    name: menuItem.name,
                    customizations: getDefaultCustomizationChoices(menuItem),
                    specialInstructions: "",
                    includeDietaryRestrictions:
                      user?.autoApplyDietaryRestrictions ?? false,
                    quantity: 1,
                    price: menuItem.price,
                    isChefsChoice: menuItem.isChefsChoice,
                    isAlcoholic: menuItem.isAlcoholic,
                    isVegetarian: menuItem.isVegetarian,
                    isVegan: menuItem.isVegan,
                    isGlutenFree: menuItem.isGlutenFree,
                    showUndercookedOrRawDisclaimer:
                      menuItem.showUndercookedOrRawDisclaimer,
                    hasImageOfItem: menuItem.hasImageOfItem,
                    discountId: activeDiscount?.id ?? null,
                    birthdayReward: false,
                    pointReward: false,
                  },
                ],
              },
            });

            setTimeout(() => {
              setShowCheckmark(false);
            }, 1000);
          }}
        >
          <AnimatePresence mode="wait">
            {showCheckmark ? (
              <motion.svg
                key={`quickAddToOrderCheckmark-${menuItem.id}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
                className="size-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "tween",
                    ease: "easeOut",
                    duration: 0.3,
                  }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            ) : (
              <motion.div
                key={`quickAddToOrder-${menuItem.id}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
                className="baseFlex h-10 w-10 rounded-md"
              >
                <LuPlus />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      )}
    </div>
  );
}

interface FavoriteItems {
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  setItemToCustomize: Dispatch<SetStateAction<FullMenuItem | null>>;
  viewportWidth: number;
  user: User | null | undefined;
}

function FavoriteItems({
  setIsDrawerOpen,
  setIsDialogOpen,
  setItemToCustomize,
  viewportWidth,
  user,
}: FavoriteItems) {
  const { menuItems, userFavoriteItemIds } = useMainStore((state) => ({
    menuItems: state.menuItems,
    userFavoriteItemIds: state.userFavoriteItemIds,
  }));

  const maxItemsToShow = viewportWidth < 640 ? 3 : 4;

  return (
    <div
      id={"FavoritesContainer"}
      className="baseVertFlex mt-4 w-full scroll-m-48 !items-start gap-2"
    >
      <div className="baseFlex w-full !justify-between pl-4 text-xl font-medium underline underline-offset-2">
        <div className="baseFlex gap-2">
          <IoMdHeart />
          <p>Favorites</p>
        </div>

        {/* dialog to show full list of favorite items */}
        {userFavoriteItemIds.length > maxItemsToShow && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="underline" className="pb-0">
                View all
              </Button>
            </DialogTrigger>
            <DialogContent extraBottomSpacer={false} className="max-h-[80vh]">
              <VisuallyHidden>
                <DialogTitle>Favorited items</DialogTitle>
                <DialogDescription>Your favorited menu items</DialogDescription>
              </VisuallyHidden>
              <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />

              <div className="baseVertFlex w-full !items-start gap-4">
                <div className="baseVertFlex w-full !items-start gap-2">
                  <div className="baseFlex w-full !justify-start gap-2">
                    <IoMdHeart />
                    <p className="font-medium">Favorited items</p>
                  </div>

                  <Separator className="h-[1px] w-full" />

                  <div className="baseVertFlex my-4 h-[60vh] w-full !justify-start gap-2 overflow-y-auto py-4 tablet:h-[70vh]">
                    {userFavoriteItemIds.map((itemId, index) => (
                      <MenuItemPreviewButton
                        key={itemId}
                        menuItem={menuItems[itemId]!}
                        activeDiscount={
                          menuItems[itemId]?.activeDiscount ?? null
                        }
                        listOrder={index}
                        setIsDialogOpen={setIsDialogOpen}
                        setIsDrawerOpen={setIsDrawerOpen}
                        setItemToCustomize={setItemToCustomize}
                        user={user}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid w-full grid-cols-1 items-start justify-items-center gap-4 px-2 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
        {userFavoriteItemIds.slice(0, maxItemsToShow).map((itemId, index) => (
          <MenuItemPreviewButton
            key={itemId}
            menuItem={menuItems[itemId]!}
            // TODO: going to prob remove this in big teardown of old system of discounts
            activeDiscount={menuItems[itemId]?.activeDiscount ?? null}
            listOrder={index}
            setIsDialogOpen={setIsDialogOpen}
            setIsDrawerOpen={setIsDrawerOpen}
            setItemToCustomize={setItemToCustomize}
            user={user}
          />
        ))}
      </div>
    </div>
  );
}

interface RecentOrders {
  userRecentOrders: DBOrderSummary[];
  viewportWidth: number;
  user: User | null | undefined;
}

function RecentOrders({ userRecentOrders, viewportWidth, user }: RecentOrders) {
  const maxOrdersToShow = viewportWidth < 640 ? 3 : 4;

  return (
    <div
      id={"Recent ordersContainer"}
      className="baseVertFlex mt-4 w-full scroll-m-48 !items-start gap-2"
    >
      <div className="baseFlex w-full !justify-between pl-4 text-xl font-medium underline underline-offset-2">
        <div className="baseFlex gap-3">
          <FaRedo className="size-4" />
          <p>Recent orders</p>
        </div>

        {/* dialog to show full list of recent orders */}
        {userRecentOrders.length > maxOrdersToShow && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="underline" className="pb-0">
                View all
              </Button>
            </DialogTrigger>
            <DialogContent extraBottomSpacer={false} className="max-h-[80vh]">
              <VisuallyHidden>
                <DialogTitle>Recent orders</DialogTitle>
                <DialogDescription>Your recent orders</DialogDescription>
              </VisuallyHidden>
              <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />

              <div className="baseVertFlex w-full !items-start gap-4">
                <div className="baseVertFlex w-full !items-start gap-2">
                  <div className="baseFlex w-full !justify-start gap-2">
                    <FaRedo className="size-3" />
                    <p className="font-medium">Recent orders</p>
                  </div>

                  <Separator className="h-[1px] w-full" />

                  <div className="baseVertFlex my-4 h-[60vh] w-full !justify-start gap-2 overflow-y-auto py-4 tablet:h-[70vh]">
                    {userRecentOrders.map((order) => (
                      <PreviousOrder key={order.id} order={order} user={user} />
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid w-full grid-cols-1 items-start justify-items-center gap-4 px-2 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
        {userRecentOrders.slice(0, maxOrdersToShow).map((order) => (
          <PreviousOrder key={order.id} order={order} user={user} />
        ))}
      </div>
    </div>
  );
}

interface PreviousOrder {
  order: DBOrderSummary;
  user: User | null | undefined;
}

function PreviousOrder({ order, user }: PreviousOrder) {
  const userId = useGetUserId();

  const {
    orderDetails,
    getPrevOrderDetails,
    setPrevOrderDetails,
    setItemNamesRemovedFromCart,
  } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    getPrevOrderDetails: state.getPrevOrderDetails,
    setPrevOrderDetails: state.setPrevOrderDetails,
    setItemNamesRemovedFromCart: state.setItemNamesRemovedFromCart,
  }));

  const {
    mutate: addItemsFromPreviousOrderToCart,
    isLoading: isValidatingOrder,
  } = api.validateOrder.validate.useMutation({
    onSuccess: (data) => {
      if (!data.validItems) {
        // TODO: show a dialog mostly likely with something along the lines of
        // "We're sorry, but the items from your previous order are not currently available."
        // ^ "to be reordered. Please try again later."

        return;
      }

      setTimeout(() => {
        // set prev order details so we can revert if necessary
        // with toast's undo button
        setPrevOrderDetails(orderDetails);

        const totalValidItems = data.validItems.reduce(
          (acc, item) => acc + item.quantity,
          0,
        );

        toast({
          description: `${totalValidItems} item${totalValidItems > 1 ? "s were" : "was"} added to your order.`,
          action: (
            <ToastAction
              altText={`Undo the addition of ${totalValidItems} item${totalValidItems > 1 ? "s" : ""} to your order.`}
              onClick={() => {
                updateOrder({ newOrderDetails: getPrevOrderDetails() });
              }}
            >
              Undo
            </ToastAction>
          ),
        });

        // directly add to order w/ defaults + trigger toast notification

        // need to pre-generate unique ids for each item since
        // we can't do it dynamically in the map below
        const largestCurrentItemId =
          orderDetails.items.length === 0
            ? 0
            : orderDetails.items.at(-1)!.id + 1;

        const increasingItemIds = Array.from({
          length: order.orderItems.length,
        }).map((_, index) => largestCurrentItemId + index);

        updateOrder({
          newOrderDetails: {
            ...orderDetails,
            items: [
              ...orderDetails.items,
              ...data.validItems.map((item, idx) => ({
                id: increasingItemIds[idx]!,
                itemId: item.itemId,
                name: item.name,
                customizations: item.customizations,
                specialInstructions: item.specialInstructions,
                includeDietaryRestrictions:
                  user?.autoApplyDietaryRestrictions ?? false,
                quantity: item.quantity,
                price: item.price,
                isChefsChoice: item.isChefsChoice,
                isAlcoholic: item.isAlcoholic,
                isVegetarian: item.isVegetarian,
                isVegan: item.isVegan,
                isGlutenFree: item.isGlutenFree,
                showUndercookedOrRawDisclaimer:
                  item.showUndercookedOrRawDisclaimer,
                hasImageOfItem: item.hasImageOfItem,
                discountId: item.discountId,
                birthdayReward: item.birthdayReward,
                pointReward: item.pointReward,
              })),
            ],
          },
        });

        if (data.removedItemNames && data.removedItemNames.length > 0) {
          setItemNamesRemovedFromCart(data.removedItemNames);
        }

        setKeepSpinnerShowing(false);
      }, 1000);
    },
    onError: (error) => {
      console.error("Error adding items from previous order to cart", error);
    },
  });

  const { updateOrder } = useUpdateOrder();

  const [keepSpinnerShowing, setKeepSpinnerShowing] = useState(false);

  const { toast } = useToast();

  return (
    <div className="relative h-40 w-full max-w-96 bg-offwhite">
      <div className="baseFlex size-full gap-4 rounded-md border border-stone-300 px-4 py-6">
        <div className="grid w-28 grid-cols-2 grid-rows-2 !place-items-center gap-2">
          <Image
            src={"/menuItems/sampleImage.webp"}
            alt={order.orderItems[0]?.name ?? "First item"}
            width={32}
            height={32}
            className="rounded-md drop-shadow-sm"
          />

          {order.orderItems.length > 1 && (
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={order.orderItems[1]?.name ?? "Second item"}
              width={32}
              height={32}
              className="rounded-md drop-shadow-sm"
            />
          )}
          {order.orderItems.length > 2 && (
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={order.orderItems[2]?.name ?? "Third item"}
              width={32}
              height={32}
              className="rounded-md drop-shadow-sm"
            />
          )}
          {order.orderItems.length > 3 && (
            <p className="text-center text-xs">
              +{order.orderItems.length - 3} more
            </p>
          )}
        </div>

        <div className="baseFlex relative size-full !items-start gap-4">
          <div className="baseVertFlex w-full !items-start gap-2">
            <p className="w-full !text-nowrap font-medium underline underline-offset-2">
              {format(
                toZonedTime(order.datetimeToPickup, "America/Chicago"),
                "EEEE, MMMM do",
              )}
            </p>

            <div className="baseVertFlex w-full !items-start text-xs text-stone-400">
              <p className="max-w-28 truncate">
                {order.orderItems[0]?.quantity} {order.orderItems[0]?.name}
              </p>

              {order.orderItems.length > 1 && (
                <p className="max-w-28 truncate">
                  {order.orderItems[1]?.quantity} {order.orderItems[1]?.name}
                </p>
              )}

              {order.orderItems.length > 2 && (
                <p className="max-w-28 truncate">
                  {order.orderItems[2]?.quantity} {order.orderItems[2]?.name}
                </p>
              )}

              {order.orderItems.length > 3 && (
                <p>+{order.orderItems.length - 3} more</p>
              )}
            </div>
          </div>

          <Button
            size={"sm"}
            disabled={keepSpinnerShowing || isValidatingOrder}
            className={`absolute bottom-0 right-0 w-20 self-end`}
            onClick={() => {
              // TODO: maybe want to create dialog/modal for the summary of this order

              // need to pre-generate unique ids for each item since
              // we can't do it dynamically in the map below
              const largestCurrentItemId =
                orderDetails.items.length === 0
                  ? 0
                  : orderDetails.items.at(-1)!.id + 1;

              const increasingItemIds = Array.from({
                length: order.orderItems.length,
              }).map((_, index) => largestCurrentItemId + index);

              addItemsFromPreviousOrderToCart({
                userId,
                orderDetails: {
                  datetimeToPickup: getFirstValidMidnightDate(),
                  isASAP: orderDetails.isASAP,
                  includeNapkinsAndUtensils: false,
                  items: order.orderItems.map((item, idx) => ({
                    id: increasingItemIds[idx]!,
                    itemId: item.menuItemId,
                    name: item.name,
                    customizations: item.customizations,
                    specialInstructions: item.specialInstructions,
                    includeDietaryRestrictions:
                      user?.autoApplyDietaryRestrictions ?? false,
                    quantity: item.quantity,
                    price: item.price,
                    isChefsChoice: item.isChefsChoice,
                    isAlcoholic: item.isAlcoholic,
                    isVegetarian: item.isVegetarian,
                    isVegan: item.isVegan,
                    isGlutenFree: item.isGlutenFree,
                    showUndercookedOrRawDisclaimer:
                      item.showUndercookedOrRawDisclaimer,
                    hasImageOfItem: item.hasImageOfItem,
                    discountId: item.discountId,
                    birthdayReward: item.birthdayReward,
                    pointReward: item.pointReward,
                  })),
                  discountId: null,
                  tipPercentage: null,
                  tipValue: 0,
                },
                validatingAReorder: true,
              });

              setKeepSpinnerShowing(true);
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={
                  keepSpinnerShowing || isValidatingOrder
                    ? `reorderValidationSpinner-${order.id}`
                    : `reorder-${order.id}`
                }
                layout
                // whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{
                  duration: 0.25,
                }}
                className="baseFlex gap-2"
              >
                {keepSpinnerShowing || isValidatingOrder ? (
                  <div
                    className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-offwhite"
                    role="status"
                    aria-label="loading"
                  >
                    <span className="sr-only">Loading...</span>
                  </div>
                ) : (
                  <div>Reorder</div>
                )}
              </motion.div>
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  );
}
