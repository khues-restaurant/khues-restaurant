import { useAuth } from "@clerk/nextjs";
import { type Discount } from "@prisma/client";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  Fragment,
} from "react";
import { LuPlus } from "react-icons/lu";
import Sticky from "react-stickynode";
import ItemCustomizationDialog from "~/components/itemCustomization/ItemCustomizationDialog";
import ItemCustomizationDrawer from "~/components/itemCustomization/ItemCustomizationDrawer";
import { Button } from "~/components/ui/button";
import { Drawer, DrawerContent } from "~/components/ui/drawer";
import { Skeleton } from "~/components/ui/skeleton";
import useGetViewportLabel from "~/hooks/useGetViewportLabel";
import useUpdateOrder from "~/hooks/useUpdateOrder";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { type StoreCustomizations, useMainStore } from "~/stores/MainStore";
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
import AnimatedLogo from "~/components/ui/AnimatedLogo";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { getDefaultCustomizationChoices } from "~/utils/getDefaultCustomizationChoices";
import Head from "next/head";

import sampleImage from "/public/menuItems/sampleImage.webp";
import wideAngleFoodShot from "/public/menuItems/wideAngleFoodShot.webp";

// - fyi as a performance optimization, we might want to dynamically import the <Dialog> and
//   <Drawer> components and have them only conditionally be rendered based on dimensions

