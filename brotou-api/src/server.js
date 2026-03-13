const app = require("./app");
const prisma = require("./lib/prisma");

const PORT = process.env.PORT || 3333;

async function iniciar() {
  try {
    // Testa conexão com o banco antes de subir
    await prisma.$connect();
    console.log("✅ Conexão com Neon Tech estabelecida");

    app.listen(PORT, () => {
      console.log(`\n🌿 Brotou API rodando em http://localhost:${PORT}`);
      console.log("─────────────────────────────────────────");
      console.log(`GET  /              → health check`);
      console.log(`POST /admins/login  → login admin`);
      console.log(`GET  /admins/dashboard → métricas`);
      console.log(`─────────────────────────────────────────`);
      console.log(`Rotas: /usuarios  /especies  /plantas`);
      console.log(`       /entradas  /adocoes   /admins`);
    });
  } catch (err) {
    console.error("❌ Erro ao conectar com o banco:", err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

iniciar();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Encerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
