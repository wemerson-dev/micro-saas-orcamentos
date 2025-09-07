/*
  Warnings:

  - Made the column `telefone` on table `Cliente` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "CEP" TEXT,
ADD COLUMN     "UF" TEXT,
ADD COLUMN     "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "observacoes" TEXT,
ALTER COLUMN "numero" SET DATA TYPE TEXT,
ALTER COLUMN "telefone" SET NOT NULL;