function OrderNow() {
  const { isLoaded, isSignedIn } = useAuth();
  const userId = useGetUserId();

  const { menuItems, userFavoriteItemIds } = useMainStore((state) => ({
    menuItems: state.menuItems,
    userFavoriteItemIds: state.userFavoriteItemIds,
  }));

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

  const [currentlyInViewCategory, setCurrentlyInViewCategory] = useState(""); //TODO: dynamically have this be set to either Favorites or Recent orders if applicable or w/e the first category is otherwise
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

  useEffect(() => {
    if (menuCategories === undefined) return;

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
  }, [menuCategories, userFavoriteItemIds.length, userRecentOrders]);

  const [stickyCategoriesApi, setStickyCategoriesApi] = useState<CarouselApi>();

  const [favoriteItemsApi, setFavoriteItemsApi] = useState<CarouselApi>();
  const [favoriteItemsSlide, setFavoriteItemsSlide] = useState(0);

  const [recentOrdersApi, setRecentOrdersApi] = useState<CarouselApi>();
  const [recentOrdersSlide, setRecentOrdersSlide] = useState(0);

  const [itemsPerSlide, setItemsPerSlide] = useState(1);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1536) {
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

  const viewportLabel = useGetViewportLabel();

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

  function ableToRenderMainContent() {
    return (
      menuCategories &&
      menuCategoryIndicies &&
      (isLoaded || isSignedIn !== undefined) // ensuring that clerk state is loaded fully, regardless
      // of whether user is signed in or not
    );
  }

  // TODO: decide whether you want to try and use <MenuCategory> for favorites and recent orders
  // or make a very similar separate component for them in regards to getting the useInView tech

  return (
    <motion.div
      key={"order"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-24 min-h-[calc(100dvh-6rem)] w-full !justify-start tablet:mt-28 tablet:min-h-[calc(100dvh-7rem)]"
    >
      <Head>
        <title>Order | Khue&apos;s</title>
        <meta
          name="description"
          content="Order directly from Khue's for exclusive benefits, including our lowest menu prices, priority processing, and rewards points towards free meals."
        />
        <meta property="og:title" content="Order | Khue's"></meta>
        <meta property="og:url" content="www.khueskitchen.com/order" />
        <meta
          property="og:description"
          content="Order directly from Khue's for exclusive benefits, including our lowest menu prices, priority processing, and rewards points towards free meals."
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
            className="!relative rounded-md tablet:!hidden"
          />

          <Image
            src={sampleImage}
            alt={"TODO: fill in w/ appropriate alt text"}
            sizes="(min-width: 1000px) 160px, 192px"
            className="!relative !hidden !size-40 rounded-md tablet:!block desktop:!size-48"
          />
          <Image
            src={sampleImage}
            alt={"TODO: fill in w/ appropriate alt text"}
            sizes="(min-width: 1000px) 160px, 192px"
            className="!relative !hidden !size-40 rounded-md tablet:!block desktop:!size-48"
          />
          <div className="baseFlex z-10 mx-8 !hidden rounded-md bg-offwhite p-2 shadow-lg tablet:!flex">
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
            className="!relative !hidden !size-40 rounded-md tablet:!block desktop:!size-48"
          />
          <Image
            src={sampleImage}
            alt={"TODO: fill in w/ appropriate alt text"}
            sizes="(min-width: 1000px) 160px, 192px"
            className="!relative !hidden !size-40 rounded-md tablet:!block desktop:!size-48"
          />
        </div>

        <div className="baseFlex z-10 rounded-md bg-offwhite p-2 shadow-lg tablet:hidden">
          <div className="baseFlex gap-2 p-2 text-xl font-semibold text-primary tablet:px-8 tablet:py-3 tablet:text-2xl">
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary" />
            <h1>Order</h1>
            <SideAccentSwirls className="h-4 fill-primary" />
          </div>
        </div>
      </div>

      <div className="baseVertFlex relative size-full tablet:w-3/4">
        {ableToRenderMainContent() && (
          <div className="baseFlex z-10 h-12 w-full bg-offwhite shadow-lg tablet:shadow-none">
            {/* unsure of why container increases in size a bit on desktop when sticky becomes active..  */}
            <AnimatePresence mode="popLayout">
              <Sticky
                top={viewportLabel.includes("mobile") ? 95 : 112}
                activeClass="bg-offwhite h-12"
                innerActiveClass="bg-offwhite baseFlex px-2 py-1 h-16 shadow-lg tablet:shadow-none"
                innerClass="bg-offwhite w-full h-12"
                className="baseFlex w-full bg-offwhite p-2"
                // enabled={!isDrawerOpen} // prevents sticky from activating when drawer is open
              >
                {!isDrawerOpen && (
                  <motion.div
                    key={"menuCategoriesPicker"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1,
                      ease: "easeInOut",
                    }}
                    className="baseFlex w-full"
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
                        {userFavoriteItemIds.length > 0 && (
                          <CarouselItem className="baseFlex basis-1/5 tablet:basis-auto">
                            <MenuCategoryButton
                              name={"Favorites"}
                              listOrder={menuCategoryIndicies!.Favorites!}
                              currentlyInViewCategory={currentlyInViewCategory}
                              setProgrammaticallyScrolling={
                                setProgrammaticallyScrolling
                              }
                              stickyCategoriesApi={stickyCategoriesApi}
                            />
                          </CarouselItem>
                        )}

                        {userRecentOrders && userRecentOrders.length > 0 && (
                          <CarouselItem className="baseFlex basis-1/5 tablet:basis-auto">
                            <MenuCategoryButton
                              name={"Recent orders"}
                              listOrder={
                                menuCategoryIndicies!["Recent orders"]!
                              }
                              currentlyInViewCategory={currentlyInViewCategory}
                              setProgrammaticallyScrolling={
                                setProgrammaticallyScrolling
                              }
                              stickyCategoriesApi={stickyCategoriesApi}
                            />
                          </CarouselItem>
                        )}

                        {(userFavoriteItemIds.length > 0 ||
                          (userRecentOrders &&
                            userRecentOrders.length > 0)) && (
                          <Separator
                            orientation="vertical"
                            className="mx-2 h-[35px] w-[2px]" // why did h-full not work here?
                          />
                        )}

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
                                    listOrder={menuCategoryIndicies!.Beer!}
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
                                listOrder={
                                  menuCategoryIndicies![category.name] ?? 0
                                }
                                currentlyInViewCategory={
                                  currentlyInViewCategory
                                }
                                setProgrammaticallyScrolling={
                                  setProgrammaticallyScrolling
                                }
                                stickyCategoriesApi={stickyCategoriesApi}
                              />
                            </CarouselItem>
                          );
                        })}
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
                  </motion.div>
                )}
              </Sticky>
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {!ableToRenderMainContent() ? (
            <motion.div
              key={"loadingMenuContent"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="baseVertFlex h-[calc(100dvh-6rem-14rem)] w-full tablet:h-[calc(100dvh-7rem-18rem)]"
            >
              <AnimatedLogo className="size-20 tablet:size-24" />
            </motion.div>
          ) : (
            <motion.div
              key={"menuContent"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="baseVertFlex my-8 size-full gap-8 p-4 pb-8 tablet:mt-0 tablet:p-0 tablet:pb-8"
            >
              {/* TODO: add Favorites + Recent orders buttons to sticky list at top.
                  should they just be the words or also have the heart/"redo" icon next to them?
                  ^^
                  also decide whether you want to make their own component similar to <MenuCategory />
                  to get the useInView() logic in there or try and adjust <MenuCategory /> to accomodate */}

              {userFavoriteItemIds.length > 0 && (
                <div
                  id={"FavoritesContainer"}
                  className="baseVertFlex mt-4 w-full scroll-m-48 !items-start gap-2"
                >
                  <div className="baseFlex gap-3 pl-4 text-xl underline underline-offset-2">
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
                          "(min-width: 1536px)": {
                            slidesToScroll: 4,
                            active: userFavoriteItemIds.length > itemsPerSlide,
                          },
                        },
                        // skipSnaps: true, play around with this
                      }}
                      className="baseFlex w-full !justify-start"
                    >
                      <CarouselContent>
                        {userFavoriteItemIds.map((itemId, index) => (
                          <Fragment key={itemId}>
                            {menuItems[itemId] && (
                              <CarouselItem className="basis-full md:basis-1/2 xl:basis-1/3 2xl:basis-1/4">
                                <MenuItemPreviewButton
                                  menuItem={menuItems[itemId]!}
                                  // TODO: going to prob remove this in big teardown of old system of discounts
                                  activeDiscount={
                                    menuItems[itemId]?.activeDiscount ?? null
                                  }
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
                            length: Math.ceil(
                              userFavoriteItemIds.length / itemsPerSlide,
                            ),
                          }).map((_, index) => (
                            <Button key={index} asChild>
                              <div
                                className={`!size-2 cursor-pointer rounded-full !p-0 ${
                                  favoriteItemsSlide === index
                                    ? "!bg-primary"
                                    : "!bg-stone-300"
                                }`}
                                onClick={() =>
                                  favoriteItemsApi?.scrollTo(index)
                                }
                              />
                            </Button>
                          ))}
                        </>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {userRecentOrders && userRecentOrders.length > 0 && (
                <div
                  id={"Recent ordersContainer"}
                  className="baseVertFlex mt-4 w-full scroll-m-48 !items-start gap-2"
                >
                  <div className="baseFlex gap-3 pl-4 text-xl underline underline-offset-2">
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
                          "(min-width: 1536px)": {
                            slidesToScroll: 4,
                            active: userRecentOrders.length > itemsPerSlide,
                          },
                        },
                        // skipSnaps: true, play around with this
                      }}
                      className="baseFlex w-full !justify-start"
                    >
                      <CarouselContent>
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
                            length: Math.ceil(
                              userRecentOrders.length / itemsPerSlide,
                            ),
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
              )}

              {menuCategories?.map((category) => (
                <MenuCategory
                  key={category.id}
                  name={category.name}
                  activeDiscount={category.activeDiscount}
                  menuItems={category.menuItems as FullMenuItem[]}
                  listOrder={menuCategoryIndicies![category.name]!}
                  currentlyInViewCategory={currentlyInViewCategory}
                  setCurrentlyInViewCategory={setCurrentlyInViewCategory}
                  programmaticallyScrolling={programmaticallyScrolling}
                  setIsDrawerOpen={setIsDrawerOpen}
                  setIsDialogOpen={setIsDialogOpen}
                  setItemToCustomize={setItemToCustomize}
                  stickyCategoriesApi={stickyCategoriesApi}
                />
              ))}

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
      </div>

      {viewportLabel.includes("mobile") ? (
        <Drawer
          open={Boolean(isDrawerOpen && itemToCustomize)}
          onOpenChange={(open) => {
            if (!open) {
              setIsDrawerOpen(false);
              setItemToCustomize(null);
            }
          }}
        >
          <DrawerContent>
            <AnimatePresence>
              {itemToCustomize && (
                <ItemCustomizationDrawer
                  setIsDrawerOpen={setIsDrawerOpen}
                  itemToCustomize={itemToCustomize}
                />
              )}
            </AnimatePresence>
          </DrawerContent>
        </Drawer>
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
    <Button
      // key={`${name}CategoryButton`}
      id={`${name}Button`}
      variant={currentlyInViewCategory === name ? "default" : "outline"}
      size="sm"
      className="border" // not ideal, but keeps same height for all buttons
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
      {name}
    </Button>
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
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  setItemToCustomize: Dispatch<SetStateAction<FullMenuItem | null>>;
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
  setIsDrawerOpen,
  setIsDialogOpen,
  setItemToCustomize,
  stickyCategoriesApi,
}: MenuCategory) {
  const menuCategoryRef = useRef(null);
  const isInView = useInView(menuCategoryRef, {
    amount: 0.5,
    // margin: "192px 0px 0px 0px"
  });

  useEffect(() => {
    if (!isInView || programmaticallyScrolling || !stickyCategoriesApi) return;

    setCurrentlyInViewCategory(name);

    setTimeout(() => {
      stickyCategoriesApi.scrollTo(listOrder);
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
          className="!relative !h-48 w-full rounded-md object-cover"
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
      <div className="grid w-full grid-cols-1 place-items-center gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
  } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    getPrevOrderDetails: state.getPrevOrderDetails,
    setPrevOrderDetails: state.setPrevOrderDetails,
    customizationChoices: state.customizationChoices,
    discounts: state.discounts,
  }));

  const viewportLabel = useGetViewportLabel();

  const [showCheckmark, setShowCheckmark] = useState(false);

  const { updateOrder } = useUpdateOrder();

  const { toast, dismiss: dismissToasts } = useToast();

  return (
    <div
      style={{
        order: listOrder,
      }}
      className="relative h-48 w-full max-w-96"
    >
      <Button
        variant="outline"
        disabled={!menuItem.available}
        className="baseFlex size-full !justify-between gap-4 border border-stone-300 !p-6 tablet:!p-4"
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
        <Image
          src={"/menuItems/sampleImage.webp"}
          alt={menuItem.name}
          width={96}
          height={96}
          className="mb-4 rounded-md"
        />

        <div className="baseVertFlex h-full w-48 !items-start">
          <div
            className={`baseVertFlex !items-start gap-2 ${!menuItem.available ? "mt-4" : ""}`}
          >
            <div className="baseVertFlex !items-start gap-1">
              <p className="max-w-40 text-wrap text-left text-lg font-medium underline underline-offset-2">
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
          <p
            // TODO: idk about either the goldBorder or rewardsGoldBorder here...
            className={`mt-4 self-end text-base ${activeDiscount ? "goldBorder rounded-md !py-0.5 px-4 text-offwhite" : ""}`}
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

      {menuItem.available ? (
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
              description: `${menuItem.name} added to your order.`,
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
      ) : (
        <div className="absolute right-2 top-2 rounded-md bg-stone-100 px-2 py-0.5 text-stone-400">
          <p className="text-xs italic">Currently unavailable</p>
        </div>
      )}
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
  } = useMainStore((state) => ({
    orderDetails: state.orderDetails,
    getPrevOrderDetails: state.getPrevOrderDetails,
    setPrevOrderDetails: state.setPrevOrderDetails,
    customizationChoices: state.customizationChoices,
    discounts: state.discounts,
    setItemNamesRemovedFromCart: state.setItemNamesRemovedFromCart,
  }));

  const { mutate: addItemsFromOrderToCart, isLoading: isValidatingOrder } =
    api.validateOrder.validate.useMutation({
      onSuccess: (data) => {
        if (!data.validItems) {
          // TODO: show a dialog mostly likely with something along the lines of
          // "We're sorry, but the items from your previous order are not currently available."
          // ^ "to be reordered. Please try again later."

          return;
        }

        // set prev order details so we can revert if necessary
        // with toast's undo button
        setPrevOrderDetails(orderDetails);

        const totalValidItems = data.validItems.reduce(
          (acc, item) => acc + item.quantity,
          0,
        );

        toast({
          description: `${totalValidItems} item${totalValidItems > 1 ? "s" : ""} added to your order.`,
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
        setShowCheckmark(true);

        updateOrder({
          newOrderDetails: {
            ...orderDetails,
            items: [
              ...orderDetails.items,
              ...data.validItems.map((item) => ({
                id:
                  orderDetails.items.length === 0
                    ? 0
                    : orderDetails.items.at(-1)!.id + 1,
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

        setTimeout(() => {
          setShowCheckmark(false);
        }, 1000);

        if (data.removedItemNames && data.removedItemNames.length > 0) {
          setItemNamesRemovedFromCart(data.removedItemNames);
        }
      },
      onError: (error) => {
        console.error("Error adding items from previous order to cart", error);
      },
    });

  const viewportLabel = useGetViewportLabel();

  const [showCheckmark, setShowCheckmark] = useState(false);

  const { updateOrder } = useUpdateOrder();

  const { toast } = useToast();

  return (
    <div className="relative h-40 w-full max-w-96">
      <div className="baseFlex size-full gap-4 rounded-md border border-stone-300 px-4 py-6">
        <div className="grid w-28 grid-cols-2 grid-rows-2 !place-items-center gap-1">
          <Image
            src={"/menuItems/sampleImage.webp"}
            alt={order.orderItems[0]?.name ?? "First item image"}
            width={32}
            height={32}
            className="rounded-md"
          />

          {order.orderItems.length > 1 && (
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={order.orderItems[0]?.name ?? "Second item image"}
              width={32}
              height={32}
              className="rounded-md"
            />
          )}
          {order.orderItems.length > 2 && (
            <Image
              src={"/menuItems/sampleImage.webp"}
              alt={order.orderItems[0]?.name ?? "Third item image"}
              width={32}
              height={32}
              className="rounded-md"
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
              {format(order.datetimeToPickup, "EEEE, MMMM do")}
            </p>

            <div className="baseVertFlex w-full !items-start text-xs text-stone-400">
              <p className="baseFlex gap-2">
                {order.orderItems[0]?.quantity} {order.orderItems[0]?.name}
              </p>

              {order.orderItems.length > 1 && (
                <p className="baseFlex gap-2">
                  {order.orderItems[1]?.quantity} {order.orderItems[1]?.name}
                </p>
              )}

              {order.orderItems.length > 2 && (
                <p className="baseFlex gap-2">
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
            disabled={showCheckmark || isValidatingOrder}
            className={`absolute bottom-0 right-0 self-end`}
            onClick={() => {
              // TODO: maybe want to create dialog/modal for the summary of this order

              addItemsFromOrderToCart({
                userId,
                orderDetails: {
                  datetimeToPickUp: new Date(),
                  isASAP: orderDetails.isASAP,
                  includeNapkinsAndUtensils: false,
                  items: order.orderItems.map((item) => ({
                    id:
                      orderDetails.items.length === 0
                        ? 0
                        : orderDetails.items.at(-1)!.id + 1,
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
                },
                validatingAReorder: true,
              });
            }}
          >
            <AnimatePresence mode="wait">
              {showCheckmark ? (
                <motion.svg
                  key={`reorderCheckmark-${order.id}`}
                  layout
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  className="size-6 text-offwhite"
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
              ) : isValidatingOrder ? (
                <motion.div
                  key={`reorderValidationSpinner-${order.id}`}
                  layout
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-block size-4 animate-spin rounded-full border-[2px] border-white border-t-transparent text-offwhite"
                  role="status"
                  aria-label="loading"
                >
                  <span className="sr-only">Loading...</span>
                </motion.div>
              ) : (
                <motion.div
                  key={`reorder-${order.id}`}
                  layout
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Reorder
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  );
}
