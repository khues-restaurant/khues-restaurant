import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";
import {
  Br,
  Cut,
  Line,
  Printer,
  Text,
  Row,
  render,
} from "react-thermal-printer";
import {
  type CustomizationCategory,
  type CustomizationChoice,
  type Discount,
  type MenuItem,
  type Order,
  type OrderItem,
  type OrderItemCustomization,
} from "@prisma/client";
import {
  generatePrintCommandsForImage,
  generatePrintCommandsForCanvas,
} from "@vaju/image-thermal-printer";
// import receiptLine from "receiptline"
const receiptline = require("receiptline");
import { format } from "date-fns";
import { Fragment } from "react";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // console.dir(req, { depth: null });
  // ("https://khues-restaurant.vercel.app/api/printQueue?mac=00%3A11%3A62%3A42%3A27%3A03&type=text%2Fplain");

  const { token } = req.query;

  switch (req.method) {
    // printer's interval based POST request. Checks every 5 seconds
    // to see if there are any new print jobs in the queue. Expects a
    // response either way.
    case "POST":
      // checks to see if there are any print jobs in the queue
      const printJobAvailable = await prisma.orderPrintQueue.findFirst({
        orderBy: {
          createdAt: "desc", // oldest first, so we can pop it off the queue
        },
        select: {
          id: true,
        }, // we don't need any data about the print job, just whether it exists
      });

      if (printJobAvailable !== null) {
        console.log("a job ready", encodeURIComponent(printJobAvailable.id));

        res.status(200).json({
          jobReady: true,
          mediaTypes: ["application/vnd.star.starprnt"],
          jobToken: encodeURIComponent(printJobAvailable.id),
        });
        // clientAction: { request: "Encodings", options: "" },
        // mediaTypes: ["image/png"], // if you need later: also "image/png"
      } else {
        console.log("no job ready");
        res.status(200).json({ jobReady: false });
      }

      break;

    // printer has requested the latest print job in the queue
    case "GET":
      // get the "code" query parameter, which corresponds to id of the print job

      if (typeof token !== "string") {
        {
          // if there isn't a print job, return a 404
          res.status(404).json({ message: "No print jobs in the queue" });
        }
        break;
      }

      // get the oldest print job in the queue
      const printJob = await prisma.orderPrintQueue.findUnique({
        where: {
          id: token,
        },

        include: {
          order: {
            include: {
              orderItems: {
                include: {
                  menuItem: true,
                  // ^ include: {
                  //   activeDiscount: true,
                  // }
                  customizations: {
                    include: {
                      customizationCategory: true,
                      customizationChoice: true,
                    },
                  },
                  discount: true,
                },
              },
            },
          },
        },

        // orderBy: {
        //   createdAt: "asc", // oldest first, so we can pop it off the queue
        // },
      });

      // if there is a print job, return it
      if (printJob) {
        const data = formatReceipt(printJob.order);

        // also send token to delete the print job from the queue here right?

        const printer = {
          cpl: 48,
          encoding: "cp437",
          upsideDown: false,
          spacing: true,
          command: "starsbcs",
          cutting: true,
        };

        console.log(data);

        console.log("---------");

        const command = receiptline.transform(data, printer);

        console.log(command);

        // slice - removes ESC @ (command initialization) ESC GS a 0 (disable status transmission)
        const bin = Buffer.from(command.slice(6), "binary");

        console.log("sending this print job with", bin.length);
        res.setHeader("Content-Type", "application/vnd.star.starprnt");
        res.status(200).send(bin);
      } else {
        // if there isn't a print job, return a 404
        res.status(404).json({ message: "No print jobs in the queue" });
      }

      break;

    // printer has requested to delete the latest print job in the queue, either due to
    // the print job being successfully printed or due to an error (determined by the printer)
    case "DELETE":
      // get the "code" query parameter, which corresponds to id of the print job

      console.log("deleting token", token, "from the print queue");

      // delete the print job from the queue
      if (typeof token === "string") {
        const deletedPrintJob = await prisma.orderPrintQueue.delete({
          where: {
            id: token,
          },
        });

        // return the deleted print job
        res.status(200).json(deletedPrintJob);
      } else {
        // TODO: is this part wanted/necessary?

        // if the "token" query parameter is not a string, return a 400
        res.status(400).json({ message: "Invalid query parameter" });
      }

      break;
    default:
      console.log("not allowed!", req.method, req.url);

      // Block any other type of HTTP method
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}

