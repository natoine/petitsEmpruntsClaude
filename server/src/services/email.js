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

async function send(to, subject, html, devExtra = '') {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`\n📧 [DEV] Email à ${to}\nSujet : ${subject}${devExtra}\n`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Petits Emprunts Entre Amis" <no-reply@petitsemprunts.fr>',
    to,
    subject,
    html,
  });
}

export async function sendVerificationEmail(email, token) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

  await send(email, 'Confirmez votre adresse email', `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; color: #2d2d2d;">
      <h2 style="color: #e87722;">Bienvenue sur Petits Emprunts Entre Amis !</h2>
      <p>Pour activer votre compte, cliquez sur le lien ci-dessous. Il expire dans 24 heures.</p>
      <a href="${verifyUrl}"
         style="display:inline-block; margin: 1.5rem 0; padding: 0.75rem 1.75rem;
                background: #e87722; color: white; border-radius: 50px;
                text-decoration: none; font-weight: 600;">
        Confirmer mon email
      </a>
      <p style="color: #888; font-size: 0.875rem;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
    </div>
  `, `\nLien : ${verifyUrl}`);
}

// Notifie un utilisateur existant qu'un prêt le concerne
export async function sendLoanNotification({ to, ownerName, kind, what }) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  // Du point de vue du destinataire :
  // si l'owner a fait un 'loan' (prêté) → le destinataire a emprunté
  // si l'owner a fait un 'borrow' (emprunté) → le destinataire a prêté
  const isLoanFromOwner = kind === 'loan';
  const subject = isLoanFromOwner
    ? `${ownerName} vous a prêté : ${what}`
    : `${ownerName} vous a emprunté : ${what}`;
  const actionLine = isLoanFromOwner
    ? `<strong>${ownerName}</strong> vous a prêté <strong>${what}</strong>.`
    : `<strong>${ownerName}</strong> vous a emprunté <strong>${what}</strong>.`;

  await send(to, subject, `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; color: #2d2d2d;">
      <h2 style="color: #e87722;">Nouveau mouvement enregistré</h2>
      <p>${actionLine}</p>
      <p>Retrouvez le détail dans votre espace Petits Emprunts Entre Amis.</p>
      <a href="${clientUrl}/app"
         style="display:inline-block; margin: 1.5rem 0; padding: 0.75rem 1.75rem;
                background: #e87722; color: white; border-radius: 50px;
                text-decoration: none; font-weight: 600;">
        Voir mes prêts et emprunts
      </a>
    </div>
  `);
}

// Notifie une personne sans compte qu'un prêt la concerne et l'invite à s'inscrire
export async function sendLoanInvitation({ to, ownerName, kind, what }) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const isLoanFromOwner = kind === 'loan';
  const subject = isLoanFromOwner
    ? `${ownerName} vous a prêté : ${what}`
    : `${ownerName} vous a emprunté : ${what}`;
  const actionLine = isLoanFromOwner
    ? `<strong>${ownerName}</strong> vous a prêté <strong>${what}</strong> et l'a enregistré sur Petits Emprunts Entre Amis.`
    : `<strong>${ownerName}</strong> vous a emprunté <strong>${what}</strong> et l'a enregistré sur Petits Emprunts Entre Amis.`;

  await send(to, subject, `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; color: #2d2d2d;">
      <h2 style="color: #e87722;">Petits Emprunts Entre Amis</h2>
      <p>${actionLine}</p>
      <p>Créez un compte gratuit pour suivre vos prêts et emprunts, et ne plus jamais oublier qui vous doit quoi.</p>
      <a href="${clientUrl}/register"
         style="display:inline-block; margin: 1.5rem 0; padding: 0.75rem 1.75rem;
                background: #e87722; color: white; border-radius: 50px;
                text-decoration: none; font-weight: 600;">
        Créer mon compte gratuitement
      </a>
      <p style="color: #888; font-size: 0.875rem;">Vous recevez cet email car ${ownerName} a saisi votre adresse.</p>
    </div>
  `);
}
