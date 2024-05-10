import { type Order, type OrderItem } from "@prisma/client";
import { addMonths } from "date-fns";
import OrderReady from "emails/OrderReady";
import { Resend } from "resend";
import { z } from "zod";
import { env } from "~/env";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { type Discount as DBDiscount } from "@prisma/client";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";

const resend = new Resend(env.RESEND_API_KEY);

interface CustomizationChoice {
  id: string;
  name: string;
  description: string;
  priceAdjustment: number;

  customizationCategoryId: string;
}

interface CustomizationCategory {
  id: string;
  name: string;
  description: string;
  defaultChoiceId: string;

  customizationChoice: CustomizationChoice[];
}

interface Discount {
  id: string;
  name: string;
  description: string;
  expirationDate: Date;
  active: boolean;
}

interface OrderItemCustomization {
  id: string;
  customizationChoice: CustomizationChoice;
  customizationCategory: CustomizationCategory;
}

export interface DashboardOrderItem {
  id: string;
  name: string;
  specialInstructions: string;
  includeDietaryRestrictions: boolean;
  quantity: number;
  price: number;
  customizations: OrderItemCustomization[];
  discount: Discount | null;
}

export interface DashboardOrder {
  id: string;
  createdAt: Date;
  orderStartedAt: Date | null;
  orderCompletedAt: Date | null;
  datetimeToPickup: Date;

  status: string; // better types?
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  includeNapkinsAndUtensils: boolean;

  orderItems: DashboardOrderItem[];

  prevRewardsPoints: number;
  rewardsPoints: number;

  stripeSessionId: string;

  userId: string | null;
}

export type DBOrderSummary = Order & {
  orderItems: DBOrderSummaryItem[];
};

export type DBOrderSummaryItem = OrderItem & {
  customizations: Record<string, string>;
  discount: Discount | null;
};

export const orderRouter = createTRPCRouter({
  // leverage this skeleton below to get the order details for the OrderReady stuff right?
  // legit just copy and paste

  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: id }) => {
      const order = await ctx.prisma.order.findFirst({
        where: {
          id,
        },
        include: {
          orderItems: {
            include: {
              customizations: true,
              discount: true,
            },
          },
        },
      });

      if (!order) return null;

      // turn the item customizations into a Record<string, string>
      // for easier access in the frontend
      order.orderItems = order.orderItems.map((item) => {
        // @ts-expect-error asdf
        item.customizations = item.customizations.reduce(
          (acc, customization) => {
            acc[customization.customizationCategoryId] =
              customization.customizationChoiceId;
            return acc;
          },
          {} as Record<string, string>,
        );

        return item;
      });

      // @ts-expect-error asdf
      return order as DBOrderSummary;
    }),

  // TODO: technically want this to be infinite scroll
  getUsersOrders: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        limitToFirstSix: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const recentOrders = await ctx.prisma.order.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          orderItems: {
            include: {
              customizations: true,
              discount: true,
            },
          },
        },
        orderBy: {
          datetimeToPickup: "desc",
        },
      });

      if (!recentOrders) return null;

      // Iterate over each order to transform the item customizations
      // into a Record<string, string> for each order's items
      const transformedOrders = recentOrders.map((order) => {
        order.orderItems = order.orderItems.map((item) => {
          // @ts-expect-error asdf
          item.customizations = item.customizations.reduce(
            (acc, customization) => {
              acc[customization.customizationCategoryId] =
                customization.customizationChoiceId;
              return acc;
            },
            {} as Record<string, string>,
          );

          return item;
        });

        return order;
      });

      // @ts-expect-error asdf
      return transformedOrders.slice(
        0,
        input.limitToFirstSix ? 6 : transformedOrders.length,
      ) as DBOrderSummary[];
    }),

  getByStripeSessionId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: stripeSessionId }) => {
      return ctx.prisma.order.findFirst({
        where: {
          stripeSessionId,
        },
      });
    }),

  getTodaysOrders: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.order.findMany({
      // Uncomment and adjust according to your requirements
      // where: {
      //   datetimeToPickup: {
      //     gte: new Date(new Date().setHours(0, 0, 0, 0)),
      //     lte: new Date(new Date().setHours(23, 59, 59, 999)),
      //   },
      // },
      include: {
        orderItems: {
          include: {
            customizations: true,
          },
        },
      },
    });
  }),
  startOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.order.update({
        where: {
          id: input.id,
        },
        data: {
          orderStartedAt: new Date(),
        },
      });
    }),
  completeOrder: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string().nullable(),
        customerEmail: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.order.update({
        where: {
          id: input.id,
        },
        data: {
          orderCompletedAt: new Date(),
        },
      });

      const user = await ctx.prisma.user.findFirst({
        where: {
          email: input.customerEmail,
        },
      });

      // send email receipt (if allowed) to user
      if (user?.allowsEmailReceipts) {
        const orderDetails = await queryForOrderDetails(input.id);

        if (orderDetails) {
          await SendOrderReadyEmail({
            order: {
              id: input.id,
              datetimeToPickup: orderDetails.datetimeToPickup,
              firstName: orderDetails.firstName,
              lastName: orderDetails.lastName,
              email: user.email,
              includeNapkinsAndUtensils: orderDetails.includeNapkinsAndUtensils,
            },
            orderDetails,
            userIsAMember: true,
          });
        }
      }

      // check if customer email is on do not email blacklist in database
      else {
        const emailBlacklistValue = await prisma.blacklistedEmail.findFirst({
          where: {
            emailAddress: input.customerEmail,
          },
        });

        if (!emailBlacklistValue) {
          const orderDetails = await queryForOrderDetails(input.id);

          if (orderDetails) {
            await SendOrderReadyEmail({
              order: {
                id: input.id,
                datetimeToPickup: orderDetails.datetimeToPickup,
                firstName: orderDetails.firstName,
                lastName: orderDetails.lastName,
                email: input.customerEmail,
                includeNapkinsAndUtensils:
                  orderDetails.includeNapkinsAndUtensils,
              },
              orderDetails,
              userIsAMember: false,
            });
          }
        }
      }
    }),
});

