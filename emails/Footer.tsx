import { Column, Img, Link, Row, Section, Text } from "@react-email/components";
import dynamicAssetUrls from "emails/utils/dynamicAssetUrls";

interface Footer {
  userIsAMember: boolean;
  unsubscriptionToken: string;
}

function Footer({ userIsAMember, unsubscriptionToken }: Footer) {
  const { baseUrl } = dynamicAssetUrls;

  return (
    <Section className="relative rounded-b-lg bg-primary text-offwhite">
      <Column align="center">
        <Row className="w-[350px] sm:hidden">
          <Column className="text-center">
            <Link
              href="https://maps.app.goo.gl/CF5wv5oK1SBhsme56"
              target="_blank"
              rel="noreferrer"
            >
              <Text className="mb-0 text-xs text-offwhite">
                693 Raymond Ave, St. Paul, MN 55114
              </Text>
            </Link>
          </Column>
        </Row>

        <Row className="w-[350px] sm:hidden">
          <Column className="text-center">
            <Link href="tel:+16126009139">
              <Text className="!mb-6 !mt-2 text-xs text-offwhite">
                (612) 600-9139
              </Text>
            </Link>
          </Column>
        </Row>

        <Row className="hidden w-auto sm:inline-table">
          <Column>
            <Link
              href="https://maps.app.goo.gl/CF5wv5oK1SBhsme56"
              target="_blank"
              rel="noreferrer"
            >
              <Text className="mb-0 text-xs text-offwhite">
                693 Raymond Ave, St. Paul, MN 55114
              </Text>
            </Link>
          </Column>

          <Column className="px-3">
            <Text className="mb-0">|</Text>
          </Column>

          <Column>
            <Link href="tel:+16126009139">
              <Text className="mb-0 text-xs text-offwhite">(612) 600-9139</Text>
            </Link>
          </Column>
        </Row>

        <Row className="!my-0 w-auto !py-0">
          <Column className="!my-0 !py-0 text-left">
            <Link href="https://www.khueskitchen.com" className="!my-0 !py-0">
              <Text className="!my-0 !py-0 text-xs text-offwhite">
                Visit our website
              </Text>
            </Link>
          </Column>

          <Column className="!my-0 !py-0 text-center">
            <Text className="!my-0 !py-0 px-3">|</Text>
          </Column>

          <Column className="!my-0 !py-0 text-right">
            <Link
              href="https://www.khueskitchen.com/privacy"
              className="!my-0 !py-0"
            >
              <Text className="!my-0 !py-0 text-xs text-offwhite">
                Privacy Policy
              </Text>
            </Link>
          </Column>
        </Row>

        <Text className="!mt-6 mb-0 text-sm font-medium">
          Follow us on social media!
        </Text>

        <Row
          align="center"
          style={{
            width: "100px",
          }}
        >
          <Column>
            <Link href="https://www.instagram.com/khueskitchen">
              <Img
                src={`${baseUrl}/socials/whiteInstagram.png`}
                width="24"
                height="24"
                alt="Follow Khue's on Instagram"
                className="m-4"
              />
            </Link>
          </Column>
          <Column>
            <Link href="https://www.facebook.com/khueskitchen">
              <Img
                src={`${baseUrl}/socials/whiteFacebook.png`}
                width="24"
                height="24"
                alt="Follow Khue's on Facebook"
                className="m-4"
              />
            </Link>
          </Column>
          <Column>
            <Link href="https://www.tiktok.com/@khues_kitchen">
              <Img
                src={`${baseUrl}/socials/whiteTiktok.png`}
                width="24"
                height="24"
                alt="Follow Khue's on TikTok"
                className="m-4"
              />
            </Link>
          </Column>
        </Row>

        <Text className="text-xs">
          © 2025 Khue&apos;s. All rights reserved.
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
  );
}

export default Footer;
