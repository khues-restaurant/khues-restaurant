import { Server, type Socket } from "socket.io";
import { type IncomingMessage, type ServerResponse } from "http";

export default function SocketHandler(
  req: IncomingMessage & { socket: { server: { io: Server } } },
  res: ServerResponse & { socket: { server: { io: Server } } },
) {
  // means that socket server was already initialised
  if (res.socket.server.io) {
    res.end();
    return;
  }

  // @ts-expect-error fix typing later
  const io = new Server(res.socket.server, {
    path: "/api/socket",
  });
  res.socket.server.io = io;

  const onConnection = (socket: Socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    // client -> server
    socket.on("newOrderCreated", () => {
      console.log("new order created");
    });

    socket.on(
      "sendNewMessage",
      ({
        senderUserId,
        recipientUserId,
        message,
      }: {
        senderUserId: string;
        recipientUserId: string;
        message: string;
      }) => {
        socket.emit("newMessageSent", {
          senderUserId,
          recipientUserId,
          message,
        });
      },
    );

    // server -> client
    socket.on("menuItemAvailabilityChanged", () => {
      socket.emit("refetchMenuCategories");
    });

    socket.on("minOrderPickupTimeChanged", () => {
      socket.emit("refetchMinOrderPickupTime");
    });

    socket.on("orderStatusUpdate", (orderId) => {
      socket.emit("orderStatusUpdated", orderId);
    });
  };

  io.on("connection", onConnection);

  res.end();
}
