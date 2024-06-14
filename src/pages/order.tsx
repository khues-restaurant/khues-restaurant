import { useAuth } from "@clerk/nextjs";
import { type Discount } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
  Fragment,
} from "react";
import { LuPlus } from "react-icons/lu";
import ItemCustomizationDialog from "~/components/itemCustomization/ItemCustomizationDialog";
import ItemCustomizationDrawer from "~/components/itemCustomization/ItemCustomizationDrawer";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent } from "~/components/ui/sheet";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { useMainStore } from "~/stores/MainStore";
import { calculateRelativeTotal } from "~/utils/calculateRelativeTotal";
import { api } from "~/utils/api";
import { FaRedo } from "react-icons/fa";
import { formatPrice } from "~/utils/formatPrice";
import { useToast } from "~/components/ui/use-toast";
import { ToastAction } from "~/components/ui/toast";
import { SiLeaflet } from "react-icons/si";
import { LuVegan } from "react-icons/lu";
import {
  Carousel,
  CarouselContent,
  type CarouselApi,
  CarouselItem,
} from "~/components/ui/carousel";
import { type DBOrderSummary } from "~/server/api/routers/order";
import { format } from "date-fns";
import { IoMdHeart } from "react-icons/io";
import useGetUserId from "~/hooks/useGetUserId";
import { Separator } from "~/components/ui/separator";
import Image from "next/image";
import AnimatedLotus from "~/components/ui/AnimatedLotus";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { getDefaultCustomizationChoices } from "~/utils/getDefaultCustomizationChoices";
import { getFirstValidMidnightDate } from "~/utils/getFirstValidMidnightDate";
import { FaWineBottle } from "react-icons/fa6";

import sampleImage from "/public/menuItems/sampleImage.webp";
import wideAngleFoodShot from "/public/menuItems/wideAngleFoodShot.webp";
import { toZonedTime } from "date-fns-tz";
import Script from "next/script";

// - fyi as a performance optimization, we might want to dynamically import the <Dialog> and
//   <Drawer> components and have them only conditionally be rendered based on dimensions

