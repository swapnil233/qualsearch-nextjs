/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'VIEWER', 'MEMBER', 'ADMIN');

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- CreateTable
CREATE TABLE "TeamMember" (
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("userId","teamId")
);

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
