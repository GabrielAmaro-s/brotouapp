const nodemailer = require("nodemailer");

const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];

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
  const transporter = criarTransporter();

  return transporter.sendMail({
    from: process.env.MAIL_FROM || "Brotou <no-reply@brotou.app>",
    to,
    subject,
    text,
    html,
  });
};

module.exports = { enviarEmail };
