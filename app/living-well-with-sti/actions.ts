"use server";

import { db } from "@/app/db";
import { newsletterSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_DEFAULT_FROM = "henry@news.lucids.top";

export type NewsletterSubscribeResult = {
  status: "success" | "error";
  code: "subscribed" | "already_subscribed" | "missing_email" | "invalid_email" | "server_error";
};

const EMAIL_REGEX = /^[\w.!#$%&'*+/=?^`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

async function sendWelcomeEmail(recipientEmail: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const fromEmail = process.env.RESEND_FROM ?? RESEND_DEFAULT_FROM;

  const subject = "Safhira: how to live well with sti";
  const plainBody = [
    "Hi there,",
    "",
    "Henry from Safhira here — thanks for subscribing to Living Well with STI.",
    "Here are a few foundations we’ll build on together:",
    "- Know your status: stay on top of routine check-ups and results.",
    "- Treatment first: follow your care plan and never skip your meds.",
    "- Protect partners: talk openly, use protection, and agree on testing routines.",
    "- Mind and body: care for your mental health, rest well, and stay active.",
    "",
    "We’ll drop practical guides, reminders, and inspiration straight to your inbox.",
    "You can unsubscribe anytime via the link in every email.",
    "",
    "With care,",
    "Henry",
    "Safhira — Living Well with STI",
  ].join("\n");

  const htmlBody = `
    <div style="background:#f8fafc;padding:32px 0;margin:0;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:600px;max-width:90%;border-collapse:separate;border-radius:16px;background:#ffffff;box-shadow:0 16px 40px rgba(15,23,42,0.08);overflow:hidden;">
              <tr>
                <td style="background:linear-gradient(135deg,#fb7185,#22d3ee);padding:32px;text-align:left;">
                  <p style="margin:0;color:#f8fafc;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;">Living Well with STI</p>
                  <h1 style="margin:12px 0 0;font-size:28px;line-height:1.3;color:#ffffff;font-weight:700;">
                    Henry from Safhira
                  </h1>
                  <p style="margin:12px 0 0;font-size:16px;color:rgba(248,250,252,0.88);line-height:1.6;">
                    Thank you for joining our community — here’s how we’ll help you feel grounded and confident.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 28px 20px;font-family:'Helvetica Neue',Arial,sans-serif;color:#0f172a;">
                  <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">Hi there,</p>
                  <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">
                    Henry from Safhira here — thanks for subscribing to Living Well with STI. We’re here to make every email feel like a trusted check-in, starting with a few essentials we’ll keep coming back to.
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;border-collapse:separate;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc;">
                    <tr>
                      <td style="padding:22px 24px;">
                        <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a;">Foundations for living well</h2>
                        <ul style="padding-left:20px;margin:0;font-size:15px;line-height:1.7;color:#1e293b;">
                          <li style="margin-bottom:10px;">Know your status: stay on top of routine check-ups and read your results with your care team.</li>
                          <li style="margin-bottom:10px;">Treatment first: follow your care plan, keep meds on schedule, and ask questions early.</li>
                          <li style="margin-bottom:10px;">Protect partners: talk openly, choose the right protection, and agree on testing routines.</li>
                          <li>Mind and body: nurture your mental health, rest well, move often, and lean on your support network.</li>
                        </ul>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">
                    Every week or two, we’ll drop practical guides, new resources, and a reminder to celebrate your progress. Your inbox is yours — unsubscribe anytime using the link in each message.
                  </p>
                  <p style="margin:0;font-size:16px;line-height:1.7;">With care,<br/><strong>Henry</strong><br/>Safhira — Living Well with STI</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px 28px;background:#f8fafc;font-size:12px;color:#64748b;text-align:center;line-height:1.6;">
                  You received this email because you subscribed to Living Well with STI. If this wasn’t you, simply ignore this message or unsubscribe below.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [recipientEmail],
      subject,
      text: plainBody,
      html: htmlBody,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Resend responded with status ${response.status}`;

    try {
      const errorBody = await response.json();
      if (errorBody && typeof errorBody === "object") {
        errorMessage = `${errorMessage}: ${JSON.stringify(errorBody)}`;
      }
    } catch {
      // Response body not JSON; ignore and use default error message.
    }

    throw new Error(errorMessage);
  }
}

export async function subscribeToNewsletter(email: string): Promise<NewsletterSubscribeResult> {
  const trimmedEmail = typeof email === "string" ? email.trim() : "";

  if (!trimmedEmail) {
    return {
      status: "error",
      code: "missing_email",
    };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      status: "error",
      code: "invalid_email",
    };
  }

  const normalizedEmail = trimmedEmail.toLowerCase();

  try {
    const inserted = await db
      .insert(newsletterSubscriptions)
      .values({ email: normalizedEmail })
      .onConflictDoNothing({ target: newsletterSubscriptions.email })
      .returning({ id: newsletterSubscriptions.id });

    if (inserted.length === 0) {
      return {
        status: "success",
        code: "already_subscribed",
      };
    }

    try {
      await sendWelcomeEmail(normalizedEmail);
    } catch (emailError) {
      console.error("Failed to send welcome email", emailError);

      try {
        await db.delete(newsletterSubscriptions).where(eq(newsletterSubscriptions.id, inserted[0].id));
      } catch (cleanupError) {
        console.error("Failed to roll back subscription after email error", cleanupError);
      }

      throw emailError;
    }

    return {
      status: "success",
      code: "subscribed",
    };
  } catch (error) {
    console.error("Failed to save newsletter subscription", error);
    return {
      status: "error",
      code: "server_error",
    };
  }
}
