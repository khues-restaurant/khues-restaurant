import { type Discount } from "@prisma/client";
import { z } from "zod";
import { devtools } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import {
  type FullMenuItem,
  type RewardCategoriesResponse,
} from "~/server/api/routers/menuCategory";
import { getFirstValidMidnightDate } from "~/utils/dateHelpers/getFirstValidMidnightDate";

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
  id: z.number(),
  itemId: z.string(),
  name: z.string(),
  customizations: storeCustomizationChoiceSchema,
  discountId: z.string().nullable(),
  specialInstructions: z.string(),
  includeDietaryRestrictions: z.boolean(),
  quantity: z.number(),
  price: z.number(),
  isChefsChoice: z.boolean(),
  isAlcoholic: z.boolean(),
  isVegetarian: z.boolean(),
  isVegan: z.boolean(),
  isGlutenFree: z.boolean(),
  showUndercookedOrRawDisclaimer: z.boolean(),
  hasImageOfItem: z.boolean(),
  pointReward: z.boolean(),
  birthdayReward: z.boolean(),
});

export const orderDetailsSchema = z.object({
  datetimeToPickup: z.date().or(z.string().transform((val) => new Date(val))),
  isASAP: z.boolean(),
  items: z.array(itemSchema),
  tipPercentage: z.number().nullable(),
  tipValue: z.number(),
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
  id: number; // unique (increasing int), used to identify the item for map keys + consistent ordering
  itemId: string; // tied to database row id
  name: string;
  customizations: StoreCustomizations;
  discountId: string | null; // tied to database row id (not an array because should only allow one discount per item)
  specialInstructions: string;
  includeDietaryRestrictions: boolean;
  quantity: number;
  price: number;
  isChefsChoice: boolean;
  isAlcoholic: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  showUndercookedOrRawDisclaimer: boolean;
  hasImageOfItem: boolean;
  pointReward: boolean;
  birthdayReward: boolean;
}

export interface OrderDetails {
  datetimeToPickup: Date;
  isASAP: boolean;
  items: Item[];
  includeNapkinsAndUtensils: boolean;
  discountId: string | null;

  tipPercentage: number | null;
  tipValue: number;

  rewardBeingRedeemed?: {
    reward: Discount;
    item: Item;
  };

  // subtotal, tax, and total will be calculated dynamically
  // based on what the items are and what the discount is
}

// used solely when logging out the current user
function resetStore() {
  return {
    orderDetails: {
      datetimeToPickup: getFirstValidMidnightDate(),
      isASAP: false,
      items: [],
      tipPercentage: null,
      tipValue: 0,
      includeNapkinsAndUtensils: false,
      discountId: null,
    },
    prevOrderDetails: {
      datetimeToPickup: getFirstValidMidnightDate(),
      isASAP: false,
      items: [],
      tipPercentage: null,
      tipValue: 0,
      includeNapkinsAndUtensils: false,
      discountId: null,
    },
    menuItems: {},
    customizationChoices: {},
    rewards: {
      rewardMenuCategories: [],
      birthdayMenuCategories: [],
    },
    discounts: {},
    userFavoriteItemIds: [],
    itemNamesRemovedFromCart: [],
    cartInitiallyValidated: true, // both true because otherwise useInitLocalStorage will revalidate while user is still signed in
    initOrderDetailsRetrieved: true, // both true because otherwise useInitLocalStorage will revalidate while user is still signed in
    validatingCart: true,
    footerIsInView: false,
    viewportLabel: undefined,
    initViewportLabelSet: false,
    cartDrawerIsOpen: false,
    chatIsOpen: false,
    mobileHeroThresholdInView: false,
  };
}

interface StoreState {
  orderDetails: OrderDetails;
  setOrderDetails: (orderDetails: OrderDetails) => void;

  // used for "Undo" button on order menu item toasts
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

  rewards: RewardCategoriesResponse;
  setRewards: (rewards: RewardCategoriesResponse) => void;

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

  refetchMenu?: () => void;
  setRefetchMenu: (refetchMenu: () => Promise<unknown>) => void;
  refetchMinOrderPickupTime?: () => void;
  setRefetchMinOrderPickupTime: (
    refetchMinOrderPickupTime: () => Promise<unknown>,
  ) => void;

  viewportLabel: "mobile" | "mobileLarge" | "tablet" | "desktop";
  setViewportLabel: (
    viewportLabel: "mobile" | "mobileLarge" | "tablet" | "desktop",
  ) => void;
  initViewportLabelSet: boolean;
  setInitViewportLabelSet: (initViewportLabelSet: boolean) => void;

  // mostly deprecated: can just use one state for both cartSheets since we aren't
  // using <Drawer> anymore
  cartDrawerIsOpen: boolean;
  setCartDrawerIsOpen: (cartDrawerIsOpen: boolean) => void;

  initOrderDetailsRetrieved: boolean;
  setInitOrderDetailsRetrieved: (initOrderDetailsRetrieved: boolean) => void;

  chatIsOpen: boolean;
  setChatIsOpen: (chatIsOpen: boolean) => void;

  mobileHeroThresholdInView: boolean;
  setMobileHeroThresholdInView: (mobileHeroThresholdInView: boolean) => void;

  resetStore: () => void;
}

export const useMainStore = createWithEqualityFn<StoreState>()(
  devtools(
    (set, get) => ({
      orderDetails: {
        datetimeToPickup: getFirstValidMidnightDate(),
        isASAP: false,
        items: [],
        tipPercentage: null,
        tipValue: 0,
        includeNapkinsAndUtensils: false,
        discountId: null,
      },
      setOrderDetails: (orderDetails: OrderDetails) => {
        set({ orderDetails });
      },

      prevOrderDetails: {
        datetimeToPickup: getFirstValidMidnightDate(),
        isASAP: false,
        items: [],
        tipPercentage: null,
        tipValue: 0,
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

      rewards: {
        rewardMenuCategories: [],
        birthdayMenuCategories: [],
      },
      setRewards: (rewards: RewardCategoriesResponse) => {
        set({ rewards });
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

      refetchMenu: undefined,
      setRefetchMenu: (refetchMenu: () => void) => {
        set({ refetchMenu });
      },
      refetchMinOrderPickupTime: undefined,
      setRefetchMinOrderPickupTime: (refetchMinOrderPickupTime: () => void) => {
        set({ refetchMinOrderPickupTime });
      },

      viewportLabel: "mobile",
      setViewportLabel: (
        viewportLabel: "mobile" | "mobileLarge" | "tablet" | "desktop",
      ) => {
        set({ viewportLabel });
      },
      initViewportLabelSet: false,
      setInitViewportLabelSet: (initViewportLabelSet: boolean) => {
        set({ initViewportLabelSet });
      },

      cartDrawerIsOpen: false,
      setCartDrawerIsOpen: (cartDrawerIsOpen: boolean) => {
        set({ cartDrawerIsOpen });
      },

      initOrderDetailsRetrieved: false,
      setInitOrderDetailsRetrieved: (initOrderDetailsRetrieved: boolean) => {
        set({ initOrderDetailsRetrieved });
      },

      chatIsOpen: false,
      setChatIsOpen: (chatIsOpen: boolean) => {
        set({ chatIsOpen });
      },

      mobileHeroThresholdInView: false,
      setMobileHeroThresholdInView: (mobileHeroThresholdInView: boolean) => {
        set({ mobileHeroThresholdInView });
      },

      resetStore: () => {
        set(resetStore());
      },
    }),
    shallow,
  ),
);
