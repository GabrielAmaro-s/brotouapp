-- AlterTable
ALTER TABLE "adocoes"
ADD COLUMN "mensagem_cliente" TEXT,
ADD COLUMN "resposta_admin" TEXT,
ADD COLUMN "email_enviado_em" TIMESTAMP(3),
ADD COLUMN "confirmada_em" TIMESTAMP(3);