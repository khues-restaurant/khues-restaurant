import type { StaticImageData } from "next/image";
import headerBanhMiXiuMai from "/public/miscFood/header-banh-mi-xiu-mai.png";
import creamCheeseWantons from "/public/menuItems/cream-cheese-wantons.png";
import roastPorkFriedRice from "/public/menuItems/roast-pork-fried-rice.png";
import spicyChickenSando from "/public/menuItems/spicy-chicken-sando.jpg";
import stickyJicamaRibs from "/public/menuItems/sticky-jicama-ribs.png";
import grilledSirloin from "/public/menuItems/grilled-sirloin.png";
import affogato from "/public/menuItems/affogato.png";
import thaiTeaTresLeches from "/public/menuItems/thai-tea-tres-leches.png";

export const menuItemImagePaths: Record<string, StaticImageData> = {
  "Cream Cheese Wontons": creamCheeseWantons,
  "Roast Pork Fried Rice": roastPorkFriedRice,
  "Bánh Mì Xíu Mại": headerBanhMiXiuMai,
  "Spicy Chicken Sando": spicyChickenSando,
  "Sticky Jicama Ribs": stickyJicamaRibs,
  "Grilled Sirloin": grilledSirloin,
  "Cà Phê Sữa Đá Affogato": affogato,
  "Thai Tea Tres Leches": thaiTeaTresLeches,
};
