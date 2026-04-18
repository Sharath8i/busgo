import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();
  if (!t) {
    console.warn('[email] Skipping send — EMAIL_USER / EMAIL_PASS not configured');
    return { skipped: true };
  }
  try {
    return await t.sendMail({
      from: '"BusGo" <noreply@busgo.com>',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('[email] Nodemailer Error:', err.message);
    throw err; // Crucial: throw it so auth controller falls into DEV MODE
  }
};
