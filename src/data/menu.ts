export type MenuItem = {
  name: string;
  description?: string;
  price: number;
  altPrice?: number;
  showUndercookedOrRawDisclaimer?: boolean;
  isWeekendSpecial?: boolean;
  isChefsChoice?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isDairyFree?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  askServerForAvailability?: boolean;
  isMagnumBottle?: boolean;
};

export type MenuCategory = {
  name: string;
  menuItems: MenuItem[];
};

export const menuCategories: MenuCategory[] = [
  {
    name: "Starters",
    menuItems: [
      {
        name: "Cream Cheese Wontons",
        description: "Savory cream cheese, sweet and sour sauce",
        price: 1200,
        isVegetarian: true,
      },
      {
        name: "Crispy Pork Lettuce Wraps",
        description:
          "Vietnamese roast pork, woven noodles, butter lettuce, cucumbers, herb salad, fish sauce vinaigrette",
        price: 1700,
        isWeekendSpecial: true,
        isDairyFree: true,
        isGlutenFree: true,
      },
      {
        name: "Khue's Chicken Salad",
        description:
          "Taiwanese cabbage, rau ram, thai chiles, fish sauce vinaigrette, crushed peanuts",
        price: 1600,
        isDairyFree: true,
        isGlutenFree: true,
        isSpicy: true,
      },
    ],
  },
  {
    name: "Entrees",
    menuItems: [
      {
        name: "Roast Pork Fried Rice",
        description:
          "Scallion oil, crispy pork, lap xuong, fried egg, chili crunch. Can be vegetarian.",
        price: 1700,
        showUndercookedOrRawDisclaimer: true,
        isDairyFree: true,
      },
      {
        name: "Spicy Chicken Sandwich",
        description:
          "Brioche bun, lettuce, tomato, house pickles, herb aioli, chili crunch",
        price: 1800,
      },
      {
        name: "20 oz Grilled Ribeye",
        description:
          "Traditional Vietnamese marinade, jasmine rice, yu choy, scallions",
        price: 5900,
        showUndercookedOrRawDisclaimer: true,
        isDairyFree: true,
      },
      {
        name: "Sticky Jicama Ribs",
        description:
          "Marinated tofu, fried jicama, jasmine rice, soy glaze, toasted sesame seeds, mint, scallions",
        price: 2100,
        isVegetarian: true,
        isVegan: true,
      },
      {
        name: "Chili Crunch Wings",
        description: "Green garlic ranch, house pickles",
        price: 1700,
      },
      {
        name: "Grilled Thick-Cut Pork Chop",
        description:
          "Peppercorn marinade, jasmine rice, scallion oil, nước mắm salad, fried egg",
        price: 3600,
        showUndercookedOrRawDisclaimer: true,
        isDairyFree: true,
      },
      {
        name: "Bún Chay | Rice Noodle Salad",
        description:
          "Crispy tofu, vermicelli, soy vinaigrette, herb salad, perilla leaf, crushed peanuts",
        price: 2000,
        isVegetarian: true,
        isVegan: true,
      },
    ],
  },
  {
    name: "Desserts",
    menuItems: [
      {
        name: "Cà Phê Sữa Đá Affogato",
        description:
          "Vietnamese coffee, vanilla ice cream, black sesame coconut shard.",
        price: 900,
        isVegetarian: true,
        isGlutenFree: true,
      },
      {
        name: "Thai Tea Tres Leches",
        description:
          "Milk soaked chiffon cake, caramelized coconut cream, shortbread crumble, brown sugar boba",
        price: 1400,
        isVegetarian: true,
      },
    ],
  },
  {
    name: "Sparkling",
    menuItems: [
      {
        name: "Poggio Costa",
        description:
          'Sparkling Rosé, Prosecco, Glera, Pinot Nero, "The Hill by the Sea," Italy',
        price: 1400,
        altPrice: 5400,
      },
      {
        name: "Albet i Noya",
        description: "Xarel·lo, Macabeu, Parellada, Penedès, Spain",
        price: 1500,
        altPrice: 5800,
      },
    ],
  },
  {
    name: "White",
    menuItems: [
      {
        name: "Wiley",
        description:
          "Tocai Friulano, Chardonnay, Oak Knoll and Potter Valley, California",
        price: 1800,
        altPrice: 6800,
      },
      {
        name: "Rodica",
        description: "Malvasia, Truške, Istria, Slovenia",
        price: 1600,
        altPrice: 6000,
      },
      {
        name: "Sandy Cove",
        description: "Sauvignon Blanc 2025, Marlborough, New Zealand",
        price: 1400,
        altPrice: 5200,
      },
      {
        name: "Martin Woods",
        description: "Aligoté 2023, Chehalem Mountains, Oregon",
        price: 10000,
        askServerForAvailability: true,
      },
      {
        name: "Amevive",
        description: "Roussanne 2023, Los Olivos District, California",
        price: 8500,
        askServerForAvailability: true,
      },
      {
        name: "Bodegas Los Bermejos",
        description: "Malvasía, Volcánica Seco, Canary Islands, Spain",
        price: 7500,
        askServerForAvailability: true,
      },
      {
        name: "Occhipinti",
        description: "Albanello, Muscat of Alexandria 2024, Sicily, Italy",
        price: 7000,
        askServerForAvailability: true,
      },
    ],
  },
  {
    name: "Orange / Rosé",
    menuItems: [
      {
        name: "Sanctum",
        description: "Skin Contact, White Blend, Styria, Slovenia",
        price: 1600,
        altPrice: 6300,
      },
      {
        name: "Moulin de Gassac",
        description: "Rosé, Grenache, Carignan, Cinsault, Languedoc, France",
        price: 1200,
        altPrice: 4400,
      },
    ],
  },
  {
    name: "Red",
    menuItems: [
      {
        name: "The Paring",
        description:
          "Cabernet Sauvignon, Cabernet Franc, Merlot 2021, Santa Barbara County, California",
        price: 1800,
        altPrice: 6800,
      },
      {
        name: "Newfound 'Gravels'",
        description:
          "Grenache, Counoise, Syrah 2023, Sierra Foothills, California",
        price: 1600,
        altPrice: 6000,
      },
      {
        name: "Pullus",
        description: "Pinot Noir, Štajerska, Slovenia",
        price: 1400,
        altPrice: 5400,
      },
      {
        name: "Jonata Todos",
        description: "Bordeaux Blend, Santa Ynez Valley, California",
        price: 10500,
        askServerForAvailability: true,
      },
      {
        name: "Santini Au Vin Rouge",
        description: "Pinot Noir, Gamay, Chardonnay, France",
        price: 9800,
        askServerForAvailability: true,
      },
      {
        name: "Lady of the Sunshine",
        description: "Nero d'Avola, Pinot Noir 2024, Edna Valley, California",
        price: 9500,
        askServerForAvailability: true,
      },
      {
        name: "Le Fruit du Hasard",
        description: "Carignan, Syrah, Languedoc-Roussillon, France",
        price: 6000,
        askServerForAvailability: true,
      },
    ],
  },
  {
    name: "Sake",
    menuItems: [
      {
        name: "Mana 1751 True Vision",
        description:
          "Producer: Manatsuru | Grade: Tokubetsu Junmai, Yamahai, Muroka, Genshu",
        price: 1800,
        altPrice: 8500,
      },
      {
        name: "Blue Hue",
        description: "Producer: Tsukinowa Brewery | Grade: Honjozo | Magnum",
        price: 1600,
        altPrice: 12800,
        isMagnumBottle: true,
      },
      {
        name: "Blossom of Peace",
        description: "Producer: Tozai, Plum Sake, sweet but balanced",
        price: 1400,
        altPrice: 5500,
      },
    ],
  },
  {
    name: "Cider",
    menuItems: [
      {
        name: "Keepsake",
        description: "Semi-sweet cider, farmhouse blend, Dundas, MN",
        price: 900,
        altPrice: 3200,
      },
      {
        name: "Beak & Skiff 1911",
        description: "Pineapple, mango, refreshing hard cider, Lafayette, NY",
        price: 800,
      },
    ],
  },
  {
    name: "Beer",
    menuItems: [
      {
        name: "Terra Lager",
        description: "Crisp, clean, refreshing lager, South Korea",
        price: 600,
      },
      {
        name: "BlackStack 'Slopes' Pilsner",
        description: "Light-bodied, fresh French-style pilsner, Saint Paul, MN",
        price: 700,
      },
      {
        name: "YOHO 'Wednesday Cat' Belgian White Ale",
        description: "Bright, citrusy, smooth Belgian white ale, Japan",
        price: 900,
      },
      {
        name: "YOHO 'Aooni' IPA",
        description: "Bold, hoppy, earthy Japanese IPA, Japan",
        price: 900,
      },
    ],
  },
  {
    name: "N/A Beverages",
    menuItems: [
      {
        name: "Unified Ferments Jasmine Green",
        description:
          "Organic, fermented, caffeinated, eucalyptus, tuberose, and jasmine flowers",
        price: 1200,
        altPrice: 4600,
      },
      {
        name: "Aplós [N/A Cocktail]",
        description: "Ume Spritz or Dragon Fruit Martini",
        price: 800,
      },
      {
        name: "Surly Outlook Good Hoppy Pale",
        description: "Aromatic hops, citrus, lemon, clean bitterness",
        price: 600,
      },
      {
        name: "Cà Phê Sữa Đá Coffee",
        description: "Bold, sweet, creamy Vietnamese coffee over ice",
        price: 800,
      },
    ],
  },
  {
    name: "Soda",
    menuItems: [
      {
        name: "Sprite",
        price: 300,
      },
      {
        name: "Coke",
        price: 300,
      },
      {
        name: "Diet Coke",
        price: 300,
      },
      {
        name: "Canada Dry",
        price: 300,
      },
      {
        name: "Sparkling Water",
        price: 300,
      },
    ],
  },
];
