import { customizationChoiceRouter } from "./routers/customizationChoice";
import { minimumOrderPickupTimeRouter } from "./routers/minimumOrderPickupTime";
import { transientOrderRouter } from "./routers/transientOrder";
import { menuCategoryRouter } from "./routers/menuCategory";
import { createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "~/server/api/routers/user";
import { paymentRouter } from "~/server/api/routers/payment";
import { orderRouter } from "~/server/api/routers/order";
import { menuItemRouter } from "~/server/api/routers/menuItem";
import { discountRouter } from "~/server/api/routers/discount";
import { validateOrderRouter } from "~/server/api/routers/validateOrder";
import { reviewRouter } from "~/server/api/routers/review";
import { favoriteRouter } from "~/server/api/routers/favorite";
import { chatRouter } from "~/server/api/routers/chat";

export const appRouter = createTRPCRouter({
  user: userRouter,
  menuCategory: menuCategoryRouter,
  menuItem: menuItemRouter,
  payment: paymentRouter,
  transientOrder: transientOrderRouter,
  order: orderRouter,
  minimumOrderPickupTime: minimumOrderPickupTimeRouter,
  customizationChoice: customizationChoiceRouter,
  discount: discountRouter,
  validateOrder: validateOrderRouter,
  review: reviewRouter,
  favorite: favoriteRouter,
  chat: chatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
