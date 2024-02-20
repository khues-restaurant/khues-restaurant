import Link from "next/link";
import { FaPhone } from "react-icons/fa6";
import { MdOutlineMail } from "react-icons/md";
import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoInstagram } from "react-icons/io5";
import { SiTiktok } from "react-icons/si";
import { Button } from "~/components/ui/button";

function Footer() {
  return (
    <div className="baseVertFlex tablet:!flex-row tablet:!justify-between tablet:gap-0 min-h-10 w-full gap-8  bg-gray-500 p-4">
      {/* contact info */}
      <div className="baseVertFlex tablet:!justify-start tablet:!items-start tablet:gap-0 gap-2">
        <p className="font-semibold underline underline-offset-2">Contact</p>
        <div className="baseVertFlex tablet:!justify-start tablet:!items-start">
          <div className="baseFlex gap-2">
            <FaPhone size={"0.75rem"} />
            <a href="tel:+1234567890">(234) 567-890</a>
          </div>
          <div className="baseFlex gap-2">
            <MdOutlineMail size={"0.95rem"} />
            <a
              href="mailto:example@example.com"
              target="_blank"
              rel="noreferrer"
            >
              example@example.com
            </a>
          </div>
        </div>
      </div>

      {/* privacy policy */}
      <Link
        href="/privacy-policy"
        className="tablet:order-2 order-3 underline underline-offset-2"
      >
        Privacy Policy
      </Link>

      {/* socials */}
      <div className="baseVertFlex tablet:order-3 tablet:!justify-end tablet:!items-end order-2 gap-2">
        <p className="font-semibold underline underline-offset-2">Socials</p>

        <div className="baseFlex gap-2">
          <Button variant="ghost" asChild>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <SiTiktok className="mobileLarge:w-6 mobileLarge:h-6 h-5 w-5" />
            </a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <IoLogoInstagram className="mobileLarge:w-6 mobileLarge:h-6 h-5 w-5" />
            </a>
          </Button>

          <Button variant="ghost" asChild>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FaFacebook className="mobileLarge:w-6 mobileLarge:h-6 h-5 w-5" />
            </a>
          </Button>

          <Button variant="ghost" asChild>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <FaXTwitter className="mobileLarge:w-6 mobileLarge:h-6 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Footer;
