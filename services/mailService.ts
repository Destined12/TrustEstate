
/**
 * TrustEstate Production Mail Service
 * Note: Neon Auth handles automatic verification emails.
 * This service remains as a secondary fallback or for manual security updates.
 */

const SMTP_CONFIG = {
  Host: process.env.SMTP_HOST || "smtp.gmail.com",
  Username: process.env.SMTP_USER || "",
  Password: process.env.SMTP_PASSWORD || "",
};

// Dynamically load SmtpJS if not present
const loadSmtpScript = (): Promise<void> => {
  return new Promise((resolve) => {
    if ((window as any).Email) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = "https://smtpjs.com/v3/smtp.js";
    script.onload = () => resolve();
    script.onerror = () => {
      console.error("[SMTP] Failed to load SmtpJS script.");
      resolve(); 
    };
    document.head.appendChild(script);
  });
};

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtpEmail = async (
  toEmail: string, 
  toName: string, 
  otp: string, 
  actionType: 'Registration' | 'Recovery' | 'Security Update'
): Promise<boolean> => {
  await loadSmtpScript();
  
  // If no SMTP credentials provided, we assume Neon Auth handles it for Registration
  if (!SMTP_CONFIG.Username || !SMTP_CONFIG.Password) {
    console.info("[SMTP] No custom credentials. Relying on system-level mailers.");
    return true;
  }

  const htmlBody = `
    <div style="font-family: sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; border-radius: 24px;">
      <h2 style="color: #4f46e5; margin-bottom: 24px;">TrustEstate Security</h2>
      <p>Hello <strong>${toName}</strong>,</p>
      <p>A ${actionType} was requested for your account. Please use the following security code:</p>
      <div style="background: white; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center; margin: 32px 0;">
        <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #1e293b;">${otp}</span>
      </div>
    </div>
  `;

  try {
    const result = await (window as any).Email.send({
      Host: SMTP_CONFIG.Host,
      Username: SMTP_CONFIG.Username,
      Password: SMTP_CONFIG.Password,
      To: toEmail,
      From: `TrustEstate Security <${SMTP_CONFIG.Username}>`,
      Subject: `TrustEstate Security: ${actionType} Code`,
      Body: htmlBody
    });
    return result === 'OK';
  } catch (error) {
    console.error("[SMTP] Failed to send email via SmtpJS:", error);
    return false;
  }
};
