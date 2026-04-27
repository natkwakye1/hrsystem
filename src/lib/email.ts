import nodemailer from "nodemailer";

interface EmailOptions { to: string; subject: string; html: string; }

function getTransporter() {
  if (!process.env.EMAIL_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT ?? "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.log(`[EMAIL – no SMTP configured]\nTo: ${to}\nSubject: ${subject}`);
    return false;
  }
  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM ?? `"NeraAdmin" <noreply@neraadmin.com>`,
      to, subject, html,
    });
    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

export function credentialsEmailHTML(opts: {
  name: string; email: string; password: string; portal: string; loginUrl: string; companyName?: string;
}): string {
  const { name, email, password, portal, loginUrl, companyName } = opts;
  const brand = companyName || "NeraAdmin";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f7fe;margin:0;padding:0}
.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.hd{background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px 40px}
.hd h1{color:#fff;margin:0;font-size:22px;font-weight:700}
.hd p{color:rgba(255,255,255,.7);margin:4px 0 0;font-size:13px}
.bd{padding:32px 40px}
.card{background:#f8faff;border:1px solid #dbeafe;border-radius:10px;padding:20px 24px;margin:20px 0}
.row{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.row:last-child{margin-bottom:0}
.lbl{color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.val{color:#1e293b;font-size:14px;font-weight:600;font-family:monospace;background:#e0ecff;padding:3px 10px;border-radius:6px}
.btn{display:inline-block;background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:16px}
.ft{padding:20px 40px;background:#f8faff;border-top:1px solid #e2e8f0;text-align:center}
.ft p{color:#94a3b8;font-size:12px;margin:0}
</style></head><body>
<div class="wrap">
  <div class="hd"><h1>Welcome to ${brand}</h1><p>${portal} — Account Created</p></div>
  <div class="bd">
    <p style="color:#1e293b;font-size:15px;margin-bottom:8px">Hi <strong>${name}</strong>,</p>
    <p style="color:#64748b;font-size:14px;line-height:1.7;margin-bottom:4px">Your ${portal} account at <strong>${brand}</strong> is ready. Use these credentials to sign in:</p>
    <div class="card">
      <div class="row"><span class="lbl">Email</span><span class="val">${email}</span></div>
      <div class="row"><span class="lbl">Password</span><span class="val">${password}</span></div>
    </div>
    <p style="color:#64748b;font-size:13px;">For security, please change your password after your first login.</p>
    <a href="${loginUrl}" class="btn">Sign in to ${brand} &rarr;</a>
  </div>
  <div class="ft"><p>Powered by NeraAdmin — Human Capital Management System</p><p style="margin-top:4px">Didn't request this? Contact your administrator.</p></div>
</div>
</body></html>`;
}
