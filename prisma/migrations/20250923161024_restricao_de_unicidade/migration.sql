/*
  Warnings:

  - A unique constraint covering the columns `[numOrc,clienteId]` on the table `Orcamento` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Orcamento_numOrc_key";

-- CreateIndex
CREATE UNIQUE INDEX "Orcamento_numOrc_clienteId_key" ON "Orcamento"("numOrc", "clienteId");
