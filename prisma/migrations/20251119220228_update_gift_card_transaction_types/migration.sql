/*
  Warnings:

  - The values [PURCHASE] on the enum `GiftCardTransactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GiftCardTransactionType_new" AS ENUM ('ACTIVATION_IN_STORE', 'ACTIVATION_ONLINE', 'REDEMPTION', 'RELOAD', 'REPLACEMENT_CREDIT', 'REPLACEMENT_DEBIT', 'MANUAL_ADJUSTMENT');
ALTER TABLE "GiftCardTransaction" ALTER COLUMN "type" TYPE "GiftCardTransactionType_new" USING ("type"::text::"GiftCardTransactionType_new");
ALTER TYPE "GiftCardTransactionType" RENAME TO "GiftCardTransactionType_old";
ALTER TYPE "GiftCardTransactionType_new" RENAME TO "GiftCardTransactionType";
DROP TYPE "public"."GiftCardTransactionType_old";
COMMIT;
