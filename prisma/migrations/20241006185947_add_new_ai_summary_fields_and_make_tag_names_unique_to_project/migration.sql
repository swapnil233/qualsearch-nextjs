/*
  Warnings:

  - You are about to drop the column `teamMemberId` on the `Speaker` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,projectId]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Speaker" DROP CONSTRAINT "Speaker_teamMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "createdByUserId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Speaker" DROP COLUMN "teamMemberId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Summary" ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "createdByUserId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SummaryInsight" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "insight" TEXT NOT NULL,
    "quote" TEXT,
    "summaryId" TEXT NOT NULL,

    CONSTRAINT "SummaryInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SummaryOverview" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "overview" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,

    CONSTRAINT "SummaryOverview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SummaryOverview_summaryId_key" ON "SummaryOverview"("summaryId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_projectId_key" ON "Tag"("name", "projectId");

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummaryInsight" ADD CONSTRAINT "SummaryInsight_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "Summary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummaryOverview" ADD CONSTRAINT "SummaryOverview_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "Summary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Speaker" ADD CONSTRAINT "Speaker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
