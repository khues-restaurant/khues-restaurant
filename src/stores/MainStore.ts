import { devtools } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { type MenuItem } from "@prisma/client";

// might want to use this pattern at some point based on some route navigation
// const initialStoreState = {};

// store the entire list of menu items in the store, with key being the name of the item
// and the value being the item object
// we will have an initialization hook to get the intial data and presumably we would have the cart button
// be disabled/a loading spinner while we don't have the data yet

// and then we can just always directly reference the store for the menu items
// and still have a socket.io listener for whenever an item is 86'd to refetch the data
// and update the store.

export type StoreMenuItems = Record<string, MenuItem>;

type Customization = Record<string, string>;

export interface Item {
  id: string;
  name: string;
  customizations: Customization[];
  // {
  // this will be depending on exactly what is being ordered right?
  // like for a fountain drink you would probably need:
  // type: “Coke” | “Sprite” | etc..
  // size: “Small” | “Medium” | “Large”
  // };
  specialInstructions: string;
  includeDietaryRestrictions: boolean;
  quantity: number;
  price: number;
}

export interface OrderDetails {
  dateToPickUp?: Date;
  timeToPickUp?: string; // will be in the direct form of "6:00 PM" or w/e in intervals of 15 minutes
  items: Item[];
  discount?: {
    title: string;
    value: number;
  };
  // subtotal, tax, and total will be calculated dynamically
  // based on what the items are and what the discount is
}

interface StoreState {
  orderDetails: OrderDetails;
  setOrderDetails: (orderDetails: OrderDetails) => void;
  menuItems: StoreMenuItems;
  setMenuItems: (menuItems: StoreMenuItems) => void;
}

export const useMainStore = createWithEqualityFn<StoreState>()(
  devtools(
    (set, get) => ({
      orderDetails: {
        dateToPickUp: new Date(),
        timeToPickUp: "",
        items: [],
        discount: {
          title: "",
          value: 0,
        },
      },
      setOrderDetails: (orderDetails: OrderDetails) => {
        set({ orderDetails });
      },
      menuItems: {} as StoreMenuItems, // TODO: this isn't great, might have to allow it to be null, and then do
      // a heavy-handed if (!menuItems) return; outright before return jsx of function. I just don't want to
      // constantly have to be ?. chaining
      setMenuItems: (menuItems: StoreMenuItems) => {
        set({ menuItems });
      },
    }),
    shallow,
  ),
);
