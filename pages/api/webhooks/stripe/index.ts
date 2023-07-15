import { HttpStatus } from "@/constants/HttpStatus";
import Cors from "micro-cors";
import { NextApiRequest, NextApiResponse } from "next";

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(HttpStatus.Ok).send("Stripe webhook endpoint");
};

export default cors(webhookHandler as any);
