import {
  Body,
  Button,
  Column,
  Container,
  Font,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

// in other components, will want to pass in whether user is a member or not to conditionally show
// "Manage your email communication preferences" alongside "Unsubscribe from all emails"

// maybe also get user's first name to put in <Preview> section?

interface Welcome {
  firstName: string;
  unsubscriptionToken: string;
}

function Welcome({ firstName, unsubscriptionToken }: Welcome) {
  return (
    <Html>
      <Preview>Welcome to Khue&apos;s Rewards Program!</Preview>
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
              <div className="w-full rounded-t-lg bg-primary">
                <Text className="py-4 pl-4 text-2xl font-semibold text-offwhite">
                  Khue&apos;s
                </Text>
              </div>

              <Section className="p-4">
                <Text className="text-xl font-semibold">
                  Welcome to the Khue&apos;s Rewards Program, {firstName} 🎉
                </Text>
                <Text>
                  You now have access to free perks including earning points on
                  your orders, a complementary birthday gift, and the ability to
                  try new items before they&apos;re on the menu.
                </Text>

                <Section className="my-8 text-center">
                  <Column align="center">
                    <Img
                      src={`${baseUrl}/static/myOrders.jpg`}
                      alt="Promotional image for order now card"
                      className="my-8 h-[126px] w-[240px] rounded-md sm:h-[252px] sm:w-[480px]"
                    />
                    <Button
                      href="https://khueskitchen.com/order"
                      className="rounded-md bg-primary px-4 py-3 text-sm text-offwhite"
                    >
                      Order now
                    </Button>
                  </Column>
                </Section>
              </Section>

              <Section className="rounded-b-lg bg-primary text-offwhite">
                <Column align="center">
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
                    <Row className="text-center">
                      <Link href="https://khueskitchen.com/profile/preferences">
                        <Text className="mt-0 text-xs text-offwhite underline underline-offset-2">
                          Manage your email communication preferences
                        </Text>
                      </Link>
                    </Row>

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

export default Welcome;

const main = {
  backgroundColor: "#e7e5e4",
  fontFamily:
    '\'Noto Sans\', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
};

const container = {
  backgroundColor: "#e7e5e4",
  margin: "0 auto",
};
