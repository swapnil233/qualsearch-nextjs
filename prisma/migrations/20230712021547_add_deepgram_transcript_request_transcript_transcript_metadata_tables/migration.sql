/*
  Warnings:

  - You are about to drop the column `dgCallbackRequestId` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `transcript` on the `File` table. All the data in the column will be lost.
  - You are about to drop the `DGTranscript` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DGTranscript" DROP CONSTRAINT "DGTranscript_fileId_fkey";

-- DropIndex
DROP INDEX "File_dgCallbackRequestId_key";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "dgCallbackRequestId",
DROP COLUMN "transcript";

-- DropTable
DROP TABLE "DGTranscript";

-- CreateTable
CREATE TABLE "DeepgramTranscriptRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "request_id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "DeepgramTranscriptRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transcript" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DOUBLE PRECISION NOT NULL,
    "words" JSONB NOT NULL,
    "topics" JSONB NOT NULL,
    "entities" JSONB NOT NULL,
    "summaries" JSONB NOT NULL,
    "paragraphs" JSONB NOT NULL,
    "transcriptString" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "Transcript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranscriptMetadata" (
    "id" TEXT NOT NULL,
    "created" TEXT NOT NULL,
    "tags" TEXT[],
    "models" TEXT[],
    "sha256" TEXT NOT NULL,
    "channels" INTEGER NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "model_info" JSONB NOT NULL,
    "request_id" TEXT NOT NULL,
    "transcriptId" TEXT NOT NULL,

    CONSTRAINT "TranscriptMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeepgramTranscriptRequest_request_id_key" ON "DeepgramTranscriptRequest"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "DeepgramTranscriptRequest_fileId_key" ON "DeepgramTranscriptRequest"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "Transcript_fileId_key" ON "Transcript"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "TranscriptMetadata_transcriptId_key" ON "TranscriptMetadata"("transcriptId");

-- AddForeignKey
ALTER TABLE "DeepgramTranscriptRequest" ADD CONSTRAINT "DeepgramTranscriptRequest_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcript" ADD CONSTRAINT "Transcript_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptMetadata" ADD CONSTRAINT "TranscriptMetadata_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "Transcript"("id") ON DELETE CASCADE ON UPDATE CASCADE;
