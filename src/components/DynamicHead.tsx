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
          "Explore Khue's Kitchen in the media, featuring interviews, articles, and videos showcasing Chef Eric Pham's culinary journey and Vietnamese cuisine.",
        ogTitle: "Menu | Khue's",
        ogUrl: "https://www.khueskitchen.com/menu",
      };
    case "/order":
      return {
        title: "Order | Khue's",
        description:
          "Order directly from Khue's for exclusive benefits, including our lowest menu prices, priority processing, and rewards points towards free meals.",
        ogTitle: "Order | Khue's",
        ogUrl: "https://www.khueskitchen.com/order",
      };
    case "/reservations":
      return {
        title: "Reservations | Khue's",
        description:
          "Secure your reservations at Khue's Kitchen. Learn about our policies for larger parties and how to guarantee your spot for an unforgettable dining experience.",
        ogTitle: "Reservations | Khue's",
        ogUrl: "https://www.khueskitchen.com/reservations",
      };
    case "/rewards":
      return {
        title: "Rewards | Khue's",
        description:
          "Become a member of Khue's Rewards and enjoy exclusive benefits, from earning points towards free meals to special birthday treats and early access to new dishes.",
        ogTitle: "Rewards | Khue's",
        ogUrl: "https://www.khueskitchen.com/rewards",
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
    case "/payment-success":
      return {
        title: "Payment success | Khue's",
        ogTitle: "Payment success | Khue's",
        ogUrl: "https://www.khueskitchen.com/payment-sucess",
        robots: "noindex,nofollow",
      };
    case "/track":
      return {
        title: "Track | Khue's",
        ogTitle: "Track | Khue's",
        ogUrl: "https://www.khueskitchen.com/track",
        robots: "noindex,nofollow",
      };
    case "/privacy":
      return {
        title: "Privacy | Khue's",
        description:
          "Khue's is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, and interact with our platform.",
        ogTitle: "Privacy | Khue's",
        ogUrl: "https://www.khueskitchen.com/privacy",
      };
    case "unsubscribe":
      return {
        title: "Unsubscribe | Khue's",
        description:
          "Unsubscribe from Khue's email list to stop receiving updates on new dishes, special promotions, and exclusive events.",
        ogTitle: "Unsubscribe | Khue's",
        ogUrl: "https://www.khueskitchen.com/unsubscribe",
        robots: "noindex,nofollow",
      };

    // profile routes
    case "/profile/preferences":
      return {
        title: "Preferences | Khue's",
        description:
          "Manage your Khue's account preferences, including email subscriptions, notifications, and personal information.",
        ogTitle: "Preferences | Khue's",
        ogUrl: "https://www.khueskitchen.com/profile/preferences",
        robots: "noindex,nofollow",
      };
    case "/profile/rewards":
      return {
        title: "Rewards | Khue's",
        description:
          "Track your Khue's Rewards points, redeem rewards, and view your rewards history.",
        ogTitle: "Rewards | Khue's",
        ogUrl: "https://www.khueskitchen.com/profile/rewards",
        robots: "noindex,nofollow",
      };
    case "/profile/my-orders":
      return {
        title: "My orders | Khue's",
        description:
          "View your past orders, track your current orders, and access your order history.",
        ogTitle: "My orders | Khue's",
        ogUrl: "https://www.khueskitchen.com/profile/my-orders",
        robots: "noindex,nofollow",
      };

    // dashboard
    case "/dashboard":
      return {
        title: "Dashboard | Khue's",
        robots: "noindex,nofollow",
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
        // TODO: Change for production
        content={
          "https://khues-restaurant.vercel.app/openGraph/opengraphImage.png"
        }
      ></meta>
      <meta
        property="og:image:alt"
        content="Welcome to Khue's - A modern take on classic Vietnamese cuisine. The image features a welcoming character in traditional Vietnamese attire, set against a background of delicious Vietnamese dishes."
      ></meta>
      <meta
        property="twitter:image"
        content="https://khues-restaurant.vercel.app/openGraph/opengraphImage.png"
      />
      <meta property="twitter:card" content="summary_large_image" />
    </Head>
  );
}

export default DynamicHead;
