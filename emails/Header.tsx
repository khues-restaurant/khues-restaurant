import { Img } from "@react-email/components";
import dynamicAssetUrls from "emails/utils/dynamicAssetUrls";

function Header() {
  const { baseUrl } = dynamicAssetUrls;

  return (
    <div className="relative rounded-t-lg bg-primary py-4">
      <div className="!ml-4 h-[46px] w-[64px] rounded-xl bg-offwhite px-4 py-2">
        <Img
          src={`${baseUrl}/logo.png`}
          alt="Khue's logo"
          width="64" // is normally 192px
          height="46" // is normally 139px
        />
      </div>
    </div>
  );
}

export default Header;

{
  /* <Text className="py-4 pl-4 text-2xl font-semibold text-offwhite">
  Khue&apos;s
</Text>; */
}
