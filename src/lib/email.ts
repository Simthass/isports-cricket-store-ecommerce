import nodemailer from "nodemailer";

interface SendPasswordResetEmailParams {
  email: string;
  name: string;
  resetUrl: string;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
}: SendPasswordResetEmailParams) {
  try {
    const transporter = createTransporter();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - iSPORTS Cricket</title>
        <style>
          body { font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #004b9c 0%, #0062cc 100%); padding: 32px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; letter-spacing: 1px; }
          .content { padding: 40px 32px; }
          .button { display: inline-block; background-color: #25D366; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 24px 0; transition: all 0.3s ease; }
          .button:hover { background-color: #1ebe5d; transform: translateY(-2px); }
          .footer { background-color: #f3f4f6; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
          .text-muted { color: #6b7280; font-size: 12px; }
          .text-small { font-size: 12px; line-height: 1.5; }
          .divider { height: 1px; background-color: #e5e7eb; margin: 24px 0; }
        </style>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f9fafb; font-family: 'Poppins', Arial, sans-serif;">
        <div class="container">
          <div class="header">
            <h1>🏏 iSPORTS Cricket</h1>
          </div>
          
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Hello <strong>${name}</strong>,
            </p>
            
            <p style="color: #4b5563; line-height: 1.6;">
              We received a request to reset your password for your iSPORTS Cricket account.
              Click the button below to create a new password:
            </p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button" style="display: inline-block; background-color: #25D366; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 24px 0;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="background-color: #f3f4f6; padding: 12px; border-radius: 8px; word-break: break-all; font-size: 12px; color: #004b9c;">
              ${resetUrl}
            </p>
            
            <div class="divider"></div>
            
            <p style="color: #4b5563; line-height: 1.6; font-size: 13px;">
              This link will expire in <strong>1 hour</strong>. If you didn't request this, please ignore this email.
            </p>
          </div>
          
          <div class="footer">
            <p class="text-muted" style="margin: 0 0 8px;">iSPORTS Cricket – Your Cricket Equipment Specialist</p>
            <p class="text-small text-muted" style="margin: 0;">&copy; 2026 iSPORTS Cricket UAE. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await transporter.sendMail({
      from: `"iSPORTS Cricket" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password - iSPORTS Cricket",
      html,
    });
    
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send email");
  }
}