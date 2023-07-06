import Cors from "micro-cors";
import { NextApiRequest, NextApiResponse } from "next";

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(200).json({ message: "ok" });
};

export default cors(webhookHandler as any);
