import {
  Body,
  Button,
  Column,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import Footer from "emails/Footer";
import { type Reward } from "@prisma/client";
import Decimal from "decimal.js";
import { container, main, tailwindConfig } from "emails/utils/styles";
import { addDays } from "date-fns";
import Header from "emails/Header";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

interface RewardsExpiringThisMonth {
  firstName: string;
  rewardsExpiringThisMonth: Reward[];
  userPoints: number;
  unsubscriptionToken: string;
}

function RewardsExpiringThisMonth(
  {
    // firstName,
    // rewardsExpiringThisMonth,
    // userPoints,
    // unsubscriptionToken,
  }: RewardsExpiringThisMonth,
) {
  const unsubscriptionToken = "testUnsubToken";

  const rewardsExpiringThisMonth = [
    {
      id: "78d528f8-0e7a-4271-9ed3-872289c4644e",
      createdAt: new Date(),
      expiresAt: addDays(new Date(), 1),
      active: false,
      expired: false,
      value: 17,
      partiallyRedeemed: false,
      orderId: null,
      userId: "user_2d4XoRNA57VwLUYXy0M9XTdP4wV",
    },
    {
      id: "3a9b44b4-ed2c-4e0a-a54f-3bf2145809ec",
      createdAt: new Date(),
      expiresAt: addDays(new Date(), 10),
      active: false,
      expired: false,
      value: 17,
      partiallyRedeemed: false,
      orderId: null,
      userId: "user_2d4XoRNA57VwLUYXy0M9XTdP4wV",
    },
    {
      id: "857b2451-9a5a-466e-ba21-a1fa07fee1a5",
      createdAt: new Date(),
      expiresAt: addDays(new Date(), 11),
      active: false,
      expired: false,
      value: 170,
      partiallyRedeemed: false,
      orderId: null,
      userId: "user_2d4XoRNA57VwLUYXy0M9XTdP4wV",
    },
    {
      id: "a9688e44-9772-4cd2-af83-3339c1c92463",
      createdAt: new Date(),
      expiresAt: addDays(new Date(), 15),
      active: false,
      expired: false,
      value: 1700,
      partiallyRedeemed: false,
      orderId: "4cab21e1-59e2-4522-815a-d7952921a44f",
      userId: "user_2d4XoRNA57VwLUYXy0M9XTdP4wV",
    },
    {
      id: "d8cffdc0-2ea5-4497-89c0-8162f61c3f7f",
      createdAt: new Date(),
      expiresAt: addDays(new Date(), 16),
      active: false,
      expired: false,
      value: 490,
      partiallyRedeemed: false,
      orderId: "9e6c458b-d1e0-489c-b24c-de28dfa4c29d",
      userId: "user_2d4XoRNA57VwLUYXy0M9XTdP4wV",
    },
  ];

  return (
    <Html>
      <Preview>
        Your rewards are about to expire soon. Take a look and redeem them
        before the end of this month!
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
            <Section className="mb-4 rounded-lg bg-offwhite">
              <Header />

              <Section className="p-4">
                <Row align="center" className="w-64">
                  <Text className="text-center font-semibold">
                    {/* TODO: make this text dynamic/reference the user's first name somewhere */}
                    Thank you! Your order has been successfully placed and will
                    be started soon.
                  </Text>
                </Row>

                <Hr />

                <Section className="my-8 text-center">
                  {/* TODO: section to show user's current points, might involve screenshotting
                      since ideally you want to use the same branding for the gold rewards gradient */}

                  <Text className="text-center text-lg font-medium">
                    Your rewards that will expire during{" "}
                    {new Date().toLocaleString("en-US", {
                      month: "long",
                    })}
                  </Text>

                  {/* Legend */}
                  <Section className="w-80 pt-4 text-left sm:w-[350px]">
                    <Row>
                      <Column align="left" className="w-1/3">
                        <Text className="m-0 ml-4 text-center">
                          Expiration date
                        </Text>
                      </Column>
                      <Column align="center" className="w-1/3">
                        <Text className="m-0 text-center">Value</Text>
                      </Column>
                      <Column align="right" className="w-1/3">
                        <Text className="m-0 mr-5 text-center">Status</Text>
                      </Column>
                    </Row>
                  </Section>

                  <Section className="text-center">
                    {rewardsExpiringThisMonth.map((reward) => (
                      <ExpiringReward key={reward.id} reward={reward} />
                    ))}
                  </Section>
                </Section>
              </Section>

              <Section className="text-center">
                <Button
                  href={`https://khueskitchen.com/order`}
                  className="mb-8 rounded-md bg-primary px-8 py-4 text-offwhite"
                >
                  View your account&apos;s rewards
                </Button>
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

export default RewardsExpiringThisMonth;

function ExpiringReward({ reward }: { reward: Reward }) {
  // Calculate the difference in milliseconds
  const millisecondsUntilExpiration = new Decimal(
    reward.expiresAt.getTime(),
  ).sub(new Decimal(new Date().getTime()));

  // Convert milliseconds to days (1 day = 24 * 60 * 60 * 1000 milliseconds)
  const daysInMilliseconds = new Decimal(24 * 60 * 60 * 1000);
  const daysUntilExpiration = millisecondsUntilExpiration
    .div(daysInMilliseconds)
    .floor()
    .toNumber();

  return (
    <Section className="mt-4 w-80 rounded-md bg-stone-200 p-4 text-left sm:w-[350px]">
      <Section align="center">
        <Row align="center">
          <Column align="left" className="w-1/3">
            <Row>
              <Text className="m-0 text-center font-semibold">
                {daysUntilExpiration === 0
                  ? "Today"
                  : `${daysUntilExpiration === 1 ? "1 day" : `in ${daysUntilExpiration} days`} `}
              </Text>
            </Row>
          </Column>

          <Column align="center" className="w-1/3">
            <Text className="my-0 text-center font-medium">
              {reward.value} points
            </Text>
          </Column>

          <Column align="right" className="w-1/3">
            <Text className="my-0 text-center font-medium">
              {reward.partiallyRedeemed ? "Partially used" : "Unused"}
            </Text>
          </Column>
        </Row>
      </Section>
    </Section>
  );
}
