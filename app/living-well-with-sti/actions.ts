"use server";

import { db } from "@/app/db";
import { newsletterSubscriptions } from "@/db/schema";

export type NewsletterSubscribeResult = {
  status: "success" | "error";
  code: "subscribed" | "already_subscribed" | "missing_email" | "invalid_email" | "server_error";
};

const EMAIL_REGEX = /^[\w.!#$%&'*+/=?^`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

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
