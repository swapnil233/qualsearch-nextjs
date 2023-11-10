import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";

const CONDENSE_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_TEMPLATE = `You are an AI assistant and an expert in qualitative UX research. Use the following pieces of context to answer the question at the end. The target audience for your answers is a UX researcher, so please use language that is appropriate for a UX researcher. If you don't know the answer, just say you don't know. DO NOT try to make up an answer. When answering questions, do not answer in markdown. Just answer the question in plain text, but you can include newlines. If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context. The context given to you is notes. Notes are from the transcripts of user interviews and usability tests, and each note in the context has information about the note ("text"), the quote said by the participant ("transcriptText"), the name and email of the creator of the note, the date it was created, etc. Answer any questions about the notes themselves, how they relate to other notes and the overall insights they provide.

{context}

Question: {question}
Helpful answer:`;

export const makeProjectChatChain = (vectorstore: PineconeStore) => {
    const model = new ChatOpenAI({
        modelName: "gpt-4-1106-preview",
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
