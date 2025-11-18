import type { JSX } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { type StaticImageData } from "next/image";
import SideAccentSwirls from "~/components/ui/SideAccentSwirls";
import StaticLotus from "~/components/ui/StaticLotus";
import { Button } from "~/components/ui/button";
import { cn } from "~/utils/shadcnuiUtils";

import { Charis_SIL } from "next/font/google";

const charis = Charis_SIL({
  subsets: ["latin"],
  weight: ["400", "700"],
});

import kare11MothersDay from "public/media/kare11MothersDay.jpg";
import starTribune from "public/media/starTribune.jpg";
import mpr from "public/media/mpr.jpg";
import kare11Logo from "public/media/kare11Logo.png";
import starTribuneLogo from "public/media/starTribuneLogo.png";
import mprLogo from "public/media/mprLogo.png";
import kare11CulinaryDream from "public/media/kare11CulinaryDream.png";
import WCCOLogo from "public/media/WCCOLogo";
import wccoImage from "public/media/wccoImage.png";
import heavyTableLogo from "public/media/heavyTableLogo.png";
import heavyTable from "public/media/heavyTable.jpg";
import top30StarTribune from "public/media/top30StarTribune.jpg";
import theTastingNotes from "public/media/theTastingNotes.jpg";
import theTastingNotesLogo from "public/media/theTastingNotesLogo.png";
import mspMagImage from "public/media/mspMagImage.jpg";
import mspMagLogo from "public/media/mspMagLogo.png";
import ericAndKhue from "public/media/ericAndKhue.jpg";

