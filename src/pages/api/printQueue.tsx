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
        // const formattedReceipt = formatReceipt(printJob.order);
        // const data = await render(formattedReceipt);

        // also send token to delete the print job from the queue here right?

        // const sizeInBytes = data.length; // Total number of bytes
        // const sizeInMegabytes = sizeInBytes / 1024 / 1024; // Convert bytes to MB

        // console.log("sending back data to print", data, sizeInMegabytes, "MB");

        const printer = {
          cpl: 48,
          encoding: "cp437",
          upsideDown: false,
          spacing: true,
          command: "starsbcs",
        };

        const order = () => `{width:*}
^^^Online Order
${new Date().toLocaleString("en")}
{width:4,*}
---
|^^^2|^^Hamburger
|    |Tomato, Onion, Meat sauce, Mayonnaise
|    |\`"~Mustard~
|^^^2|^^Clam chowder
|    |Oyster cracker
---
{code:1234567890; option:code128,2,72,hri}`;

        const data = order();

        const command = receiptline.transform(data, printer);
        // remove ESC @ (command initialization) ESC GS a 0 (disable status transmission)
        const bin = Buffer.from(command.slice(6), "binary");

        console.log("sending this print job with", bin.length);
        res.setHeader("Content-Type", "application/vnd.star.starprnt");
        res.status(200).send(bin);

        // res.setHeader("Content-Type", "application/octet-stream");
        // // Set any custom headers needed for specific printer models here
        // // maybe .end() instead of .send()?
        // // res.status(200).send(data);
        // res.status(200).send(Buffer.from(data));
        // // res.status(200).json(data);
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

  const atLeastOneDietaryRestriction =
    order.dietaryRestrictions &&
    items.food.some((orderItem) => orderItem.includeDietaryRestrictions);

  return (
    <Printer type="star" width={48} characterSet="pc437_usa">
      <Text bold={true} size={{ width: 2, height: 2 }}>
        Khue&apos;s
      </Text>
      <Text>799 University Ave W, St Paul, MN 55104</Text>
      <Text>651-222-3301</Text>

      <Br />

      <Line />

      <Text bold={true} align="center" size={{ width: 2, height: 2 }}>
        {order.firstName} {order.lastName}
      </Text>
      <Text bold={true} align="center" size={{ width: 2, height: 2 }}>
        {format(new Date(order.createdAt), "HH:mm")}
      </Text>
      <Text align="center">
        on {format(new Date(order.createdAt), "MM/dd/yyyy")}
      </Text>
      <Text bold={true} align="center">
        Order #{order.id.toUpperCase().substring(0, 6)}
      </Text>

      <Line character="=" />

      <Text align="left" underline="1dot-thick">
        Items
      </Text>
      {items.food.map((orderItem) => (
        <Fragment key={orderItem.id}>
          <Text bold={true} align="left">
            {orderItem.quantity} {orderItem.menuItem.name}
            {orderItem.includeDietaryRestrictions && "*"}
          </Text>

          {orderItem.customizations.map((customization) => (
            <Text key={customization.id} align="left">
              {"   - "}
              {customization.customizationCategory.name}:{" "}
              {customization.customizationChoice.name}
            </Text>
          ))}
        </Fragment>
      ))}

      <Line />

      <Text align="left" underline="1dot-thick">
        Alcoholic beverages
      </Text>
      {items.alcoholicBeverages.map((orderItem) => (
        <Fragment key={orderItem.id}>
          <Text bold={true} align="left">
            {orderItem.quantity} {orderItem.menuItem.name}
          </Text>

          {orderItem.customizations.map((customization) => (
            <Text key={customization.id} align="left">
              {"   - "}
              {customization.customizationCategory.name}:{" "}
              {customization.customizationChoice.name}
            </Text>
          ))}
        </Fragment>
      ))}

      {atLeastOneDietaryRestriction && (
        <>
          <Br />
          <Text align="center">
            {"* - "}
            {order.dietaryRestrictions}
          </Text>
        </>
      )}

      <Br />

      <Cut />
    </Printer>
  );
}

// TODO: includ ethe napkins and utensils partr
