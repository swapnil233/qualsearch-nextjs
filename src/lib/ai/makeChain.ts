import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";

const CONDENSE_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_TEMPLATE = `You are an AI assistant and an expert in qualitative UX research. Use the following pieces of context to answer the question at the end. The target audience for your answers is a UX researcher, so please use language that is appropriate for a UX researcher.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer. 
When answering questions, do not answer in markdown, for example including the asterisks around the word you want to bold. Just answer the question in plain text, but you can include newlines.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.
Sometimes in the embeddings, speakers are referred to as "Speaker 1" and "Speaker 2". Please do not include these numeric speaker references in your answers. Instead, just refer to the speaker by their name if you know it, or try to differentiate between the speakers by who is the participant and who is the researcher.

{context}

Question: {question}
Helpful answer:`;

export const makeChain = (vectorstore: PineconeStore) => {
  const model = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.3,
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_TEMPLATE,
      questionGeneratorTemplate: CONDENSE_TEMPLATE,
      // returnSourceDocuments: true, //The number of source documents returned is 4 by default
    }
  );
  return chain;
};
