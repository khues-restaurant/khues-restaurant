import { transientOrderRouter } from "./routers/transientOrder";
import { menuCategoryRouter } from "./routers/menuCategory";
import { createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "~/server/api/routers/user";
import { paymentRouter } from "~/server/api/routers/payment";
import { orderRouter } from "~/server/api/routers/order";

export const appRouter = createTRPCRouter({
  user: userRouter,
  menuCategory: menuCategoryRouter,
  payment: paymentRouter,
  transientOrder: transientOrderRouter,
  order: orderRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
