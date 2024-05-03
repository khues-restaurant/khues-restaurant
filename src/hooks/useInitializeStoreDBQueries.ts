import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import useGetUserId from "~/hooks/useGetUserId";
import { type StoreMenuItems, useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";

function useInitializeStoreDBQueries() {
  const { isSignedIn } = useAuth();
  const userId = useGetUserId();

  const {
    setMenuItems,
    customizationChoices,
    setCustomizationChoices,
    discounts,
    setDiscounts,
    setUserFavoriteItemIds,
    refetchMenu,
    setRefetchMenu,
    refetchMinOrderPickupTime,
    setRefetchMinOrderPickupTime,
  } = useMainStore((state) => ({
    setMenuItems: state.setMenuItems,
    customizationChoices: state.customizationChoices,
    setCustomizationChoices: state.setCustomizationChoices,
    discounts: state.discounts,
    setDiscounts: state.setDiscounts,
    setUserFavoriteItemIds: state.setUserFavoriteItemIds,
    refetchMenu: state.refetchMenu,
    setRefetchMenu: state.setRefetchMenu,
    refetchMinOrderPickupTime: state.refetchMinOrderPickupTime,
    setRefetchMinOrderPickupTime: state.setRefetchMinOrderPickupTime,
  }));

  const { data: menuCategories, refetch: getUpdatedMenuCategories } =
    api.menuCategory.getAll.useQuery();

  const { refetch: getUpdatedMinOrderPickupTime } =
    api.minimumOrderPickupTime.get.useQuery();

  const { data: databaseCustomizationChoices } =
    api.customizationChoice.getAll.useQuery();

  const { data: databaseDiscounts } = api.discount.getAll.useQuery();

  const { data: userFavoriteItemIds } =
    api.favorite.getFavoriteItemIds.useQuery(userId, {
      enabled: Boolean(userId && isSignedIn),
    });

  useEffect(() => {
    if (refetchMenu && refetchMinOrderPickupTime) return;

    setRefetchMenu(getUpdatedMenuCategories);
    setRefetchMinOrderPickupTime(getUpdatedMinOrderPickupTime);
  }, [
    getUpdatedMenuCategories,
    getUpdatedMinOrderPickupTime,
    setRefetchMenu,
    setRefetchMinOrderPickupTime,
    refetchMenu,
    refetchMinOrderPickupTime,
  ]);

  useEffect(() => {
    if (!menuCategories) return;

    const menuItems = menuCategories.flatMap((category) => category.menuItems);

    const menuItemsObject = menuItems.reduce((acc, menuItem) => {
      acc[menuItem.id] = menuItem;
      return acc;
    }, {} as StoreMenuItems);

    setMenuItems(menuItemsObject);
  }, [menuCategories, setMenuItems]);

  useEffect(() => {
    if (!userFavoriteItemIds) return;

    setUserFavoriteItemIds(userFavoriteItemIds);
  }, [userFavoriteItemIds, setUserFavoriteItemIds]);

  useEffect(() => {
    if (
      (Object.keys(customizationChoices).length !== 0 &&
        Object.keys(discounts).length !== 0) ||
      !databaseCustomizationChoices ||
      !databaseDiscounts
    )
      return;

    setCustomizationChoices(databaseCustomizationChoices);

    setDiscounts(databaseDiscounts);
  }, [
    customizationChoices,
    setCustomizationChoices,
    discounts,
    setDiscounts,
    databaseCustomizationChoices,
    databaseDiscounts,
  ]);
}

export default useInitializeStoreDBQueries;
