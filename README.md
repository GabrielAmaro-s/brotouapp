# Brotou

Aplicacao web para catalogo, diario de cuidados e interacoes de adocao temporaria de plantas.

## Tecnologias

- Backend: Node.js, Express, Prisma, PostgreSQL, JWT, Zod, Nodemailer
- Frontend: React, Vite, React Router
- Banco: PostgreSQL
- Docker: API, frontend e banco local
- E-mail de teste: Mailtrap SMTP Sandbox

## Pre-requisitos

Instale:

- Git
- Node.js LTS e npm
- Docker Desktop, recomendado para rodar tudo com um comando

Confira no terminal:

```bash
git --version
node --version
npm --version
docker --version
```

## Configuracao do ambiente

Crie o arquivo de variaveis da API:

```bash
cd brotou-api
copy .env.example .env
```

No macOS/Linux:

```bash
cp .env.example .env
```

Preencha `brotou-api/.env`:

```env
DATABASE_URL="sua_url_postgres"
DIRECT_URL="sua_url_postgres"
PORT=3333

JWT_SECRET="um_segredo_para_usuarios"
JWT_EXPIRES_IN="7d"
JWT_ADMIN_SECRET="um_segredo_para_admin"
JWT_ADMIN_EXPIRES_IN="1d"
NODE_ENV="development"

SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER="usuario_do_mailtrap"
SMTP_PASS="senha_do_mailtrap"
MAIL_FROM="Brotou <no-reply@brotou.app>"
```

Importante: nunca envie `.env` para o GitHub.

## Rodar com Docker

Na raiz do projeto:

```bash
docker compose up -d --build
```

Acesse:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3333`
- Healthcheck: `http://localhost:3333/health`

Ver logs:

```bash
docker compose logs -f api
docker compose logs -f frontend
```

Parar:

```bash
docker compose down
```

Se mudar apenas `.env`, recrie a API:

```bash
docker compose up -d --force-recreate api
```

## Banco e seed

Se estiver usando um banco vazio, aplique migrations e seed pela API:

```bash
cd brotou-api
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

Se quiser aplicar migrations existentes em outro ambiente:

```bash
npx prisma migrate deploy
```

## Rodar sem Docker

Terminal 1, API:

```bash
cd brotou-api
npm install
npm run db:generate
npm run dev
```

Terminal 2, frontend:

```bash
cd brotou-frontend
npm install
npm run dev
```

Abra:

```text
http://localhost:5173
```

## Mailtrap

Para testar envio de e-mail:

1. Entre no Mailtrap.
2. Va em `Email Testing` > `Sandboxes`.
3. Abra seu sandbox.
4. Na aba `Integration`, selecione `SMTP`.
5. Copie Host, Port, Username e Password para `brotou-api/.env`.
6. Recrie a API:

```bash
docker compose up -d --force-recreate api
```

No sistema, entre como admin, va em `Interacoes` e clique em `Enviar e-mail`. O e-mail aparece no inbox do sandbox do Mailtrap.

## Credenciais seed

Depois de rodar o seed:

```text
Admin:   admin@brotou.app / admin123
Usuario: ana@email.com    / Usuario123
Usuario: carlos@email.com / Usuario123
```

Credenciais pessoais de teste devem ficar em arquivo local ignorado, por exemplo:

```text
brotou-api/CREDENCIAIS_TESTE.local.txt
```

## Scripts uteis

API:

```bash
npm run dev
npm start
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

Frontend:

```bash
npm run dev
npm run build
```

## Antes de subir para o GitHub

Confira se estes arquivos nao entram no commit:

- `brotou-api/.env`
- `brotou-frontend/.env.local`
- `node_modules/`
- `dist/`
- `brotou-api/CREDENCIAIS_TESTE.local.txt`

Comandos uteis:

```bash
git status
git add .
git status
```

Revise o `git status` antes do commit para garantir que nenhum segredo foi adicionado.
