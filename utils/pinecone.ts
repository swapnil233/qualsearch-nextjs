import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  environment: process.env.PINECONE_ENVIRONMENT!,
  apiKey: process.env.PINECONE_API_KEY!,
});

export default pinecone;
