import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task = body?.task ?? "chat";

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    // ---------------- IMAGE GENERATION (Hugging Face) ----------------
    if (task === "image") {
      const prompt = (body?.prompt ?? "").trim();
      if (!prompt) {
        return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
      }

      const hfToken = process.env.HF_TOKEN;
      if (!hfToken) {
        return NextResponse.json(
          { error: "HF_TOKEN is not configured" },
          { status: 500 },
        );
      }

      const finalPrompt = `professional food photography of ${prompt}, realistic, high quality, studio lighting, 4k, detailed`;

      const res = await fetch(
        "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-2-1",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
            Accept: "image/*,application/json",
          },
          body: JSON.stringify({
            inputs: finalPrompt,
            options: { wait_for_model: true },
          }),
        },
      );

      const ct = res.headers.get("content-type") || "";

      if (!res.ok) {
        const errText = ct.includes("application/json")
          ? JSON.stringify(await res.json())
          : await res.text();
        return NextResponse.json(
          { error: `HF error ${res.status}: ${errText || "Empty error body"}` },
          { status: res.status },
        );
      }

      if (!ct.startsWith("image/")) {
        const text = ct.includes("application/json")
          ? JSON.stringify(await res.json())
          : await res.text();
        return NextResponse.json(
          { error: `HF returned non-image (${ct}): ${text || "Empty body"}` },
          { status: 500 },
        );
      }

      const arrayBuffer = await res.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        headers: { "Content-Type": ct },
      });
    }

    // ---------------- INGREDIENT EXTRACTION (OpenAI) ----------------
    if (task === "ingredients") {
      const text = body?.text;
      if (!text || typeof text !== "string") {
        return NextResponse.json({ error: "Missing 'text'" }, { status: 400 });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You extract ingredients from food descriptions.
Return ONLY a clean bullet list of ingredients.
No extra text, no explanations, no numbering.`,
          },
          {
            role: "user",
            content: `Food description:\n${text}\n\nExtract ingredients:`,
          },
        ],
        max_tokens: 500,
      });

      return NextResponse.json({
        message: response.choices[0]?.message?.content ?? "",
      });
    }

    // ---------------- GENERAL CHAT (OpenAI) ----------------
    const { messages } = body as { messages: Message[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing 'messages' array for chat task" },
        { status: 400 },
      );
    }

    const systemPrompt = `You are a helpful food assistant. Always reply in clean Markdown.

Choose the best format based on the user's question:
- If it is a "how-to" question: use numbered steps.
- If it is a comparison: use a short table or bullet comparison.
- If it is troubleshooting: use sections titled "Cause", "Solution", and "Checks".
- If it is a definition: give a one-line definition plus two short examples.

Constraints:
- Be concise and avoid long essays.
- Do not add unnecessary filler text.
- If the question is unclear, ask at most ONE short clarifying question at the end.
- You can answer in Mongolian if the user writes in Mongolian.`;

    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages,
      max_tokens: 1000,
    });

    return NextResponse.json({
      message: response.choices[0]?.message?.content ?? "",
    });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: error?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}
