import nodemailer from 'nodemailer';

function createTransporter() {
  if (!process.env.SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendVerificationEmail(email, token) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

  const transporter = createTransporter();

  if (!transporter) {
    console.log(`\n📧 [DEV] Lien de vérification pour ${email} :\n${verifyUrl}\n`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Petits Emprunts Entre Amis" <no-reply@petitsemprunts.fr>',
    to: email,
    subject: 'Confirmez votre adresse email',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; color: #2d2d2d;">
        <h2 style="color: #e87722;">Bienvenue sur Petits Emprunts Entre Amis !</h2>
        <p>Pour activer votre compte, cliquez sur le lien ci-dessous. Il expire dans 24 heures.</p>
        <a href="${verifyUrl}"
           style="display:inline-block; margin: 1.5rem 0; padding: 0.75rem 1.75rem;
                  background: #e87722; color: white; border-radius: 50px;
                  text-decoration: none; font-weight: 600;">
          Confirmer mon email
        </a>
        <p style="color: #888; font-size: 0.875rem;">
          Si vous n'avez pas créé de compte, ignorez cet email.
        </p>
      </div>
    `,
  });
}
