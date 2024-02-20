import { type ReactNode } from "react";

interface Layout {
  children: ReactNode;
}

function TopProfileNavigationLayout({ children }: Layout) {
  // why not utilize getServerSideProps on these two instead of waiting for whole
  // page jsx to load?
  if (!isLoaded) {
    return null;
  }

  if (!userId) {
    return <UserIsNotAuthenticated />;
  }

  return (
    <motion.div
      key={"topProfileNavigationLayout"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex w-full"
    >
      <Tabs
        defaultValue={finalQueryOfUrl}
        value={tabValue}
        onValueChange={(value) => {
          setTabValue(value as "preferences" | "tabs" | "likes");
          pushToNewUrl(value as "preferences" | "tabs" | "likes");
        }}
        className="baseVertFlex my-12 w-full md:my-24"
      >
        <TabsList className="z-40 grid h-16 w-11/12 grid-cols-3 gap-2 md:h-10 md:w-[500px]">
          <TabsTrigger
            value="preferences"
            className="baseVertFlex w-full gap-2 md:!flex-row"
            onClick={() => {
              void push(`/profile/preferences`);
            }}
          >
            <IoSettingsOutline className="h-4 w-4 md:h-5 md:w-5" />
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="tabs"
            className="baseVertFlex w-full gap-2 md:!flex-row"
          >
            <FaGuitar className="h-4 w-4 md:h-5 md:w-5" />
            Tabs
          </TabsTrigger>
          <TabsTrigger
            value="likes"
            className="baseVertFlex w-full gap-2 md:!flex-row"
          >
            <AiOutlineHeart className="h-4 w-4 md:h-5 md:w-5" />
            Likes
          </TabsTrigger>
        </TabsList>
        <div className={`min-h-[100dvh] ${getDynamicWidth()}`}>
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </div>
      </Tabs>
    </motion.div>
  );
}
