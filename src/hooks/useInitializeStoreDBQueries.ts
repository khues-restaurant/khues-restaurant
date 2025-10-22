import { useEffect } from "react";
import useGetUserId from "~/hooks/useGetUserId";
import { type StoreMenuItems, useMainStore } from "~/stores/MainStore";
import { api } from "~/utils/api";

function useInitializeStoreDBQueries() {
  const userId = useGetUserId();

  const {
    setMenuItems,
    customizationChoices,
    setCustomizationChoices,
    setRewards,
    discounts,
    setDiscounts,
    setUserFavoriteItemIds,
    refetchMenu,
    setRefetchMenu,
    refetchMinOrderPickupTime,
    setRefetchMinOrderPickupTime,
    setHoursOfOperation,
    setHolidays,
  } = useMainStore((state) => ({
    setMenuItems: state.setMenuItems,
    customizationChoices: state.customizationChoices,
    setCustomizationChoices: state.setCustomizationChoices,
    setRewards: state.setRewards,
    discounts: state.discounts,
    setDiscounts: state.setDiscounts,
    setUserFavoriteItemIds: state.setUserFavoriteItemIds,
    refetchMenu: state.refetchMenu,
    setRefetchMenu: state.setRefetchMenu,
    refetchMinOrderPickupTime: state.refetchMinOrderPickupTime,
    setRefetchMinOrderPickupTime: state.setRefetchMinOrderPickupTime,
    setHoursOfOperation: state.setHoursOfOperation,
    setHolidays: state.setHolidays,
  }));

  const { data: initStoreDBQueries } = api.storeDBQueries.getAll.useQuery(
    {
      userId: userId,
    },
    {
      enabled: !!userId,
    },
  );

  const { refetch: getUpdatedMenuCategories } =
    api.menuCategory.getAll.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const { refetch: getUpdatedMinOrderPickupTime } =
    api.minimumOrderPickupTime.get.useQuery(undefined, {
      refetchOnWindowFocus: false,
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
    if (!initStoreDBQueries?.menuCategories) return;

    const menuItems = initStoreDBQueries.menuCategories.flatMap(
      (category) => category.menuItems,
    );

    const menuItemsObject = menuItems.reduce((acc, menuItem) => {
      acc[menuItem.id] = menuItem;
      return acc;
    }, {} as StoreMenuItems);

    setMenuItems(menuItemsObject);
  }, [initStoreDBQueries?.menuCategories, setMenuItems]);

  useEffect(() => {
    if (!initStoreDBQueries?.rewardMenuCategories) return;

    setRewards(initStoreDBQueries.rewardMenuCategories);
  }, [initStoreDBQueries?.rewardMenuCategories, setRewards]);

  useEffect(() => {
    if (!initStoreDBQueries?.userFavoriteItemIds) return;

    setUserFavoriteItemIds(initStoreDBQueries.userFavoriteItemIds);
  }, [initStoreDBQueries?.userFavoriteItemIds, setUserFavoriteItemIds]);

  useEffect(() => {
    if (
      !initStoreDBQueries?.customizationChoices ||
      !initStoreDBQueries?.discounts
    )
      return;

    setCustomizationChoices(initStoreDBQueries?.customizationChoices);
    setDiscounts(initStoreDBQueries?.discounts);
  }, [
    customizationChoices,
    setCustomizationChoices,
    discounts,
    setDiscounts,
    initStoreDBQueries?.customizationChoices,
    initStoreDBQueries?.discounts,
  ]);

  useEffect(() => {
    if (!initStoreDBQueries?.hoursOfOperation) return;

    setHoursOfOperation(initStoreDBQueries.hoursOfOperation);
  }, [initStoreDBQueries?.hoursOfOperation, setHoursOfOperation]);

  useEffect(() => {
    if (!initStoreDBQueries?.holidays) return;

    setHolidays(initStoreDBQueries.holidays);
  }, [initStoreDBQueries?.holidays, setHolidays]);
}

export default useInitializeStoreDBQueries;
