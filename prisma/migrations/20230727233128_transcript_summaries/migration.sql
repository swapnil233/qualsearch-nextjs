/*
  Warnings:

  - A unique constraint covering the columns `[summaryId]` on the table `Transcript` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transcript" ADD COLUMN     "summaryId" TEXT;

-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transcript_summaryId_key" ON "Transcript"("summaryId");

-- AddForeignKey
ALTER TABLE "Transcript" ADD CONSTRAINT "Transcript_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "Summary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
