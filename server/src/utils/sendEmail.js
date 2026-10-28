/**
 * Email delivery utility with SMTP support and graceful local simulation fallback.
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const isConfigured = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  if (!isConfigured) {
    console.log(`[Email Service - Simulated] To: ${to}`);
    console.log(`[Email Service - Simulated] Subject: ${subject}`);
    console.log(`[Email Service - Simulated] Content: ${text || html}`);
    return {
      success: true,
      simulated: true,
      message: 'Email simulated because SMTP is not configured.'
    };
  }

  try {
    // When SMTP is provided, load nodemailer dynamically
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'NEXTowner <noreply@nextowner.campus>',
      to,
      subject,
      text,
      html
    });

    return { success: true, messageId: info.messageId, simulated: false };
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error.message);
    return { success: false, error: error.message, simulated: false };
  }
};

export default sendEmail;
