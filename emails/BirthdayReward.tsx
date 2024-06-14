import {
  Body,
  Button,
  Column,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import Footer from "emails/Footer";
import { type MenuItem } from "@prisma/client";
import { container, main, tailwindConfig } from "emails/utils/styles";
import { addWeeks, format, setYear } from "date-fns";
import Header from "emails/Header";
import { toZonedTime } from "date-fns-tz";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

interface BirthdayReward {
  firstName: string;
  birthday: Date;
  birthdayRewards: MenuItem[];
  unsubscriptionToken: string;
}

function BirthdayReward(
  {
    // firstName,
    // birthday,
    // birthdayRewards,
    // unsubscriptionToken,
  }: BirthdayReward,
) {
  const unsubscriptionToken = "testUnsubToken";
  const firstName = "Michael";
  const birthday = new Date();

  const birthdayInCST = toZonedTime(birthday, "America/Chicago");

  const currentYear = new Date().getFullYear();

  // Adjust the birthday to the current year
  const birthdayThisYear = setYear(birthdayInCST, currentYear);

  // email will be sent out 2 weeks before the birthday
  const startDate = birthdayThisYear;
  const endDate = addWeeks(birthdayThisYear, 4);

  // Formatting dates as needed (e.g., 'MMMM do' for 'June 12th')
  const formattedStartDate = format(startDate, "MMMM do");
  const formattedEndDate = format(endDate, "MMMM do");

  const birthdayRewards = [
    {
      id: "cab3e737-7b07-423f-9d9c-8bce07a9e3e2",
      createdAt: new Date(),
      name: "Cream Cheese Wontons",
      description:
        "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
      imageUrl: "test",
      price: 1100,
      altPrice: null,
      available: true,
      discontinued: false,
      listOrder: 2,
      menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
      activeDiscountId: null,
      isChefsChoice: true,
      isAlcoholic: false,
      isVegetarian: false,
      isVegan: true,
      isGlutenFree: true,
      showUndercookedOrRawDisclaimer: false,
      pointReward: true,
      birthdayReward: false,
      reviews: null,
      activeDiscount: null,
      customizationCategories: [],
    },
    {
      id: "7b0aa9eb-2a87-48cd-8c98-67b3f5a4b74f",
      createdAt: new Date(),
      name: "Vietnamese Bar Nuts",
      description:
        "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
      imageUrl: "test",
      price: 1200,
      altPrice: null,
      available: true,
      discontinued: false,
      listOrder: 1,
      menuCategoryId: "60f90b72-e44a-4775-b071-97ed5dc020d3",
      activeDiscountId: null,
      isChefsChoice: false,
      isAlcoholic: false,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      showUndercookedOrRawDisclaimer: false,
      pointReward: true,
      birthdayReward: false,
      reviews: null,
      activeDiscount: null,
      customizationCategories: [],
    },
    {
      id: "60cdfd99-7970-4ce1-9032-6918f4dfcfec",
      createdAt: new Date(),
      name: "Xiu Mai",
      description:
        "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
      imageUrl: "test",
      price: 1900,
      altPrice: null,
      available: true,
      discontinued: false,
      listOrder: 14,
      menuCategoryId: "d500046e-b7d2-44a4-973e-568a143c48f0",
      activeDiscountId: null,
      isChefsChoice: true,
      isAlcoholic: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      showUndercookedOrRawDisclaimer: false,
      pointReward: true,
      birthdayReward: false,
      reviews: null,
      activeDiscount: null,
      customizationCategories: [],
    },
    {
      id: "7bd980fe-a447-401d-8880-03ec4773a9b2",
      createdAt: new Date(),
      name: "Grilled Pork Vermicelli",
      description:
        "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
      imageUrl: "test",
      price: 1900,
      altPrice: null,
      available: true,
      discontinued: false,
      listOrder: 4,
      menuCategoryId: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
      activeDiscountId: null,
      isChefsChoice: false,
      isAlcoholic: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      showUndercookedOrRawDisclaimer: true,
      pointReward: true,
      birthdayReward: false,
      reviews: null,
      activeDiscount: null,
      customizationCategories: [],
    },
    {
      id: "d809597c-803b-4bbb-b8b9-65d57b5a3577",
      createdAt: new Date(),
      name: "Chicken Sandwich",
      description:
        "Silky ricotta, signature red sauce, Italian sausage, mozzarella & parmesan cheeses.",
      imageUrl: "test",
      price: 1900,
      altPrice: null,
      available: true,
      discontinued: false,
      listOrder: 6,
      menuCategoryId: "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
      activeDiscountId: null,
      isChefsChoice: true,
      isAlcoholic: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      showUndercookedOrRawDisclaimer: false,
      pointReward: true,
      birthdayReward: false,
      reviews: null,
      activeDiscount: null,
      customizationCategories: [],
    },
  ];

  return (
    <Html>
      <Preview>
        Your special day is coming up! Enjoy a complimentary dessert to make
        your birthday even sweeter.
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
                  <Text className="my-1 text-left">Hi {firstName},</Text>
                </Row>

                <Row align="center" className="w-64">
                  <Text className="my-1 text-left">
                    We&apos;re excited to celebrate your upcoming birthday with
                    you! As a special treat, we&apos;re offering you a
                    complimentary dessert to make your day even more delightful.
                  </Text>
                </Row>

                <Row align="center" className="w-64">
                  <Text className="my-1 text-left">
                    You can redeem your free dessert when placing a pickup order
                    on our website anytime between{" "}
                    <strong>{formattedStartDate}</strong> and{" "}
                    <strong>{formattedEndDate}</strong>.
                  </Text>
                </Row>

                <Hr />

                <Section className="my-8 text-center">
                  <Text className="text-center text-lg font-medium">
                    Explore your reward options
                  </Text>

                  <Section className="w-80 rounded-md bg-stone-200 p-4 text-center sm:w-[350px]">
                    {birthdayRewards.map((reward) => (
                      <Row key={reward.id} align="center">
                        <Column align="left">
                          <Text className="text-left font-semibold">
                            {reward.name}
                          </Text>
                          <Text className="text-left">
                            {reward.description}
                          </Text>
                        </Column>

                        <Column align="right">
                          <Img
                            src={`${baseUrl}/static/sampleImage.png`}
                            alt={`Image of ${reward.name}`}
                            width="100"
                            height="100"
                            className="my-0 ml-2 text-right sm:ml-4"
                          />
                        </Column>
                      </Row>
                    ))}
                  </Section>
                </Section>
              </Section>

              <Section className="text-center">
                <Button
                  href={`https://khueskitchen.com/order`}
                  className="mb-8 rounded-md bg-primary px-8 py-4 text-offwhite"
                >
                  Redeem your birthday reward
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

export default BirthdayReward;
