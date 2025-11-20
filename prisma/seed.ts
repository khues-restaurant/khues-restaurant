import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // --------------------------------------------------------
  // IMPORTANT: PRE-REQUISITE DATA
  // You must ensure the Categories exist before inserting MenuItems
  // that reference them.
  // --------------------------------------------------------

  // Example: Creating the missing categories referenced in your SQL
  // (You should replace these generic names with your actual category names)
  const categoryIds = [
    "60f90b72-e44a-4775-b071-97ed5dc020d3",
    "98b3d4ba-4689-4372-a206-448f7eb5ebf4",
    "7abeebb9-4fce-457a-af05-adb1b89aa1b0",
    "a7403e9f-35b7-48f6-add7-a5d9121a5f6d",
    "22fe5cbd-8e0b-4387-9456-006b31d5ec72",
    "6b21a3e1-97b4-45d7-9a93-25547c0990d6",
    "86c7aa2a-64f1-488a-a87e-8efc3a79447f",
    "bc6ad82c-c33c-4e91-93bb-610ac4ecc026",
    "afbe0627-48a5-40df-bd5d-f6bb25fd2a07",
    "abf33b8e-670d-4e08-98bb-380799928c7f",
  ];

  console.log("Ensuring categories exist...");
  for (const id of categoryIds) {
    await prisma.menuCategory.upsert({
      where: { id: id },
      update: {},
      create: {
        id: id,
        name: "Seeded Category Placeholder", // You might want to verify the actual names
        listOrder: 1,
      },
    });
  }

  // --------------------------------------------------------
  // THE RAW SQL INJECTION
  // --------------------------------------------------------

  // Note: We removed "BEGIN;" and "COMMIT;" because $executeRawUnsafe
  // handles the execution. We rely on Postgres to handle the apostrophe escaping
  // present in your string (e.g., 'Khue''s Chicken Salad').
  const rawSql = `
    INSERT INTO "MenuItem" (
        "id", "createdAt", "updatedAt", "name", "description", "price", "altPrice", 
        "available", "discontinued", "listOrder", "menuCategoryId", "activeDiscountId", 
        "isChefsChoice", "isWeekendSpecial", "isVegetarian", "isVegan", 
        "isDairyFree", "isGlutenFree", "isSpicy", "askServerForAvailability", 
        "showUndercookedOrRawDisclaimer", "birthdayReward", "reviews"
    ) VALUES
    ('7b0aa9eb-2a87-48cd-8c98-67b3f5a4b74f', '2024-02-21T03:51:47.000Z', '2024-02-21T03:51:47.000Z', 'Cream Cheese Wontons', 'Savory cream cheese, sweet and sour sauce', 1200, NULL, true, false, 1, '60f90b72-e44a-4775-b071-97ed5dc020d3', NULL, false, false, true, false, false, false, false, false, false, false, NULL),
    ('702b5c80-7d63-43ef-a80f-948c64c21575', '2024-05-15T21:32:32.217Z', '2024-05-15T21:32:32.217Z', 'Crispy Pork Lettuce Wraps', 'Vietnamese roast pork, woven noodles, butter lettuce, cucumbers, herb salad, fish sauce vinaigrette', 1500, NULL, true, false, 2, '60f90b72-e44a-4775-b071-97ed5dc020d3', NULL, false, true, false, false, true, true, false, false, false, false, NULL),
    ('2315135f-19f4-4ede-9af7-0ffccadd2557', '2024-05-15T21:28:07.340Z', '2024-05-15T21:28:07.340Z', 'Khue''s Chicken Salad', 'Taiwanese cabbage, rau ram, thai chiles, fish sauce vinaigrette, crushed peanuts', 1500, NULL, true, false, 3, '60f90b72-e44a-4775-b071-97ed5dc020d3', NULL, false, false, false, false, true, true, true, false, false, false, NULL),
    ('1663442b-e4a2-4bac-a5ab-b7d2edb7cfd9', '2024-05-15T21:36:35.209Z', '2024-05-15T21:36:35.209Z', 'Roast Pork Fried Rice', 'Scallion oil, crispy pork, lap xuong, fried egg, chili crunch. Can be vegetarian.', 1600, NULL, true, false, 1, '98b3d4ba-4689-4372-a206-448f7eb5ebf4', NULL, false, false, false, false, true, false, false, false, true, false, NULL),
    ('a44bfc71-facd-4ce6-a576-afbac6e2b2f3', '2024-05-15T16:36:35.000Z', '2024-05-15T16:36:35.000Z', 'Spicy Chicken Sandwich', 'Brioche bun, lettuce, tomato, house pickles, herb aioli, chili crunch', 1700, NULL, true, false, 2, '98b3d4ba-4689-4372-a206-448f7eb5ebf4', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('aa7afbc1-8dad-49b8-ac9c-4c7651264dde', '2024-02-20T15:53:09.000Z', '2024-02-20T15:53:09.000Z', 'Bún Chay | Rice Noodle Salad', 'Crispy tofu, vermicelli, soy vinaigrette, herb salad, perilla leaf, crushed peanuts', 1900, NULL, true, false, 8, '98b3d4ba-4689-4372-a206-448f7eb5ebf4', NULL, false, false, true, true, false, false, false, false, false, false, NULL),
    ('cab3e737-7b07-423f-9d9c-8bce07a9e3e2', '2024-02-20T15:53:09.000Z', '2024-02-20T15:53:09.000Z', 'Sticky Jicama Ribs', 'Marinated tofu, fried jicama, jasmine rice, soy glaze, toasted sesame seeds, mint, scallions', 2100, NULL, true, false, 4, '98b3d4ba-4689-4372-a206-448f7eb5ebf4', NULL, false, false, true, true, false, false, false, false, false, false, NULL),
    ('7bd980fe-a447-401d-8880-03ec4773a9b2', '2024-02-20T21:54:12.000Z', '2024-02-20T21:54:12.000Z', '20 oz Grilled Ribeye', 'Traditional Vietnamese marinade, jasmine rice, yu choy, scallions', 4900, NULL, true, false, 3, '98b3d4ba-4689-4372-a206-448f7eb5ebf4', NULL, false, false, false, false, true, false, false, false, true, false, NULL),
    ('a776d637-bb2d-4e48-ab52-2c7fe70d16e4', '2024-02-21T15:54:46.000Z', '2024-02-21T15:54:46.000Z', 'Chili Crunch Wings', 'Green garlic ranch, house pickles', 1600, NULL, true, false, 5, '98b3d4ba-4689-4372-a206-448f7eb5ebf4', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('32ca68b1-ec1b-4bdc-b853-51b63d73cb26', '2024-02-21T15:54:46.000Z', '2024-02-21T15:54:46.000Z', 'Grilled Thick-Cut Pork Chop', 'Peppercorn marinade, jasmine rice, scallion oil, nước mắm salad, fried egg', 2800, NULL, true, false, 7, '98b3d4ba-4689-4372-a206-448f7eb5ebf4', NULL, false, false, false, false, true, false, false, false, true, false, NULL),
    ('3581eac7-f105-486e-97de-2aa234bb6e0c', '2024-05-15T21:38:58.971Z', '2024-05-15T21:38:58.971Z', 'Cà Phê Sữa Đá Affogato', 'Vietnamese coffee, vanilla ice cream, black sesame coconut tuile. * Contains hazelnuts', 900, NULL, true, false, 1, '7abeebb9-4fce-457a-af05-adb1b89aa1b0', NULL, false, false, true, false, false, true, false, false, false, true, NULL),
    ('3dad69fb-2607-4563-aeca-79515f93e06d', '2024-02-21T09:58:09.000Z', '2024-02-21T09:58:09.000Z', 'Thai Tea Tres Leches', 'Milk soaked chiffon cake, caramelized coconut cream, shortbread crumble, brown sugar boba', 1200, NULL, true, false, 2, '7abeebb9-4fce-457a-af05-adb1b89aa1b0', NULL, false, false, true, false, false, false, false, false, false, true, NULL),
    ('06eb8dce-1e9d-4053-a843-4dec5c217f14', '2024-03-29T16:10:53.000Z', '2024-03-29T16:10:53.000Z', 'Rodica', 'Sparkling Rosé, Pét-Nat, Refošk, Slovenia', 1600, 5800, true, false, 2, 'a7403e9f-35b7-48f6-add7-a5d9121a5f6d', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('a48bf6eb-c185-49b9-9d53-d1651015ae4f', '2024-03-29T16:10:53.000Z', '2024-03-29T16:10:53.000Z', 'Avinyó', 'Sparkling Pét-Nat, Muscat Frontignan, Macabeo, Catalonia, Spain', 1300, 4700, true, false, 2, 'a7403e9f-35b7-48f6-add7-a5d9121a5f6d', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('a6c44c03-de7f-431f-acee-305fc9ee0c9a', '2024-03-29T16:10:53.000Z', '2024-03-29T16:10:53.000Z', 'Schafer-Frohlich', 'Müller-Thurgau 2022, Franken, Germany', 1600, 6000, true, false, 2, '22fe5cbd-8e0b-4387-9456-006b31d5ec72', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('86b82c5c-f764-4041-b2b8-70e60b80ba5d', '2024-03-29T16:10:53.000Z', '2024-03-29T16:10:53.000Z', 'Madson', 'Chardonnay 2022, Central Coast, California', 1800, 7500, true, false, 2, '22fe5cbd-8e0b-4387-9456-006b31d5ec72', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('36ee18b8-5aff-4a56-be1a-f1ed53f7ed83', '2024-03-29T16:10:53.000Z', '2024-03-29T16:10:53.000Z', 'Salvatore Marino', '"Turi" 2022, Sicily, Italy', 1500, 5500, true, false, 2, '22fe5cbd-8e0b-4387-9456-006b31d5ec72', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('ee0bcc63-541c-4dca-a8b1-b2459508af26', '2024-03-29T16:10:53.000Z', '2024-03-29T16:10:53.000Z', 'La Pepie', 'Muscadet, Loire Valley, France', 4400, NULL, true, false, 2, '22fe5cbd-8e0b-4387-9456-006b31d5ec72', NULL, false, false, false, false, false, false, false, true, false, false, NULL),
    ('b8324c59-a00a-4019-b3d4-3eb49e50618f', '2024-03-29T16:10:53.000Z', '2024-03-29T16:10:53.000Z', 'Koehler-Ruprecht', 'Chardonnay, Pfalz, Germany', 5400, NULL, true, false, 2, '22fe5cbd-8e0b-4387-9456-006b31d5ec72', NULL, false, false, false, false, false, false, false, true, false, false, NULL),
    ('afdbd5a9-431e-4bc0-9488-7cc44e30fa48', '2024-03-29T16:10:53.000Z', '2024-03-29T16:10:53.000Z', 'Maloof, "Where Ya PJ''s At"', 'Gewürztraminer, Riesling, Pinot Gris', 1600, 6000, true, false, 2, '6b21a3e1-97b4-45d7-9a93-25547c0990d6', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('13ae4b38-92c7-42ab-bc94-ca2edd01049d', '2024-03-29T16:10:53.000Z', '2024-03-29T16:10:53.000Z', 'Ioppa', 'Nebbiolo Rosé, Piedmont, Italy', 1200, 4500, true, false, 2, '6b21a3e1-97b4-45d7-9a93-25547c0990d6', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('9107f0e1-dc76-4ccb-91c7-a7fa7e24a578', '2024-03-29T16:10:53.000Z', '2024-03-29T16:10:53.000Z', 'Fattoria Di Vaira', 'Orange, Falanghina, Trebbiano, Molise, Italy', 5000, NULL, true, false, 2, '6b21a3e1-97b4-45d7-9a93-25547c0990d6', NULL, false, false, false, false, false, false, false, true, false, false, NULL),
    ('b7e2d082-dc96-4e19-a705-5c5fab95a210', '2024-03-29T16:10:53.000Z', '2024-03-29T16:10:53.000Z', 'New Found', 'Mourvèdre, Grenache, Rosé, California', 5000, NULL, true, false, 2, '6b21a3e1-97b4-45d7-9a93-25547c0990d6', NULL, false, false, false, false, false, false, false, true, false, false, NULL),
    ('35daaaa0-b891-46fa-8f86-f7a3a36984a0', '2024-03-29T16:10:53.000Z', '2024-03-29T16:10:53.000Z', 'Chat Fout, Éric Texier', 'Grenache, White Varietals, Rhône Valley, France', 1600, 5800, true, false, 2, '86c7aa2a-64f1-488a-a87e-8efc3a79447f', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('761ce095-71f9-43e0-be42-890d5171c5c5', '2024-03-29T16:10:53.000Z', '2024-03-29T16:10:53.000Z', 'Hervé Viellemade', 'Gamay 2022, Loire Valley, France', 1600, 5800, true, false, 2, '86c7aa2a-64f1-488a-a87e-8efc3a79447f', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('83ee68f5-8bac-4105-8b88-c6158a2f47d2', '2024-03-29T16:10:53.000Z', '2024-03-29T16:10:53.000Z', 'Torre alle Tolfe', 'Chianti, Tuscany, Italy', 1700, 6100, true, false, 2, '86c7aa2a-64f1-488a-a87e-8efc3a79447f', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('aaea55ae-8889-4d8a-81b5-0bc48f24a721', '2024-03-29T16:10:10.000Z', '2024-03-29T16:10:10.000Z', 'Crane of Paradise', 'Producer: Kawatsuru / Grade: Junmai', 1600, 6500, true, false, 1, 'bc6ad82c-c33c-4e91-93bb-610ac4ecc026', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('dcb19f40-b0d1-4bb1-95aa-60912b76c385', '2024-03-29T16:09:49.000Z', '2024-03-29T16:09:49.000Z', 'Forgotten Fortune', 'Producer: Fukucho / Grade: Junmai', 1800, 7200, true, false, 2, 'bc6ad82c-c33c-4e91-93bb-610ac4ecc026', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('4a027a04-3fe6-440a-a860-3c0c9e0ef0a0', '2024-03-29T21:09:27.000Z', '2024-03-29T21:09:27.000Z', 'Fulton Chill City Chugger', 'Crisp, clean, smooth American lager', 600, NULL, true, false, 3, 'bc6ad82c-c33c-4e91-93bb-610ac4ecc026', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('8349fe66-81b0-4d04-8291-4ab60641676d', '2024-03-29T21:09:27.000Z', '2024-03-29T21:09:27.000Z', 'Lagunitas IPA', 'Hoppy, citrus, pine, caramel malt', 700, NULL, true, false, 4, 'bc6ad82c-c33c-4e91-93bb-610ac4ecc026', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('17130954-3dcc-47d9-806a-b222a458a9c7', '2024-03-29T21:09:27.000Z', '2024-03-29T21:09:27.000Z', 'Indeed Flavorwave IPA', 'Juicy, tropical, citrus, bold bitterness', 800, NULL, true, false, 5, 'bc6ad82c-c33c-4e91-93bb-610ac4ecc026', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('516bae9a-48d8-4d0a-9dae-8d8ae8a5e827', '2024-03-29T21:09:27.000Z', '2024-03-29T21:09:27.000Z', 'Left Hand Nitro Milk Stout', 'Creamy, chocolate, coffee, smooth finish', 800, NULL, true, false, 6, 'bc6ad82c-c33c-4e91-93bb-610ac4ecc026', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('717349d0-4829-4e4a-98ab-a9e00a67768a', '2024-02-20T21:56:02.000Z', '2024-02-20T21:56:02.000Z', 'Unified Ferments', 'Fermented, Oolong Tea or Jasmine Green Tea', 1500, 5400, true, false, 1, 'afbe0627-48a5-40df-bd5d-f6bb25fd2a07', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('b883736a-314d-4b19-a9e2-582a2a543790', '2024-02-20T21:57:13.000Z', '2024-02-20T21:57:13.000Z', 'Aplós (Cocktail)', 'Negroni or Ume Spritz', 800, NULL, true, false, 2, 'afbe0627-48a5-40df-bd5d-f6bb25fd2a07', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('f5adc265-dc7c-47ad-aead-cdad3d111de8', '2024-02-20T21:56:45.000Z', '2024-02-20T21:56:45.000Z', 'Lagunitas Hoppy Refresher', 'Crisp, citrusy, zero alcohol hop sparkle', 600, NULL, true, false, 3, 'afbe0627-48a5-40df-bd5d-f6bb25fd2a07', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('896d0c0d-ee5b-4cdb-9c87-163cbc825e1d', '2024-02-20T21:56:45.000Z', '2024-02-20T21:56:45.000Z', 'Cà Phê Sữa Đá Coffee', 'Bold, sweet, creamy Vietnamese coffee over ice. * Contains hazelnuts', 800, NULL, true, false, 4, 'afbe0627-48a5-40df-bd5d-f6bb25fd2a07', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('638d4427-3235-486b-b656-67a30458b05f', '2024-02-20T21:56:02.000Z', '2024-02-20T21:56:02.000Z', 'Sprite', '', 300, NULL, true, false, 1, 'abf33b8e-670d-4e08-98bb-380799928c7f', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('25db431c-2a2b-4535-b5f7-67a38a5e4fc1', '2024-02-20T21:57:13.000Z', '2024-02-20T21:57:13.000Z', 'Coke', '', 300, NULL, true, false, 2, 'abf33b8e-670d-4e08-98bb-380799928c7f', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('f82b585e-d5de-4834-a3cb-ea5e0309df28', '2024-02-20T21:56:45.000Z', '2024-02-20T21:56:45.000Z', 'Diet Coke', '', 300, NULL, true, false, 3, 'abf33b8e-670d-4e08-98bb-380799928c7f', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('a85b80bc-0f0a-4de9-aacf-1bdfd3a8a557', '2024-02-20T21:56:45.000Z', '2024-02-20T21:56:45.000Z', 'Canada Dry', '', 300, NULL, true, false, 4, 'abf33b8e-670d-4e08-98bb-380799928c7f', NULL, false, false, false, false, false, false, false, false, false, false, NULL),
    ('7a433898-4ebe-4347-b9e1-d932084422f3', '2024-02-20T21:56:45.000Z', '2024-02-20T21:56:45.000Z', 'San Pellegrino', '', 300, NULL, true, false, 5, 'abf33b8e-670d-4e08-98bb-380799928c7f', NULL, false, false, false, false, false, false, false, false, false, false, NULL);
  `;

  console.log("Executing raw SQL...");
  // ON CONFLICT DO NOTHING is not in your SQL, so this will fail if these IDs already exist.
  await prisma.$executeRawUnsafe(rawSql);

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
