import { type PrismaClient, type User } from "@prisma/client";
import { type OrderDetails } from "~/stores/MainStore";
import { env } from "~/env";
import { io } from "socket.io-client";
import { Resend } from "resend";
import Receipt from "emails/Receipt";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { type Discount } from "@prisma/client";
import { addMonths } from "date-fns";
import { prisma } from "~/server/db";

const resend = new Resend(env.RESEND_API_KEY);

interface CreateOrderParams {
  userId: string;
  user: User | null;
  orderDetails: OrderDetails;
  paymentMetadata: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
  paymentDetails: {
    stripeSessionId: string;
    subtotal: number;
    tax: number;
    tipPercentage: number | null;
    tipValue: number;
    total: number;
  };
  giftCardUsage?: {
    code: string;
    amount: number;
    id: string;
  }[];
}

export async function createOrderInDb(params: CreateOrderParams) {
  const {
    userId,
    user,
    orderDetails,
    paymentMetadata,
    paymentDetails,
    giftCardUsage,
  } = params;

  const includeDietaryRestrictions = orderDetails.items.some(
    (item) => item.includeDietaryRestrictions,
  );

  const orderItemsData = orderDetails.items.map(
    ({ itemId, id, customizations, ...rest }) => ({
      ...rest,
      menuItemId: itemId,
      customizations: {
        create: Object.entries(customizations).map(
          ([categoryId, choiceId]) => ({
            customizationCategoryId: categoryId,
            customizationChoiceId: choiceId,
          }),
        ),
      },
    }),
  );

  const orderData = {
    stripeSessionId: paymentDetails.stripeSessionId,
    datetimeToPickup: new Date(orderDetails.datetimeToPickup),
    firstName: paymentMetadata.firstName,
    lastName: paymentMetadata.lastName,
    email: paymentMetadata.email,
    phoneNumber: paymentMetadata.phoneNumber,
    dietaryRestrictions: includeDietaryRestrictions
      ? (user?.dietaryRestrictions ?? null)
      : null,
    includeNapkinsAndUtensils: orderDetails.includeNapkinsAndUtensils,
    subtotal: paymentDetails.subtotal,
    tax: paymentDetails.tax,
    tipPercentage: paymentDetails.tipPercentage,
    tipValue: paymentDetails.tipValue,
    total: paymentDetails.total,
    userId: user ? user.userId : null,
    orderItems: {
      create: orderItemsData,
    },
  };

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: orderData,
    });

    // Handle Gift Card Transaction
    if (giftCardUsage && giftCardUsage.length > 0) {
      for (const usage of giftCardUsage) {
        await tx.giftCard.update({
          where: { id: usage.id },
          data: {
            balance: { decrement: usage.amount },
            lastUsedAt: new Date(),
            transactions: {
              create: {
                amount: -usage.amount,
                type: "REDEMPTION",
                note: `Order ${createdOrder.id}`,
                orderId: createdOrder.id,
              },
            },
          },
        });
      }
    }

    // Add order to print queue
    await tx.orderPrintQueue.create({
      data: {
        orderId: createdOrder.id,
      },
    });

    // Cleanup transient order
    await tx.transientOrder.deleteMany({
      where: {
        userId: userId,
      },
    });

    return createdOrder;
  });

  // Send socket emit
  const socket = io(env.SOCKET_IO_URL, {
    query: {
      userId: "webhook",
    },
    secure: env.NODE_ENV === "production",
    retries: 3,
  });

  socket.on("connect", () => {
    console.log("Connected to socket.io server from createOrderInDb");
    socket.emit("newOrderPlaced", {
      orderId: order.id,
    });
  });

  // Wait a brief moment for the socket to connect and emit, then close
  setTimeout(() => {
    socket.close();
  }, 1000);

  // Send Email Receipt
  // TODO: Uncomment for production or when ready
  /*
  if (user?.allowsEmailReceipts) {
    await SendEmailReceipt({
      order,
      orderDetails,
      userIsAMember: true,
    });
  } else {
    const emailBlacklistValue = await prisma.blacklistedEmail.findFirst({
      where: {
        emailAddress: paymentMetadata.email,
      },
    });

    if (!emailBlacklistValue) {
      await SendEmailReceipt({
        order,
        orderDetails,
        userIsAMember: false,
      });
    }
  }
  */

  return order;
}

interface SendEmailReceiptParams {
  order: any; // Using any to avoid complex type matching with Prisma return type for now, or import Order
  orderDetails: OrderDetails;
  userIsAMember: boolean;
}

// Exporting this in case we need it elsewhere or want to move it later
export async function SendEmailReceipt({
  order,
  orderDetails,
  userIsAMember,
}: SendEmailReceiptParams) {
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
      menuItem: undefined,
      menuCategory: undefined,
    },
  });

  const discounts = rawDiscounts.reduce(
    (acc, discount) => {
      acc[discount.id] = discount;
      return acc;
    },
    {} as Record<string, Discount>,
  );

  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "khues.dev@gmail.com", // order.email,
      subject: "Your Order Receipt",
      react: Receipt({
        order: {
          ...order,
          orderItems: orderDetails.items.map((item) => ({
            ...item,
            id: item.itemId,
            orderId: order.id,
            menuItemId: item.itemId,
            customizationChoices: item.customizations
              ? Object.entries(item.customizations).map(
                  ([categoryId, choiceId]) => ({
                    categoryId,
                    choiceId,
                    choice: customizationChoices[choiceId],
                  }),
                )
              : [],
            discount: item.discountId ? discounts[item.discountId]! : null,
          })),
        },
        customizationChoices,
        discounts,
        userIsAMember,
        unsubscriptionToken: unsubscriptionToken.id,
      }),
    });

    if (error) {
      console.error(error);
    }
    console.log("Email sent", data);
  } catch (error) {
    console.error(error);
  }
}
