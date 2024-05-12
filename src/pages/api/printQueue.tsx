import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";
import {
  type CustomizationCategory,
  type CustomizationChoice,
  type Discount,
  type MenuItem,
  type Order,
  type OrderItem,
  type OrderItemCustomization,
} from "@prisma/client";
import receiptline, { type Printer } from "receiptline";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getFirstSixNumbers } from "~/utils/getFirstSixNumbers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { token } = req.query;

  switch (req.method) {
    // printer's interval based POST request. Checks every (default of) 5 seconds
    // to see if there are any new print jobs in the queue. Expects a
    // response either way.
    case "POST":
      // checks to see if there are any print jobs in the queue
      const printJobAvailable = await prisma.orderPrintQueue.findFirst({
        orderBy: {
          createdAt: "desc", // newest first, just so reprints print asap
        },
        select: {
          id: true,
        }, // we don't need any data about the print job, just whether it exists
      });

      if (printJobAvailable !== null) {
        // console.log("a job ready", encodeURIComponent(printJobAvailable.id));

        res.status(200).json({
          jobReady: true,
          mediaTypes: ["application/vnd.star.starprnt"],
          jobToken: encodeURIComponent(printJobAvailable.id),
        });
      } else {
        // console.log("no job ready");

        res.status(200).json({ jobReady: false });
      }

      break;

    // printer has requested the latest print job in the queue
    case "GET":
      if (typeof token !== "string") {
        {
          // if there isn't a print job, return a 404
          res.status(404).json({ message: "No print jobs in the queue" });
        }
        break;
      }

      // get the requested print job (by token id) from the queue
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
      });

      // if there is a print job, return it
      if (printJob) {
        const data = formatReceipt(printJob.order);
        console.log(data);

        const printer: Printer = {
          cpl: 48,
          encoding: "cp437",
          upsideDown: false,
          spacing: true,
          command: "starsbcs",
          cutting: true,
        };
        const command = receiptline.transform(data, printer);

        // slice - removes ESC @ (command initialization) ESC GS a 0 (disable status transmission)
        const binaryFormattedData = Buffer.from(command.slice(6), "binary");

        res.setHeader("Content-Type", "application/vnd.star.starprnt");
        res.status(200).send(binaryFormattedData);
      } else {
        // if there isn't a print job, return a 404
        res.status(404).json({ message: "No print jobs in the queue" });
      }

      break;

    // printer has requested to delete the latest print job in the queue, either due to
    // the print job being successfully printed or due to an error (determined by the printer)
    case "DELETE":
      // console.log("deleting token", token, "from the print queue");

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
      // console.log("not allowed!", req.method, req.url);

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

// standard

