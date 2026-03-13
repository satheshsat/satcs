const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'JobBoard <noreply@jobboard.com>';
const appName = 'JobBoard';

function isEmailConfigured() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendWelcomeEmail(to, name, role) {
  if (!isEmailConfigured()) {
    console.log('[Email] SMTP not configured, skipping welcome email to', to);
    return;
  }
  const baseUrl = process.env.FRONTEND_URL || '';
  const roleLabel = role === 'employer' ? 'Employer' : 'Job Seeker';
  const link = role === 'employer' ? `${baseUrl}/post-job.html` : `${baseUrl}/index.html`;
  const linkText = role === 'employer' ? 'post jobs' : 'browse jobs';
  await transporter.sendMail({
    from,
    to,
    subject: `Welcome to ${appName}!`,
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>You've successfully registered as a <strong>${roleLabel}</strong> on ${appName}.</p>
      <p>You can now <a href="${link}">${linkText}</a>.</p>
      <p>If you didn't create this account, you can ignore this email.</p>
      <p>— The ${appName} Team</p>
    `,
    text: `Welcome, ${name}! You've registered as ${roleLabel} on ${appName}. Visit ${link} to get started.`
  });
}

async function sendPasswordResetEmail(to, name, resetUrl) {
  if (!isEmailConfigured()) {
    console.log('[Email] SMTP not configured, skipping reset email to', to);
    return;
  }
  await transporter.sendMail({
    from,
    to,
    subject: `Reset your ${appName} password`,
    html: `
      <h2>Password reset</h2>
      <p>Hi ${name},</p>
      <p>You requested a password reset. Click the link below to set a new password (valid for 1 hour):</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, ignore this email. Your password will stay unchanged.</p>
      <p>— The ${appName} Team</p>
    `,
    text: `Hi ${name}, reset your password: ${resetUrl} (valid 1 hour).`
  });
}

module.exports = { sendWelcomeEmail, sendPasswordResetEmail, isEmailConfigured };
