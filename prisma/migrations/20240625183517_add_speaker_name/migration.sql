-- CreateTable
CREATE TABLE "SpeakerName" (
    "id" TEXT NOT NULL,
    "speakerIndex" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "transcriptId" TEXT NOT NULL,

    CONSTRAINT "SpeakerName_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpeakerName_transcriptId_speakerIndex_key" ON "SpeakerName"("transcriptId", "speakerIndex");

-- AddForeignKey
ALTER TABLE "SpeakerName" ADD CONSTRAINT "SpeakerName_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "Transcript"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
