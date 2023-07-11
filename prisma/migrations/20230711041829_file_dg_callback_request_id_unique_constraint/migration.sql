/*
  Warnings:

  - A unique constraint covering the columns `[dgCallbackRequestId]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "File_dgCallbackRequestId_key" ON "File"("dgCallbackRequestId");
