import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'info@roofquote.com';

export interface LeadNotificationDetails {
  customerName: string;
  email: string;
  phone?: string;
  address: string;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  selectedMaterial?: string;
  roofSquares?: number;
}

export async function sendCustomerConfirmationEmail(
  email: string,
  details: LeadNotificationDetails,
  companyName: string
) {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY not set — skipping customer email');
    return { success: false };
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your Roofing Estimate from ${companyName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 40px 20px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <tr>
              <td style="padding: 32px 40px; background: #1e3a5f; text-align: center;">
                <h1 style="color: #fff; font-size: 22px; font-weight: 800; margin: 0;">${companyName}</h1>
                <p style="color: #93c5fd; margin: 8px 0 0; font-size: 13px;">Roofing Estimate</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-top: 0;">Hi ${details.customerName} 👋</h2>
                <p style="color: #4b5563; font-size: 15px; line-height: 24px;">
                  Thank you for using our online estimator! We've received your project details and a member of our team will be in touch shortly.
                </p>
                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 24px 0;">
                  <p style="margin: 0 0 8px; color: #0369a1; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Your Estimate Summary</p>
                  <p style="margin: 0 0 4px; color: #1e3a5f; font-size: 14px;"><strong>Property:</strong> ${details.address}</p>
                  ${details.selectedMaterial ? `<p style="margin: 0 0 4px; color: #1e3a5f; font-size: 14px;"><strong>Material:</strong> ${details.selectedMaterial}</p>` : ''}
                  ${details.roofSquares ? `<p style="margin: 0 0 4px; color: #1e3a5f; font-size: 14px;"><strong>Roof Size:</strong> ${details.roofSquares} squares</p>` : ''}
                  <p style="margin: 0; color: #1e3a5f; font-size: 16px; font-weight: 800;">
                    Estimated Range: $${details.estimatedPriceMin.toLocaleString()} – $${details.estimatedPriceMax.toLocaleString()}
                  </p>
                </div>
                <p style="color: #6b7280; font-size: 13px; line-height: 20px;">
                  This is a preliminary estimate based on aerial measurements. Final pricing will be confirmed after a professional site assessment.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 40px; background: #f3f4f6; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${companyName}. Powered by RoofQuote.</p>
              </td>
            </tr>
          </table>
        </div>
      `,
    });
    return { success: true };
  } catch (e: unknown) {
    const err = e as Error;
    console.error('❌ Customer email failed:', err.message);
    return { success: false, error: err.message };
  }
}

export async function sendAdminLeadAlertEmail(
  adminEmail: string,
  details: LeadNotificationDetails,
  companyName: string
) {
  if (!resend) return { success: false };
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `🏠 New RoofQuote Lead: ${details.customerName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #1e3a5f;">New Roofing Lead for ${companyName}</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; width: 140px;">Customer</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${details.customerName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${details.email}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Phone</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${details.phone || 'Not provided'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Address</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${details.address}</td></tr>
            ${details.selectedMaterial ? `<tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Material</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${details.selectedMaterial}</td></tr>` : ''}
            ${details.roofSquares ? `<tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Roof Squares</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${details.roofSquares}</td></tr>` : ''}
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Estimate</td><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; color: #1e3a5f;">$${details.estimatedPriceMin.toLocaleString()} – $${details.estimatedPriceMax.toLocaleString()}</td></tr>
          </table>
          <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">Log in to your RoofQuote dashboard to view and manage this lead.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (e: unknown) {
    const err = e as Error;
    console.error('❌ Admin email failed:', err.message);
    return { success: false, error: err.message };
  }
}

export async function sendAdminLeadAlertSMS(
  adminPhone: string,
  details: LeadNotificationDetails,
  companyName: string
) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn('⚠️ Twilio not configured — skipping SMS');
    return { success: false };
  }
  try {
    await twilioClient.messages.create({
      body: `🏠 New RoofQuote lead for ${companyName}!\nCustomer: ${details.customerName}\nPhone: ${details.phone || 'N/A'}\nAddress: ${details.address}\nEstimate: $${details.estimatedPriceMin.toLocaleString()}–$${details.estimatedPriceMax.toLocaleString()}\nLog in to dashboard to view.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: adminPhone,
    });
    return { success: true };
  } catch (e: unknown) {
    const err = e as Error;
    console.error('❌ SMS failed:', err.message);
    return { success: false, error: err.message };
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (!resend) return { success: false };
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your RoofQuote Password',
      html: `
        <div style="font-family: sans-serif; background: #f9fafb; padding: 40px 20px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <tr>
              <td style="padding: 32px 40px; background: #1e3a5f; text-align: center;">
                <h1 style="color: #fff; font-size: 22px; margin: 0; font-weight: 800;">RoofQuote</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-top: 0;">Reset your password</h2>
                <p style="color: #4b5563; font-size: 15px; line-height: 24px; margin-bottom: 24px;">
                  Click the button below to set a new password for your RoofQuote account.
                </p>
                <div style="text-align: center; margin-bottom: 32px;">
                  <a href="${resetUrl}" style="display: inline-block; background: #e85d04; color: #fff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px;">
                    Reset Password
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 13px;">If you didn't request this, just ignore this email.</p>
              </td>
            </tr>
          </table>
        </div>
      `,
    });
    return { success: true };
  } catch (e: unknown) {
    const err = e as Error;
    return { success: false, error: err.message };
  }
}
