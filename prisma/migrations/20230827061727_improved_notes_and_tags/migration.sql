/*
  Warnings:

  - You are about to drop the column `end` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `start` on the `Tag` table. All the data in the column will be lost.
  - Made the column `createdByUserId` on table `Note` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdByUserId` on table `Tag` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_fileId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_projectId_fkey";

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "createdByUserId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "end",
DROP COLUMN "start",
ALTER COLUMN "fileId" DROP NOT NULL,
ALTER COLUMN "createdByUserId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
