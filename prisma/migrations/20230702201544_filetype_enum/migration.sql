/*
  Warnings:

  - You are about to drop the column `mimeType` on the `File` table. All the data in the column will be lost.
  - Added the required column `type` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('VIDEO', 'AUDIO');

-- AlterTable
ALTER TABLE "File" DROP COLUMN "mimeType",
ADD COLUMN     "type" "FileType" NOT NULL;
