import { devtools } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

// might want to use this pattern at some point based on some route navigation
// const initialStoreState = {};

type Customization = Record<string, string>;

interface Item {
  name: string;
  customizations: Customization[];
  // {
  // this will be depending on exactly what is being ordered right?
  // like for a fountain drink you would probably need:
  // type: “Coke” | “Sprite” | etc..
  // size: “Small” | “Medium” | “Large”
  // };
  specialInstructions: string;
  quantity: number;
  price: number;
}

export interface OrderDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateToPickUp: Date;
  timeToPickUp: string; // will be in the direct form of "6:00 PM" or w/e in intervals of 15 minutes
  items: Item[];
  discount?: {
    title: string;
    value: number;
  };
  subtotal: number;
  tax: number;
  total: number;
}

interface StoreState {
  orderDetails: OrderDetails | null;
  setOrderDetails: (orderDetails: OrderDetails) => void;
}

export const useMainStore = createWithEqualityFn<StoreState>()(
  devtools(
    (set, get) => ({
      orderDetails: null,
      setOrderDetails: (orderDetails: OrderDetails) => {
        set({ orderDetails });
      },
    }),
    shallow,
  ),
);
