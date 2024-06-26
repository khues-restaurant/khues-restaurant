import { Img, Text } from "@react-email/components";
import dynamicAssetUrls from "emails/utils/dynamicAssetUrls";

function Header() {
  const { baseUrl } = dynamicAssetUrls;

  return (
    <div className="relative rounded-t-lg bg-primary p-4">
      <Img
        src={`${baseUrl}/whiteLogo.png`}
        alt="Image of the Khue's logo."
        width="50"
        height="50"
      />
    </div>
  );
}

export default Header;

{
  /* <Text className="py-4 pl-4 text-2xl font-semibold text-offwhite">
  Khue&apos;s
</Text>; */
}
