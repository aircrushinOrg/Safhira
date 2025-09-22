/**
 * Tone tuning API route providing AI-powered conversation response generation for relationship guidance.
 * This endpoint uses OpenAI to generate contextually appropriate responses with specific tones for sensitive conversations.
 * Features tone customization, conversation context awareness, and safety guidelines for relationship communication support.
 */
import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TONE_TEMPLATES: Record<string, string> = {
  supportive:
    "Supportive, caring, and non-judgmental. Validate feelings, show care, and use gentle language.",
  empathetic:
    "Empathetic and reflective. Acknowledge emotions, use active listening cues, and mirror concerns kindly.",
  reassuring:
    "Calm and reassuring. Reduce anxiety, emphasize safety and commitment, avoid alarmist wording.",
  "calm-direct":
    "Calm but direct. Communicate clearly and respectfully, set boundaries without blame or pressure.",
  appreciative:
    "Appreciative and warm. Express gratitude, highlight positives, and keep tone affectionate and kind.",
  collaborative:
    "Collaborative and solution-focused. Use ‘we’ language, propose small next steps, invite input kindly.",
};

function buildSystemPrompt(toneKey: string) {
  const style = TONE_TEMPLATES[toneKey] || TONE_TEMPLATES.supportive;
  return `You are a careful assistant that rewrites messages to improve tone for kind, respectful communication between romantic partners.

Style target: ${style}

Strict rules:
- Preserve the original intent and key facts; do not add new commitments.
- Keep length roughly similar (±20%).
- Use simple, clear language suitable for teens and young adults.
- Avoid medical/legal advice, judgmental wording, or manipulation.
- No emojis unless present in the original. No markdown. Output only the rewritten message.`;
}

export async function POST(req: Request) {
  try {
    const { text, tone } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const toneKey = typeof tone === "string" ? tone : "supportive";
    const system = buildSystemPrompt(toneKey);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const model = process.env.TUNE_MODEL_NAME || process.env.OPENAI_MODEL || "openrouter/sonoma-dusk-alpha";
    const baseURL = process.env.OPENAI_BASE_URL;
    const client = new OpenAI({ apiKey, baseURL });

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const completion = await client.chat.completions.create({
            model,
            temperature: 0.5,
            stream: true,
            messages: [
              { role: "system", content: system },
              {
                role: "user",
                content:
                  "Rewrite the following message to the requested tone. Keep meaning and facts.\n\n" +
                  `Tone: ${toneKey}\n` +
                  `Message: ${text}`,
              },
            ],
          });

          for await (const part of completion) {
            const delta = part.choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          }
          controller.close();
        } catch (e) {
          console.error("/api/tone-tune stream error", e);
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("/api/tone-tune error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
