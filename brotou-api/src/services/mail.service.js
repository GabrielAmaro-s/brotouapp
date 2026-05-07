const nodemailer = require("nodemailer");

const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
const emailIntervalMs = Number(process.env.SMTP_INTERVAL_MS || 6000);
let filaEmails = Promise.resolve();
let ultimoEnvioEm = 0;

const aguardar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const criarTransporter = () => {
  const faltando = requiredEnv.filter((key) => !process.env[key]);

  if (faltando.length > 0) {
    const err = new Error(`Configuração SMTP ausente: ${faltando.join(", ")}`);
    err.statusCode = 500;
    throw err;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const enviarEmail = async ({ to, subject, text, html }) => {
  const tarefa = filaEmails.catch(() => {}).then(async () => {
    const agora = Date.now();
    const espera = Math.max(0, emailIntervalMs - (agora - ultimoEnvioEm));

    if (espera > 0) {
      await aguardar(espera);
    }

    const transporter = criarTransporter();
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || "Brotou <no-reply@brotou.app>",
      to,
      subject,
      text,
      html,
    });

    ultimoEnvioEm = Date.now();
    return info;
  });

  filaEmails = tarefa.catch(() => {});
  return tarefa;
};

module.exports = { enviarEmail };
