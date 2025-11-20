import { z } from "zod";

export const giftCardRecipientTypeValues = ["someoneElse", "myself"] as const;

export const giftCardRecipientTypeEnum = z.enum(giftCardRecipientTypeValues);

export type GiftCardRecipientType = z.infer<typeof giftCardRecipientTypeEnum>;

export const DEFAULT_GIFT_CARD_RECIPIENT_TYPE: GiftCardRecipientType =
  "someoneElse";
