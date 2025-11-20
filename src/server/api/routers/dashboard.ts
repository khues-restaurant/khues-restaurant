import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
  getHeaderStatusReport: adminProcedure.query(async ({ ctx }) => {
    const minOrderPickupTime =
      await ctx.prisma.minimumOrderPickupTime.findFirst();

    const totalDisabledMenuItems = await ctx.prisma.menuItem.count({
      where: {
        available: false,
      },
    });

    return {
      minOrderPickupTime: minOrderPickupTime?.value || new Date(0),
      totalDisabledMenuItems,
    };
  }),
});
