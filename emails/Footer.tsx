import { Column, Img, Link, Row, Section, Text } from "@react-email/components";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

interface Footer {
  userIsAMember: boolean;
  unsubscriptionToken: string;
}

function Footer({ userIsAMember, unsubscriptionToken }: Footer) {
  return (
    <Section className="relative -bottom-4 rounded-b-lg bg-primary text-offwhite">
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
  );
}

export default Footer;
