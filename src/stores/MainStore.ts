import { devtools } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

// might want to use this pattern at some point based on some route navigation
// const initialStoreState = {};

interface StoreState {
  test: boolean;
}

export const useTabStore = createWithEqualityFn<StoreState>()(
  devtools(
    (set, get) => ({
      test: false,
    }),
    shallow,
  ),
);
