import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import { Paragraph } from "@/types";
import prisma from "@/utils/prisma";
import { PineconeClient } from "@pinecone-database/pinecone";
import { loadSummarizationChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const removeUnwantedKeys = (data: { paragraphs: Paragraph[] }): { paragraphs: Paragraph[] } => {
  data.paragraphs.forEach((paragraph) => {
    delete paragraph.start;
    delete paragraph.end;
    delete paragraph.num_words;

    paragraph.sentences.forEach((sentence) => {
      delete sentence.start;
      delete sentence.end;
    });
  });
  return data;
};

/**
 * Handler for the '/api/summaries' API endpoint.
 * This function is responsible for performing various summary-related operations,
 * depending on the HTTP method of the request:
 * 1. POST: Create a new summary.
 * 2. GET: Fetch a summary's information.
 * 3. DELETE: Delete a summary.
 *
 * For all operations, the client must be authenticated.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the server session and authenticate the request.
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(HttpStatus.Unauthorized).send(ErrorMessages.Unauthorized);
  }

  // Handle the request depending on its HTTP method.
  switch (req.method) {
    case "POST":
      return handlePost(req, res);
    case "GET":
      return handleGet(req, res);
    case "DELETE":
      return handleDelete(req, res);
    default:
      res.setHeader("Allow", ["POST", "GET", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

/**
 * Handler for POST requests to '/api/summaries'.
 * This function creates a new summary for a given transcript.
 * The transcript ID should be provided in the request body.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Retrieve transcriptId from the request body.
    const { transcriptId } = req.body;

    // Validate that transcriptId is provided.
    if (!transcriptId) {
      return res.status(HttpStatus.BadRequest).send(ErrorMessages.BadRequest);
    }

    // Get the transcript from DB
    const transcript = await prisma.transcript.findUnique({
      where: {
        id: transcriptId,
      },
    });

    if (!transcript) {
      return res.status(HttpStatus.NotFound).send(ErrorMessages.NotFound);
    }

    // Initialize pinecone
    const pinecone = new PineconeClient();
    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    // Split transcript into 10,000 char chunks with 500 char overlap
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 10000,
      chunkOverlap: 500,
    });

    // @ts-ignore Prisma stores transcript.paragraph as a generic JsonValue
    const cleanParagraphs = removeUnwantedKeys(transcript.paragraphs);

    const splitTranscript = await splitter.createDocuments([
      JSON.stringify(cleanParagraphs)
    ]);

    // Upsert transcript embeddings to Pinecone vector store.
    await PineconeStore.fromDocuments(
      splitTranscript,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }),
      {
        pineconeIndex,
        namespace: `file-${transcript.fileId}-transcript-${transcript.id}-5`,
        // @TODO figure out what textKey is
        textKey: "text",
      }
    );

    const model = new OpenAI({
      // @TODO figure out why gpt-4 doesn't work??tr
      modelName: "gpt-4",
      temperature: 0.3,
    });

    const combinePromptTemplate = new PromptTemplate({
      inputVariables: ["text"],
      template: `
      Given text is a UX team's usability test transcript. Produce a summary including two sections, styled as such:
      
      **Overview**: Briefly encapsulate key discussions or outcomes.
  
      **Key Findings**: Enumerate 10 main insights in a numbered list, such as "User finds the log-in process difficult due to 2FA requirement" Start with issues and problems the user had during the user test, then cover the remaining items. 
  
      The summary targets UX professionals and web app development engineers; UX jargon usage is acceptable. 
  
      If the text isn't a usability test transcript, return an appropriate message.
      
      {text}`
    })

    // Generate a summary
    // https://js.langchain.com/docs/modules/chains/popular/summarize
    const summaryChain = loadSummarizationChain(model, {
      type: "map_reduce",
      verbose: true,
      combinePrompt: combinePromptTemplate,
    });

    const result = await summaryChain.call({
      input_documents: splitTranscript,
    });

    // Insert the summary to the DB
    const summary = await prisma.transcript.update({
      where: {
        id: transcriptId,
      },
      data: {
        summary: {
          create: {
            content: result.text,
          },
        },
      },
      select: {
        summary: true,
      },
    });

    return res.status(HttpStatus.Ok).send(summary);
  } catch (error) {
    console.log(error);
    return res
      .status(HttpStatus.InternalServerError)
      .send(ErrorMessages.InternalServerError);
  }
}

/**
 * Handler for GET requests to '/api/summaries'.
 * This function fetches the summary of a transcript.
 * The transcript ID should be provided in the request's query string.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Retrieve transcriptId from the query parameters.
    const transcriptId = req.query.transcriptId as string;

    // Validate that transcriptId is provided.
    if (!transcriptId) {
      return res.status(HttpStatus.BadRequest).send(ErrorMessages.BadRequest);
    }

    const transcript = await prisma.transcript.findUniqueOrThrow({
      where: {
        id: transcriptId,
      },
      select: {
        summary: true,
      },
    });

    if (!transcript || !transcript.summary)
      return res.status(HttpStatus.NotFound).send(ErrorMessages.NotFound);

    // Return the summary
    return res.status(HttpStatus.Ok).json(transcript.summary);
  } catch (error) {
    console.log(error);
    return res
      .status(HttpStatus.InternalServerError)
      .send(ErrorMessages.InternalServerError);
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  console.log("DELETE");
}
