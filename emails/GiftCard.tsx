import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import * as React from "react";
import { main, container, tailwindConfig } from "emails/utils/styles";
import Header from "emails/Header";
import Footer from "emails/Footer";
import dynamicAssetUrls from "emails/utils/dynamicAssetUrls";
import { formatPrice } from "~/utils/formatters/formatPrice";

interface GiftCardEmailProps {
  senderName: string;
  recipientName: string;
  amount: number; // in cents
  code: string;
  message?: string;
}

export const GiftCardEmail = ({
  senderName = "John Doe",
  recipientName = "Jane Doe",
  amount = 5000,
  code = "ABCD-1234-EFGH-5678",
  message = "Happy Birthday! Enjoy some delicious food!",
}: GiftCardEmailProps) => {
  const { baseUrl } = dynamicAssetUrls;

  return (
    <Html>
      <Preview>You received a gift card from {senderName}!</Preview>
      <Tailwind config={tailwindConfig}>
        <Head />
        <Body style={main} className="bg-white font-sans">
          <Container style={container} className="mx-auto max-w-[600px]">
            <Section className="rounded-lg bg-offwhite">
              <Header />

              <Section className="p-8 text-center">
                <Heading className="mb-4 text-2xl font-bold text-stone-800">
                  You&apos;ve received a gift card!
                </Heading>

                <Text className="mb-6 text-stone-600">
                  Hi {recipientName},<br />
                  {senderName} has sent you a Khue&apos;s Restaurant gift card.
                </Text>

                <Section className="mx-auto mb-6 max-w-[400px] rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
                  <Img
                    src={`${baseUrl}/gift-card-preview.png`} // You might want to replace this with a real image
                    alt="Gift Card"
                    className="mb-4 h-auto w-full rounded-lg object-cover"
                    width={350}
                    height={200}
                  />

                  <Text className="my-2 text-3xl font-bold text-stone-800">
                    {formatPrice(amount)}
                  </Text>

                  <Section className="my-4 rounded-md border border-dashed border-stone-300 bg-stone-100 p-3">
                    <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-500">
                      Gift Card Code
                    </Text>
                    <Text className="select-all font-mono text-xl font-bold tracking-widest text-stone-800">
                      {code}
                    </Text>
                  </Section>
                </Section>

                {message && (
                  <Section className="mx-auto mb-6 max-w-[400px] rounded-lg bg-stone-100 p-4">
                    <Text className="mb-2 text-sm italic text-stone-500">
                      Message from {senderName}:
                    </Text>
                    <Text className="font-medium text-stone-800">
                      &ldquo;{message}&rdquo;
                    </Text>
                  </Section>
                )}

                <Button
                  className="rounded-md bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
                  href={`${baseUrl}/order`}
                >
                  Order Now
                </Button>

                <Text className="mt-6 text-xs text-stone-400">
                  To redeem, enter the code above at checkout.
                </Text>
              </Section>

              <Footer userIsAMember={false} unsubscriptionToken="" />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default GiftCardEmail;
