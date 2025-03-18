import Link from "next/link";
import { useEffect, useRef } from "react";
import { FaFacebook } from "react-icons/fa";
import { FaPhone, FaXTwitter } from "react-icons/fa6";
import { IoLogoInstagram } from "react-icons/io5";
import { MdOutlineMail } from "react-icons/md";
import { SiTiktok } from "react-icons/si";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useMainStore } from "~/stores/MainStore";

function Footer() {
  const { setFooterIsInView } = useMainStore((state) => ({
    setFooterIsInView: state.setFooterIsInView,
  }));

  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterIsInView(entry?.isIntersecting ?? false);
      },
      {
        root: null,
        rootMargin: "0px 0px 0px 0px",
        threshold: 0,
      },
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    const internalFooterRef = footerRef.current;

    return () => {
      if (internalFooterRef) {
        observer.unobserve(internalFooterRef);
      }

      // setFooterIsInView(false); // was this even necessary?
    };
  }, [setFooterIsInView]);

  return (
    <footer
      id="footer"
      ref={footerRef}
      className="baseVertFlex z-20 min-h-10 w-full gap-8 bg-gradient-to-br from-primary to-darkPrimary 
p-4 py-8 text-offwhite tablet:!flex-row tablet:!justify-between tablet:gap-0 tablet:py-4"
    >
      {/* contact info */}
      <div className="baseVertFlex gap-3 tablet:!items-start tablet:!justify-start tablet:gap-0">
        <p className="font-semibold underline underline-offset-2">Contact</p>
        <div className="baseVertFlex gap-1 tablet:!items-start tablet:!justify-start tablet:gap-0">
          <div className="baseFlex gap-2 tablet:gap-[9px]">
            <FaPhone size={"0.8rem"} className="tablet:ml-[1px]" />
            <Button variant="link" className="h-8 px-1" asChild>
              <a href="tel:+6126009139" className="!text-offwhite">
                (612) 600-9139
              </a>
            </Button>
          </div>
          <div className="baseFlex gap-2">
            <MdOutlineMail size={"0.95rem"} />
            <Button variant="link" className="h-8 px-1" asChild>
              <a
                href="mailto:khueskitchen@gmail.com"
                className="!text-offwhite"
              >
                khueskitchen@gmail.com
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* privacy policy + business copyright */}
      <div className="baseFlex order-3 gap-2 tablet:order-2">
        <Button variant={"link"} asChild>
          <Link href="/privacy" className="!text-offwhite">
            Privacy Policy
          </Link>
        </Button>

        <Separator className="mr-4 h-5 w-[1px]" />

        <p className="mr-4 text-sm tablet:mr-0">&copy; Khue&apos;s</p>
      </div>

      {/* socials */}
      <div className="baseVertFlex order-2 gap-[14px] tablet:order-3 tablet:!items-end tablet:!justify-between tablet:gap-2">
        <p className="font-semibold underline underline-offset-2">Socials</p>

        <div className="baseFlex gap-2">
          <Button variant="ghost" asChild>
            <a
              aria-label="Visit our Instagram page"
              href="https://www.instagram.com/khueskitchen/"
            >
              <IoLogoInstagram className="h-5 w-5 mobileLarge:h-6 mobileLarge:w-6" />
            </a>
          </Button>

          <Button variant="ghost" asChild>
            <a
              aria-label="Visit our Facebook page"
              href="https://www.facebook.com/khueskitchen/"
            >
              <FaFacebook className="h-5 w-5 mobileLarge:h-6 mobileLarge:w-6" />
            </a>
          </Button>

          <Button variant="ghost" asChild>
            <a
              aria-label="Visit our Tiktok page"
              href="https://www.tiktok.com/@khues_kitchen"
            >
              <SiTiktok className="h-5 w-5 mobileLarge:h-6 mobileLarge:w-6" />
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
