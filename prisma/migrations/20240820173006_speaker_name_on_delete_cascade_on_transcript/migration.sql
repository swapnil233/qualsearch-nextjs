-- DropForeignKey
ALTER TABLE "SpeakerName" DROP CONSTRAINT "SpeakerName_transcriptId_fkey";

-- AddForeignKey
ALTER TABLE "SpeakerName" ADD CONSTRAINT "SpeakerName_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "Transcript"("id") ON DELETE CASCADE ON UPDATE CASCADE;
