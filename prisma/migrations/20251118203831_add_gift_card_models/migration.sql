-- CreateEnum
CREATE TYPE "GiftCardTransactionType" AS ENUM ('PURCHASE', 'RELOAD', 'REPLACEMENT_CREDIT', 'REPLACEMENT_DEBIT', 'MANUAL_ADJUSTMENT');


-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "isReplaced" BOOLEAN NOT NULL DEFAULT false,
    "replacedBy" TEXT,
    "userId" TEXT,


    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);


-- CreateTable
CREATE TABLE "GiftCardTransaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "type" "GiftCardTransactionType" NOT NULL,
    "note" TEXT,
    "giftCardId" TEXT NOT NULL,
    "orderId" TEXT,


    CONSTRAINT "GiftCardTransaction_pkey" PRIMARY KEY ("id")
);


-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");


-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE "GiftCardTransaction" ADD CONSTRAINT "GiftCardTransaction_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES "GiftCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE "GiftCardTransaction" ADD CONSTRAINT "GiftCardTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;


