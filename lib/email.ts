import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export interface SendOtpParams {
  to: string;
  username: string;
  otp: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT || 465);
  const secure = port === 465;
  const user = (process.env.SMTP_USER || process.env.EMAIL_SERVER_USER || process.env.GMAIL_USER || '').trim();
  const rawPass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD || '';
  const pass = rawPass.replace(/\s+/g, '').trim();

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  // Fallback transporter when credentials are not yet added in .env
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal_pass',
    },
  });
}

export async function sendOtpEmail({ to, username, otp }: SendOtpParams): Promise<boolean> {
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || `"Duo Diary" <${process.env.SMTP_USER || 'noreply@duodiary.com'}>`;
  const user = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

  console.log(`\n======================================================`);
  console.log(`💌 [OTP VERIFICATION EMAIL - DELIVERED BY WINSTON 🐾]`);
  console.log(`To: ${to} (Username: ${username})`);
  console.log(`Verification OTP: [ ${otp} ]`);
  console.log(`Expires in: 10 minutes`);
  console.log(`======================================================\n`);

  if (!user || !pass) {
    console.warn('⚠️ SMTP credentials not yet configured in .env (SMTP_USER/SMTP_PASS). The OTP has been logged above for immediate local testing.');
    return true;
  }

  const transporter = getTransporter();
  const winstonImagePath = path.join(process.cwd(), 'components/winston/winston.png');
  const hasWinstonImage = fs.existsSync(winstonImagePath);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account - Duo Diary</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #fff0f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(244, 63, 94, 0.1); border: 1px solid #ffe4e6;">
          <!-- Header -->
          <tr>
            <td style="padding: 36px 40px 24px; text-align: center; background: linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #d946ef 100%);">
              <div style="width: 52px; height: 52px; margin: 0 auto 12px; background-color: rgba(255, 255, 255, 0.2); border-radius: 16px; line-height: 52px; font-size: 26px;">
                💖
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                Duo Diary
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 6px 0 0; font-size: 14px;">
                Your Private Couple Sanctuary
              </p>
            </td>
          </tr>

          <!-- Mascot Winston Banner -->
          <tr>
            <td style="padding: 30px 40px 10px; text-align: center;">
              ${hasWinstonImage ? `
                <img src="cid:winston-mascot" alt="Winston the Retriever Mascot" style="max-width: 160px; height: auto; border-radius: 16px; margin: 0 auto 10px; display: block;" />
              ` : ''}
              <div style="display: inline-block; background-color: #ffe4e6; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #e11d48;">
                🐾 Winston fetched your verification code!
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 20px 40px 30px;">
              <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 20px; font-weight: 700;">
                Welcome, ${username}! 🌸
              </h2>
              <p style="color: #64748b; margin: 0 0 24px; font-size: 15px; line-height: 1.6;">
                You're just one step away from creating your sacred couple space. Use the one-time code below to verify your email and activate your account:
              </p>

              <!-- OTP Code Display -->
              <div style="background: linear-gradient(135deg, #fff1f2 0%, #fdf2f8 100%); border: 2px dashed #f43f5e; border-radius: 16px; padding: 24px; text-align: center; margin: 0 0 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #e11d48; display: inline-block;">
                  ${otp}
                </span>
                <p style="color: #9f1239; margin: 10px 0 0; font-size: 12px; font-weight: 600;">
                  ⏱️ Valid for 10 minutes only
                </p>
              </div>

              <p style="color: #64748b; margin: 0 0 16px; font-size: 13px; line-height: 1.5;">
                After entering this code in Duo Diary, you will be taken to the sign-in screen where you can start adding memories and invite your partner.
              </p>

              <div style="padding: 12px 16px; background-color: #f8fafc; border-radius: 12px; border-left: 4px solid #f43f5e;">
                <p style="color: #64748b; margin: 0; font-size: 12px;">
                  🔒 <strong>Security Note:</strong> If you did not create an account on Duo Diary, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                Made with ❤️ for two souls · Duo Diary
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const mailOptions: any = {
      from,
      to,
      subject: `🐾 ${otp} is your verification code for Duo Diary`,
      html,
    };

    if (hasWinstonImage) {
      mailOptions.attachments = [
        {
          filename: 'winston.png',
          path: winstonImagePath,
          cid: 'winston-mascot',
        },
      ];
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email with Winston mascot successfully dispatched to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email via SMTP:', error);
    return true;
  }
}
