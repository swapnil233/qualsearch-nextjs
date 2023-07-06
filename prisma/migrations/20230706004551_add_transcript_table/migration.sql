-- CreateTable
CREATE TABLE "DGTranscript" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transcript" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "words" JSONB NOT NULL,
    "paragraphs" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "DGTranscript_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DGTranscript_fileId_key" ON "DGTranscript"("fileId");

-- AddForeignKey
ALTER TABLE "DGTranscript" ADD CONSTRAINT "DGTranscript_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
