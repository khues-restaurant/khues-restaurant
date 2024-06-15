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

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

// in other components, will want to pass in whether user is a member or not to conditionally show
// "Manage your email communication preferences" alongside "Unsubscribe from all emails"

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
            <Section className="mb-4 bg-offwhite">
              <Header />

              <Section className="p-4">
                <Row align="center" className="w-64">
                  <Text className="text-center font-semibold">
                    Thank you! Your order has been successfully placed and will
                    be started soon.
                  </Text>
                </Row>

                <Hr />

                <Section className="my-8 text-center">
                  <Column align="center">
                    <Text className="text-lg font-semibold underline underline-offset-2">
                      Order {getFirstSixNumbers(order.id)}
                    </Text>

                    <Img
                      src={`${baseUrl}/static/emailOrderTracker.png`}
                      alt="Image of the order tracker progress bar: with steps of 'Order placed', 'In progress', and 'Ready for pickup'"
                      className="my-8 h-[55px] w-[333px] sm:h-[78px] sm:w-[467px]"
                    />

                    <Text className="text-base font-semibold">
                      Your order is ready to be picked up!
                    </Text>

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
                            Address
                          </Text>
                          <Text className="my-0 text-left text-xs">
                            1234 Lorem Ipsum Dr. Roseville, MN 12345
                          </Text>
                        </Column>
                      </Row>
                    </Section>

                    {/* loop through items to make an order summary section */}
                    <Section className="mt-4 w-80 rounded-md bg-stone-200 p-4 text-left sm:w-[350px]">
                      <Text className="mb-4 mt-0 text-lg font-semibold">
                        {order.orderItems.length}{" "}
                        {order.orderItems.length > 1 ? "Items" : "Item"}
                      </Text>

                      {order.orderItems.map((item, index) => (
                        <Row key={index} align="center" className="my-2 w-80">
                          <Column className="align-top">
                            <Text className="my-0 text-left font-medium">
                              {item.quantity}
                            </Text>
                          </Column>

                          <Column className="align-top">
                            <Text className="my-0">{item.name}</Text>
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
                            <Text className="my-0 text-right">
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

                      <Section className="mt-8 w-80 text-center sm:w-[350px]">
                        <Row>
                          <Column className="w-4 text-right">
                            <Img
                              src={`${baseUrl}/static/utensils.png`}
                              alt="Image of a fork and knife to represent napkins and utensils"
                              className="ml-auto mr-2 h-3 w-3"
                            />
                          </Column>

                          <Column className="w-28 text-right">
                            <Text className="my-0 text-left text-xs italic text-stone-400">
                              {`Napkins and utensils were ${
                                order.includeNapkinsAndUtensils ? "" : "not"
                              } requested.`}
                            </Text>
                          </Column>
                        </Row>
                      </Section>

                      <Hr className="border-stone-400" />

                      <Section className="w-48">
                        <Row>
                          <Column>
                            <Text className="my-0 text-left">Subtotal</Text>
                          </Column>
                          <Column>
                            <Text className="my-0 text-right">
                              {formatPrice(order.subtotal)}
                            </Text>
                          </Column>
                        </Row>
                        <Row>
                          <Column>
                            <Text className="my-0 text-left">Tax</Text>
                          </Column>
                          <Column>
                            <Text className="my-0 text-right">
                              {formatPrice(order.tax)}
                            </Text>
                          </Column>
                        </Row>
                        {order.tipValue !== 0 && (
                          <Row>
                            <Column>
                              <Text className="my-0 text-left">
                                {`Tip${order.tipPercentage !== null ? ` (${order.tipPercentage}%)` : ""}`}
                              </Text>
                            </Column>
                            <Column>
                              <Text className="my-0 text-right">
                                {formatPrice(order.tipValue)}
                              </Text>
                            </Column>
                          </Row>
                        )}
                        <Row>
                          <Column>
                            <Text className="my-0 text-left text-base font-semibold">
                              Total
                            </Text>
                          </Column>
                          <Column>
                            <Text className="my-0 text-right text-base font-semibold">
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