const mediaArticles: MediaCard[] = [
  {
    articleUrl:
      "https://mspmag.com/eat-and-drink/restaurant-review-homecoming-khues-kitchen/",
    imageSrc: mspMagImage,
    imageAlt:
      "Three plated dishes from Khue's Kitchen displayed on a wooden table: a Spicy Chicken Sandwich on a bun with lettuce, Crispy Pork Lettuce Wraps with dipping sauce, and a Grilled Thick-Cut Pork Chop topped with a fried egg and served with a fresh salad. A menu and glasses of wine are also on the table.",
    imageHeight: 335,
    brandUrl: "https://mspmag.com/",
    brandLogo: mspMagLogo,
    brandLogoAlt: "Mpls.St.Paul Magazine's logo",
    brandLogoWidth: 40.4,
    brandLogoHeight: 27.6,
    cardStyles: "pt-5",
    title: "A Homecoming for Khue's Kitchen",
    snippet:
      "At just 25, Eric Pham—son of the chef behind Minneapolis' beloved Quang—has forged his own path with Khue's Kitchen on the Minneapolis-St. Paul border. Overcoming family expectations and a devastating fire, Pham created a refined Vietnamese restaurant named for his mother, featuring Southern-style chicken wings, inventive vegan jicama ribs, thick pork chops, and a standout natural wine list. Khue's Kitchen is both a tribute to family tradition and a bold step forward, proving that fresh flavors and second beginnings can flourish side by side.",
    date: "8/24/2025",
  },
  {
    articleUrl:
      "https://thetastingnotes.co/khues-kitchen-resilience-and-flavor-in-equal-measure/",
    imageSrc: theTastingNotes,
    imageAlt:
      "Nighttime exterior image of the patio of Khue's Kitchen restaurant.",
    imageHeight: 325,
    brandUrl: "https://heavytable.com/",
    brandLogo: theTastingNotesLogo,
    brandLogoAlt: "The Tasting Note's logo",
    brandLogoWidth: 140,
    brandLogoHeight: 27,
    brandLogoStyles: "-ml-1 -mb-2",
    cardStyles: "pt-2",
    title: "Khue's Kitchen — Resilience and Flavor in Equal Measure",
    snippet:
      "Khue's Kitchen in St. Paul is a story of resilience and flavor. After a fire destroyed his first location, Chef Eric Pham reopened in a cozy shared kitchen, serving a focused menu inspired by his family's Quang Restaurant legacy. Highlights include crisp cream cheese wontons, a standout fried chicken sandwich, and unforgettable vegan jicama ribs. Warm hospitality and bold, balanced flavors make Khue's Kitchen a must-visit—proof that the best meals often come from second chances.",
    date: "8/13/2025",
  },
  {
    articleUrl:
      "https://www.startribune.com/the-30-restaurants-most-vital-to-the-twin-cities-area-right-now/601328163",
    imageSrc: top30StarTribune,
    imageAlt: "Sticky Jicama Ribs at Khue's Kitchen.",
    imageHeight: 305,
    brandUrl: "https://heavytable.com/",
    brandLogo: starTribuneLogo,
    brandLogoAlt: "Star Tribune's logo",
    brandLogoWidth: 150,
    brandLogoHeight: 35,
    brandLogoStyles: "-ml-5",
    cardStyles: "pt-3",
    title: "The 30 restaurants most vital to the Twin Cities area right now",
    snippet:
      "Eric Pham, of the legendary Quang family restaurant pedigree, is in pursuit of fresh flavors while ushering in a new era of Vietnamese cuisine: chile crisp-pork fried rice, a supper-club-style steak with a house marinade, Vietnamese coffee affogato topped with black sesame coconut crackers and more. Then there was the reimagined bánh mì xíu mại, a gigantic rice porcupine meatball that sits in a stewed tomato sauce...",
    date: "7/11/2025",
  },
  {
    articleUrl:
      "https://heavytable.substack.com/i/160888645/now-open-up-to-months",
    imageSrc: heavyTable,
    imageAlt: "Outdoor sign on the patio of Khue's Kitchen restaurant.",
    imageHeight: 314,
    brandUrl: "https://heavytable.com/",
    brandLogo: heavyTableLogo,
    brandLogoAlt: "Heavy Table's logo",
    brandLogoWidth: 62,
    brandLogoHeight: 29,
    cardStyles: "pt-5",
    title: "Vietnamese Food Beyond the Usual",
    snippet:
      "Khue's Kitchen offers a deeply personal exploration of Vietnamese food, shaped by Chef Eric Pham's upbringing as the son of immigrants and his desire to champion the dishes of his Vietnamese-American experience. Moving beyond common expectations, Pham presents a menu that's authentic to his story—where traditional flavors meet new contexts, influenced by adaptation, necessity, and childhood preferences.",
    date: "4/11/2025",
  },
  {
    articleUrl:
      "https://www.kare11.com/article/news/local/eric-phams-culinary-dream-reignites-khues-kitchen-st-paul/89-9b917801-8af4-431c-adc4-50ffa1a87a42",
    imageSrc: kare11CulinaryDream,
    imageAlt:
      "Chef Eric Pham, wearing a white chef's coat and apron, seated inside the dining room of Khue's Kitchen while discussing the reopening after a devastating fire.",
    imageHeight: 288,
    brandUrl: "https://www.kare11.com/",
    brandLogo: kare11Logo,
    brandLogoAlt: "Kare 11's logo",
    brandLogoWidth: 86,
    brandLogoHeight: 40,
    cardStyles: "pt-5",
    title:
      "Eric Pham's culinary dream reignites with Khue's Kitchen in St. Paul",
    snippet:
      "Eric Pham overcame a devastating fire just days before his first restaurant was set to open. Now, he's reignited his culinary dream in St. Paul with Khue's Kitchen—named for his mother, Khue Pham—where he's showcasing new dishes like jicama ribs and homemade desserts alongside his signature fried chicken sandwich.",
    date: "3/11/2025",
  },
  {
    articleUrl:
      "https://www.cbsnews.com/minnesota/news/khues-kitchen-reopens-midcity-kitchen/",
    imageSrc: wccoImage,
    imageAlt:
      "Chef Eric Pham, in a white chef's coat and apron, standing in the dining room of Khue's Kitchen and gesturing as he describes his restaurant's comeback story.",
    imageHeight: 288,
    brandUrl: "https://www.cbsnews.com/minnesota/",
    BrandLogoComponent: <WCCOLogo className="mb-1 h-[85px] w-[110px]" />,
    brandLogoAlt: "WCCO's logo",
    cardStyles: "pt-5",
    title:
      "Khue's Kitchen reopens seven months after fire destroyed the restaurant",
    snippet:
      "Eric Pham nearly gave up on his restaurant dreams when a fire destroyed his first location weeks before opening. Thanks to community support, he has now reopened Khue's Kitchen inside MidCity Kitchen in St. Paul, where he plans to stay long-term serving his signature chicken sandwich and authentic Vietnamese dishes.",
    date: "3/9/2025",
  },
  {
    articleUrl:
      "https://www.mprnews.org/story/2023/12/27/appetites-looks-back-on-2023-restaurants-vietnamese-meatballs-and-the-secret-to-entertaining",
    imageSrc: mpr,
    imageAlt:
      "Chef Eric Pham, owner of Khue's Kitchen, smiling while cooking in a professional kitchen.",
    imageHeight: 288,
    brandUrl: "https://www.mprnews.org/",
    brandLogo: mprLogo,
    brandLogoAlt: "MPR's logo",
    brandLogoWidth: 110,
    brandLogoHeight: 85,
    brandLogoStyles: "mb-1",
    cardStyles: "pt-5",
    title: "Eric Pham of the Quang Restaurant family",
    snippet:
      "Eric Pham grew up in Minneapolis' Quang Restaurant family. Now a chef in his own right, he talked to Tom Crann about opening his own place — Khue's Kitchen, named for his mom Khue Pham — and showed us how he makes his favorite dish: bánh mì xíu mại, Vietnamese meatball sandwiches.",
    date: "12/27/2023",
  },
  {
    articleUrl:
      "https://www.startribune.com/how-these-moms-shaped-the-next-generation-of-great-twin-cities-restaurateurs/600273728/?refresh=true",
    imageSrc: starTribune,
    imageAlt:
      "Khue Pham, lead chef at Quang Restaurant, smiling and posing with her young son, Eric Pham, both dressed formally.",
    imageHeight: 300,
    brandUrl: "https://www.startribune.com/",
    brandLogo: starTribuneLogo,
    brandLogoAlt: "Star Tribune's logo",
    brandLogoWidth: 150,
    brandLogoHeight: 35,
    brandLogoStyles: "-ml-5",
    cardStyles: "pt-2",
    title: "These 4 Twin Cities area restaurateurs learned from the best: Mom",
    snippet:
      "For Khue Pham, the restaurant business is inextricable from sacrifice. Her mother, Lung Tran, was just 36 when her father, Quang, died unexpectedly. With six kids to raise, there was little time to sit in her grief. Instead, she built a restaurant that endures as an iconic Minneapolis institution: Quang. 'I remember sleeping on a cot in the restaurant because I was so tired I couldn't drive,' said Khue. She and her...",
    date: "10/10/2023",
  },
  {
    articleUrl:
      "https://www.kare11.com/article/news/local/mpls-chef-credits-his-mom-for-inspiration/89-0f237053-85cf-48ae-96f7-8cbebb780555",
    imageSrc: kare11MothersDay,
    imageAlt:
      "Khue Pham, lead chef at Quang Restaurant in Minneapolis, converses with her two sons in the kitchen.",
    brandUrl: "https://www.kare11.com/",
    imageHeight: 256,
    brandLogo: kare11Logo,
    brandLogoAlt: "Kare 11's logo",
    brandLogoWidth: 86,
    brandLogoHeight: 40,
    title: "Minneapolis chef credits his mom for inspiration",
    snippet:
      "The Quang Restaurant is synonymous with Eat Street. The popular Vietnamese restaurant located in Minneapolis has been serving authentic Vietnamese cuisine for over 30 years. It was opened by the Pham family, who immigrated to the U.S. after the Vietnam War...",
    date: "10/14/2023",
  },
];

