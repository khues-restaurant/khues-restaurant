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
    <footer className="baseVertFlex text-offwhite z-20 min-h-10 w-full gap-8 bg-primary p-4 tablet:!flex-row tablet:!justify-between tablet:gap-0">
      {/* contact info */}
      <div className="baseVertFlex gap-2 tablet:!items-start tablet:!justify-start tablet:gap-0">
        <p className="font-semibold underline underline-offset-2">Contact</p>
        <div className="baseVertFlex tablet:!items-start tablet:!justify-start">
          <div className="baseFlex gap-2">
            <FaPhone size={"0.75rem"} />
            <Button variant="link" className="h-8 px-1" asChild>
              <a href="tel:+1234567890" className="!text-offwhite">
                (234) 567-8900
              </a>
            </Button>
          </div>
          <div className="baseFlex gap-2">
            <MdOutlineMail size={"0.95rem"} />
            <Button variant="link" className="h-8 px-1" asChild>
              <a
                href="mailto:example@example.com"
                target="_blank"
                rel="noreferrer"
                className="!text-offwhite"
              >
                example@example.com
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* privacy policy */}
      <Button variant={"link"} asChild>
        <Link
          href="/privacy-policy"
          className="!text-offwhite order-3 tablet:order-2"
        >
          Privacy Policy
        </Link>
      </Button>

      {/* socials */}
      <div className="baseVertFlex order-2 gap-2 tablet:order-3 tablet:!items-end tablet:!justify-end">
        <p className="font-semibold underline underline-offset-2">Socials</p>

        <div className="baseFlex gap-2">
          <Button variant="ghost" asChild>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <SiTiktok className="h-5 w-5 mobileLarge:h-6 mobileLarge:w-6" />
            </a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <IoLogoInstagram className="h-5 w-5 mobileLarge:h-6 mobileLarge:w-6" />
            </a>
          </Button>

          <Button variant="ghost" asChild>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FaFacebook className="h-5 w-5 mobileLarge:h-6 mobileLarge:w-6" />
            </a>
          </Button>

          <Button variant="ghost" asChild>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <FaXTwitter className="h-5 w-5 mobileLarge:h-6 mobileLarge:w-6" />
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
