-- CreateEnum
CREATE TYPE "StatusAmizade" AS ENUM ('PENDENTE', 'ACEITA', 'RECUSADA');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN "username" TEXT;

-- Backfill username for existing records
UPDATE "usuarios"
SET "username" = LOWER(SPLIT_PART("email", '@', 1)) || '_' || SUBSTRING("id", 1, 4)
WHERE "username" IS NULL;

-- Set username not null and unique
ALTER TABLE "usuarios" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateTable
CREATE TABLE "amizades" (
    "id" TEXT NOT NULL,
    "status" "StatusAmizade" NOT NULL DEFAULT 'PENDENTE',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondido_em" TIMESTAMP(3),
    "solicitante_id" TEXT NOT NULL,
    "destinatario_id" TEXT NOT NULL,
    CONSTRAINT "amizades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "amizades_solicitante_id_destinatario_id_key" ON "amizades"("solicitante_id", "destinatario_id");

-- AddForeignKey
ALTER TABLE "amizades" ADD CONSTRAINT "amizades_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "amizades" ADD CONSTRAINT "amizades_destinatario_id_fkey" FOREIGN KEY ("destinatario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;