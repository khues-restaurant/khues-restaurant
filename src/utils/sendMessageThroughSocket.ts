import { io } from "socket.io-client";

// this is kinda janky in its own file, should eventually be moved to a better
// spot I think.

// This function could be called within your API route or other server-side logic
export function sendMessageThroughSocket({
  senderUserId,
  recipientUserId,
  message,
}: {
  senderUserId: string;
  recipientUserId: string;
  message: string;
}) {
  // Assuming your Next.js server and the socket.io server are running on the same host
  const socketServerUrl = "http://localhost:3000"; // Adjust the port if necessary
  const path = "/api/socket"; // The path to your socket.io server

  // Initialize socket.io-client to connect to your socket.io server
  const socket = io(socketServerUrl, { path });

  socket.on("connect", () => {
    console.log("Connected to socket.io server as client");

    // Emit an event or perform actions as needed
    socket.emit("sendNewMessage", {
      senderUserId,
      recipientUserId,
      message,
    });

    // Disconnect after the operation to clean up resources
    // Depending on your use case, you might want to manage the connection differently
    socket.disconnect();
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from socket.io server");
  });

  // Handle connection errors (e.g., server not available)
  socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
  });
}
