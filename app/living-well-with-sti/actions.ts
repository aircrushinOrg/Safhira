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

  const subject = "Welcome to Living Well with STI";
  const plainBody = [
    "Hi there,",
    "",
    "Thanks for signing up to get tips on living well with an STI.",
    "We'll share practical guides, new resources, and reminders to help you stay informed.",
    "",
    "You can unsubscribe anytime via the link in our emails.",
    "",
    "Take good care,",
    "The Living Well with STI team",
  ].join("\n");

  const htmlBody = `
    <p>Hi there,</p>
    <p>Thanks for signing up to get tips on living well with an STI. We'll share practical guides, new resources, and reminders to help you stay informed.</p>
    <p>You can unsubscribe anytime via the link in our emails.</p>
    <p>Take good care,<br/>The Living Well with STI team</p>
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
