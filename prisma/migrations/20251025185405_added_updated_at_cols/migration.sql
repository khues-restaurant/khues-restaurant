-- Add updatedAt columns to several tables, with default current timestamp and auto-update behavior.
-- Since PostgreSQL does not natively auto-update timestamps, Prisma handles @updatedAt in its client layer.

ALTER TABLE "MenuCategory"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE "MenuItem"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE "CustomizationCategory"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE "CustomizationChoice"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE "MenuItemCustomizationCategory"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE "User"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;