function OrderNow() {
  const { isLoaded, isSignedIn } = useAuth();
  const userId = useGetUserId();

  const { userFavoriteItemIds, viewportLabel, cartDrawerIsOpen } = useMainStore(
    (state) => ({
      userFavoriteItemIds: state.userFavoriteItemIds,
      viewportLabel: state.viewportLabel,
      cartDrawerIsOpen: state.cartDrawerIsOpen,
    }),
  );

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
    if (!menuCategories || menuCategoryIndicies !== undefined) return;

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
  const [itemsPerSlide, setItemsPerSlide] = useState(1);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1700) {
        setItemsPerSlide(4);
      } else if (window.innerWidth >= 1280) {
        setItemsPerSlide(3);
      } else if (window.innerWidth >= 640) {
        setItemsPerSlide(2);
      } else {
        setItemsPerSlide(1);
      }
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
      className="baseVertFlex mt-24 min-h-[calc(100dvh-6rem)] w-full !justify-start tablet:mt-28 tablet:min-h-[calc(100dvh-7rem)]"
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
            sizes="(min-width: 1000px) 160px, 192px"
            className="!relative !hidden !size-40 rounded-md drop-shadow-xl tablet:!block desktop:!size-48"
          />
          <Image
            src={sampleImage}
            alt={"TODO: fill in w/ appropriate alt text"}
            sizes="(min-width: 1000px) 160px, 192px"
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
            sizes="(min-width: 1000px) 160px, 192px"
            className="!relative !hidden !size-40 rounded-md drop-shadow-xl tablet:!block desktop:!size-48"
          />
          <Image
            src={sampleImage}
            alt={"TODO: fill in w/ appropriate alt text"}
            sizes="(min-width: 1000px) 160px, 192px"
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

      {ableToRenderMainContent() && (
        <motion.div
          key={"orderStickyHeader"}
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
              align: "start",
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
                    setProgrammaticallyScrolling={setProgrammaticallyScrolling}
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
                    setProgrammaticallyScrolling={setProgrammaticallyScrolling}
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
                    setProgrammaticallyScrolling={setProgrammaticallyScrolling}
                    programmaticallyScrolling={programmaticallyScrolling}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Custom scrollbar indicating scroll progress */}
          <div className="absolute bottom-0 left-0 h-1 w-full bg-stone-200">
            <div
              style={{ width: `${scrollProgress}%` }}
              className="h-1 bg-primary"
            ></div>
          </div>
        </motion.div>
      )}

      <div className="baseVertFlex relative size-full tablet:w-3/4">
        <AnimatePresence mode="popLayout">
          {ableToRenderMainContent() ? (
            <motion.div
              key={"orderContent"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="baseVertFlex my-8 size-full gap-8 p-4 pb-16 tablet:mt-0 tablet:p-0 tablet:pb-8"
            >
              {userFavoriteItemIds.length > 0 && (
                <FavoriteItems
                  setIsDrawerOpen={setIsDrawerOpen}
                  setIsDialogOpen={setIsDialogOpen}
                  setItemToCustomize={setItemToCustomize}
                  itemsPerSlide={itemsPerSlide}
                />
              )}

              {userRecentOrders && userRecentOrders.length > 0 && (
                <RecentOrders
                  userRecentOrders={userRecentOrders}
                  itemsPerSlide={itemsPerSlide}
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

          categoryContainer.scrollIntoView({ behavior: "smooth" });

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
}

function MenuCategory({
  name,
  activeDiscount,
  menuItems,
  listOrder,
  setIsDrawerOpen,
  setIsDialogOpen,
  setItemToCustomize,
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
          alt={name}
          sizes="(min-width: 1000px) 90vw, 75vw"
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
      <div className="grid w-full grid-cols-1 place-items-center gap-4 sm:grid-cols-2 sm:place-items-start xl:grid-cols-3 3xl:grid-cols-4">
        {menuItems.map((item) => (
          <MenuItemPreviewButton
            key={item.id}
            menuItem={item}
            activeDiscount={activeDiscount} // TODO: should prob also add ?? item.activeDiscount too right? was giving type error w/ createdAt but 99% sure this should be on there
            listOrder={item.listOrder}
            setIsDialogOpen={setIsDialogOpen}
            setIsDrawerOpen={setIsDrawerOpen}
            setItemToCustomize={setItemToCustomize}
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
}

function MenuItemPreviewButton({
  menuItem,
  activeDiscount,
  listOrder,
  setIsDialogOpen,
  setIsDrawerOpen,
  setItemToCustomize,
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
        <div className="baseFlex mt-4 w-full !justify-around gap-4 tablet:mt-0">
          <Image
            src={"/menuItems/sampleImage.webp"}
            alt={menuItem.name}
            width={96}
            height={96}
            className="mt-2 !self-start rounded-md drop-shadow-lg"
          />

          <div className="baseVertFlex h-full w-48 !items-start">
            <div className="baseVertFlex !items-start gap-2">
              <div className="baseVertFlex !items-start gap-1">
                <p className="max-w-36 text-wrap text-left text-lg font-medium underline underline-offset-2">
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

              <p className="line-clamp-3 max-w-48 text-wrap text-left text-stone-400">
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
          onClick={() => {
            // set prev order details so we can revert if necessary
            // with toast's undo button
            setPrevOrderDetails(orderDetails);

            toast({
              description: `${menuItem.name} was added to your order.`,
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
                    includeDietaryRestrictions: false,
                    quantity: 1,
                    price: menuItem.price,
                    isChefsChoice: menuItem.isChefsChoice,
                    isAlcoholic: menuItem.isAlcoholic,
                    isVegetarian: menuItem.isVegetarian,
                    isVegan: menuItem.isVegan,
                    isGlutenFree: menuItem.isGlutenFree,
                    showUndercookedOrRawDisclaimer:
                      menuItem.showUndercookedOrRawDisclaimer,
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
  itemsPerSlide: number;
}

function FavoriteItems({
  setIsDrawerOpen,
  setIsDialogOpen,
  setItemToCustomize,
  itemsPerSlide,
}: FavoriteItems) {
  const { menuItems, userFavoriteItemIds } = useMainStore((state) => ({
    menuItems: state.menuItems,
    userFavoriteItemIds: state.userFavoriteItemIds,
  }));

  const [favoriteItemsApi, setFavoriteItemsApi] = useState<CarouselApi>();
  const [favoriteItemsSlide, setFavoriteItemsSlide] = useState(0);

  useEffect(() => {
    if (!favoriteItemsApi) {
      return;
    }

    setFavoriteItemsSlide(favoriteItemsApi.selectedScrollSnap());

    favoriteItemsApi.on("select", () => {
      setFavoriteItemsSlide(favoriteItemsApi.selectedScrollSnap());
    });

    favoriteItemsApi.on("resize", () => {
      setFavoriteItemsSlide(0);
      favoriteItemsApi.scrollTo(0);
    });

    // eventually add proper cleanup functions here
  }, [favoriteItemsApi]);

  return (
    <div
      id={"FavoritesContainer"}
      className="baseVertFlex mt-4 w-full scroll-m-48 !items-start gap-2"
    >
      <div className="baseFlex gap-3 pl-4 text-xl font-medium underline underline-offset-2">
        <IoMdHeart />
        <p>Favorites</p>
      </div>

      <div className="baseVertFlex w-full gap-4">
        <Carousel
          setApi={setFavoriteItemsApi}
          opts={{
            breakpoints: {
              "(min-width: 640px)": {
                slidesToScroll: 2,
                active: userFavoriteItemIds.length > itemsPerSlide,
              },
              "(min-width: 1280px)": {
                slidesToScroll: 3,
                active: userFavoriteItemIds.length > itemsPerSlide,
              },
              "(min-width: 1700px)": {
                slidesToScroll: 4,
                active: userFavoriteItemIds.length > itemsPerSlide,
              },
            },
            // skipSnaps: true, play around with this
          }}
          className="baseFlex w-full !justify-start"
        >
          <CarouselContent className="w-full">
            {userFavoriteItemIds.map((itemId, index) => (
              <Fragment key={itemId}>
                {menuItems[itemId] && (
                  <CarouselItem className="basis-full md:basis-1/2 xl:basis-1/3 3xl:basis-1/4">
                    <MenuItemPreviewButton
                      menuItem={menuItems[itemId]!}
                      // TODO: going to prob remove this in big teardown of old system of discounts
                      activeDiscount={menuItems[itemId]?.activeDiscount ?? null}
                      listOrder={index}
                      setIsDialogOpen={setIsDialogOpen}
                      setIsDrawerOpen={setIsDrawerOpen}
                      setItemToCustomize={setItemToCustomize}
                    />
                  </CarouselItem>
                )}
              </Fragment>
            ))}
          </CarouselContent>
        </Carousel>

        {userFavoriteItemIds.length > itemsPerSlide && (
          <div className="baseFlex gap-2">
            <>
              {Array.from({
                length: Math.ceil(userFavoriteItemIds.length / itemsPerSlide),
              }).map((_, index) => (
                <Button key={index} asChild>
                  <div
                    className={`!size-2 cursor-pointer rounded-full !p-0 ${
                      favoriteItemsSlide === index
                        ? "!bg-primary"
                        : "!bg-stone-300"
                    }`}
                    onClick={() => favoriteItemsApi?.scrollTo(index)}
                  />
                </Button>
              ))}
            </>
          </div>
        )}
      </div>
    </div>
  );
}

interface RecentOrders {
  userRecentOrders: DBOrderSummary[];
  itemsPerSlide: number;
}

function RecentOrders({ userRecentOrders, itemsPerSlide }: RecentOrders) {
  const [recentOrdersApi, setRecentOrdersApi] = useState<CarouselApi>();
  const [recentOrdersSlide, setRecentOrdersSlide] = useState(0);

  useEffect(() => {
    if (
      !userRecentOrders ||
      userRecentOrders.length === 0 ||
      !recentOrdersApi
    ) {
      return;
    }

    setRecentOrdersSlide(recentOrdersApi.selectedScrollSnap());

    recentOrdersApi.on("select", () => {
      setRecentOrdersSlide(recentOrdersApi.selectedScrollSnap());
    });

    recentOrdersApi.on("resize", () => {
      setRecentOrdersSlide(0);
      recentOrdersApi.scrollTo(0);
    });

    // eventually add proper cleanup functions here
  }, [userRecentOrders, recentOrdersApi]);

  return (
    <div
      id={"Recent ordersContainer"}
      className="baseVertFlex mt-4 w-full scroll-m-48 !items-start gap-2"
    >
      <div className="baseFlex gap-3 pl-4 text-xl font-medium underline underline-offset-2">
        <FaRedo className="size-4" />
        <p>Recent orders</p>
      </div>

      <div className="baseVertFlex w-full gap-4">
        <Carousel
          setApi={setRecentOrdersApi}
          opts={{
            breakpoints: {
              "(min-width: 640px)": {
                slidesToScroll: 2,
                active: userRecentOrders.length > itemsPerSlide,
              },
              "(min-width: 1280px)": {
                slidesToScroll: 3,
                active: userRecentOrders.length > itemsPerSlide,
              },
              "(min-width: 1700px)": {
                slidesToScroll: 4,
                active: userRecentOrders.length > itemsPerSlide,
              },
            },
            // skipSnaps: true, play around with this
          }}
          className="baseFlex w-full !justify-start"
        >
          <CarouselContent className="w-full">
            {userRecentOrders.map((order) => (
              <CarouselItem
                key={order.id}
                className="basis-full md:basis-1/2 xl:basis-1/3 2xl:basis-1/4"
              >
                <PreviousOrder order={order} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {userRecentOrders.length > itemsPerSlide && (
          <div className="baseFlex gap-2">
            <>
              {Array.from({
                length: Math.ceil(userRecentOrders.length / itemsPerSlide),
              }).map((_, index) => (
                <Button key={index} asChild>
                  <div
                    className={`!size-2 cursor-pointer rounded-full !p-0 ${
                      recentOrdersSlide === index
                        ? "!bg-primary"
                        : "!bg-stone-300"
                    }`}
                    onClick={() => recentOrdersApi?.scrollTo(index)}
                  />
                </Button>
              ))}
            </>
          </div>
        )}
      </div>
    </div>
  );
}

interface PreviousOrder {
  order: DBOrderSummary;
}

function PreviousOrder({ order }: PreviousOrder) {
  const userId = useGetUserId();

  const {
    orderDetails,
    getPrevOrderDetails,
    setPrevOrderDetails,
    customizationChoices,
    discounts,
    setItemNamesRemovedFromCart,
    viewportLabel,
  } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    getPrevOrderDetails: state.getPrevOrderDetails,
    setPrevOrderDetails: state.setPrevOrderDetails,
    customizationChoices: state.customizationChoices,
    discounts: state.discounts,
    setItemNamesRemovedFromCart: state.setItemNamesRemovedFromCart,
    viewportLabel: state.viewportLabel,
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
                includeDietaryRestrictions: item.includeDietaryRestrictions,
                quantity: item.quantity,
                price: item.price,
                isChefsChoice: item.isChefsChoice,
                isAlcoholic: item.isAlcoholic,
                isVegetarian: item.isVegetarian,
                isVegan: item.isVegan,
                isGlutenFree: item.isGlutenFree,
                showUndercookedOrRawDisclaimer:
                  item.showUndercookedOrRawDisclaimer,
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
            alt={order.orderItems[0]?.name ?? "First item image"}
            width={32}
            height={32}
            className="rounded-md drop-shadow-sm"
          />

          {order.orderItems.length > 1 && (
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={order.orderItems[0]?.name ?? "Second item image"}
              width={32}
              height={32}
              className="rounded-md drop-shadow-sm"
            />
          )}
          {order.orderItems.length > 2 && (
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={order.orderItems[0]?.name ?? "Third item image"}
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
                    includeDietaryRestrictions: item.includeDietaryRestrictions,
                    quantity: item.quantity,
                    price: item.price,
                    isChefsChoice: item.isChefsChoice,
                    isAlcoholic: item.isAlcoholic,
                    isVegetarian: item.isVegetarian,
                    isVegan: item.isVegan,
                    isGlutenFree: item.isGlutenFree,
                    showUndercookedOrRawDisclaimer:
                      item.showUndercookedOrRawDisclaimer,
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
