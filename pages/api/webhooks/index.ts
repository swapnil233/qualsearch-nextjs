import prisma from "@/utils/prisma";
import { File } from "@prisma/client";
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
        request_id: '562827bd-de8e-4fb6-8678-fa3a7e55de24',
        sha256: '380ece2b282ca047850648243a6eb0a713de9678ec42a656b49e017e15b33359',
        created: '2023-07-11T04:00:59.109Z',
        duration: 578.904,
        channels: 1,
        models: [ '85b5dbfd-bc1d-46b5-99d8-070d379a7f97' ],
        model_info: { '85b5dbfd-bc1d-46b5-99d8-070d379a7f97': [Object] },
        tags: [ 'cljxqx7bg0007r9sw9k6qs61o-cljxqxi850009r9sw5rqb65hp' ]
      },
      results: { channels: [ [Object] ] }
    }
   */

  const { request_id, tags } = req.body.metadata;
  const teamId = tags[0].split("-")[0];
  const projectId = tags[0].split("-")[1];

  const files: ({ files: File[] }) = await prisma.project.findUniqueOrThrow({
    where: {
      id: projectId
    },
    select: {
      files: {
        where: {
          dgCallbackRequestId: request_id
        },
      }
    }
  })

  const file: File = files.files[0]

  console.log(file)
};

export default cors(webhookHandler as any);
