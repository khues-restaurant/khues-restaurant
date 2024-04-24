import { devtools } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { type Discount } from "@prisma/client";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { z } from "zod";

// might want to use this pattern at some point based on some route navigation
// const initialStoreState = {};

// store the entire list of menu items in the store, with key being the name of the item
// and the value being the item object
// we will have an initialization hook to get the intial data and presumably we would have the cart button
// be disabled/a loading spinner while we don't have the data yet

// and then we can just always directly reference the store for the menu items
// and still have a socket.io listener for whenever an item is 86'd to refetch the data
// and update the store.

const storeCustomizationChoiceSchema = z.record(z.string());

const discountSchema = z.object({
  id: z.string(),
  createdAt: z.date().or(z.string().transform((val) => new Date(val))),
  name: z.string(),
  description: z.string(),
  expirationDate: z.date().or(z.string().transform((val) => new Date(val))),
  active: z.boolean(),
  userId: z.string().nullable(),
});

const itemSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  name: z.string(),
  customizations: storeCustomizationChoiceSchema,
  discountId: z.string().nullable(),
  specialInstructions: z.string(),
  includeDietaryRestrictions: z.boolean(),
  quantity: z.number(),
  price: z.number(),
  isAlcoholic: z.boolean(),
  pointReward: z.boolean(),
  birthdayReward: z.boolean(),
});

export const orderDetailsSchema = z.object({
  datetimeToPickUp: z.date().or(z.string().transform((val) => new Date(val))),
  isASAP: z.boolean(),
  items: z.array(itemSchema),
  includeNapkinsAndUtensils: z.boolean(),
  discountId: z.string().nullable(),
  rewardBeingRedeemed: z
    .object({
      reward: discountSchema,
      item: itemSchema,
    })
    .optional(),
});

export type StoreMenuItems = Record<string, FullMenuItem>;

export type StoreCustomizations = Record<string, string>;

export interface Item {
  id: string; // unique uuid to identify the item
  itemId: string; // tied to database row id
  name: string;
  customizations: StoreCustomizations;
  discountId: string | null; // tied to database row id (not an array because should only allow one discount per item)
  specialInstructions: string;
  includeDietaryRestrictions: boolean;
  quantity: number;
  price: number;
  isAlcoholic: boolean;
  pointReward: boolean;
  birthdayReward: boolean;
}

export interface OrderDetails {
  datetimeToPickUp: Date;
  isASAP: boolean;
  items: Item[];
  includeNapkinsAndUtensils: boolean;
  discountId: string | null;

  rewardBeingRedeemed?: {
    reward: Discount;
    item: Item;
  };

  // subtotal, tax, and total will be calculated dynamically
  // based on what the items are and what the discount is
}

// TODO: need absolutely airtight validation on initialization from localStorage/db values

function getTodayAtMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function resetStore() {
  return {
    orderDetails: {
      datetimeToPickUp: getTodayAtMidnight(),
      isASAP: false,
      items: [],
      includeNapkinsAndUtensils: false,
      discountId: null,
    },
    prevOrderDetails: {
      datetimeToPickUp: getTodayAtMidnight(),
      isASAP: false,
      items: [],
      includeNapkinsAndUtensils: false,
      discountId: null,
    },
    menuItems: {},
    customizationChoices: {},
    discounts: {},
    userFavoriteItemIds: [],
    itemNamesRemovedFromCart: [],
    cartInitiallyValidated: false,
    validatingCart: true,
    footerIsInView: false,
  };
}

interface StoreState {
  orderDetails: OrderDetails;
  setOrderDetails: (orderDetails: OrderDetails) => void;

  // used for "Undo" button on order-now menu item toasts
  prevOrderDetails: OrderDetails;
  setPrevOrderDetails: (orderDetails: OrderDetails) => void;
  getPrevOrderDetails: () => OrderDetails; // needed since getting prevOrderDetails inside onClick
  // was returning stale state

  menuItems: StoreMenuItems;
  setMenuItems: (menuItems: StoreMenuItems) => void;

  customizationChoices: Record<string, CustomizationChoiceAndCategory>;
  setCustomizationChoices: (
    customizationChoices: Record<string, CustomizationChoiceAndCategory>,
  ) => void;

  discounts: Record<string, Discount>;
  setDiscounts: (discounts: Record<string, Discount>) => void;

  userFavoriteItemIds: string[];
  setUserFavoriteItemIds: (userFavoriteItemIds: string[]) => void;

  itemNamesRemovedFromCart: string[];
  setItemNamesRemovedFromCart: (itemNamesRemovedFromCart: string[]) => void;
  cartInitiallyValidated: boolean;
  setCartInitiallyValidated: (cartInitiallyValidated: boolean) => void;
  validatingCart: boolean;
  setValidatingCart: (validatingCart: boolean) => void;

  footerIsInView: boolean;
  setFooterIsInView: (footerIsInView: boolean) => void;

  resetStore: () => void;
}

export const useMainStore = createWithEqualityFn<StoreState>()(
  devtools(
    (set, get) => ({
      orderDetails: {
        datetimeToPickUp: getTodayAtMidnight(),
        isASAP: false,
        items: [],
        includeNapkinsAndUtensils: false,
        discountId: null,
      },
      setOrderDetails: (orderDetails: OrderDetails) => {
        set({ orderDetails });
      },

      prevOrderDetails: {
        datetimeToPickUp: getTodayAtMidnight(),
        isASAP: false,
        items: [],
        includeNapkinsAndUtensils: false,
        discountId: null,
      },
      setPrevOrderDetails: (prevOrderDetails: OrderDetails) => {
        set({ prevOrderDetails });
      },
      getPrevOrderDetails: () => {
        return get().prevOrderDetails;
      },

      menuItems: {} as StoreMenuItems, // TODO: this isn't great, might have to allow it to be null, and then do
      // a heavy-handed if (!menuItems) return; outright before return jsx of function. I just don't want to
      // constantly have to be ?. chaining
      setMenuItems: (menuItems: StoreMenuItems) => {
        set({ menuItems });
      },

      customizationChoices: {},
      setCustomizationChoices: (
        customizationChoices: Record<string, CustomizationChoiceAndCategory>,
      ) => {
        set({ customizationChoices });
      },

      discounts: {},
      setDiscounts: (discounts: Record<string, Discount>) => {
        set({ discounts });
      },

      userFavoriteItemIds: [],
      setUserFavoriteItemIds: (userFavoriteItemIds: string[]) => {
        set({ userFavoriteItemIds });
      },

      itemNamesRemovedFromCart: [],
      setItemNamesRemovedFromCart: (itemNamesRemovedFromCart: string[]) => {
        set({ itemNamesRemovedFromCart });
      },
      cartInitiallyValidated: false,
      setCartInitiallyValidated: (cartInitiallyValidated: boolean) => {
        set({ cartInitiallyValidated });
      },
      validatingCart: true,
      setValidatingCart: (validatingCart: boolean) => {
        set({ validatingCart });
      },

      footerIsInView: false,
      setFooterIsInView: (footerIsInView: boolean) => {
        set({ footerIsInView });
      },

      resetStore: () => {
        set(resetStore());
      },
    }),
    shallow,
  ),
);