type PrintedOrderItemCustomization = OrderItemCustomization & {
  customizationCategory: CustomizationCategory;
  customizationChoice: CustomizationChoice;
};

type PrintedOrderItem = OrderItem & {
  menuItem: MenuItem;
  customizations: PrintedOrderItemCustomization[];
  discount: Discount | null;
};

type PrintedOrder = Order & {
  orderItems: PrintedOrderItem[];
};

function formatReceipt(order: PrintedOrder) {
  // Separate items into food and alcoholic beverages
  const items: {
    food: PrintedOrderItem[];
    alcoholicBeverages: PrintedOrderItem[];
  } = {
    food: [],
    alcoholicBeverages: [],
  };

  order.orderItems.forEach((orderItem) => {
    if (orderItem.menuItem.isAlcoholic) {
      items.alcoholicBeverages.push(orderItem);
    } else {
      items.food.push(orderItem);
    }
  });

  // Check for dietary restrictions
  const atLeastOneDietaryRestriction =
    order.dietaryRestrictions &&
    items.food.some((item) => item.includeDietaryRestrictions);

  // Constructing the receipt using template literals
  let receipt = `

{width:*}
^^^Khue's
799 University Ave W, St Paul, MN 55104
(651) 222-3301
-
Online Order (Pickup)
^^^${order.firstName} ${order.lastName}
${format(new Date(order.datetimeToPickup), "h:mma 'on' MM/dd/yyyy")}
"Order #${order.id.substring(0, 6).toUpperCase()}"
-`;

  // Food items section
  if (items.food.length > 0) {
    receipt += `
    {width:7,*}
    "_Items_"
    {width:4,*}
    `;

    items.food.forEach((orderItem) => {
      receipt += `|"${orderItem.quantity}"|"${orderItem.menuItem.name}${orderItem.includeDietaryRestrictions ? " *" : ""}"`;

      if (orderItem.customizations.length > 0) {
        receipt += ` \n
      ${orderItem.customizations.map((custom) => `||- ${custom.customizationCategory.name}: ${custom.customizationChoice.name}`).join(" \n")}`;
      }

      if (orderItem.specialInstructions) {
        receipt += ` \n
      ||- \\"${orderItem.specialInstructions}\\"`;
      }
    });

    // .join(" \n") seems suspect to me

    receipt += `
    -`;
  }

  // Alcoholic beverages section
  if (items.alcoholicBeverages.length > 0) {
    receipt += `
    {width:21,*}
    "_Alcoholic beverages_"
    {width:4,*}`;
    items.alcoholicBeverages.forEach((orderItem) => {
      receipt += `|"${orderItem.quantity}"|"${orderItem.menuItem.name}"
`;
    });
    receipt += `
    -`;
  }

  receipt += `
  {width:*}
  `;

  // Napkins and utensils request
  if (order.includeNapkinsAndUtensils) {
    receipt += `Utensils and napkins were requested.`;
  }

  // Dietary preferences
  if (atLeastOneDietaryRestriction) {
    receipt += `
    _* Dietary preferences_
    \\"${order.dietaryRestrictions}\\"`;
  }

  receipt += `
  
  `;

  return receipt;
}

// ^^^^

// why did this work below.. in terms fo spacing vertically between items?
// const order = () => `{width:*}
// ^^^Online Order
// ${new Date().toLocaleString('en')}
// {width:4,*}
// ---
// |^^^2|^^Hamburger
// |    |Tomato, Onion, Meat sauce, Mayonnaise
// |    |\`"~Mustard~
// |^^^2|^^Clam chowder
// |    |Oyster cracker
// ---
// {code:1234567890; option:code128,2,72,hri}`;
