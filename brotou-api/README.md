# 🌿 Brotou API

API REST do **Brotou — Diário de Plantas Colaborativo**.  
Stack: **Node.js · Express · Prisma ORM · Neon Tech (PostgreSQL) · Zod · JWT**

---

## Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Variáveis de ambiente
```bash
cp .env.example .env
```
Abra `.env` e cole as strings de conexão do seu projeto no **Neon Tech**:
- `DATABASE_URL` → Connection Pooling (uso geral)
- `DIRECT_URL` → Direct Connection (migrations)

Ambas ficam em: **Neon Console → Project → Connection Details**

### 3. Gerar o Prisma Client
```bash
npm run db:generate
```

### 4. Criar as tabelas
```bash
npm run db:migrate
# ou, se quiser apenas sincronizar sem migrations:
npm run db:push
```

### 5. Popular com dados de exemplo
```bash
npm run db:seed
```

### 6. Rodar em desenvolvimento
```bash
npm run dev
```

API disponível em `http://localhost:3333`

---

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Sobe com nodemon (hot reload) |
| `npm start` | Produção |
| `npm run db:migrate` | Cria migration e aplica |
| `npm run db:push` | Sincroniza schema sem migration |
| `npm run db:seed` | Popula dados de exemplo |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run db:reset` | Reseta BD e re-popula |

---

## Autenticação

A API usa **JWT** com dois secrets distintos:

| Tipo | Header | Secret env |
|---|---|---|
| Usuário | `Authorization: Bearer <token>` | `JWT_SECRET` |
| Admin | `Authorization: Bearer <token>` | `JWT_ADMIN_SECRET` |

Login admin: `POST /admins/login`

---

## Endpoints

### Admins

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/admins/login` | — | Login do admin |
| `GET` | `/admins` | Admin | Listar admins |
| `GET` | `/admins/dashboard` | Admin | Métricas gerais |
| `GET` | `/admins/:id` | Admin | Buscar admin por ID |
| `POST` | `/admins` | Admin | Criar admin |
| `PATCH` | `/admins/:id` | Admin | Atualizar admin |
| `DELETE` | `/admins/:id` | Admin | Remover admin |

**Login request:**
```json
{ "email": "admin@brotou.app", "senha": "admin123" }
```

---

### Usuários

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/usuarios` | — | Listar (filtro: `?adminId=`) |
| `GET` | `/usuarios/:id` | — | Buscar por ID (inclui plantas) |
| `POST` | `/usuarios` | — | Criar usuário |
| `PATCH` | `/usuarios/:id` | — | Atualizar usuário |
| `DELETE` | `/usuarios/:id` | — | Remover usuário |

**POST /usuarios body:**
```json
{
  "nome": "Ana Silva",
  "email": "ana@email.com",
  "urlAvatar": "https://...",
  "adminId": "cuid_do_admin" 
}
```

---

### Espécies

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/especies` | — | Listar (filtro: `?dificuldade=FACIL`) |
| `GET` | `/especies/:id` | — | Buscar por ID |
| `POST` | `/especies` | Admin | Criar espécie |
| `PATCH` | `/especies/:id` | Admin | Atualizar espécie |
| `DELETE` | `/especies/:id` | Admin | Remover espécie |

**POST /especies body:**
```json
{
  "nomeComum": "Costela-de-Adão",
  "nomeCientifico": "Monstera deliciosa",
  "dicaRega": "A cada 7 dias",
  "dicaLuz": "Luz indireta brilhante",
  "dificuldade": "FACIL"
}
```
> `dificuldade`: `FACIL` | `MEDIO` | `DIFICIL`

---

