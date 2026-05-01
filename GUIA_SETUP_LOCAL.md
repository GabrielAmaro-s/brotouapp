# Guia para rodar o Brotou localmente em outro computador

Este passo a passo e para continuar desenvolvendo o projeto em outro PC.

## 1. Instalar programas

Instale:

- Git: https://git-scm.com/downloads
- Node.js LTS: https://nodejs.org/
- VS Code: https://code.visualstudio.com/

Opcional:

- Docker Desktop, se quiser rodar com Docker: https://www.docker.com/products/docker-desktop/

Depois de instalar, confira no terminal:

```bash
git --version
node --version
npm --version
```

## 2. Baixar ou copiar o projeto

Se estiver usando Git:

```bash
git clone URL_DO_REPOSITORIO
cd brotouapp
```

Se for copiar por pendrive/zip, copie a pasta do projeto e abra ela no VS Code.

Importante: as pastas `node_modules` nao precisam ser copiadas. Elas sao recriadas com `npm install`.

## 3. Configurar variaveis da API

Entre na pasta da API:

```bash
cd brotou-api
```

Crie o arquivo `.env` a partir do exemplo:

```bash
copy .env.example .env
```

No macOS/Linux:

```bash
cp .env.example .env
```

Abra o arquivo `.env` e preencha:

```env
DATABASE_URL="sua_url_do_banco"
JWT_SECRET="uma_string_segura_para_usuario"
JWT_ADMIN_SECRET="uma_string_segura_para_admin"
JWT_ADMIN_EXPIRES_IN="1d"
FRONTEND_URL="http://localhost:5173"
```

Se voce for usar o mesmo banco Neon atual, copie a `DATABASE_URL` do seu ambiente antigo.
Nao coloque o `.env` no Git.

## 4. Instalar dependencias da API

Ainda dentro de `brotou-api`:

```bash
npm install
npm run db:generate
```

Se o banco estiver vazio ou precisar receber as tabelas:

```bash
npm run db:migrate
```

Se as migrations ja existem e voce so quer aplicar no banco:

```bash
npx prisma migrate deploy
```

Para popular dados iniciais:

```bash
npm run db:seed
```

## 5. Rodar a API

Dentro de `brotou-api`:

```bash
npm run dev
```

A API deve abrir em:

```text
http://localhost:3333
```

Deixe esse terminal aberto.

## 6. Configurar e rodar o frontend

Abra outro terminal na raiz do projeto e entre no frontend:

```bash
cd brotou-frontend
```

Instale as dependencias:

```bash
npm install
```

Se precisar configurar a URL da API, crie `.env.local`:

```env
VITE_API_URL=http://localhost:3333
```

Rode o frontend:

```bash
npm run dev
```

Abra no navegador:

```text
http://localhost:5173
```

## 7. Credenciais de teste

Credenciais pessoais ou de teste ficam no arquivo local:

```text
brotou-api/CREDENCIAIS_TESTE.local.txt
```

Esse arquivo e ignorado pelo Git. Se voce for para outro computador, copie esse arquivo manualmente se precisar consultar as credenciais.

## 8. Rodar com Docker, opcional

Se preferir usar Docker, instale o Docker Desktop e rode na raiz do projeto:

```bash
docker compose up -d --build
```

Ver logs:

```bash
docker compose logs -f api
docker compose logs -f frontend
```

Parar:

```bash
docker compose down
```

## 9. Comandos uteis

API:

```bash
cd brotou-api
npm run dev
npm run db:generate
npm run db:migrate
npm run db:seed
```

Frontend:

```bash
cd brotou-frontend
npm run dev
npm run build
```

## 10. Checklist rapido

- Git instalado
- Node.js LTS instalado
- `.env` criado em `brotou-api`
- `npm install` rodado em `brotou-api`
- `npm install` rodado em `brotou-frontend`
- Prisma Client gerado com `npm run db:generate`
- API rodando em `http://localhost:3333`
- Frontend rodando em `http://localhost:5173`
