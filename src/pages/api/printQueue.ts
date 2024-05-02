import { type NextApiRequest, type NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET":
      // Simulate fetching data
      res.status(200).json({ message: "Fetching user data" });
      break;
    case "DELETE":
      // Simulate deleting a user
      res.status(200).json({ message: "User deleted successfully" });
      break;
    default:
      // Block any other type of HTTP method
      res.setHeader("Allow", ["GET", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}
