import { io } from "socket.io-client";
import { env } from "~/env";

// This function could be called within your API route or other server-side logic
export function emitNewOrderThroughSocket() {
  const socketServerUrl = env.BASE_URL;
  const path = "/api/socket";

  // Initialize socket.io-client to connect to your socket.io server
  const socket = io(socketServerUrl, { path });

  socket.on("connect", () => {
    console.log("Connected to socket.io server as client");

    // Emit an event or perform actions as needed
    socket.emit("newOrderCreated", {
      /* payload if needed */
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
