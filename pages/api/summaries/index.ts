import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import prisma from "@/utils/prisma";
import { get_encoding } from "@dqbd/tiktoken";
import { LLMChain, loadSummarizationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import { ChatPromptTemplate, PromptTemplate } from "langchain/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
const encoding = get_encoding("cl100k_base");
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

    // Split transcript into 10,000 char chunks with 500 char overlap
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 40000,
      chunkOverlap: 500,
    });

    const model = new OpenAI({
      modelName: "gpt-4-1106-preview",
      temperature: 0.3,
    });

    // @ts-ignore Prisma stores transcript as a generic JsonValue
    const tokenCount = encoding.encode(transcript.paragraphs.transcript).length;

    let aiSummary = '';

    // gpt-4-1106-preview has a 128,000 token limit. Setting the limit to 126,000 to be safe.
    if (tokenCount < 126000) {
      const template =
        `Given text is a transcript of a UX team conducting usability tests. Produce a summary including three sections, styled exactly as such:
      
      **Overview**: 
      
      Briefly encapsulate key discussions or outcomes. The summary targets UX professionals and web application developers; UX jargon usage is acceptable. 
  
      **Key Findings**: 
      
      5 to 10 insights in a numbered list, such as "1. User finds the log-in process difficult due to 2FA requirement". Start with issues and problems the user had during the usability test, then cover the remaining items. Do not talk about problems unrelated to the usability test (e.g., if the user had trouble sharing their screen to the researchers, or if the user had trouble with their internet connection). Do not refer to speakers as their integer labels (e.g., "Speaker 0 said..."). Whenever possible, refer to speakers by their names.
  
      **Quotes**: 
      
      Include 5-10 unique and direct quotes from the transcript that are representative of the user's experience. Do not include quotes that are not representative of the user's experience (e.g., if the user was talking about their personal life, or if the user was talking about a different product, or when the researcher was introducing the testing session, etc.). Do not repeat quotes.
  
      If the text isn't a usability test transcript, return an appropriate message.`;

      const humanTemplate = "{text}"

      const chatPrompt = ChatPromptTemplate.fromMessages([
        ["system", template],
        ["human", humanTemplate],
      ]);

      const chat = new ChatOpenAI(model);

      const chain = new LLMChain({
        llm: chat,
        prompt: chatPrompt,
      });

      const result = await chain.call({
        // @ts-ignore Prisma stores transcript as a generic JsonValue
        text: transcript.paragraphs.transcript as string,
      });

      aiSummary = result.text;
    } else {
      const splitTranscript = await splitter.createDocuments([
        // @ts-ignore Prisma stores transcript.paragraph as a generic JsonValue
        JSON.stringify(transcript.paragraphs.transcript),
      ]);

      const combineMapPromptTemplate = new PromptTemplate({
        inputVariables: ["text"],
        template: `The following is a chunk of text from the transcript of a UX team conducting a usability test. Speakers are labelled as integers, starting from 0. Summarize the text and provide 1-2 representative quotes from this chunk. Keep in mind that this summary will be fed to another summary-generation tool, so do not leave any important parts out.
  
        The output of this action should be a JSON object with the following structure:
          
        "summary": "The summary of the text goes here.",
          "quotes": [
            "The first quote goes here.",
            "The second quote goes here."
          ]
        Text:
        
        {text}`,
      });

      const combinePromptTemplate = new PromptTemplate({
        inputVariables: ["text"],
        template: `Given text is a transcript of a UX team conducting usability tests. Produce a summary including three sections, styled exactly as such:
      
        **Overview**: 
        
        Briefly encapsulate key discussions or outcomes. The summary targets UX professionals and web application developers; UX jargon usage is acceptable. 
    
        **Key Findings**: 
        
        5 to 10 insights in a numbered list, such as "1. User finds the log-in process difficult due to 2FA requirement". Start with issues and problems the user had during the usability test, then cover the remaining items. Do not talk about problems unrelated to the usability test (e.g., if the user had trouble sharing their screen to the researchers, or if the user had trouble with their internet connection). Do not refer to speakers as their integer labels (e.g., "Speaker 0 said..."). Whenever possible, refer to speakers by their names.
    
        **Quotes**: 
        
        Include 5-10 unique and direct quotes from the transcript that are representative of the user's experience. Do not include quotes that are not representative of the user's experience (e.g., if the user was talking about their personal life, or if the user was talking about a different product, or when the researcher was introducing the testing session, etc.). Do not repeat quotes.
    
        If the text isn't a usability test transcript, return an appropriate message.
  
        Text:
        
        {text}`,
      });

      // Generate a summary
      // https://js.langchain.com/docs/modules/chains/popular/summarize
      const summaryChain = loadSummarizationChain(model, {
        type: "map_reduce",
        verbose: true,
        combinePrompt: combinePromptTemplate,
        combineMapPrompt: combineMapPromptTemplate,
      });

      const result = await summaryChain.call({
        input_documents: splitTranscript,
      });

      aiSummary = result.text;
    }

    // Insert the summary to the DB
    const summary = await prisma.transcript.update({
      where: {
        id: transcriptId,
      },
      data: {
        summary: {
          create: {
            content: aiSummary,
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