function formatReceipt(order: PrintedOrder) {
  const chicagoZonedTime = toZonedTime(
    order.datetimeToPickup,
    "America/Chicago",
  );

  // Check for dietary restrictions
  const atLeastOneDietaryRestriction =
    order.dietaryRestrictions &&
    order.orderItems.some((item) => item.includeDietaryRestrictions);

  // Constructing the receipt using template literals
  let receipt = `
    {width:*}
    ^^^Khue's
    799 University Ave W, St Paul, MN 55104
    (651) 222-3301
    -
    Online Order (Pickup)
    ^^^${order.firstName} ${order.lastName}
    ${format(chicagoZonedTime, "h:mma 'on' MM/dd/yyyy")}
    "Order #${getFirstSixNumbers(order.id)}"
    -`;

  // Food items section
  if (order.orderItems.length > 0) {
    receipt += `
    {width:8,*}
    "_Items_"
    `;

    order.orderItems.forEach((orderItem, index) => {
      receipt += `|"${orderItem.quantity}"|"${orderItem.menuItem.name}${orderItem.includeDietaryRestrictions ? " *" : ""}"`;

      if (orderItem.customizations.length > 0) {
        receipt += ` \n`; // space before \n necessary?
        const itemCustomizations = orderItem.customizations
          .map(
            (c) =>
              `||- ${c.customizationCategory.name}: ${c.customizationChoice.name}`,
          )
          .join(" \n");
        receipt += itemCustomizations;
      }

      if (orderItem.specialInstructions) {
        receipt += ` \n`; // space before \n necessary?
        receipt += `||- \\"${orderItem.specialInstructions}\\"`;
      }

      if (index < order.orderItems.length - 1) {
        receipt += ` \n`; // space before \n necessary?
      }
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

// individual borders

// function formatReceipt(order: PrintedOrder) {
//   const chicagoZonedTime = toZonedTime(
//     order.datetimeToPickup,
//     "America/Chicago",
//   );

//   // Check for dietary restrictions
//   const atLeastOneDietaryRestriction =
//     order.dietaryRestrictions &&
//     order.orderItems.some((item) => item.includeDietaryRestrictions);

//   // Constructing the receipt using template literals
//   let receipt = `
//     {width:*}
//     {border:line; width:50}
//     ^^^Khue's
//     799 University Ave W, St Paul, MN 55104
//     (651) 222-3301
//     -
//     Online Order (Pickup)
//     ^^^${order.firstName} ${order.lastName}
//     ${format(chicagoZonedTime, "h:mma 'on' MM/dd/yyyy")}
//     "Order #${getFirstSixNumbers(order.id)}"
//     {border:space; width:50}`;

//   // Food items section
//   if (order.orderItems.length > 0) {
//     receipt += `
//     {width:8,*}
//     "_Items_"
//     {border:line; width:50}
//     {width:6,50}
//     `;

//     order.orderItems.forEach((orderItem, index) => {
//       receipt += `|"${orderItem.quantity}"|"${orderItem.menuItem.name}${orderItem.includeDietaryRestrictions ? " *" : ""}"`;

//       if (orderItem.customizations.length > 0) {
//         receipt += ` \n`; // space before \n necessary?
//         const itemCustomizations = orderItem.customizations
//           .map(
//             (c) =>
//               `||- ${c.customizationCategory.name}: ${c.customizationChoice.name}`,
//           )
//           .join(" \n");
//         receipt += itemCustomizations;
//       }

//       if (orderItem.specialInstructions) {
//         receipt += ` \n`; // space before \n necessary?
//         receipt += `||- \\"${orderItem.specialInstructions}\\"`;
//       }

//       if (index < order.orderItems.length - 1) {
//         receipt += ` \n`; // space before \n necessary?
//       }
//     });

//     receipt += `
//     -`;
//   }

//   receipt += `
//     {border:space; width:50}
//     {width:*}
//     {border:line; width:50}

//   `;

//   // Napkins and utensils request
//   if (order.includeNapkinsAndUtensils) {
//     receipt += `Utensils and napkins were requested.`;
//   }

//   // Dietary preferences
//   if (atLeastOneDietaryRestriction) {
//     receipt += `

//     _* Dietary preferences_
//     \\"${order.dietaryRestrictions}\\"`;
//   }

//   receipt += `

//   `;

//   return receipt;
// }

// full borders

// function formatReceipt(order: PrintedOrder) {
//   const chicagoZonedTime = toZonedTime(
//     order.datetimeToPickup,
//     "America/Chicago",
//   );

//   // Check for dietary restrictions
//   const atLeastOneDietaryRestriction =
//     order.dietaryRestrictions &&
//     order.orderItems.some((item) => item.includeDietaryRestrictions);

//   // Constructing the receipt using template literals
//   let receipt = `
//     {width:*}
//     {border:line; width:50}
//     ^^^Khue's
//     799 University Ave W, St Paul, MN 55104
//     (651) 222-3301
//     -
//     Online Order (Pickup)
//     ^^^${order.firstName} ${order.lastName}
//     ${format(chicagoZonedTime, "h:mma 'on' MM/dd/yyyy")}
//     "Order #${getFirstSixNumbers(order.id)}"
//     -`;

//   // Food items section
//   if (order.orderItems.length > 0) {
//     receipt += `
//     {width:6,*}
//     ||"_Items_"

//     `;

//     order.orderItems.forEach((orderItem, index) => {
//       receipt += `|"${orderItem.quantity}"|"${orderItem.menuItem.name}${orderItem.includeDietaryRestrictions ? " *" : ""}"`;

//       if (orderItem.customizations.length > 0) {
//         receipt += ` \n`; // space before \n necessary?
//         const itemCustomizations = orderItem.customizations
//           .map(
//             (c) =>
//               `||- ${c.customizationCategory.name}: ${c.customizationChoice.name}`,
//           )
//           .join(" \n");
//         receipt += itemCustomizations;
//       }

//       if (orderItem.specialInstructions) {
//         receipt += ` \n`; // space before \n necessary?
//         receipt += `||- \\"${orderItem.specialInstructions}\\"`;
//       }

//       if (index < order.orderItems.length - 1) {
//         receipt += ` \n`; // space before \n necessary?
//       }
//     });

//     receipt += `
//     -`;
//   }

//   receipt += `
//     {width:*}

//   `;

//   // Napkins and utensils request
//   if (order.includeNapkinsAndUtensils) {
//     receipt += `Utensils and napkins were requested.`;
//   }

//   // Dietary preferences
//   if (atLeastOneDietaryRestriction) {
//     receipt += `

//     _* Dietary preferences_
//     \\"${order.dietaryRestrictions}\\"`;
//   }

//   receipt += `
//   `;

//   return receipt;
// }
