import {
  Body,
  Button,
  Column,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import Footer from "emails/Footer";
import { type MenuItem } from "@prisma/client";
import Decimal from "decimal.js";
import { container, main, tailwindConfig } from "emails/utils/styles";
import Header from "emails/Header";
import dynamicAssetUrls from "emails/utils/dynamicAssetUrls";

interface CloseToAReward {
  firstName: string;
  ableToRedeem: MenuItem[];
  closeToRedeeming: MenuItem[];
  userPoints: number;
  unsubscriptionToken: string;
}

function CloseToAReward(
  {
    // firstName,
    // ableToRedeem,
    // closeToRedeeming,
    // userPoints,
    // unsubscriptionToken,
  }: CloseToAReward,
) {
  const firstName = "Michael";
  const userPoints = 1000;
  const unsubscriptionToken = "testUnsubToken";

  const ableToRedeem = [
    {
      id: "cab3e737-7b07-423f-9d9c-8bce07a9e3e2",
      createdAt: new Date(),
      name: "Cream Cheese Wontons",
      description:
        "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
      imageUrl: "test",
      price: 1100,
      altPrice: null,
      available: true,
      discontinued: false,
      listOrder: 2,
      menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
      activeDiscountId: null,
      isChefsChoice: true,
      isAlcoholic: false,
      isVegetarian: false,
      isVegan: true,
      isGlutenFree: true,
      showUndercookedOrRawDisclaimer: false,
      pointReward: true,
      birthdayReward: false,
      reviews: null,
      activeDiscount: null,
      customizationCategories: [],
    },
    {
      id: "7b0aa9eb-2a87-48cd-8c98-67b3f5a4b74f",
      createdAt: new Date(),
      name: "Vietnamese Bar Nuts",
      description:
        "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
      imageUrl: "test",
      price: 1200,
      altPrice: null,
      available: true,
      discontinued: false,
      listOrder: 1,
      menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
      activeDiscountId: null,
      isChefsChoice: false,
      isAlcoholic: false,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      showUndercookedOrRawDisclaimer: false,
      pointReward: true,
      birthdayReward: false,
      reviews: null,
      activeDiscount: null,
      customizationCategories: [],
    },
    {
      id: "60cdfd99-7970-4ce1-9032-6918f4dfcfec",
      createdAt: new Date(),
      name: "Xiu Mai",
      description:
        "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
      imageUrl: "test",
      price: 1900,
      altPrice: null,
      available: true,
      discontinued: false,
      listOrder: 14,
      menuCategoryId: "d500046e-b7d2-44a4-973e-568a143c48f0",
      activeDiscountId: null,
      isChefsChoice: true,
      isAlcoholic: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      showUndercookedOrRawDisclaimer: false,
      pointReward: true,
      birthdayReward: false,
      reviews: null,
      activeDiscount: null,
      customizationCategories: [],
    },
    {
      id: "7bd980fe-a447-401d-8880-03ec4773a9b2",
      createdAt: new Date(),
      name: "Grilled Pork Vermicelli",
      description:
        "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
      imageUrl: "test",
      price: 1900,
      altPrice: null,
      available: true,
      discontinued: false,
      listOrder: 4,
      menuCategoryId: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
      activeDiscountId: null,
      isChefsChoice: false,
      isAlcoholic: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      showUndercookedOrRawDisclaimer: true,
      pointReward: true,
      birthdayReward: false,
      reviews: null,
      activeDiscount: null,
      customizationCategories: [],
    },
    {
      id: "d809597c-803b-4bbb-b8b9-65d57b5a3577",
      createdAt: new Date(),
      name: "Chicken Sandwich",
      description:
        "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
      imageUrl: "test",
      price: 1900,
      altPrice: null,
      available: true,
      discontinued: false,
      listOrder: 6,
      menuCategoryId: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
      activeDiscountId: null,
      isChefsChoice: true,
      isAlcoholic: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      showUndercookedOrRawDisclaimer: false,
      pointReward: true,
      birthdayReward: false,
      reviews: null,
      activeDiscount: null,
      customizationCategories: [],
    },
  ];

  const closeToRedeeming = [
    {
      id: "f5adc265-dc7c-47ad-aead-cdad3d111de8",
      createdAt: new Date(),
      name: "Drink Two",
      description:
        "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
      imageUrl: "test",
      price: 600,
      altPrice: null,
      available: true,
      discontinued: false,
      listOrder: 8,
      menuCategoryId: "afbe0627-48a5-40df-bd5d-f6bb25fd2a07",
      activeDiscountId: null,
      isChefsChoice: false,
      isAlcoholic: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      showUndercookedOrRawDisclaimer: false,
      pointReward: true,
      birthdayReward: false,
      reviews: null,
      activeDiscount: null,
      customizationCategories: [
        {
          id: "d58f86b3-d769-468e-9b5c-3e207438701f",
          name: "Size",
          description: "Select a size",
          defaultChoiceId: "e1f38eae-c3d1-41e4-9069-a84a76d456cc",
          internalName: "",
          customizationChoices: [
            {
              id: "27f847cc-676a-4617-aa34-8895627dab2f",
              name: "Small",
              description: "12oz",
              priceAdjustment: -175,
              isAvailable: false,
              listOrder: 1,
              customizationCategoryId: "d58f86b3-d769-468e-9b5c-3e207438701f",
            },
            {
              id: "e1f38eae-c3d1-41e4-9069-a84a76d456cc",
              name: "Medium",
              description: "16oz",
              priceAdjustment: 0,
              isAvailable: true,
              listOrder: 2,
              customizationCategoryId: "d58f86b3-d769-468e-9b5c-3e207438701f",
            },
            {
              id: "dc9c85df-49f6-46a9-9055-a6de9240699a",
              name: "Large",
              description: "20oz",
              priceAdjustment: 175,
              isAvailable: true,
              listOrder: 3,
              customizationCategoryId: "d58f86b3-d769-468e-9b5c-3e207438701f",
            },
          ],
        },
      ],
    },
    {
      id: "3581eac7-f105-486e-97de-2aa234bb6e0c",
      createdAt: new Date(),
      name: "Toffee Chocolate Chip Cookie",
      description:
        "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
      imageUrl: "test",
      price: 1100,
      altPrice: null,
      available: true,
      discontinued: false,
      listOrder: 10,
      menuCategoryId: "7abeebb9-4fce-457a-af05-adb1b89aa1b0",
      activeDiscountId: null,
      isChefsChoice: false,
      isAlcoholic: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      showUndercookedOrRawDisclaimer: false,
      pointReward: true,
      birthdayReward: true,
      reviews: null,
      activeDiscount: null,
      customizationCategories: [],
    },
    {
      id: "3dad69fb-2607-4563-aeca-79515f93e06d",
      createdAt: new Date(),
      name: "Thai Tea Tres Leches",
      description:
        "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
      imageUrl: "test",
      price: 1100,
      altPrice: null,
      available: true,
      discontinued: false,
      listOrder: 11,
      menuCategoryId: "7abeebb9-4fce-457a-af05-adb1b89aa1b0",
      activeDiscountId: null,
      isChefsChoice: false,
      isAlcoholic: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      showUndercookedOrRawDisclaimer: false,
      pointReward: true,
      birthdayReward: true,
      reviews: null,
      activeDiscount: null,
      customizationCategories: [],
    },
  ];

  const { baseUrl } = dynamicAssetUrls;

  function getDynamicIntroduction() {
    let introduction = (
      <>
        <Text className="text-left">Hi {firstName},</Text>

        <Text className="text-left">
          We noticed you haven&apos;t placed an order in a while, and we wanted
          to let you know that you&apos;re just a few points away from redeeming
          some amazing rewards! Earn a few more points on your next purchase and
          unlock delicious treats.
        </Text>

        <Text className="text-left">
          Don&apos;t miss out on this opportunity to enjoy your favorite dishes
          and earn rewards while you do!
        </Text>
      </>
    );

    if (ableToRedeem.length > 0) {
      introduction = (
        <>
          <Text className="text-left">Hi {firstName},</Text>

          <Text className="text-left">
            Great news! You have enough points to redeem some fantastic rewards
            on your next order. We haven&apos;t seen you in a while, and
            we&apos;d love to welcome you back with something special.
          </Text>

          <Text className="text-left">
            Visit us soon and enjoy the rewards you&apos;ve earned!
          </Text>
        </>
      );
    } else if (ableToRedeem.length > 0 && closeToRedeeming.length === 0) {
      introduction = (
        <>
          <Text className="text-left">Hi {firstName},</Text>

          <Text className="text-left">
            We miss you! It looks like you have enough points to redeem some
            great rewards right now, and you&apos;re also close to earning even
            more rewards with just a few more points.
          </Text>

          <Text className="text-left">
            Come back and treat yourself to your favorite dishes, and take
            advantage of the rewards you&apos;ve earned and those you&apos;re
            close to achieving!
          </Text>
        </>
      );
    }

    return introduction;
  }

  let dynamicPreviewContent =
    "You're just a few points away from redeeming your favorite items. Keep earning and enjoy our special treats soon!";

  if (ableToRedeem.length > 0) {
    dynamicPreviewContent =
      "You have items ready to redeem and are close to earning even more. Check your rewards and keep collecting points!";
  } else if (ableToRedeem.length > 0 && closeToRedeeming.length === 0) {
    dynamicPreviewContent =
      "You have items available to redeem right now. Enjoy your rewards and see what you can get today!";
  }

  return (
    <Html>
      <Preview>{dynamicPreviewContent}</Preview>
      <Tailwind config={tailwindConfig}>
        <Head>
          <Font
            fontFamily="Noto Sans"
            fallbackFontFamily="Verdana"
            webFont={{
              url: "https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap",
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
        </Head>

        <Body style={main} className="rounded-lg">
          <Container style={container} className="rounded-lg">
            <Section className="rounded-lg bg-offwhite">
              <Header />

              <Section className="p-4">
                <Row>
                  <Column align="left">{getDynamicIntroduction()}</Column>
                </Row>

                <Hr />

                <Section className="my-8 text-center">
                  <Column align="center">
                    {/* TODO: section to show user's current points, might involve screenshotting
                      since ideally you want to use the same branding for the gold rewards gradient */}

                    {ableToRedeem.length > 0 && (
                      <Section className="mb-4">
                        <Text className="text-center text-lg font-medium underline underline-offset-2">
                          You can already redeem these rewards
                        </Text>
                        {ableToRedeem.map((item) => (
                          <Reward key={item.id} item={item} />
                        ))}
                      </Section>
                    )}

                    {closeToRedeeming.length > 0 && (
                      <Section className="my-4">
                        <Text className="text-center text-lg font-medium underline underline-offset-2">
                          You&apos;re close to redeeming these rewards:
                        </Text>
                        {closeToRedeeming.map((item) => (
                          <Reward
                            key={item.id}
                            item={item}
                            userPoints={userPoints}
                          />
                        ))}
                      </Section>
                    )}

                    <Link
                      href="https://khueskitchen.com/order"
                      className="block w-[236px]"
                    >
                      <Img
                        src={`${baseUrl}/orderNowButton.png`}
                        alt="Button to visit Khue's order page"
                        className="mt-8"
                      />
                    </Link>
                  </Column>
                </Section>
              </Section>

              <Footer
                userIsAMember={true}
                unsubscriptionToken={unsubscriptionToken}
              />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default CloseToAReward;

function Reward({ item, userPoints }: { item: MenuItem; userPoints?: number }) {
  const itemPoints = new Decimal(item.price).mul(2).toNumber();

  const pointsAway = userPoints ? itemPoints - userPoints : 0;

  const { menuItemBaseUrl } = dynamicAssetUrls;

  return (
    <Section className="mt-4 w-80 rounded-md border border-solid border-stone-300 bg-stone-200 p-4 text-left sm:w-[350px]">
      <Section align="center">
        <Row align="left">
          <Text className="m-0 text-base font-semibold">{item.name}</Text>
        </Row>

        <Row align="left">
          <Text className="my-0 text-left font-medium">
            {itemPoints} points
          </Text>

          {pointsAway > 0 && (
            <Text className="my-0 text-left font-medium">
              ({pointsAway} points away)
            </Text>
          )}
        </Row>

        <Column align="right">
          <Img
            src={`${menuItemBaseUrl}/menuItems/sampleImage.png`}
            alt={`Image of ${item.name}`}
            width="100"
            height="100"
            className="my-0 ml-2 text-right sm:ml-4"
          />
        </Column>
      </Section>
    </Section>
  );
}

// rough jsx of if you wanted to include the description of the item
//  <Section className="my-4 w-80 rounded-md bg-stone-200 p-4 text-left sm:w-[350px]">
//   <Section align="center" className="my-2">
//     <Row align="center" className="my-2">
//     <Row align="center" className="my-0">
//       <Text className="text-lg font-semibold">{item.name}</Text>
//     </Row>
//     <Row align="center" className="my-0">
//       <Text className="my-0 text-left font-medium">
//         {itemPoints} points
//         {pointsAway > 0 ? ` - (${pointsAway} points away)` : ""}
//       </Text>
//     </Row>

//      <Row align="center" className="my-2">
//             <Text className="my-0">{item.description}</Text>
//           </Row>

//     <Column className="align-right ml-auto">
//       <Img
//         src={`${baseUrl}/static/sampleImage.png`}
//         alt={`Image of ${item.name}`}
//         width="100"
//         height="100"
//         className="my-0 ml-2 text-right sm:ml-4"
//       />
//     </Column>
//     </Row>

//     <Row align="center" className="my-2">
//           <Text className="my-0 text-left font-medium">
//             {itemPoints} points
//             {pointsAway > 0 ? ` - (${pointsAway} points away)` : ""}
//           </Text>
//         </Row>
//   </Section>
// </Section>;
