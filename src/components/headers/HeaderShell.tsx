import DesktopHeader from "~/components/headers/DesktopHeader";
import MobileHeader from "~/components/headers/MobileHeader";

function HeaderShell() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="tablet:!hidden">
        <MobileHeader />
      </div>

      <div className="!hidden tablet:!block">
        <DesktopHeader />
      </div>
    </header>
  );
}

export default HeaderShell;
