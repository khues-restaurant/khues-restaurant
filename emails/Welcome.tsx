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
import Footer from "emails/Footer";
import Header from "emails/Header";
import dynamicAssetUrls from "emails/utils/dynamicAssetUrls";
import { main, container, tailwindConfig } from "emails/utils/styles";

interface Welcome {
  firstName: string;
  unsubscriptionToken: string;
}

function Welcome({ firstName, unsubscriptionToken }: Welcome) {
  const { baseUrl } = dynamicAssetUrls;

  return (
    <Html>
      <Preview>Welcome to Khue&apos;s Rewards Program!</Preview>
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
                <Text className="text-xl font-semibold">
                  Welcome to the Khue&apos;s Rewards Program, {firstName}
                </Text>
                <Text>
                  You now have access to free perks including earning points on
                  your orders, a complementary birthday gift, and the ability to
                  try new items before they&apos;re on the menu.
                </Text>

                <Section className="my-8 text-center">
                  <Column align="center">
                    <Img
                      src={`${baseUrl}/myOrders.jpg`}
                      alt="Promotional image for order now card"
                      className="my-8 h-[176.4px] w-[336px] rounded-md sm:h-[252px] sm:w-[480px]"
                    />

                    <Link
                      href="https://khueskitchen.com/order"
                      className="block w-[253px]"
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

export default Welcome;
