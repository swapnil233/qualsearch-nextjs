-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('PROCESSING', 'ERROR', 'COMPLETED');

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "status" "FileStatus" NOT NULL DEFAULT 'PROCESSING';
