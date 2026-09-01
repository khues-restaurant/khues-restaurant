import Link from "next/link";
import { Button } from "~/components/ui/button";

function Privacy() {
  return (
    <div className="baseVertFlex min-h-[calc(100dvh-5rem)] w-full !justify-start tablet:min-h-[calc(100dvh-6rem)]">
      <div className="mx-auto mb-32 mt-8 max-w-2xl p-6 tablet:mb-24">
        <h1 className="mb-6 text-2xl font-bold tablet:text-3xl">
          Privacy Policy
        </h1>
        <p className="mb-4">
          <span className="font-semibold">Effective Date:</span> August 31, 2026
        </p>

        <p className="mb-4">
          Khue&apos;s (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is
          committed to protecting your privacy. This Privacy Policy explains how
          we collect, use, and share information when you visit
          <Button variant="link" className="h-6 !px-1" asChild>
            <Link prefetch={false} href="/">
              khueskitchen.com
            </Link>
          </Button>
          . This website is a static informational site. Reservations, gift card
          purchases, and any other transactions are handled on third-party
          websites that have their own privacy policies.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          1. Information We Collect
        </h2>
        <p className="mb-4">
          We collect limited information through this website:
        </p>
        <ul className="baseVertFlex mb-4 list-inside list-disc !items-start gap-2">
          <li>
            <span className="font-semibold">
              Information you provide directly:
            </span>{" "}
            If you contact us by email, phone, or another direct channel, we may
            receive the information you choose to share with us.
          </li>
          <li>
            <span className="font-semibold">Technical information:</span> Our
            hosting and infrastructure providers may automatically log standard
            technical data such as IP address, browser type, device information,
            referring pages, and basic usage information.
          </li>
          <li>
            <span className="font-semibold">
              No site-managed accounts or orders:
            </span>{" "}
            This website does not provide on-site user accounts, customer
            profiles, or direct online ordering.
          </li>
        </ul>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          2. External Services
        </h2>
        <p className="mb-4">
          When you follow links from this website to make a reservation,
          purchase a gift card, or interact with another third-party service,
          your information is collected and processed by that third party under
          its own terms and privacy practices. We recommend reviewing those
          policies before submitting information.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          3. How We Use Information
        </h2>
        <p className="mb-4">
          We use information we receive to operate and improve the website,
          respond to messages you send us, monitor performance and security, and
          comply with legal obligations.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          4. How We Share Information
        </h2>
        <p className="mb-4">
          We do not sell personal information collected through this website. We
          may share information with service providers that host or secure the
          website, or when disclosure is required by law.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          5. Cookies and Browser Controls
        </h2>
        <p className="mb-4">
          This website does not use on-site account or session cookies for user
          profiles. Your browser and any third-party sites you visit from this
          website may use cookies or similar technologies. You can manage cookie
          settings through your browser controls.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          6. Data Retention
        </h2>
        <p className="mb-4">
          We retain direct communications you send us only for as long as needed
          to respond, maintain business records, or comply with legal
          obligations. This website does not maintain on-site customer account,
          order-history, or profile records.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          7. Data Security
        </h2>
        <p className="mb-4">
          We use reasonable administrative and technical measures to protect the
          website and the information we receive. No method of transmission or
          storage is completely secure, and we cannot guarantee absolute
          security.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          8. Changes to This Policy
        </h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. The updated
          version will be posted on this page with a revised effective date.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          9. Contact Us
        </h2>
        <p className="mb-4">
          If you have any questions or concerns about this Privacy Policy,
          please contact us at:
        </p>
        <p className="baseVertFlex mb-4 w-full !items-start">
          <span className="font-medium underline underline-offset-2">
            Khue&apos;s
          </span>
          <div className="baseFlex gap-2">
            Email address:
            <Button variant="link" className="h-6 !px-1" asChild>
              <a href="mailto:khueskitchen@gmail.com">khueskitchen@gmail.com</a>
            </Button>
          </div>
          <div className="baseFlex gap-2">
            Phone number:
            <Button variant="link" className="h-6 !px-1" asChild>
              <a href="tel:+16126009139">(612) 600-9139</a>
            </Button>
          </div>
        </p>
      </div>
    </div>
  );
}

export default Privacy;
