import type { Discount, Order, OrderItem } from "@prisma/client";

export interface OrderAppliedGiftCard {
  id: string;
  giftCardId: string;
  code: string;
  amount: number;
}

export type DBOrderSummaryItem = OrderItem & {
  customizations: Record<string, string>;
  discount: Discount | null;
};

export type DBOrderSummary = Order & {
  orderItems: DBOrderSummaryItem[];
  appliedGiftCards: OrderAppliedGiftCard[];
};
