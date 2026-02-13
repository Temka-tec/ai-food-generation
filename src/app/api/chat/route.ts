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

if (task === "ingredients") {
  const text = body?.text;
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing 'text'" }, { status: 400 });
  }


  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 500 }
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

    

   
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: error?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
