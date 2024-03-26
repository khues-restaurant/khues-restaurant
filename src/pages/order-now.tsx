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
import { formatPrice } from "~/utils/formatPrice";
import { useToast } from "~/components/ui/use-toast";
import { ToastAction } from "~/components/ui/toast";
import {
  Carousel,
  CarouselContent,
  type CarouselApi,
  CarouselItem,
} from "~/components/ui/carousel";
import { DBOrderSummary } from "~/server/api/routers/order";
import { format } from "date-fns";
import { IoMdHeart } from "react-icons/io";

// - fyi as a performance optimization, we might want to dynamically import the <Dialog> and
//   <Drawer> components and have them only conditionally be rendered based on dimensions

function OrderNow() {
  const { isLoaded, isSignedIn } = useAuth();

  const { menuItems, userFavoriteItemIds } = useMainStore((state) => ({
    menuItems: state.menuItems,
    userFavoriteItemIds: state.userFavoriteItemIds,
  }));

  const { data: menuCategories } = api.menuCategory.getAll.useQuery();

  const [scrollProgress, setScrollProgress] = useState(0);
  const menuCategoriesContainerRef = useRef<HTMLDivElement | null>(null);

  const [currentlyInViewCategory, setCurrentlyInViewCategory] = useState("");
  const [programmaticallyScrolling, setProgrammaticallyScrolling] =
    useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [itemToCustomize, setItemToCustomize] = useState<FullMenuItem | null>(
    null,
  );

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
    if (
      !favoriteItemsApi
      // || !recentOrdersApi
    ) {
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

    // setRecentOrdersSlide(recentOrdersApi.selectedScrollSnap());

    // recentOrdersApi.on("select", () => {
    //   setRecentOrdersSlide(recentOrdersApi.selectedScrollSnap());
    // });

    // recentOrdersApi.on("resize", () => {
    //   setRecentOrdersSlide(0);
    //   recentOrdersApi.scrollTo(0);
    // });

    // eventually add proper cleanup functions here
  }, [favoriteItemsApi, recentOrdersApi]);

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

  return (
    <motion.div
      key={"order-now"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-[6.05rem] min-h-dvh w-full !justify-start tablet:mt-32"
    >
      {/* Hero */}
      <div className="baseFlex relative h-56 w-full overflow-hidden tablet:h-72">
        <div className="tablet:baseFlex absolute left-0 top-0 grid h-full w-full grid-cols-2 grid-rows-2 border-b-2 tablet:gap-4">
          {/* desktop fading gradients */}
          <div className="absolute left-0 top-0 h-full w-screen">
            <div className="absolute left-0 top-0 hidden h-full w-1/6 bg-gradient-to-l from-transparent to-black/50 tablet:block"></div>
            <div className="absolute right-0 top-0 hidden h-full w-1/6 bg-gradient-to-r from-transparent to-black/50 tablet:block"></div>
          </div>

          <div className="imageFiller h-full w-full tablet:w-1/4"></div>
          <div className="imageFiller h-full w-full tablet:w-1/4"></div>
          <div className="imageFiller h-full w-full tablet:w-1/4"></div>
          <div className="imageFiller h-full w-full tablet:w-1/4"></div>
        </div>

        <div className="baseFlex z-10 rounded-md bg-white p-2 shadow-lg">
          <div className="experimentalBorder baseFlex px-8 py-4 text-xl font-semibold tablet:text-2xl">
            Order
          </div>
        </div>
      </div>

      <div className="baseVertFlex relative w-full pb-8 tablet:w-3/4">
        <AnimatePresence mode="popLayout">
          {!menuCategories && !isLoaded && isSignedIn === undefined ? (
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
              className="baseFlex z-10 h-full w-full bg-white shadow-lg tablet:shadow-none"
            >
              {/* unsure of why container increases in size a bit on desktop when sticky becomes active..  */}
              <Sticky
                top={"#header"}
                activeClass="bg-white h-16"
                innerActiveClass="bg-white px-2 pt-4 h-16"
                innerClass="bg-white w-full h-12"
                className="baseFlex w-full p-2"
              >
                <div
                  ref={menuCategoriesContainerRef}
                  className={
                    "no-scrollbar flex w-full snap-x snap-mandatory gap-4 overflow-x-scroll scroll-smooth"
                  }
                >
                  {menuCategories?.map((category) => (
                    <MenuCategoryButton
                      key={category.id}
                      name={category.name}
                      listOrder={category.listOrder}
                      currentlyInViewCategory={currentlyInViewCategory}
                      setProgrammaticallyScrolling={
                        setProgrammaticallyScrolling
                      }
                    />
                  ))}
                </div>

                {/* Custom scrollbar indicating scroll progress */}

                {/* ah we want relative + -b-4 when not sticky
                    and then absolute -b-0 or w/e when sticky */}

                {/* also maybe want to just hide this part on tablet+, since it would look distracting
                    at best at that size */}

                <div className="absolute -bottom-0 left-0 h-1 w-full bg-gray-200">
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
          {!menuCategories && !isLoaded && isSignedIn === undefined ? (
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
              className="baseVertFlex mt-8 h-full w-full gap-8 tablet:mt-0"
            >
              {/* TODO: add Favorites + Recent orders buttons to sticky list at top.
                  should they just be the words or also have the heart/"redo" icon next to them? */}

              {userFavoriteItemIds.length > 0 && (
                <div className="baseVertFlex w-full !items-start gap-2">
                  <div className="baseFlex gap-2 pl-4 text-xl underline underline-offset-2">
                    <IoMdHeart />
                    <p>Favorites</p>
                  </div>

                  <div className="baseVertFlex w-full gap-2">
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
                      className="baseFlex w-full"
                    >
                      <CarouselContent>
                        {userFavoriteItemIds.map((itemId, index) => (
                          <Fragment key={itemId}>
                            {menuItems[itemId] && (
                              <CarouselItem className="basis-full md:basis-1/2 xl:basis-1/3 2xl:basis-1/4">
                                <MenuItemPreviewButton
                                  menuItem={menuItems[itemId]!}
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
                                className={`!size-2 rounded-full !p-0 ${
                                  favoriteItemsSlide === index
                                    ? "!bg-primary"
                                    : "!bg-gray-300"
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

              {/* TODO: if applicable user's favorited items (scroll-snap-x wrapper) */}

              {menuCategories?.map((category) => (
                <MenuCategory
                  key={category.id}
                  name={category.name}
                  activeDiscount={category.activeDiscount}
                  menuItems={category.menuItems as FullMenuItem[]}
                  listOrder={category.listOrder}
                  currentlyInViewCategory={currentlyInViewCategory}
                  setCurrentlyInViewCategory={setCurrentlyInViewCategory}
                  programmaticallyScrolling={programmaticallyScrolling}
                  setIsDrawerOpen={setIsDrawerOpen}
                  setIsDialogOpen={setIsDialogOpen}
                  setItemToCustomize={setItemToCustomize}
                />
              ))}
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
              setTimeout(() => {
                setItemToCustomize(null);
              }, 300);
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

          categoryContainer.scrollIntoView({ behavior: "smooth" });

          setTimeout(() => {
            setProgrammaticallyScrolling(false);
          }, 500);
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
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  setItemToCustomize: Dispatch<SetStateAction<FullMenuItem | null>>;
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
}: MenuCategory) {
  const menuCategoryRef = useRef(null);
  const isInView = useInView(menuCategoryRef);

  useEffect(() => {
    if (!isInView || programmaticallyScrolling) return;

    setCurrentlyInViewCategory(name);

    // TODO: certainly need to gate the scrolling if we don't have the scroll container
    // yet right? Aka on desktop don't do this part

    const categoryButton = document.getElementById(`${name}Button`);

    if (categoryButton) {
      console.log("scrolling to category button", name);
      setTimeout(() => {
        categoryButton.scrollIntoView({ behavior: "smooth" });
      }, 500); // TODO: bandaid at best, we need to look at this section again big time
    }
  }, [
    isInView,
    name,
    setCurrentlyInViewCategory,
    currentlyInViewCategory,
    programmaticallyScrolling,
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
      className="baseVertFlex w-full scroll-m-44 !items-start gap-4 p-2"
    >
      <div className="baseFlex relative w-full rounded-md">
        {/* TODO: one image w/ 3 dishes from category on mobile, three separate images on desktop
            so image isn't distorted */}
        <div className="imageFiller h-48 w-full rounded-md"></div>
        <div className="baseVertFlex absolute bottom-4 left-4 !items-start gap-2 rounded-md border-2 border-primary bg-white px-4 py-2 shadow-md tablet:!flex-row tablet:!items-center tablet:gap-4">
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
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
        className="baseFlex h-full w-full gap-4 border-2 py-6"
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
        <div className="imageFiller size-24 rounded-md"></div>

        <div className="baseVertFlex h-full w-48 !items-start !justify-between">
          <div className="baseVertFlex !items-start gap-2">
            <p className="text-lg font-medium underline underline-offset-2">
              {menuItem.name}
            </p>
            <p className="max-w-48 text-wrap text-left text-gray-400">
              {menuItem.chefsChoice ? "Chef's Choice" : menuItem.description}
            </p>
          </div>
          <p
            // TODO: idk about either the goldBorder or rewardsGoldBorder here...
            className={`self-end text-base ${activeDiscount ? "goldBorder rounded-md !py-0.5 px-4 text-white" : ""}`}
          >
            {formatPrice(
              calculateRelativeTotal({
                items: [
                  {
                    price: menuItem.price,
                    quantity: 1,
                    discountId: activeDiscount?.id ?? null,

                    // only necessary to fit Item shape
                    id: menuItem.id,
                    itemId: menuItem.id,
                    customizations: {}, // not necessary since all default choices are already included in price
                    includeDietaryRestrictions: false,
                    name: menuItem.name,
                    specialInstructions: "",
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
          className="baseFlex absolute right-0 top-0 h-10 w-10 rounded-none rounded-bl-md rounded-tr-md border-2 text-primary"
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

            function getDefaultCustomizationChoices(item: FullMenuItem) {
              return item.customizationCategory.reduce((acc, category) => {
                acc[category.id] = category.defaultChoiceId;
                return acc;
              }, {} as StoreCustomizations);
            }

            updateOrder({
              newOrderDetails: {
                ...orderDetails,
                items: [
                  ...orderDetails.items,
                  {
                    id: crypto.randomUUID(),
                    itemId: menuItem.id,
                    name: menuItem.name,
                    customizations: getDefaultCustomizationChoices(menuItem),
                    specialInstructions: "",
                    includeDietaryRestrictions: false,
                    quantity: 1,
                    price: menuItem.price,
                    discountId: activeDiscount?.id ?? null,
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
        <div className="absolute right-2 top-2 rounded-md bg-gray-100 px-2 py-0.5 text-gray-400">
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

  // TODO: ^ yeah most likely have toast be "{order.items.length} item(s) added to your order. Undo"

  return (
    <div className="relative h-48 w-full max-w-96">
      <div className="baseFlex h-full w-full gap-4 border-2 py-6">
        <div className="grid grid-cols-2 grid-rows-2 gap-1">
          {/* TODO: make this correct + conditional like my-orders */}
          <div className="imageFiller size-8 rounded-md"></div>
          <div className="imageFiller size-8 rounded-md"></div>
          <div className="imageFiller size-8 rounded-md"></div>
          <div className="imageFiller size-8 rounded-md"></div>
        </div>

        <div className="baseVertFlex h-full w-48 !items-start !justify-between">
          <div className="baseVertFlex !items-start gap-2">
            <p className="text-lg font-medium underline underline-offset-2">
              {format(order.datetimeToPickup, "PPP")}
            </p>
            <div className="baseVertFlex text-sm text-gray-400"></div>
            {/* TODO: same thing here */}
            <p>1 App Two</p>
            <p>1 App Two</p>
            <p>1 App Two</p>
            <p>+3 more</p>
          </div>
          <Button
            className={`self-end text-base`}
            onClick={() => {
              // TODO: will most likely want to create dialog/modal for the summary of this order
              // TODO: add the contents of this order to the current order
            }}
          >
            Reorder
          </Button>
        </div>
      </div>
    </div>
  );
}
