-- CreateTable
CREATE TABLE "MinimumOrderPickupTime" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "value" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MinimumOrderPickupTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NumberOfOrdersAllowedPerPickupTimeSlot" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "value" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "NumberOfOrdersAllowedPerPickupTimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlacklistedEmail" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailAddress" TEXT NOT NULL,

    CONSTRAINT "BlacklistedEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailUnsubscriptionToken" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "emailAddress" TEXT NOT NULL,

    CONSTRAINT "EmailUnsubscriptionToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userFullName" TEXT NOT NULL DEFAULT 'Customer',
    "userHasUnreadMessages" BOOLEAN NOT NULL DEFAULT false,
    "dashboardHasUnreadMessages" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HoursOfOperation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dayOfWeek" INTEGER NOT NULL,
    "openHour" INTEGER NOT NULL,
    "openMinute" INTEGER NOT NULL,
    "closeHour" TEXT NOT NULL,
    "closeMinute" TEXT NOT NULL,
    "isClosedAllDay" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HoursOfOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(3) NOT NULL,
    "isRecurringAnnual" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "allowedToBePublic" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "menuItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FavoriteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuCategory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "orderableOnline" BOOLEAN NOT NULL DEFAULT true,
    "listOrder" SERIAL NOT NULL,
    "activeDiscountId" TEXT,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "altPrice" INTEGER,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "discontinued" BOOLEAN NOT NULL DEFAULT false,
    "listOrder" SERIAL NOT NULL,
    "menuCategoryId" TEXT NOT NULL,
    "activeDiscountId" TEXT,
    "isChefsChoice" BOOLEAN NOT NULL DEFAULT false,
    "isWeekendSpecial" BOOLEAN NOT NULL DEFAULT false,
    "isVegetarian" BOOLEAN NOT NULL DEFAULT false,
    "isVegan" BOOLEAN NOT NULL DEFAULT false,
    "isDairyFree" BOOLEAN NOT NULL DEFAULT false,
    "isGlutenFree" BOOLEAN NOT NULL DEFAULT false,
    "isSpicy" BOOLEAN NOT NULL DEFAULT false,
    "askServerForAvailability" BOOLEAN NOT NULL DEFAULT false,
    "showUndercookedOrRawDisclaimer" BOOLEAN NOT NULL DEFAULT false,
    "birthdayReward" BOOLEAN NOT NULL DEFAULT false,
    "reviews" TEXT,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomizationCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "defaultChoiceId" TEXT NOT NULL,
    "internalName" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CustomizationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomizationChoice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceAdjustment" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "listOrder" SERIAL NOT NULL,
    "customizationCategoryId" TEXT NOT NULL,

    CONSTRAINT "CustomizationChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItemCustomizationCategory" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "customizationCategoryId" TEXT NOT NULL,

    CONSTRAINT "MenuItemCustomizationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransientOrder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TransientOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialInstructions" TEXT NOT NULL,
    "includeDietaryRestrictions" BOOLEAN NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "discountId" TEXT,
    "birthdayReward" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemCustomization" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "customizationCategoryId" TEXT NOT NULL,
    "customizationChoiceId" TEXT NOT NULL,

    CONSTRAINT "OrderItemCustomization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderRefundedAt" TIMESTAMP(3),
    "orderStartedAt" TIMESTAMP(3),
    "orderCompletedAt" TIMESTAMP(3),
    "datetimeToPickup" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "includeNapkinsAndUtensils" BOOLEAN NOT NULL DEFAULT false,
    "dietaryRestrictions" TEXT,
    "discountId" TEXT,
    "subtotal" INTEGER NOT NULL,
    "tax" INTEGER NOT NULL,
    "tipPercentage" INTEGER,
    "tipValue" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "notableUserDescription" TEXT,
    "userLeftFeedback" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderPrintQueue" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "OrderPrintQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "stripeUserId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "dietaryRestrictions" TEXT NOT NULL,
    "autoApplyDietaryRestrictions" BOOLEAN NOT NULL DEFAULT false,
    "allowsEmailReceipts" BOOLEAN NOT NULL DEFAULT true,
    "allowsOrderCompleteEmails" BOOLEAN NOT NULL DEFAULT true,
    "allowsPromotionalEmails" BOOLEAN NOT NULL DEFAULT false,
    "allowsRewardAvailabilityReminderEmails" BOOLEAN NOT NULL DEFAULT false,
    "lastBirthdayRewardRedemptionYear" INTEGER NOT NULL DEFAULT 0,
    "currentOrder" JSONB,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlacklistedEmail_emailAddress_key" ON "BlacklistedEmail"("emailAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_userId_key" ON "Chat"("userId");

-- CreateIndex
CREATE INDEX "ChatMessage_chatId_idx" ON "ChatMessage"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_date_key" ON "Holiday"("date");

-- CreateIndex
CREATE INDEX "MenuItemCustomizationCategory_menuItemId_customizationCateg_idx" ON "MenuItemCustomizationCategory"("menuItemId", "customizationCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "TransientOrder_userId_key" ON "TransientOrder"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Order_datetimeToPickup_idx" ON "Order"("datetimeToPickup");

-- CreateIndex
CREATE INDEX "Discount_userId_idx" ON "Discount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeUserId_key" ON "User"("stripeUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteItem" ADD CONSTRAINT "FavoriteItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteItem" ADD CONSTRAINT "FavoriteItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_activeDiscountId_fkey" FOREIGN KEY ("activeDiscountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_menuCategoryId_fkey" FOREIGN KEY ("menuCategoryId") REFERENCES "MenuCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_activeDiscountId_fkey" FOREIGN KEY ("activeDiscountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomizationChoice" ADD CONSTRAINT "CustomizationChoice_customizationCategoryId_fkey" FOREIGN KEY ("customizationCategoryId") REFERENCES "CustomizationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemCustomizationCategory" ADD CONSTRAINT "MenuItemCustomizationCategory_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemCustomizationCategory" ADD CONSTRAINT "MenuItemCustomizationCategory_customizationCategoryId_fkey" FOREIGN KEY ("customizationCategoryId") REFERENCES "CustomizationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemCustomization" ADD CONSTRAINT "OrderItemCustomization_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemCustomization" ADD CONSTRAINT "OrderItemCustomization_customizationCategoryId_fkey" FOREIGN KEY ("customizationCategoryId") REFERENCES "CustomizationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemCustomization" ADD CONSTRAINT "OrderItemCustomization_customizationChoiceId_fkey" FOREIGN KEY ("customizationChoiceId") REFERENCES "CustomizationChoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPrintQueue" ADD CONSTRAINT "OrderPrintQueue_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

