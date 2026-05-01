-- Add password hashes for regular users. Existing accounts receive a locked
-- bcrypt hash so they cannot be accessed until their password is reset manually.
ALTER TABLE "usuarios" ADD COLUMN "senha" TEXT;

UPDATE "usuarios"
SET "senha" = '$2a$12$AYOnrcQ3tJniAO.J3IgZHOF3xCZ0YWNR.6Xd3c4uaw90UdArqrFXK'
WHERE "senha" IS NULL;

ALTER TABLE "usuarios" ALTER COLUMN "senha" SET NOT NULL;