async function queryForOrderDetails(orderId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: {
        include: {
          customizations: true,
          discount: true,
        },
      },
    },
  });

  if (!order) return null;

  // turn the item customizations into a Record<string, string>
  // for easier access in the frontend
  order.orderItems = order.orderItems.map((item) => {
    // @ts-expect-error asdf
    item.customizations = item.customizations.reduce(
      (acc, customization) => {
        acc[customization.customizationCategoryId] =
          customization.customizationChoiceId;
        return acc;
      },
      {} as Record<string, string>,
    );

    return item;
  });

  // @ts-expect-error asdf
  return order as DBOrderSummary;
}

interface SendOrderReadyEmail {
  order: {
    id: string;
    datetimeToPickup: Date;
    firstName: string;
    lastName: string;
    email: string;
    includeNapkinsAndUtensils: boolean;
  };
  orderDetails: DBOrderSummary;
  userIsAMember: boolean;
}

async function SendOrderReadyEmail({
  // email,
  order,
  orderDetails,
  userIsAMember,
}: SendOrderReadyEmail) {
  console.log("sending email receipt");

  const unsubscriptionToken = await prisma.emailUnsubscriptionToken.create({
    data: {
      expiresAt: addMonths(new Date(), 3),
      emailAddress: order.email,
    },
  });

  const rawCustomizationChoices = await prisma.customizationChoice.findMany({
    include: {
      customizationCategory: true,
    },
  });

  const customizationChoices = rawCustomizationChoices.reduce(
    (acc, choice) => {
      acc[choice.id] = choice;
      return acc;
    },
    {} as Record<string, CustomizationChoiceAndCategory>,
  );

  const rawDiscounts = await prisma.discount.findMany({
    where: {
      active: true,
      expirationDate: {
        gte: new Date(),
      },
      userId: null,
      menuItem: undefined, // assuming that we are most likely not doing the category/item %/bogo discounts
      menuCategory: undefined, // assuming that we are most likely not doing the category/item %/bogo discounts
    },
  });

  const discounts = rawDiscounts.reduce(
    (acc, discount) => {
      acc[discount.id] = discount;
      return acc;
    },
    {} as Record<string, DBDiscount>,
  );

  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "khues.dev@gmail.com", // order.email,
      subject: "Hello world",
      react: OrderReady({
        id: order.id,
        datetimeToPickup: order.datetimeToPickup,
        pickupName: `${order.firstName} ${order.lastName}`,
        includeNapkinsAndUtensils: order.includeNapkinsAndUtensils,
        items: orderDetails.orderItems,
        customizationChoices,
        discounts,
        userIsAMember,
        unsubscriptionToken: unsubscriptionToken.id,
      }),
    });

    if (error) {
      // res.status(400).json({ error });
      console.error(error);
    }

    // res.status(200).json({ data });
    console.log("went through", data);
  } catch (error) {
    // res.status(400).json({ error });
    console.error(error);
  }
}
