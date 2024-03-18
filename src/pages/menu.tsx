import { useAuth } from "@clerk/nextjs";
import { type Discount } from "@prisma/client";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
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
import { Separator } from "~/components/ui/separator";

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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [itemToCustomize, setItemToCustomize] = useState<FullMenuItem | null>(
    null,
  );

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
      key={"menu"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex mt-[6.05rem] min-h-dvh w-full !justify-start tablet:mt-32"
    >
      {/* Hero */}
      <div className="baseFlex tablet:[125vw] relative h-56 w-full tablet:h-72">
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
            Menu
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
              className="baseVertFlex mt-8 h-full w-full tablet:mt-0"
            >
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
      <div className="baseFlex gap-4">
        <p className="text-xl font-medium underline underline-offset-2">
          {name}
        </p>

        {/* {activeDiscount && (
          <div className="baseFlex rounded-md bg-primary px-4 py-0.5 text-white">
            <p>{activeDiscount.name}</p>
          </div>
        )} */}
      </div>

      {/* wrapping container for each food item in the category */}
      <div className="baseFlex w-full flex-wrap !justify-start p-1 tablet:gap-16">
        {menuItems.map((item, idx) => (
          <MenuItemPreviewButton
            key={item.id}
            menuItem={item}
            activeDiscount={activeDiscount}
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
      className="relative h-48 w-full max-w-96"
    >
      <div className="baseFlex h-full w-full gap-4 py-6">
        <div className="imageFiller size-24 rounded-md"></div>

        <div className="baseVertFlex h-full w-full !items-start !justify-between">
          <div className="baseFlex w-full !justify-between">
            <div className="baseVertFlex !items-start gap-2">
              <p className="text-lg font-semibold underline underline-offset-2">
                {menuItem.name}
              </p>
              <p className="max-w-48 text-wrap text-left text-gray-400">
                {menuItem.description}
              </p>
            </div>
            <p
              //  ${activeDiscount ? "rounded-md bg-primary px-4 py-0.5 text-white" : ""}

              className={`self-end text-base 
              `}
            >
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
                    },
                  ],
                  customizationChoices,
                  discounts: {}, // TODO: do we want to show discount prices on menu? I feel like we should keep it
                  // to just the regular prices..
                }),
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
