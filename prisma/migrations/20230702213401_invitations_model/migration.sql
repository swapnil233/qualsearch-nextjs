/*
  Warnings:

  - You are about to drop the column `teamId` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FileType" ADD VALUE 'POWERPOINT';
ALTER TYPE "FileType" ADD VALUE 'PDF';
ALTER TYPE "FileType" ADD VALUE 'WORD';
ALTER TYPE "FileType" ADD VALUE 'EXCEL';
ALTER TYPE "FileType" ADD VALUE 'IMAGE';
ALTER TYPE "FileType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "teamId";

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "invitedEmail" VARCHAR(320) NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "teamId" TEXT NOT NULL,
    "invitedByUserId" TEXT,
    "invitedUserId" TEXT,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_invitedEmail_teamId_key" ON "Invitation"("invitedEmail", "teamId");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
