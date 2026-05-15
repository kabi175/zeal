import { OpenAI } from "openai";
import { NextRequest } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are Zeal, an AI Wellness Companion for college students in India. You are:
- Warm, empathetic, and non-judgmental
- Non-clinical: never diagnose or prescribe
- Encouraging and strengths-based
- Calm, clear, and supportive

You can suggest:
- Breathing exercises (4-7-8, box breathing)
- Journaling prompts
- Healthy routines (sleep hygiene, movement, nutrition)
- Mindfulness techniques
- Academic stress management strategies

CRITICAL: If a student expresses thoughts of self-harm, suicide, severe depression, or immediate danger:
1. Acknowledge their feelings with deep empathy
2. Immediately encourage them to contact a human counsellor
3. Provide crisis resources: iCall: 9152987821, Vandrevala Foundation: 1860-2662-345
4. Provide Zeal 2 Up contact: zealcatalyst.zeca@gmail.com | +91 97902 05149
5. Do NOT attempt to handle crisis situations yourself

Keep responses conversational and supportive. 2-4 paragraphs max. Use plain text, no markdown headers.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      userId?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Keep last 20 messages to stay within context limits
    const recentMessages = messages.slice(-20);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...recentMessages,
      ],
      stream: true,
      max_tokens: 600,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
