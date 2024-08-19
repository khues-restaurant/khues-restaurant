import { motion } from "framer-motion";
import Image from "next/image";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import { Button } from "~/components/ui/button";
import { IoChatbox } from "react-icons/io5";
import { Separator } from "~/components/ui/separator";
import { FaPhone } from "react-icons/fa6";
import { useMainStore } from "~/stores/MainStore";

import reservations from "/public/reservations/reservations.webp";
import noOrders from "/public/menuItems/myOrders.jpg";

import masonryInteriorOne from "/public/interior/one.webp";
import masonryInteriorTwo from "/public/interior/two.webp";
import masonryInteriorThree from "/public/interior/three.webp";
import masonryInteriorFour from "/public/interior/four.webp";

function Reservations() {
  const { chatIsOpen, setChatIsOpen } = useMainStore((state) => ({
    chatIsOpen: state.chatIsOpen,
    setChatIsOpen: state.setChatIsOpen,
  }));

  return (
    <motion.div
      key={"reservations"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex min-h-[calc(100dvh-6rem)] w-full !justify-start tablet:min-h-[calc(100dvh-7rem)]"
    >
      {/* Hero */}
      <div className="baseFlex relative h-56 w-full overflow-hidden bg-darkPrimary shadow-md tablet:h-72">
        <div className="absolute inset-0 grid h-56 w-full grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1 tablet:h-72">
          <Image
            src={masonryInteriorOne}
            alt="TODO"
            fill
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
            className="!relative !size-full object-cover object-top opacity-20"
          />
          <Image
            src={masonryInteriorTwo}
            alt="TODO"
            fill
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
            className="!relative !size-full object-cover object-top opacity-20"
          />
          <Image
            src={masonryInteriorThree}
            alt="TODO"
            fill
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
            className="!relative !size-full object-cover object-top opacity-20"
          />
          <Image
            src={masonryInteriorFour}
            alt="TODO"
            fill
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
            className="!relative !size-full object-cover object-top opacity-20"
          />
        </div>

        <div className="baseFlex z-10 mx-8 rounded-md bg-offwhite p-4 shadow-heroContainer tablet:!flex">
          <div className="baseFlex gap-2 text-xl font-semibold text-primary tablet:p-2 desktop:text-2xl">
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary desktop:h-5" />
            <h1>Reservations</h1>
            <SideAccentSwirls className="h-4 fill-primary desktop:h-5" />
          </div>
        </div>
      </div>

      <div className="baseVertFlex my-auto h-full max-w-sm gap-4 p-8 py-16 pb-32 xs:max-w-md tablet:max-w-3xl tablet:gap-8 tablet:pb-24">
        <Image
          src={reservations}
          alt={"TODO: fill in w/ appropriate alt text"}
          width={384}
          className="!relative !top-0 !size-full rounded-md object-cover tablet:hidden"
        />

        <Image
          src={noOrders}
          alt={"TODO: fill in w/ appropriate alt text"}
          sizes="(max-width: 640px) 80vw, 50vw"
          className="!hidden rounded-md shadow-md tablet:!flex"
        />

        <p className="text-lg font-medium">
          Planning a birthday dinner or get together with your friends?
        </p>

        <p className="tablet:text-center">
          Secure your spot for larger parties. For parties of 4 or less,
          reservations are usually not needed. However, to guarantee your seats
          for larger groups, please get in touch with us.
        </p>

        <div className="baseVertFlex mt-6 gap-4 xs:mt-4 xs:!flex-row">
          <Button
            className="baseFlex gap-2"
            onClick={() => setChatIsOpen(!chatIsOpen)}
          >
            Send us a message
            <IoChatbox className="size-4 drop-shadow-md" />
          </Button>

          <Separator
            orientation="vertical"
            className="mt-2 h-[1px] w-full bg-stone-400 xs:mt-0 xs:h-6 xs:w-[1px]"
          />

          <Button variant="link" className="h-8 px-1" asChild>
            <a href="tel:+1234567890" className="baseFlex gap-2">
              <FaPhone size={"0.75rem"} />
              (234) 567-8900
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default Reservations;
