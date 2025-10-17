import type { StaticImageData } from "next/image";

import creamCheeseWantons from "/public/menuItems/cream-cheese-wantons.png";
import roastPorkFriedRice from "/public/menuItems/roast-pork-fried-rice.png";
import spicyChickenSandwich from "/public/menuItems/spicy-chicken-sando.jpg";
import stickyJicamaRibs from "/public/menuItems/sticky-jicama-ribs.png";
import grilledRibeye from "/public/menuItems/20-oz-grilled-ribeye.png";
import affogato from "/public/menuItems/affogato.png";
import thaiTeaTresLeches from "/public/menuItems/thai-tea-tres-leches.png";
import chiliCrunchWings from "/public/menuItems/chili-crunch-wings.png";
import porkChop from "/public/menuItems/pork-chop.png";
import chickenSalad from "/public/menuItems/chicken-salad.png";
import bunChay from "/public/menuItems/bun-chay.png";

export const menuItemImagePaths: Record<string, StaticImageData> = {
  "Cream Cheese Wontons": creamCheeseWantons,
  "Khue's Chicken Salad": chickenSalad,
  "Roast Pork Fried Rice": roastPorkFriedRice,
  "Chili Crunch Wings": chiliCrunchWings,
  "Grilled Thick-Cut Pork Chop": porkChop,
  "Bún Chay | Rice Noodle Salad": bunChay,
  "Spicy Chicken Sandwich": spicyChickenSandwich,
  "Sticky Jicama Ribs": stickyJicamaRibs,
  "20 oz Grilled Ribeye": grilledRibeye,
  "Cà Phê Sữa Đá Affogato": affogato,
  "Thai Tea Tres Leches": thaiTeaTresLeches,
};
