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
            <Link href="tel:+1234567890">
              <Text className="mb-0 text-xs text-offwhite">
                1234 Lorem Ipsum Dr. Roseville, MN 12345
              </Text>
            </Link>
          </Column>
        </Row>

        <Row className="w-[350px] sm:hidden">
          <Column className="text-center">
            <Link href="tel:+1234567890">
              <Text className="mb-0 pl-2 text-xs text-offwhite">
                (123) 456-7890
              </Text>
            </Link>
          </Column>
        </Row>

        <Row className="hidden w-[363px] sm:inline-table">
          <Column className="w-[256px]">
            <Link href="tel:+1234567890">
              <Text className="mb-0 text-xs text-offwhite">
                1234 Lorem Ipsum Dr. Roseville, MN 12345
              </Text>
            </Link>
          </Column>

          <Column className="">
            <Text className="mb-0">|</Text>
          </Column>

          <Column className="w-[91px]">
            <Link href="tel:+1234567890">
              <Text className="mb-0 pl-2 text-xs text-offwhite">
                (123) 456-7890
              </Text>
            </Link>
          </Column>
        </Row>

        <Row className="mt-3 w-52">
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
                src={`${baseUrl}/socials/whiteTiktok.png`}
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
                src={`${baseUrl}/socials/whiteInstagram.png`}
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
                src={`${baseUrl}/socials/whiteFacebook.png`}
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
                src={`${baseUrl}/socials/whiteTwitter.png`}
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
  );
}

export default Footer;