### Plantas

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/plantas` | — | Listar (filtros abaixo) |
| `GET` | `/plantas/:id` | — | Buscar por ID (inclui diário) |
| `POST` | `/plantas` | — | Criar planta |
| `PATCH` | `/plantas/:id` | — | Atualizar planta |
| `DELETE` | `/plantas/:id` | — | Remover planta |

**Filtros GET /plantas:**
```
?donoId=xxx
?especieId=xxx
?adminId=xxx
?disponivelParaAdocao=true
?dificuldade=FACIL
```

**POST /plantas body:**
```json
{
  "apelido": "Monstera da Sala",
  "urlFoto": "https://...",
  "adquiridaEm": "2023-03-15",
  "disponivelParaAdocao": true,
  "donoId": "cuid_usuario",
  "especieId": "cuid_especie",
  "adminId": "cuid_admin"
}
```

---

### Entradas do Diário

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/entradas` | — | Listar (filtros abaixo) |
| `GET` | `/entradas/:id` | — | Buscar por ID |
| `POST` | `/entradas` | — | Criar entrada |
| `PATCH` | `/entradas/:id` | — | Atualizar entrada |
| `DELETE` | `/entradas/:id` | — | Remover entrada |

**Filtros GET /entradas:**
```
?plantaId=xxx
?autorId=xxx
?tipo=REGA
```

**POST /entradas body:**
```json
{
  "tipo": "REGA",
  "observacao": "Regada com 500ml",
  "plantaId": "cuid_planta",
  "autorId": "cuid_usuario"
}
```
> `tipo`: `REGA` | `ADUBACAO` | `PODA` | `OBSERVACAO`

---

### Adoções

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/adocoes` | — | Listar (filtros abaixo) |
| `GET` | `/adocoes/:id` | — | Buscar por ID |
| `POST` | `/adocoes` | — | Solicitar adoção |
| `PATCH` | `/adocoes/:id` | — | Atualizar adoção |
| `PATCH` | `/adocoes/:id/aceitar` | — | Aceitar (→ ATIVA) |
| `PATCH` | `/adocoes/:id/concluir` | — | Concluir (→ CONCLUIDA) |
| `DELETE` | `/adocoes/:id` | — | Remover adoção |

**Filtros GET /adocoes:**
```
?plantaId=xxx
?cuidadorId=xxx
?status=PENDENTE
```

**POST /adocoes body:**
```json
{
  "dataInicio": "2024-08-01",
  "dataFim": "2024-08-15",
  "plantaId": "cuid_planta",
  "cuidadorId": "cuid_usuario"
}
```
> `status`: `PENDENTE` | `ATIVA` | `CONCLUIDA`

---

## Estrutura do Projeto

```
brotou-api/
├── prisma/
│   ├── schema.prisma       # Modelos e enums
│   └── seed.js             # Dados iniciais
├── src/
│   ├── lib/
│   │   └── prisma.js       # Singleton PrismaClient
│   ├── middlewares/
│   │   ├── auth.js         # JWT usuário + admin
│   │   ├── validate.js     # Validação Zod genérica
│   │   └── errorHandler.js # Handler global de erros
│   ├── validators/
│   │   ├── admin.validator.js
│   │   ├── usuario.validator.js
│   │   ├── especie.validator.js
│   │   ├── planta.validator.js
│   │   ├── entradaDiario.validator.js
│   │   └── adocao.validator.js
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── usuario.controller.js
│   │   ├── especie.controller.js
│   │   ├── planta.controller.js
│   │   ├── entradaDiario.controller.js
│   │   └── adocao.controller.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── usuario.routes.js
│   │   ├── especie.routes.js
│   │   ├── planta.routes.js
│   │   ├── entradaDiario.routes.js
│   │   └── adocao.routes.js
│   ├── app.js              # Express + CORS + rotas
│   └── server.js           # Entrada + conexão DB
├── .env.example
├── .gitignore
└── package.json
```

---

## Banco de Dados — Tabelas

| Tabela | Descrição |
|---|---|
| `admins` | Administradores do sistema |
| `usuarios` | Usuários comuns (vinculados a um admin) |
| `especies` | Catálogo de espécies de plantas |
| `plantas` | Plantas individuais dos usuários |
| `entradas_diario` | Registros de rega, adubação, poda, observação |
| `adocoes` | Adoções temporárias de plantas entre usuários |

---

## Credenciais do seed

```
Admin:   admin@brotou.app  /  admin123
Usuário: ana@email.com
Usuário: carlos@email.com
```
