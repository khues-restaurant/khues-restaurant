import { BiErrorCircle } from "react-icons/bi";

function UserIsNotAuthenticated() {
  return (
    <div
      className="baseVertFlex min-h-[calc(100dvh-6rem-73px)] w-full gap-4
tablet:min-h-[calc(100dvh-15rem-50px)]"
    >
      <div className="baseFlex gap-2">
        <BiErrorCircle className="size-8" />
        <h1 className="text-xl font-bold tablet:text-2xl">Access denied</h1>
      </div>
      <p className="text-center tablet:text-lg">
        You must be logged in to view this page.
      </p>
    </div>
  );
}

export default UserIsNotAuthenticated;
