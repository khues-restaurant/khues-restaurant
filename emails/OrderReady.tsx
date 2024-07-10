import { type Discount } from "@prisma/client";
import {
  Body,
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
import * as React from "react";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import {
  type DBOrderSummary,
  type DBOrderSummaryItem,
} from "~/server/api/routers/order";
import { type Item } from "~/stores/MainStore";
import { calculateRelativeTotal } from "~/utils/priceHelpers/calculateRelativeTotal";
import { formatPrice } from "~/utils/formatters/formatPrice";
import { getFirstSixNumbers } from "~/utils/formatters/getFirstSixNumbers";
import { main, container, tailwindConfig } from "emails/utils/styles";
import Header from "emails/Header";
import Footer from "emails/Footer";
import dynamicAssetUrls from "emails/utils/dynamicAssetUrls";

interface OrderReady {
  order: DBOrderSummary;
  customizationChoices: Record<string, CustomizationChoiceAndCategory>;
  discounts: Record<string, Discount>;
  userIsAMember: boolean;
  unsubscriptionToken: string;
}

// TODO: probably want to add conditional jsx section "dietaryRestrictions" section

function OrderReady({
  order,
  customizationChoices,
  discounts,
  userIsAMember,
  unsubscriptionToken,
}: OrderReady) {
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
      <Preview>Great news! Your order is ready for pickup.</Preview>
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
                <Row>
                  <Column align="center">
                    <Text className="text-center font-medium leading-5 sm:w-[400px]">
                      Thank you for choosing Khue&apos;s. Your order is now
                      ready and waiting for you. We look forward to seeing you
                      soon!
                    </Text>
                  </Column>
                </Row>

                <Hr />

                <Section className="my-8 text-center">
                  <Column align="center">
                    <Img
                      src={`${baseUrl}/emailOrderReadyForPickup.png`}
                      alt="An order tracker progress bar: with steps of 'Order placed', 'In progress', and 'Ready for pickup'"
                      className="mb-8 h-[57px] w-[348px] sm:h-[87px] sm:w-[528px]"
                    />

                    <Section className="w-64">
                      <Row align="center">
                        <Column>
                          <Text className="my-0 text-left font-medium underline">
                            Pickup name
                          </Text>
                          <Text className="my-0 text-left text-xs">
                            {order.firstName} {order.lastName}
                          </Text>
                        </Column>
                      </Row>

                      <Row align="center" className="mt-2">
                        <Column>
                          <Text className="my-0 text-left font-medium underline">
                            Pickup time
                          </Text>
                          <Text className="my-0 text-left text-xs">
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
                          <Text className="my-0 text-left font-medium underline">
                            Order #
                          </Text>
                          <Text className="my-0 text-left text-xs">
                            {getFirstSixNumbers(order.id)}
                          </Text>
                        </Column>
                      </Row>

                      <Row align="center" className="mt-2">
                        <Column>
                          <Text className="my-0 text-left font-medium underline">
                            Address
                          </Text>
                          <Text className="my-0 text-left text-xs">
                            1234 Lorem Ipsum Dr. Roseville, MN 12345
                          </Text>
                        </Column>
                      </Row>
                    </Section>

                    {/* loop through items to make an order summary section */}
                    <Section className="mt-4 w-80 rounded-md border border-solid border-stone-300 bg-stone-200 p-4 text-left sm:w-[350px]">
                      <Text className="mb-4 mt-0 text-base font-medium">
                        {totalItems} {totalItems > 1 ? "Items" : "Item"}
                      </Text>

                      {order.orderItems.map((item, index) => (
                        <Row key={index} align="center" className="my-2 w-80">
                          <Column className="w-5 align-top">
                            <Text className="my-0 w-5 text-left text-base font-medium">
                              {item.quantity}
                            </Text>
                          </Column>

                          <Column className="align-top">
                            <Text className="my-0 text-left text-base font-medium">
                              {item.name}
                            </Text>
                            {Object.values(item.customizations).map(
                              (choiceId, idx) => (
                                <Text
                                  key={idx}
                                  className="my-0 max-w-64 text-xs sm:max-w-72"
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
                              <Text className="my-0 max-w-64 text-xs sm:max-w-72">
                                - {item.specialInstructions}
                              </Text>
                            )}
                          </Column>

                          <Column className="align-top">
                            <Text className="my-0 text-right text-base">
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
                              className={`my-0 text-sm italic text-stone-400 ${order.includeNapkinsAndUtensils ? "w-[250px]" : "w-[278px]"}`}
                            >
                              {`Napkins and utensils were ${
                                order.includeNapkinsAndUtensils ? "" : "not"
                              } requested.`}
                            </Text>
                          </Column>
                        </Row>
                      </Section>

                      <Hr className="border-stone-400" />

                      <Section className="w-72">
                        <Row className="h-5">
                          <Column>
                            <Text className="my-0 h-5 text-left">Subtotal</Text>
                          </Column>
                          <Column>
                            <Text className="my-0 h-5 text-right">
                              {formatPrice(order.subtotal)}
                            </Text>
                          </Column>
                        </Row>
                        <Row className="h-5">
                          <Column>
                            <Text className="my-0 h-5 text-left">Tax</Text>
                          </Column>
                          <Column>
                            <Text className="my-0 h-5 text-right">
                              {formatPrice(order.tax)}
                            </Text>
                          </Column>
                        </Row>
                        {order.tipValue !== 0 && (
                          <Row className="h-5">
                            <Column>
                              <Text className="my-0 h-5 text-left">
                                {`Tip${order.tipPercentage !== null ? ` (${order.tipPercentage}%)` : ""}`}
                              </Text>
                            </Column>
                            <Column>
                              <Text className="my-0 h-5 text-right">
                                {formatPrice(order.tipValue)}
                              </Text>
                            </Column>
                          </Row>
                        )}
                        <Row className="mt-1 h-5">
                          <Column>
                            <Text className="my-0 h-5 text-left text-base font-semibold">
                              Total
                            </Text>
                          </Column>
                          <Column>
                            <Text className="my-0 h-5 text-right text-base font-semibold">
                              {formatPrice(order.total)}
                            </Text>
                          </Column>
                        </Row>
                      </Section>
                    </Section>
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

export default OrderReady;
