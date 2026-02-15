import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task = body?.task ?? "chat";

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

      const finalPrompt = `professional food photography of ${prompt}, realistic, high quality, studio lighting, 4k`;

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
          { error: `HF error ${res.status}: ${errText}` },
          { status: 500 },
        );
      }

      const arrayBuffer = await res.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        headers: { "Content-Type": ct || "image/png" },
      });
    }

    if (task === "ingredients") {
      const text = body?.text;
      if (!text || typeof text !== "string") {
        return NextResponse.json({ error: "Missing 'text'" }, { status: 400 });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "GEMINI_API_KEY is not configured" },
          { status: 500 },
        );
      }

      const ai = new GoogleGenAI({ apiKey });

      const chat = ai.chats.create({
        model: "gemini-2.0-flash",
        history: [],
        config: {
          systemInstruction:
            "You extract ingredients from food descriptions. Return ONLY a clean bullet list of ingredients. No extra text.",
        },
      });

      const response = await chat.sendMessage({
        message: `Food description: ${text}\n\nExtract ingredients:`,
      });

      return NextResponse.json({ message: response.text ?? "" });
    }

    const { messages } = body as { messages: Message[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing 'messages' array for chat task" },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const history = messages.slice(0, -1).map((msg: Message) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      history,
      config: {
        systemInstruction:
          "You are a helpful assistant. Provide concise, helpful responses.",
      },
    });

    const response = await chat.sendMessage({
      message: lastMessage.content,
    });

    return NextResponse.json({ message: response.text ?? "" });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: error?.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}
