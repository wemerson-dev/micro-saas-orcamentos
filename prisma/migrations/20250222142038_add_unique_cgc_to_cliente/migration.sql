/*
  Warnings:

  - A unique constraint covering the columns `[cgc]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cgc_key" ON "Cliente"("cgc");
