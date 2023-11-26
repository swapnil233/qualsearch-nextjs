/*
  Warnings:

  - Made the column `participantName` on table `File` required. This step will fail if there are existing NULL values in that column.
  - Made the column `participantOrganization` on table `File` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateConducted` on table `File` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "File" ALTER COLUMN "participantName" SET NOT NULL,
ALTER COLUMN "participantOrganization" SET NOT NULL,
ALTER COLUMN "dateConducted" SET NOT NULL;
