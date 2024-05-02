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
import * as React from "react";
import { type CustomizationChoiceAndCategory } from "~/server/api/routers/customizationChoice";
import { type DBOrderSummaryItem } from "~/server/api/routers/order";
import { type Item } from "~/stores/MainStore";
import { calculateRelativeTotal } from "~/utils/calculateRelativeTotal";
import { calculateTotalCartPrices } from "~/utils/calculateTotalCartPrices";
import { formatPrice } from "~/utils/formatPrice";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

// in other components, will want to pass in whether user is a member or not to conditionally show
// "Manage your email communication preferences" alongside "Unsubscribe from all emails"

interface OrderReady {
  id: string;
  datetimeToPickup: Date;
  pickupName: string;
  includeNapkinsAndUtensils: boolean;
  items: Item[] | DBOrderSummaryItem[]; // could just be DBOrderSummaryItem[] for this email template always right?
  customizationChoices: Record<string, CustomizationChoiceAndCategory>;
  discounts: Record<string, Discount>;
  userIsAMember: boolean;
  unsubscriptionToken: string;
  // dietaryRestrictions?: string;
}

function OrderReady({
  id,
  datetimeToPickup,
  pickupName,
  includeNapkinsAndUtensils,
  items,
  customizationChoices,
  discounts,
  userIsAMember,
  unsubscriptionToken,
  // dietaryRestrictions,
}: OrderReady) {
  const { subtotal, tax, total } = calculateTotalCartPrices({
    items,
    customizationChoices,
    discounts,
  });

  return (
    <Html>
      <Preview>
        Thanks for ordering from Khue&apos;s! We&apos;re preparing your order
        now and will update when it&apos;s ready.
      </Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                primary: "#14522d",
                darkPrimary: "#0f3e22",
                offwhite: "#fffcf5",
              },
            },
          },
        }}
      >
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
            <Section className="my-4 bg-offwhite">
              <div
                // style={{
                //   backgroundImage:
                //     "linear-gradient(to bottom right, #14522d, #0f3e22)",
                // }}
                className="w-full rounded-t-lg bg-primary"
              >
                <Img
                  src={`${baseUrl}/static/whiteLogo.png`}
                  width="48"
                  height="48"
                  alt="Khue's Logo"
                  className="py-4 pl-4"
                />
              </div>

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
                      Order {id.toUpperCase().substring(0, 6)}
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
                            {pickupName}
                          </Text>
                        </Column>
                      </Row>

                      <Row align="center" className="mt-2">
                        <Column>
                          <Text className="my-0 text-left font-medium underline">
                            Pickup time
                          </Text>
                          <Text className="my-0 text-left text-xs">
                            {format(datetimeToPickup, "PPPp")}
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
                        {items.length} {items.length > 1 ? "Items" : "Item"}
                      </Text>

                      {items.map((item, index) => (
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
                                includeNapkinsAndUtensils ? "" : "not"
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
                              {formatPrice(subtotal)}
                            </Text>
                          </Column>
                        </Row>
                        <Row>
                          <Column>
                            <Text className="my-0 text-left">Tax</Text>
                          </Column>
                          <Column>
                            <Text className="my-0 text-right">
                              {formatPrice(tax)}
                            </Text>
                          </Column>
                        </Row>
                        <Row>
                          <Column>
                            <Text className="my-0 text-left text-base font-semibold">
                              Total
                            </Text>
                          </Column>
                          <Column>
                            <Text className="my-0 text-right text-base font-semibold">
                              {formatPrice(total)}
                            </Text>
                          </Column>
                        </Row>
                      </Section>
                    </Section>
                  </Column>
                </Section>
              </Section>

              <Section className="rounded-b-lg bg-primary text-offwhite">
                <Column align="center">
                  {/* 

                    idk why this was messing up the whole flow, fix later for mobile
                  
                  <Column className="w-80 text-center sm:hidden">
                    <Row>
                      <Text className="mb-0 text-xs">
                        1234 Lorem Ipsum Dr. Roseville, MN 12345
                      </Text>
                    </Row>

                    <Row>
                      <Link href="tel:+1234567890">
                        <Text className="mb-0 text-xs text-offwhite">
                          (123) 456-7890
                        </Text>
                      </Link>
                    </Row>
                  </Column> */}

                  <Row className="w-[350px]">
                    <Column className="text-left">
                      <Text className="mb-0 text-xs">
                        1234 Lorem Ipsum Dr. Roseville, MN 12345
                      </Text>
                    </Column>

                    <Column className="text-center">
                      <Text className="mb-0">|</Text>
                    </Column>

                    <Column className="text-right">
                      <Link href="tel:+1234567890">
                        <Text className="mb-0 pl-2 text-xs text-offwhite">
                          (123) 456-7890
                        </Text>
                      </Link>
                    </Column>
                  </Row>

                  <Row className="mt-1 w-52">
                    <Column className="text-left">
                      <Link href="https://khueskitchen.com">
                        <Text className="my-0 text-xs text-offwhite">
                          Visit our website
                        </Text>
                      </Link>
                    </Column>

                    <Column className="text-center">
                      <Text className="my-0 pl-1">|</Text>
                    </Column>

                    <Column className="text-right">
                      <Link href="https://khueskitchen.com/privacy">
                        <Text className="my-0 pl-2 text-xs text-offwhite">
                          Privacy Policy
                        </Text>
                      </Link>
                    </Column>
                  </Row>

                  <Text className="mb-0 text-sm font-medium">
                    Follow us on social media
                  </Text>

                  <Row
                    align="center"
                    style={{
                      width: "100px",
                    }}
                  >
                    <Column>
                      <Link href="https://tiktok.com/khueskitchen">
                        <Img
                          src={`${baseUrl}/static/socials/whiteTiktok.png`}
                          width="24"
                          height="24"
                          alt="Tiktok"
                          className="m-4"
                        />
                      </Link>
                    </Column>
                    <Column>
                      <Link href="https://instagram.com/khueskitchen">
                        <Img
                          src={`${baseUrl}/static/socials/whiteInstagram.png`}
                          width="24"
                          height="24"
                          alt="Instagram"
                          className="m-4"
                        />
                      </Link>
                    </Column>
                    <Column>
                      <Link href="https://facebook.com/khueskitchen">
                        <Img
                          src={`${baseUrl}/static/socials/whiteFacebook.png`}
                          width="24"
                          height="24"
                          alt="Facebook"
                          className="m-4"
                        />
                      </Link>
                    </Column>
                    <Column>
                      <Link href="https://twitter.com/khueskitchen">
                        <Img
                          src={`${baseUrl}/static/socials/whiteTwitter.png`}
                          width="24"
                          height="24"
                          alt="Twitter"
                          className="m-4 "
                        />
                      </Link>
                    </Column>
                  </Row>

                  <Text className="text-xs">
                    © 2024 Khue&apos;s. All rights reserved.
                  </Text>

                  <Section className="w-96 text-center">
                    {userIsAMember && (
                      <Row className="text-center">
                        <Link href="https://khueskitchen.com/profile/preferences">
                          <Text className="mt-0 text-xs text-offwhite underline underline-offset-2">
                            Manage your email communication preferences
                          </Text>
                        </Link>
                      </Row>
                    )}

                    <Row className="text-center">
                      <Link
                        href={`https://khueskitchen.com/unsubscribe?token=${unsubscriptionToken}`}
                      >
                        <Text className="mt-0 pl-2 text-xs text-offwhite underline underline-offset-2">
                          Unsubscribe from all emails
                        </Text>
                      </Link>
                    </Row>
                  </Section>
                </Column>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default OrderReady;

const main = {
  backgroundColor: "#e7e5e4",
  fontFamily:
    '\'Noto Sans\', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
};

const container = {
  backgroundColor: "#e7e5e4",
  margin: "0 auto",
};
