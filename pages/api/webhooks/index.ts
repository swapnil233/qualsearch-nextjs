import prisma from "@/utils/prisma";
import Cors from "micro-cors";
import { NextApiRequest, NextApiResponse } from "next";

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  /**
     req.body = {
        metadata: {
          transaction_key: 'deprecated',
          request_id: '8b4da3e8-a730-4e99-8b6a-f43afc41a286',
          sha256: '380ece2b282ca047850648243a6eb0a713de9678ec42a656b49e017e15b33359',
          created: '2023-07-11T03:42:40.415Z',
          duration: 578.904,
          channels: 1,
          models: [ '85b5dbfd-bc1d-46b5-99d8-070d379a7f97' ],
          model_info: { '85b5dbfd-bc1d-46b5-99d8-070d379a7f97': [Object] }
        },
        results: { channels: [ [Object] ] }
    }
   */

  const { request_id } = req.body.metadata

  // Check if there's a file in the DB that has the dgCallbackRequestId equal to req.body's request_id
  const fileRef = await prisma.file.groupBy({
    by: ['dgCallbackRequestId'],
    where: {
      dgCallbackRequestId: {
        equals: request_id
      }
    }
  })

  console.log("fileRef: ", fileRef)
};

export default cors(webhookHandler as any);
