import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "~/components/ui/button";

function Privacy() {
  return (
    <motion.div
      key={"privacy"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex min-h-[calc(100dvh-5rem)] w-full !justify-start tablet:min-h-[calc(100dvh-6rem)]"
    >
      <div className="mx-auto mb-32 mt-8 max-w-2xl p-6 tablet:mb-24">
        <h1 className="mb-6 text-2xl font-bold tablet:text-3xl">
          Privacy Policy
        </h1>
        <p className="mb-4">
          <span className="font-semibold">Effective Date:</span> May 15th, 2024
        </p>

        <p className="mb-4">
          Khue&apos;s (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is
          committed to protecting your privacy. This Privacy Policy explains how
          we collect, use, disclose, and safeguard your information when you
          visit our website
          <Button variant="link" className="h-6 !px-1" asChild>
            <Link prefetch={false} href="/">
              khueskitchen.com
            </Link>
          </Button>
          , use our services, and interact with our platform. Please read this
          policy carefully to understand our practices regarding your personal
          information.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          1. Information We Collect
        </h2>
        <p className="mb-4">
          We collect the following information from you when you use our website
          or services:
        </p>
        <ul className="baseVertFlex mb-4 list-inside list-disc !items-start gap-2">
          <li>
            <span className="font-semibold">Personal Information:</span> When
            you create an account, order food, or interact with our services, we
            may collect personal information, including your first and last
            name, phone number, email address, and birthdate.
          </li>
          <li>
            <span className="font-semibold">Order Information:</span> We keep
            track of all orders made through our website, including items
            ordered, order history, and any related rewards.
          </li>
          <li>
            <span className="font-semibold">Usage Data:</span> We collect
            anonymized data through Vercel&apos;s built-in Web Analytics and
            Page Speed Insights. This data does not identify you personally and
            is used to improve our website performance.
          </li>
          <li>
            <span className="font-semibold">Cookies:</span> Clerk, our
            authentication provider, uses cookies to manage user sessions. You
            can manage cookie preferences through your browser settings.
          </li>
        </ul>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          2. How We Use Your Information
        </h2>
        <p className="mb-4">
          We use the information we collect for the following purposes:
        </p>
        <ul className="baseVertFlex mb-4 list-inside list-disc !items-start gap-2">
          <li>
            To provide and maintain our services, including processing orders
            and managing your account.
          </li>
          <li>
            To communicate with you about your account, orders, and other
            updates.
          </li>
          <li>To personalize your experience and improve our services.</li>
          <li>To analyze usage patterns and improve website performance.</li>
          <li>To comply with legal obligations and enforce our terms.</li>
        </ul>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          3. How We Share Your Information
        </h2>
        <p className="mb-4">
          We do not sell your personal information. We may share your
          information with third parties in the following circumstances:
        </p>
        <ul className="baseVertFlex mb-4 list-inside list-disc !items-start gap-2">
          <li>
            <span className="font-semibold">Service Providers:</span> We use
            third-party services such as Clerk for authentication, Stripe for
            payment processing, and Resend for email communications. These
            service providers have their own privacy policies and terms of use.
          </li>
          <li>
            <span className="font-semibold">Legal Requirements:</span> We may
            disclose your information if required to do so by law or in response
            to valid requests by public authorities.
          </li>
        </ul>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          4. Data Retention
        </h2>
        <p className="mb-4">
          We retain your personal information for as long as your account is
          active or as needed to provide you with our services. Order history is
          kept indefinitely for your reference. If you delete your account, we
          will delete or anonymize your personal information across our services
          (including but not limited to Clerk, Stripe, and our database).
          However, your order history will be retained for historical and
          analytical purposes.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          5. Children&apos;s Privacy
        </h2>
        <p className="mb-4">
          We do not knowingly collect personal information from children under
          the age of 13. If you are under 13, you are not permitted to create an
          account or use our services. If we become aware that we have
          inadvertently collected personal information from a child under 13, we
          will take steps to delete such information.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          6. Data Security
        </h2>
        <p className="mb-4">
          We implement appropriate security measures to protect your personal
          information. Our security practices include encryption, access
          controls, and regular security assessments. However, no method of
          transmission over the internet or electronic storage is 100% secure.
          While we strive to use commercially acceptable means to protect your
          information, we cannot guarantee its absolute security.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          7. International Users
        </h2>
        <p className="mb-4">
          Our website is intended for use only within the United States. Access
          to our website from outside the United States is restricted and not
          permitted. By using our services, you agree to comply with this
          limitation.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          8. User Rights
        </h2>
        <p className="mb-4">
          You have the right to access, rectify, delete, and restrict the
          processing of your personal data. To exercise these rights, please
          contact us at{" "}
          <Button variant="link" className="h-6 !px-1" asChild>
            <a href="mailto:khueskitchen@gmail.com">khueskitchen@gmail.com</a>
          </Button>
          . We will respond to your request within a reasonable timeframe.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          9. Changes to This Privacy Policy
        </h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. If we make
          significant changes, we will notify you via email. Your continued use
          of our website and services after any changes indicates your
          acceptance of the new terms.
        </p>

        <h2 className="mb-4 text-xl font-semibold tablet:text-2xl">
          10. Contact Us
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
    </motion.div>
  );
}

export default Privacy;
