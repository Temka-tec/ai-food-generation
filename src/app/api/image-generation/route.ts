export async function POST(req: Request) {
  const { prompt } = await req.json();

  const encodePrompt = encodeURIComponent(prompt.trim());

  const imageUrl = `https://image.pollinations.ai/prompt/${encodePrompt}`;

  const imageRes = await fetch(imageUrl);

  if (!imageRes.ok) {
    return new Response("Failed to generate image", { status: 500 });
  }

  return new Response(imageRes.body, {
    headers: { "Content-Type": "image/png" },
  });
}
