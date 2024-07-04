import { motion } from "framer-motion";
import { MdBrowserUpdated } from "react-icons/md";
import { Separator } from "~/components/ui/separator";
import StaticLotus from "~/components/ui/StaticLotus";

function UnsupportedBrowserDetected() {
  return (
    <motion.div
      key={"UnsupportedBrowserDetected"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex h-screen w-full"
    >
      <div className="baseVertFlex relative max-w-80 gap-4 overflow-hidden rounded-lg border bg-gradient-to-br from-offwhite to-primary/10 px-6 py-8 shadow-md tablet:max-w-2xl tablet:p-12 tablet:pb-8">
        <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
        <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />

        <MdBrowserUpdated className="mb-4 size-10" />

        <Separator />

        <div className="baseVertFlex gap-4 pb-6">
          <p className="text-center font-medium">Unsupported Browser</p>

          <p className="text-center text-sm">
            It looks like you&apos;re using an outdated browser that does not
            support some of the required features on our site. To ensure the
            best experience on our site, please update your browser to the
            latest version or switch to a more modern browser like Google
            Chrome, Mozilla Firefox, Microsoft Edge, or Safari. Thank you!
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default UnsupportedBrowserDetected;
