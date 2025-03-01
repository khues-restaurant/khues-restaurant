import Head from "next/head";

interface DynamicHeadJSON {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogUrl?: string;
  robots?: string;
}

function getDynamicHeadJSON(currentPath: string): DynamicHeadJSON {
  switch (currentPath) {
    // main routes
    case "/":
      return {
        title: "Khue's",
        description:
          "Discover the modern Vietnamese flavors at Khue's, where Chef Eric Pham brings a fresh perspective to traditional dishes inspired by his mother's legacy.",
        ogTitle: "Khue's",
        ogUrl: "https://www.khueskitchen.com",
      };
    case "/menu":
      return {
        title: "Menu | Khue's",
        description:
          "Explore our menu at Khue's, where Chef Eric Pham merges traditional Vietnamese recipes with modern culinary innovation. Indulge in signature dishes and seasonal specials that pay homage to his mother's legacy.",
        ogTitle: "Menu | Khue's",
        ogUrl: "https://www.khueskitchen.com/menu",
      };
    case "/reservations":
      return {
        title: "Reservations | Khue's",
        description:
          "Secure your reservations at Khue's Kitchen. Learn about our policies for larger parties and how to guarantee your spot for an unforgettable dining experience.",
        ogTitle: "Reservations | Khue's",
        ogUrl: "https://www.khueskitchen.com/reservations",
      };
    case "/our-story":
      return {
        title: "Our story | Khue's",
        description:
          "Discover the inspiring story behind Khue's, where Chef Eric Pham honors his mother's legacy through modern Vietnamese cuisine, blending tradition with innovation.",
        ogTitle: "Our story | Khue's",
        ogUrl: "https://www.khueskitchen.com/our-story",
      };
    case "/media":
      return {
        title: "Media | Khue's",
        description:
          "Explore Khue's Kitchen in the media, featuring interviews, articles, and videos showcasing Chef Eric Pham's culinary journey and Vietnamese cuisine.",
        ogTitle: "Media | Khue's",
        ogUrl: "https://www.khueskitchen.com/media",
      };
    case "/privacy":
      return {
        title: "Privacy | Khue's",
        description:
          "Khue's is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, and interact with our platform.",
        ogTitle: "Privacy | Khue's",
        ogUrl: "https://www.khueskitchen.com/privacy",
      };

    default:
      return {
        title: "Khue's",
        description:
          "Discover the modern Vietnamese flavors at Khue's, where Chef Eric Pham brings a fresh perspective to traditional dishes inspired by his mother's legacy.",
        ogTitle: "Khue's",
        ogUrl: "https://www.khueskitchen.com",
      };
  }
}

interface DynamicHead {
  currentPath: string;
}

function DynamicHead({ currentPath }: DynamicHead) {
  const dynamicHeadJSON = getDynamicHeadJSON(currentPath);

  return (
    <Head>
      {dynamicHeadJSON.title && <title>{dynamicHeadJSON.title}</title>}
      {dynamicHeadJSON.robots && (
        <meta name="robots" content={dynamicHeadJSON.robots} />
      )}
      {dynamicHeadJSON.description && (
        <meta name="description" content={dynamicHeadJSON.description} />
      )}
      {dynamicHeadJSON.ogUrl && (
        <link rel="canonical" href={dynamicHeadJSON.ogUrl} />
      )}
      {dynamicHeadJSON.ogTitle && (
        <meta property="og:title" content={dynamicHeadJSON.ogTitle}></meta>
      )}
      {dynamicHeadJSON.ogUrl && (
        <meta property="og:url" content={dynamicHeadJSON.ogUrl} />
      )}

      {dynamicHeadJSON.title && (
        <meta name="twitter:title" content={dynamicHeadJSON.title} />
      )}

      {dynamicHeadJSON.description && (
        <>
          <meta
            property="og:description"
            content={dynamicHeadJSON.description}
          />
          <meta
            name="twitter:description"
            content={dynamicHeadJSON.description}
          />
        </>
      )}

      {/* default tags */}
      <meta property="og:site_name" content="Khue's" />
      <meta property="og:type" content="website" />
      <meta
        property="og:image"
        content={`${window.location.origin}/openGraph/opengraphImage.png`}
      ></meta>
      <meta
        property="og:image:alt"
        content="Welcome to Khue's - A modern take on classic Vietnamese cuisine. The image features a welcoming character in traditional Vietnamese attire, set against a background showing Chef Eric Pham and his mother, Khue Pham."
      ></meta>
      <meta
        property="twitter:image"
        content={`${window.location.origin}/openGraph/opengraphImage.png`}
      />
      <meta property="twitter:card" content="summary_large_image" />
    </Head>
  );
}

export default DynamicHead;
