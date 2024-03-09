import { ErrorMessages } from "@/constants/ErrorMessages";
import { HttpStatus } from "@/constants/HttpStatus";
import { NextApiRequest, NextApiResponse } from "next";
import qs from "qs";

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
    const { DEEPGRAM_API_KEY, NEXT_PUBLIC_EXPRESS_BACKEND_URL } = process.env;

    if (!DEEPGRAM_API_KEY) {
      return res
        .status(HttpStatus.InternalServerError)
        .json({ message: ErrorMessages.InternalServerError });
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

    console.log("options", options);

    // Update options for redactions.
    if (redactions && Array.isArray(redactions) && redactions.length > 0) {
      options["redact"] = redactions;
    }

    // Convert options to query string.
    const query = qs.stringify(options, { arrayFormat: "repeat" });

    // let cb = `https://main.dvws5ww9zrzf5.amplifyapp.com/api/webhooks/deepgram/`;
    const cb = `${NEXT_PUBLIC_EXPRESS_BACKEND_URL}/api/webhooks/deepgram/`;

    const req_cheaper = `https://api.deepgram.com/v1/listen?${query}&tag=${teamId}-${projectId}&callback=${cb}`;

    console.log("req_cheaper", req_cheaper);

    const response = await fetch(req_cheaper, {
      method: "POST",
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: uri,
      }),
    });
    const data = await response.json();
    console.log("data", data);
    res.status(HttpStatus.Ok).json(data);
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatus.InternalServerError)
      .json({ message: ErrorMessages.InternalServerError });
  }
}
