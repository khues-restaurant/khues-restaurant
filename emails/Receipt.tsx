import { type Discount } from "@prisma/client";
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
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import Footer from "emails/Footer";
import * as React from "react";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import {
  type DBOrderSummary,
  type DBOrderSummaryItem,
} from "~/types/orderSummary";
import { type Item } from "~/stores/MainStore";
import { calculateRelativeTotal } from "~/utils/priceHelpers/calculateRelativeTotal";
import { formatPrice } from "~/utils/formatters/formatPrice";
import { getFirstSixNumbers } from "~/utils/formatters/getFirstSixNumbers";
import { main, container, tailwindConfig } from "emails/utils/styles";
import Header from "emails/Header";
import dynamicAssetUrls from "emails/utils/dynamicAssetUrls";

interface Receipt {
  order: DBOrderSummary;
  customizationChoices: Record<string, CustomizationChoiceAndCategory>;
  discounts: Record<string, Discount>;
  userIsAMember: boolean;
  unsubscriptionToken: string;
}

// TODO: probably want to add conditional jsx for "dietaryRestrictions" section

function Receipt({
  order,
  customizationChoices,
  discounts,
  userIsAMember,
  unsubscriptionToken,
}: Receipt) {
  order = {
    id: "34d1dfcc-08e5-49e0-b428-6d7d94096427",
    createdAt: new Date("2024-06-24T08:44:15.663Z"),
    orderStartedAt: null,
    orderCompletedAt: null,
    datetimeToPickup: new Date("2024-06-24T18:30:00.000Z"),
    firstName: "Michael",
    lastName: "Ongaro",
    email: "mongaro6@gmail.com",
    phoneNumber: "+16513570468",
    includeNapkinsAndUtensils: false,
    dietaryRestrictions: "I am allergic to eggs and peanuts.",
    discountId: null,
    subtotal: 8100,
    tax: 0,
    tipPercentage: 10,
    tipValue: 810,
    total: 8910,
    prevRewardsPoints: 870,
    earnedRewardsPoints: 810,
    spentRewardsPoints: 0,
    stripeSessionId:
      "cs_test_b18IqiMZpLsiXRaw4MBybXAsdeM5cQNmUhfRnTGLN97YkS5QoPXG81YpMj",
    notableUserDescription: null,
    rewardsPointsRedeemed: true,
    userLeftFeedback: false,
    userId: "user_2d4XoRNA57VwLUYXy0M9XTdP4wV",
    orderItems: [
      {
        id: "27e9dd8f-08b9-4852-af2b-e7c66be02420",
        name: "Asian Fries",
        specialInstructions: "",
        includeDietaryRestrictions: false,
        quantity: 2,
        price: 1200,
        orderId: "34d1dfcc-08e5-49e0-b428-6d7d94096427",
        menuItemId: "f651ed75-a596-4a9f-8ba8-6dafd8ddd9de",
        discountId: null,
        isChefsChoice: false,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        hasImageOfItem: true,
        customizations: {},
        discount: null,
      },
      {
        id: "91a046ab-564b-42d3-890e-e80d320d6ea5",
        name: "Hainanese Chicken",
        specialInstructions: "",
        includeDietaryRestrictions: false,
        quantity: 3,
        price: 1900,
        orderId: "34d1dfcc-08e5-49e0-b428-6d7d94096427",
        menuItemId: "a44bfc71-facd-4ce6-a576-afbac6e2b2f3",
        discountId: null,
        isChefsChoice: true,
        isAlcoholic: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        showUndercookedOrRawDisclaimer: false,
        pointReward: false,
        birthdayReward: false,
        hasImageOfItem: false,
        customizations: {},
        discount: null,
      },
    ],
  };

  const totalItems = order.orderItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  const { baseUrl } = dynamicAssetUrls;

  return (
    <Html>
      <Preview>
        Thanks for ordering from Khue&apos;s! We&apos;re preparing your order
        now and will update when it&apos;s ready.
      </Preview>
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
            <Section className="bg-offwhite">
              <Header />

              <Section className="p-4">
                <Row align="center">
                  <Text className="text-center font-medium leading-5">
                    Thank you! Your order has been successfully placed.
                    {/* and will be prepared according to your selected pickup time. */}
                  </Text>
                </Row>

                <Hr />

                <Section className="my-8 text-center">
                  <Column align="center">
                    <Img
                      src={`${baseUrl}/emailOrderTracker.png`}
                      alt="An order tracker progress bar: with steps of 'Order placed', 'In progress', and 'Ready for pickup'"
                      className="mb-8 h-[59px] w-[348px] sm:h-[85px] sm:w-[520px]"
                    />

                    <Section className="w-64">
                      <Row align="center">
                        <Column>
                          <Text className="!my-0 text-left font-medium underline">
                            Pickup name
                          </Text>
                          <Text className="!my-0 text-left text-xs">
                            {order.firstName} {order.lastName}
                          </Text>
                        </Column>
                      </Row>

                      <Row align="center" className="mt-2">
                        <Column>
                          <Text className="!my-0 text-left font-medium underline">
                            Pickup time
                          </Text>
                          <Text className="!my-0 text-left text-xs">
                            {format(
                              toZonedTime(
                                order.datetimeToPickup,
                                "America/Chicago",
                              ),
                              "PPPp",
                            )}
                          </Text>
                        </Column>
                      </Row>

                      <Row align="center" className="mt-2">
                        <Column>
                          <Text className="!my-0 text-left font-medium underline">
                            Order #
                          </Text>
                          <Text className="!my-0 text-left text-xs">
                            {getFirstSixNumbers(order.id)}
                          </Text>
                        </Column>
                      </Row>

                      <Row align="center" className="mt-2">
                        <Column>
                          <Text className="!my-0 text-left font-medium underline">
                            Address
                          </Text>
                          <Text className="!my-0 text-left text-xs">
                            693 Raymond Ave, St. Paul, MN 55114
                          </Text>
                        </Column>
                      </Row>
                    </Section>

                    {/* loop through items to make an order summary section */}
                    <Section className="mt-8 w-80 rounded-md border border-solid border-stone-300 bg-stone-200 p-4 text-left sm:w-[350px]">
                      <Row align="center" className="!mb-0 w-80">
                        <Column className="w-5 align-top">
                          <Text className="!mt-0 mb-0 text-left text-base font-medium">
                            {totalItems} {totalItems > 1 ? "Items" : "Item"}
                          </Text>
                        </Column>

                        <Column className="w-5 align-bottom text-stone-500">
                          <Text className="!mt-0 mb-0 text-right text-sm font-medium">
                            Order #{getFirstSixNumbers(order.id)}
                          </Text>
                        </Column>
                      </Row>

                      <Hr className="!mt-0 mb-4 !border-t-stone-500" />

                      {order.orderItems.map((item, index) => (
                        <Row key={index} align="center" className="my-2 w-80">
                          <Column className="w-5 align-top">
                            <Text className="!my-0 w-5 text-left text-base font-medium">
                              {item.quantity}
                            </Text>
                          </Column>

                          <Column className="align-top">
                            <Text className="!my-0 text-left text-base font-medium">
                              {item.name}
                            </Text>
                            {Object.values(item.customizations).map(
                              (choiceId, idx) => (
                                <Text
                                  key={idx}
                                  className="!my-0 max-w-64 text-xs sm:max-w-72"
                                >
                                  -{" "}
                                  {
                                    customizationChoices[choiceId]
                                      ?.customizationCategory.name
                                  }
                                  : {customizationChoices[choiceId]?.name}
                                </Text>
                              ),
                            )}
                            {item.specialInstructions && (
                              <Text className="!my-0 max-w-64 text-xs sm:max-w-72">
                                - {item.specialInstructions}
                              </Text>
                            )}
                          </Column>

                          <Column className="align-top">
                            <Text className="!my-0 text-right text-base">
                              {formatPrice(
                                calculateRelativeTotal({
                                  items: [item] as
                                    | Item[]
                                    | DBOrderSummaryItem[],
                                  customizationChoices,
                                  discounts,
                                }),
                              )}
                            </Text>
                          </Column>
                        </Row>
                      ))}

                      <Section
                        className={`mt-8 text-center ${order.includeNapkinsAndUtensils ? "w-[275px]" : "w-[300px]"}`}
                      >
                        <Row>
                          <Column className="w-4">
                            <Img
                              src={`${baseUrl}/${order.includeNapkinsAndUtensils ? "utensilsRequested" : "noUtensilsRequested"}.png`}
                              alt="A fork and knife to represent napkins and utensils"
                              className="mr-2 h-4 w-4"
                            />
                          </Column>

                          <Column
                            className={`${order.includeNapkinsAndUtensils ? "w-[250px]" : "w-[278px]"}`}
                          >
                            <Text
                              className={`!my-0 text-sm italic text-stone-500 ${order.includeNapkinsAndUtensils ? "w-[250px]" : "w-[285px]"}`}
                            >
                              {`Napkins and utensils were${
                                order.includeNapkinsAndUtensils ? "" : "'t"
                              } requested.`}
                            </Text>
                          </Column>
                        </Row>
                      </Section>

                      <Hr className="!border-t-stone-500" />

                      <Section className="w-72">
                        <Row className="h-5">
                          <Column>
                            <Text className="!my-0 h-5 text-left">
                              Subtotal
                            </Text>
                          </Column>
                          <Column>
                            <Text className="!my-0 h-5 text-right">
                              {formatPrice(order.subtotal)}
                            </Text>
                          </Column>
                        </Row>
                        <Row className="h-5">
                          <Column>
                            <Text className="!my-0 h-5 text-left">Tax</Text>
                          </Column>
                          <Column>
                            <Text className="!my-0 h-5 text-right">
                              {formatPrice(order.tax)}
                            </Text>
                          </Column>
                        </Row>
                        {order.tipValue !== 0 && (
                          <Row className="h-5">
                            <Column>
                              <Text className="!my-0 h-5 text-left">
                                {`Tip${order.tipPercentage !== null ? ` (${order.tipPercentage}%)` : ""}`}
                              </Text>
                            </Column>
                            <Column>
                              <Text className="!my-0 h-5 text-right">
                                {formatPrice(order.tipValue)}
                              </Text>
                            </Column>
                          </Row>
                        )}
                        <Row className="mt-1 h-5">
                          <Column>
                            <Text className="!my-0 h-5 text-left text-base font-semibold">
                              Total
                            </Text>
                          </Column>
                          <Column>
                            <Text className="!my-0 h-5 text-right text-base font-semibold">
                              {formatPrice(order.total)}
                            </Text>
                          </Column>
                        </Row>
                      </Section>
                    </Section>

                    <Link
                      href={`https://khueskitchen.com/order/${order.id}`}
                      className="block w-[236px]"
                    >
                      <Img
                        src={`${baseUrl}/trackYourOrderButton.png`}
                        alt="Button to track your order"
                        className="mt-8"
                      />
                    </Link>
                  </Column>
                </Section>
              </Section>

              <Footer
                userIsAMember={userIsAMember}
                unsubscriptionToken={unsubscriptionToken}
              />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default Receipt;

// {
//     "id": "151ac520-08eb-4fc1-9e98-968486c13689",
//     "createdAt": "2024-06-21T00:35:50.987Z",
//     "orderStartedAt": null,
//     "orderCompletedAt": null,
//     "datetimeToPickup": "2024-06-21T00:50:50.982Z",
//     "firstName": "Michael",
//     "lastName": "Ongaro",
//     "email": "mongaro6@gmail.com",
//     "phoneNumber": "+16513570468",
//     "includeNapkinsAndUtensils": false,
//     "dietaryRestrictions": "I am allergic to eggs and peanuts",
//     "discountId": null,
//     "subtotal": 3700,
//     "tax": 0,
//     "tipPercentage": 10,
//     "tipValue": 370,
//     "total": 4070,
//     "prevRewardsPoints": 500,
//     "earnedRewardsPoints": 370,
//     "spentRewardsPoints": 0,
//     "stripeSessionId": "cs_test_b1IgztPcb4MwZIO05peXuboSmgoBLqylXrGfbmse0AlJPlFrs5yt8Q6UXy",
//     "notableUserDescription": null,
//     "rewardsPointsRedeemed": true,
//     "userLeftFeedback": false,
//     "userId": "user_2d4XoRNA57VwLUYXy0M9XTdP4wV",
//     "orderItems": [
//         {
//             "id": "60e229f5-8ace-443a-ac05-cb84d1381a03",
//             "name": "Drink One",
//             "specialInstructions": "",
//             "includeDietaryRestrictions": false,
//             "quantity": 2,
//             "price": 300,
//             "orderId": "151ac520-08eb-4fc1-9e98-968486c13689",
//             "menuItemId": "717349d0-4829-4e4a-98ab-a9e00a67768a",
//             "discountId": null,
//             "isChefsChoice": false,
//             "isAlcoholic": false,
//             "isVegetarian": false,
//             "isVegan": false,
//             "isGlutenFree": false,
//             "showUndercookedOrRawDisclaimer": false,
//             "pointReward": false,
//             "birthdayReward": false,
//             "customizations": {
//                 "d58f86b3-d769-468e-9b5c-3e207438701f": "e1f38eae-c3d1-41e4-9069-a84a76d456cc"
//             },
//             "discount": null
//         },
//         {
//             "id": "0837320e-d7a2-43b4-801b-4b85f2b00f75",
//             "name": "Fried Shrimp",
//             "specialInstructions": "",
//             "includeDietaryRestrictions": false,
//             "quantity": 1,
//             "price": 1200,
//             "orderId": "151ac520-08eb-4fc1-9e98-968486c13689",
//             "menuItemId": "f61bf41d-ef94-428f-8a27-e979d8218690",
//             "discountId": null,
//             "isChefsChoice": false,
//             "isAlcoholic": false,
//             "isVegetarian": false,
//             "isVegan": false,
//             "isGlutenFree": false,
//             "showUndercookedOrRawDisclaimer": false,
//             "pointReward": false,
//             "birthdayReward": false,
//             "customizations": {},
//             "discount": null
//         },
//         {
//             "id": "acc01f14-7b2b-4d19-bbbb-b1bfd337b25c",
//             "name": "Chicken Sandwich",
//             "specialInstructions": "",
//             "includeDietaryRestrictions": false,
//             "quantity": 1,
//             "price": 1900,
//             "orderId": "151ac520-08eb-4fc1-9e98-968486c13689",
//             "menuItemId": "d809597c-803b-4bbb-b8b9-65d57b5a3577",
//             "discountId": null,
//             "isChefsChoice": true,
//             "isAlcoholic": false,
//             "isVegetarian": false,
//             "isVegan": false,
//             "isGlutenFree": false,
//             "showUndercookedOrRawDisclaimer": false,
//             "pointReward": false,
//             "birthdayReward": false,
//             "customizations": {},
//             "discount": null
//         }
//     ]
// }