function Media() {
  return (
    <motion.div
      key={"media"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="baseVertFlex min-h-[calc(100dvh-5rem)] w-full !justify-start tablet:min-h-[calc(100dvh-6rem)]"
    >
      {/* Hero */}
      <div className="baseFlex relative h-56 w-full overflow-hidden bg-darkPrimary shadow-md tablet:h-72">
        {/* Image mosaic background */}
        <div className="absolute inset-0 grid h-56 w-full grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1 tablet:h-72">
          <Image
            src={kare11CulinaryDream}
            alt="Chef Eric Pham, wearing a white chef's coat and apron, seated inside the dining room of Khue's Kitchen while discussing the reopening after a devastating fire."
            fill
            priority
            className="!relative !size-full object-cover object-top opacity-20"
          />

          <Image
            src={ericAndKhue}
            alt="Chef Eric Pham standing and smiling together with his mother, Khue."
            fill
            priority
            className="!relative !size-full object-cover object-top opacity-20"
          />

          <Image
            src={starTribune}
            alt="Khue Pham and young Eric Pham."
            fill
            priority
            className="!relative !size-full object-cover object-top opacity-20"
          />

          <Image
            src={kare11MothersDay}
            alt="Khue Pham in conversation with family."
            fill
            priority
            className="!relative !size-full object-cover object-top opacity-20"
          />
        </div>

        <div className="baseFlex z-10 mx-8 rounded-md bg-offwhite p-4 shadow-heroContainer tablet:!flex">
          <div className="baseFlex gap-2 text-xl font-semibold text-primary tablet:p-2 desktop:text-2xl">
            <SideAccentSwirls className="h-4 scale-x-[-1] fill-primary desktop:h-5" />
            <h1 className={`${charis.className}`}>Media</h1>
            <SideAccentSwirls className="h-4 fill-primary desktop:h-5" />
          </div>
        </div>
      </div>

      {/* Mobile / Tablet grid */}
      <div className="relative grid w-80 grid-cols-1 gap-8 py-16 pb-24 md:w-[700px] md:grid-cols-2 md:gap-8 xl:!hidden">
        {mediaArticles.map((article) => (
          <MediaCard key={article.title} {...article} />
        ))}
      </div>

      {/* Desktop layout */}
      <div className="baseVertFlex relative !hidden w-[1200px] gap-16 py-16 pb-24 xl:!flex">
        {mediaArticles.map((article) => (
          <div
            key={article.title}
            className="baseFlex h-min w-full rounded-md border shadow-md"
          >
            {/* Left side text content */}
            <div
              className={`${cn("baseVertFlex relative w-full !items-start gap-2 overflow-hidden hyphens-auto rounded-l-md bg-offwhite p-6 pb-8 pt-3", article.cardStyles)}`}
            >
              <StaticLotus className="absolute -right-5 -top-5 size-16 rotate-[-135deg] fill-primary/50" />
              <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />
              {/* Regular brand logo */}
              {article.brandLogo && (
                <Button variant={"text"} className="!p-0" asChild>
                  <a
                    href={article.brandUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={article.brandLogo}
                      alt={article.brandLogoAlt ?? ""}
                      width={article.brandLogoWidth}
                      height={article.brandLogoHeight}
                      className={article.brandLogoStyles}
                    />
                  </a>
                </Button>
              )}

              {/* SVG brand logo */}
              {article.BrandLogoComponent && (
                <Button variant={"text"} className="!p-0" asChild>
                  <a
                    href={article.brandUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article.BrandLogoComponent}
                  </a>
                </Button>
              )}
              {/* Title, snippet, and link */}
              <p className="pb-2 text-lg font-semibold">{article.title}</p>
              <p>{article.snippet}</p>
              <div className="baseFlex mt-2 w-full !justify-between">
                <Button variant={"link"} className="h-8 !p-0" asChild>
                  <a
                    href={article.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read more
                  </a>
                </Button>
                <p className="text-sm italic text-stone-400">{article.date}</p>
              </div>
            </div>

            {/* Right side image */}
            <Button variant={"text"} asChild>
              <a
                href={article.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  height: `${article.imageHeight}px`,
                }}
                className="baseVertFlex relative w-[650px] !rounded-l-none rounded-r-md bg-primary !p-0 shadow-md"
              >
                <Image
                  src={article.imageSrc}
                  alt={article.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 650px, 650px"
                  className="!relative !h-full rounded-r-md bg-offwhite object-cover"
                />
              </a>
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default Media;

interface MediaCard {
  articleUrl: string;
  imageSrc: StaticImageData; // or type: StaticImageData if using Next.js images
  imageAlt: string;
  imageHeight: number;
  brandUrl: string;
  brandLogo?: StaticImageData; // if brandLogo is an image
  brandLogoAlt: string;
  brandLogoWidth?: number;
  brandLogoHeight?: number;
  brandLogoStyles?: string;
  BrandLogoComponent?: JSX.Element; // if brandLogo is an SVG component
  cardStyles?: string;
  title: string;
  snippet: string;
  date: string;
}

function MediaCard({
  articleUrl,
  imageSrc,
  imageAlt,
  imageHeight,
  brandUrl,
  brandLogo,
  brandLogoAlt,
  brandLogoWidth,
  brandLogoHeight,
  brandLogoStyles,
  BrandLogoComponent,
  cardStyles,
  title,
  snippet,
  date,
}: MediaCard) {
  return (
    <div className="baseVertFlex h-min w-full !justify-start rounded-md border shadow-md">
      <Button variant={"text"} asChild>
        <a
          href={articleUrl}
          className="baseVertFlex relative z-10 !size-full rounded-t-md bg-primary !p-0 shadow-md"
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            className="!relative rounded-t-md bg-offwhite"
            // sizes="(max-width: 1000px) 400px, 320px"
            priority
          />
        </a>
      </Button>

      <div className="baseVertFlex relative w-full !items-start gap-2 overflow-hidden hyphens-auto rounded-b-md bg-offwhite px-4 pb-12 pt-3">
        {/* Decorative Lotuses */}
        <StaticLotus className="absolute -bottom-5 -right-5 size-16 rotate-[-45deg] fill-primary/50" />
        <StaticLotus className="absolute -bottom-5 -left-5 size-16 rotate-[45deg] fill-primary/50" />

        {/* Brand Logo or some brand component */}
        <Button variant={"text"} className="!p-0" asChild>
          <a href={brandUrl} target="_blank" rel="noopener noreferrer">
            {/* If brandLogo is an image: */}
            {brandLogo && (
              <Image
                src={brandLogo}
                alt={brandLogoAlt}
                width={brandLogoWidth}
                height={brandLogoHeight}
                className={brandLogoStyles}
              />
            )}
            {/* Or handle an SVG brand component case here */}
            {BrandLogoComponent && BrandLogoComponent}
          </a>
        </Button>

        <p className="pb-2 text-lg font-semibold">{title}</p>

        <p className="">{snippet}</p>

        <div className="baseFlex mt-2 w-full !justify-between">
          <Button variant={"link"} className="h-8 !p-0" asChild>
            <a href={articleUrl} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </Button>
          <p className="text-sm italic text-stone-400">{date}</p>
        </div>
      </div>
    </div>
  );
}
