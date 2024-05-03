import { type FullMenuItem } from "~/server/api/routers/menuCategory";
import { type StoreCustomizations } from "~/stores/MainStore";

export function getDefaultCustomizationChoices(
  item: FullMenuItem,
): StoreCustomizations {
  return item.customizationCategories.reduce((acc, category) => {
    // Attempt to find the default choice and check if it's available
    const defaultChoice = category.customizationChoices.find(
      (choice) => choice.id === category.defaultChoiceId,
    );

    if (defaultChoice && defaultChoice.isAvailable) {
      // If the default choice is available, use it
      acc[category.id] = defaultChoice.id;
    } else {
      // If not available, find the first available choice sorted by listOrder
      const sortedChoices = category.customizationChoices.sort(
        (a, b) => a.listOrder - b.listOrder,
      );
      const firstAvailableChoice = sortedChoices.find(
        (choice) => choice.isAvailable,
      );

      if (firstAvailableChoice) {
        // If an available choice is found, use it
        acc[category.id] = firstAvailableChoice.id;
      }
      // If no available choices are found, do not set any customization for this category
    }

    return acc;
  }, {} as StoreCustomizations);
}
