import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { validateOrderRouter } from "../validateOrder";
import { getMidnightCSTInUTC } from "~/utils/dateHelpers/cstToUTCHelpers";
import type { OrderDetails, Item } from "~/stores/MainStore";

const BASE_NOW = new Date("2025-05-02T18:00:00.000Z");
const BASE_PICKUP = new Date("2025-05-02T23:30:00.000Z");
const DEFAULT_USER_ID = "user-123";

const MOCK_MENU_CATEGORY = { active: true, orderableOnline: true };

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(BASE_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

type MockFn = ReturnType<typeof vi.fn>;

interface PrismaMock {
  hoursOfOperation: { findMany: MockFn };
  holiday: { findMany: MockFn };
  minimumOrderPickupTime: { findFirst: MockFn };
  numberOfOrdersAllowedPerPickupTimeSlot: { findFirst: MockFn };
  order: { count: MockFn; groupBy: MockFn };
  menuItem: { findMany: MockFn };
  customizationChoice: { findFirst: MockFn; findMany: MockFn };
  customizationCategory: { findFirst: MockFn };
  user: { findFirst: MockFn };
}

function createPrismaMock() {
  const mock: PrismaMock = {
    hoursOfOperation: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    holiday: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    minimumOrderPickupTime: {
      findFirst: vi
        .fn()
        .mockResolvedValue({ id: 1, value: new Date(BASE_PICKUP) }),
    },
    numberOfOrdersAllowedPerPickupTimeSlot: {
      findFirst: vi.fn().mockResolvedValue({ id: 1, value: 3 }),
    },
    order: {
      count: vi.fn().mockResolvedValue(0),
      groupBy: vi.fn().mockResolvedValue([]),
    },
    menuItem: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    customizationChoice: {
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    customizationCategory: {
      findFirst: vi.fn(),
    },
    user: {
      findFirst: vi.fn().mockResolvedValue({
        userId: DEFAULT_USER_ID,
        birthday: new Date("1990-05-20T00:00:00.000Z"),
        lastBirthdayRewardRedemptionYear: 1990,
      }),
    },
  };

  return { client: mock as unknown as PrismaClient, mock };
}

function createCaller(prismaClient: PrismaClient, userId = DEFAULT_USER_ID) {
  return validateOrderRouter.createCaller({
    prisma: prismaClient,
    auth: { userId } as any,
  });
}

function createOrderItem(overrides?: Partial<Item>): Item {
  const customizations = overrides?.customizations
    ? { ...overrides.customizations }
    : {};

  const base: Item = {
    id: 1,
    itemId: "menu-item-1",
    name: "Beef Pho",
    customizations: {},
    discountId: null,
    specialInstructions: "",
    includeDietaryRestrictions: false,
    quantity: 1,
    price: 1500,
    birthdayReward: false,
  };

  return {
    ...base,
    ...overrides,
    customizations,
  };
}

function cloneItems(items: Item[]) {
  return items.map((item) => ({
    ...item,
    customizations: { ...item.customizations },
  }));
}

function createOrderDetails(overrides?: Partial<OrderDetails>): OrderDetails {
  const items = overrides?.items ?? [createOrderItem()];

  return {
    datetimeToPickup: overrides?.datetimeToPickup
      ? new Date(overrides.datetimeToPickup)
      : new Date(BASE_PICKUP),
    items: cloneItems(items),
    tipPercentage: overrides?.tipPercentage ?? null,
    tipValue: overrides?.tipValue ?? 0,
    includeNapkinsAndUtensils: overrides?.includeNapkinsAndUtensils ?? false,
    discountId: overrides?.discountId ?? null,
    rewardBeingRedeemed: overrides?.rewardBeingRedeemed,
  };
}

describe("validateOrderRouter.validate", () => {
  it("returns null changes when the order is already valid", async () => {
    const { client, mock } = createPrismaMock();
    const orderDetails = createOrderDetails();
    const firstItem = orderDetails.items[0]!;

    mock.menuItem.findMany.mockResolvedValue([
      {
        id: firstItem.itemId,
        price: firstItem.price,
        available: true,
        isWeekendSpecial: false,
        menuCategory: MOCK_MENU_CATEGORY,
      },
    ]);

    const caller = createCaller(client);

    const result = await caller.validate({
      userId: DEFAULT_USER_ID,
      orderDetails,
    });

    expect(result.changedOrderDetails).toBeNull();
    expect(result.removedItemNames).toEqual([]);
  });

  it("moves pickup day forward when the original selection is in the past", async () => {
    const { client, mock } = createPrismaMock();
    const orderDetails = createOrderDetails({
      datetimeToPickup: new Date("2025-05-01T23:30:00.000Z"),
    });
    const firstItem = orderDetails.items[0]!;

    mock.menuItem.findMany.mockResolvedValue([
      {
        id: firstItem.itemId,
        price: firstItem.price,
        available: true,
        isWeekendSpecial: false,
        menuCategory: MOCK_MENU_CATEGORY,
      },
    ]);

    const caller = createCaller(client);
    const result = await caller.validate({
      userId: DEFAULT_USER_ID,
      orderDetails,
    });

    expect(result.changedOrderDetails).not.toBeNull();
    const expectedMidnight = getMidnightCSTInUTC(BASE_NOW);
    expect(result.changedOrderDetails?.datetimeToPickup.getTime()).toBe(
      expectedMidnight.getTime(),
    );
  });

  it("resets pickup time to the next valid day when before the minimum pickup time", async () => {
    const { client, mock } = createPrismaMock();
    const orderDetails = createOrderDetails();
    const firstItem = orderDetails.items[0]!;

    mock.minimumOrderPickupTime.findFirst.mockResolvedValue({
      id: 1,
      value: new Date("2025-05-02T23:45:00.000Z"),
    });

    mock.menuItem.findMany.mockResolvedValue([
      {
        id: firstItem.itemId,
        price: firstItem.price,
        available: true,
        isWeekendSpecial: false,
        menuCategory: MOCK_MENU_CATEGORY,
      },
    ]);

    const caller = createCaller(client);
    const result = await caller.validate({
      userId: DEFAULT_USER_ID,
      orderDetails,
    });

    const expectedMidnight = getMidnightCSTInUTC(BASE_NOW);
    expect(result.changedOrderDetails?.datetimeToPickup.getTime()).toBe(
      expectedMidnight.getTime(),
    );
  });

  it("removes weekend specials when the pickup day is not Friday or Saturday", async () => {
    const { client, mock } = createPrismaMock();
    const orderDetails = createOrderDetails({
      datetimeToPickup: new Date("2025-05-07T23:30:00.000Z"),
    });
    const firstItem = orderDetails.items[0]!;

    mock.menuItem.findMany.mockResolvedValue([
      {
        id: firstItem.itemId,
        price: firstItem.price,
        available: true,
        isWeekendSpecial: true,
        menuCategory: MOCK_MENU_CATEGORY,
      },
    ]);

    const caller = createCaller(client);
    const result = await caller.validate({
      userId: DEFAULT_USER_ID,
      orderDetails,
    });

    expect(result.removedItemNames).toEqual([firstItem.name]);
    expect(result.changedOrderDetails?.items).toEqual([]);
  });

  it("removes items that are unavailable or fail validation", async () => {
    const { client, mock } = createPrismaMock();
    const unavailableItem = createOrderItem({
      id: 1,
      itemId: "menu-item-unavailable",
      name: "Sold Out",
    });
    const mismatchedPriceItem = createOrderItem({
      id: 2,
      itemId: "menu-item-bad-price",
      name: "Bad Price",
      price: 1500,
    });

    const orderDetails = createOrderDetails({
      items: [unavailableItem, mismatchedPriceItem],
    });

    mock.menuItem.findMany.mockResolvedValue([
      {
        id: "menu-item-bad-price",
        price: 1400,
        available: true,
        isWeekendSpecial: false,
        menuCategory: MOCK_MENU_CATEGORY,
      },
    ]);

    const caller = createCaller(client);
    const result = await caller.validate({
      userId: DEFAULT_USER_ID,
      orderDetails,
    });

    expect(result.removedItemNames).toContain("Sold Out");
    expect(result.removedItemNames).toContain("Bad Price");
    expect(result.changedOrderDetails?.items).toEqual([]);
  });

  it("replaces invalid customization selections with the category default", async () => {
    const { client, mock } = createPrismaMock();
    const orderDetails = createOrderDetails({
      items: [
        createOrderItem({
          customizations: { "cat-1": "broken-choice" },
        }),
      ],
    });
    const firstItem = orderDetails.items[0]!;

    mock.menuItem.findMany.mockResolvedValue([
      {
        id: firstItem.itemId,
        price: firstItem.price,
        available: true,
        isWeekendSpecial: false,
        menuCategory: MOCK_MENU_CATEGORY,
      },
    ]);

    mock.customizationChoice.findFirst.mockImplementation(
      async ({ where }: { where?: { id?: string } }) => {
        if (where?.id === "broken-choice") {
          return null;
        }

        if (where?.id === "default-choice") {
          return { id: "default-choice", isAvailable: true };
        }

        return null;
      },
    );

    mock.customizationCategory.findFirst.mockResolvedValue({
      id: "cat-1",
      defaultChoiceId: "default-choice",
    });

    const caller = createCaller(client);
    const result = await caller.validate({
      userId: DEFAULT_USER_ID,
      orderDetails,
    });

    expect(result.changedOrderDetails?.items[0]?.customizations["cat-1"]).toBe(
      "default-choice",
    );
    expect(result.removedItemNames).toEqual([]);
  });

  it("falls back to the first available customization when the default is unavailable", async () => {
    const { client, mock } = createPrismaMock();
    const orderDetails = createOrderDetails({
      items: [
        createOrderItem({
          customizations: { "cat-2": "missing-choice" },
        }),
      ],
    });
    const firstItem = orderDetails.items[0]!;

    mock.menuItem.findMany.mockResolvedValue([
      {
        id: firstItem.itemId,
        price: firstItem.price,
        available: true,
        isWeekendSpecial: false,
        menuCategory: MOCK_MENU_CATEGORY,
      },
    ]);

    mock.customizationChoice.findFirst.mockImplementation(
      async ({ where }: { where?: { id?: string } }) => {
        if (where?.id === "missing-choice") {
          return null;
        }

        if (where?.id === "default-choice") {
          return { id: "default-choice", isAvailable: false };
        }

        return null;
      },
    );

    mock.customizationCategory.findFirst.mockResolvedValue({
      id: "cat-2",
      defaultChoiceId: "default-choice",
    });

    mock.customizationChoice.findMany.mockResolvedValue([
      { id: "first-available", isAvailable: true },
      { id: "second", isAvailable: false },
    ]);

    const caller = createCaller(client);
    const result = await caller.validate({
      userId: DEFAULT_USER_ID,
      orderDetails,
    });

    expect(result.changedOrderDetails?.items[0]?.customizations["cat-2"]).toBe(
      "first-available",
    );
    expect(result.removedItemNames).toEqual([]);
  });

  it("removes items when no valid customization choices remain", async () => {
    const { client, mock } = createPrismaMock();
    const orderDetails = createOrderDetails({
      items: [
        createOrderItem({
          name: "No Choices",
          customizations: { "cat-3": "invalid-choice" },
        }),
      ],
    });
    const firstItem = orderDetails.items[0]!;

    mock.menuItem.findMany.mockResolvedValue([
      {
        id: firstItem.itemId,
        price: firstItem.price,
        available: true,
        isWeekendSpecial: false,
        menuCategory: MOCK_MENU_CATEGORY,
      },
    ]);

    mock.customizationCategory.findFirst.mockResolvedValue({
      id: "cat-3",
      defaultChoiceId: "default-choice",
    });

    mock.customizationChoice.findFirst.mockImplementation(
      async ({ where }: { where?: { id?: string } }) => {
        if (where?.id === "invalid-choice") {
          return null;
        }

        if (where?.id === "default-choice") {
          return { id: "default-choice", isAvailable: false };
        }

        return null;
      },
    );

    mock.customizationChoice.findMany.mockResolvedValue([
      { id: "choice-a", isAvailable: false },
    ]);

    const caller = createCaller(client);
    const result = await caller.validate({
      userId: DEFAULT_USER_ID,
      orderDetails,
    });

    expect(result.removedItemNames).toEqual(["No Choices"]);
    expect(result.changedOrderDetails?.items).toEqual([]);
  });

  it("shifts to the next available pickup slot when the current slot is full", async () => {
    const { client, mock } = createPrismaMock();
    const orderDetails = createOrderDetails();
    const firstItem = orderDetails.items[0]!;

    mock.numberOfOrdersAllowedPerPickupTimeSlot.findFirst.mockResolvedValue({
      id: 1,
      value: 1,
    });

    mock.order.count.mockResolvedValue(1);

    mock.menuItem.findMany.mockResolvedValue([
      {
        id: firstItem.itemId,
        price: firstItem.price,
        available: true,
        isWeekendSpecial: false,
        menuCategory: MOCK_MENU_CATEGORY,
      },
    ]);

    const caller = createCaller(client);
    const result = await caller.validate({
      userId: DEFAULT_USER_ID,
      orderDetails,
    });

    expect(result.changedOrderDetails?.datetimeToPickup.getTime()).toBe(
      new Date("2025-05-02T23:45:00.000Z").getTime(),
    );
  });

  it("disables birthday rewards when the user is not eligible", async () => {
    const { client, mock } = createPrismaMock();
    const item = createOrderItem({ birthdayReward: true });
    const orderDetails = createOrderDetails({ items: [item] });
    const firstItem = orderDetails.items[0]!;

    mock.user.findFirst.mockResolvedValue({
      userId: DEFAULT_USER_ID,
      birthday: new Date("1990-01-01T00:00:00.000Z"),
      lastBirthdayRewardRedemptionYear: BASE_NOW.getFullYear(),
    });

    mock.menuItem.findMany.mockResolvedValue([
      {
        id: firstItem.itemId,
        price: firstItem.price,
        available: true,
        isWeekendSpecial: false,
        menuCategory: MOCK_MENU_CATEGORY,
      },
    ]);

    const caller = createCaller(client);
    const result = await caller.validate({
      userId: DEFAULT_USER_ID,
      orderDetails,
    });

    expect(result.changedOrderDetails?.items[0]?.birthdayReward).toBe(false);
  });

  it("returns validItems when validating a reorder and clears reward flags", async () => {
    const { client, mock } = createPrismaMock();
    const item = createOrderItem({ birthdayReward: true });
    const orderDetails = createOrderDetails({ items: [item] });

    mock.menuItem.findMany.mockResolvedValue([
      {
        id: item.itemId,
        price: item.price,
        available: true,
        isWeekendSpecial: false,
        menuCategory: MOCK_MENU_CATEGORY,
      },
    ]);

    const caller = createCaller(client);
    const result = await caller.validate({
      userId: DEFAULT_USER_ID,
      orderDetails,
      validatingAReorder: true,
    });

    if (!("validItems" in result)) {
      throw new Error("Expected reorder response with validItems");
    }

    const reorderResult = result as {
      validItems: Item[];
      removedItemNames: string[];
    };

    expect(reorderResult.validItems[0]?.birthdayReward).toBe(false);
    expect(reorderResult.removedItemNames).toEqual([]);
  });

  it("returns the order details when forceReturnOrderDetails is true", async () => {
    const { client, mock } = createPrismaMock();
    const orderDetails = createOrderDetails();
    const firstItem = orderDetails.items[0]!;

    mock.menuItem.findMany.mockResolvedValue([
      {
        id: firstItem.itemId,
        price: firstItem.price,
        available: true,
        isWeekendSpecial: false,
        menuCategory: MOCK_MENU_CATEGORY,
      },
    ]);

    const caller = createCaller(client);
    const result = await caller.validate({
      userId: DEFAULT_USER_ID,
      orderDetails,
      forceReturnOrderDetails: true,
    });

    expect(result.changedOrderDetails).toEqual(orderDetails);
  });
});
