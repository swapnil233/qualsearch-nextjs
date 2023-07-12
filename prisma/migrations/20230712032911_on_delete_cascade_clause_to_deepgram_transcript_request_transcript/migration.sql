-- DropForeignKey
ALTER TABLE "DeepgramTranscriptRequest" DROP CONSTRAINT "DeepgramTranscriptRequest_fileId_fkey";

-- DropForeignKey
ALTER TABLE "Transcript" DROP CONSTRAINT "Transcript_fileId_fkey";

-- AddForeignKey
ALTER TABLE "DeepgramTranscriptRequest" ADD CONSTRAINT "DeepgramTranscriptRequest_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcript" ADD CONSTRAINT "Transcript_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
