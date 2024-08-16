import { customizationChoiceRouter } from "./routers/customizationChoice";
import { minimumOrderPickupTimeRouter } from "./routers/minimumOrderPickupTime";
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
import { customizationCategoryRouter } from "~/server/api/routers/customizationCategory";
import { blacklistedEmailRouter } from "~/server/api/routers/blacklistedEmail";
import { orderPrintQueueRouter } from "~/server/api/routers/orderPrintQueue";
import { statsRouter } from "~/server/api/routers/stats";
import { storeDBQueriesRouter } from "~/server/api/routers/storeDBQueries";
import { temporaryCustomerEmailSignUp } from "~/server/api/routers/temporaryCustomerEmailSignUp";

export const appRouter = createTRPCRouter({
  user: userRouter,
  menuCategory: menuCategoryRouter,
  menuItem: menuItemRouter,
  payment: paymentRouter,
  order: orderRouter,
  minimumOrderPickupTime: minimumOrderPickupTimeRouter,
  customizationCategory: customizationCategoryRouter,
  customizationChoice: customizationChoiceRouter,
  validateOrder: validateOrderRouter,
  review: reviewRouter,
  favorite: favoriteRouter,
  chat: chatRouter,
  blacklistedEmail: blacklistedEmailRouter,
  orderPrintQueue: orderPrintQueueRouter,
  stats: statsRouter,
  storeDBQueries: storeDBQueriesRouter,

  temporaryCustomerEmailSignUp: temporaryCustomerEmailSignUp,

  discount: discountRouter, // currently not being used
});

// export type definition of API
export type AppRouter = typeof appRouter;
