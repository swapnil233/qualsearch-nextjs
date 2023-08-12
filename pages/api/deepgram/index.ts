import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import { NextApiRequest, NextApiResponse } from "next";
import qs from "qs"; // import the query string library

// Define an interface for the options object
interface Options {
  language: string;
  smart_format: boolean;
  diarize: boolean;
  model?: string;
  tier?: string;
  redact?: string[];
}

/**
 * The handler for the '/api/deepgram' API endpoint.
 * Currently, it only supports POST requests to interact with Deepgram API.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      return handlePost(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      res
        .status(HttpStatus.MethodNotAllowed)
        .end(`Method ${req.method} Not Allowed`);
  }
}

/**
 * Handler for POST requests to '/api/deepgram'.
 * This function prepares a query string using information from the request body,
 * then sends a POST request to Deepgram's API.
 *
 * @param req {NextApiRequest} The HTTP request object.
 * @param res {NextApiResponse} The HTTP response object.
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { DEEPGRAM_API_KEY } = process.env;

    if (!DEEPGRAM_API_KEY) {
      res
        .status(HttpStatus.InternalServerError)
        .json({ message: ErrorMessages.InternalServerError });
      return;
    }

    // Extract values from the request body.
    const {
      uri,
      multipleSpeakers,
      audioType,
      redactions,
      transcriptionQuality,
      teamId,
      projectId,
    }: {
      uri: string;
      multipleSpeakers: string;
      audioType: string;
      redactions: string[];
      transcriptionQuality: string;
      teamId: string;
      projectId: string;
    } = req.body;

    // Create base options.
    let options: Options = {
      language: "en",
      smart_format: true,
      diarize: multipleSpeakers === "true",
    };

    if (
      transcriptionQuality === "whisper" ||
      transcriptionQuality === "whisper-large"
    ) {
      // Whisper models do not require tier and model properties.
      // They are identified solely by the model name (e.g., 'whisper' or 'whisper-large').
      options["model"] = transcriptionQuality;
    } else {
      // Update options based on audioType for 'nova' quality.
      switch (audioType) {
        case "general":
          options["model"] = "general";
          options["tier"] = "nova";
          break;
        case "phonecall":
          options["model"] = "phonecall";
          options["tier"] = "enhanced";
          break;
        case "conference":
          options["model"] = "meeting";
          options["tier"] = "enhanced";
          break;
        default:
          options["model"] = "general";
          options["tier"] = "nova";
          break;
      }
    }

    // Update options for redactions.
    if (redactions && Array.isArray(redactions) && redactions.length > 0) {
      options["redact"] = redactions;
    }

    // Convert options to query string.
    const query = qs.stringify(options, { arrayFormat: "repeat" });

    let cb = process.env.VERCEL
      ? "https://transcription-eight.vercel.app/api/webhooks/deepgram"
      : process.env.AMPLIFY_URL
        ? `${process.env.AMPLIFY_URL}/api/webhooks/deepgram`
        : "https://main.dvws5ww9zrzf5.amplifyapp.com/api/webhooks/deepgram/";

    console.log("Callback URL", cb)

    const req_expensive = `https://api.deepgram.com/v1/listen?${query}&summarize=true&detect_topics=true&detect_entities=latest&tag=${teamId}-${projectId}&callback=${cb}`;
    const req_cheaper = `https://api.deepgram.com/v1/listen?${query}&tag=${teamId}-${projectId}&callback=${cb}`;

    const response = await fetch(req_cheaper, {
      method: "POST",
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: uri }),
    });
    const data = await response.json();
    console.log("DG Response", data);
    res.status(HttpStatus.Ok).json(data);
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatus.InternalServerError)
      .json({ message: ErrorMessages.InternalServerError });
  }
}
