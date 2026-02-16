"use client";

import { Sparkles, RotateCw, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type Props = {
  // API endpoint-оо өөр болгох бол override хийж болно
  endpoint?: string; // default: "/api/image-generation"
};

export function ImageCreatorTab({ endpoint = "/api/image-generation" }: Props) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // objectURL leak-ээс сэргийлнэ
  useEffect(() => {
    return () => {
      if (generatedImage) URL.revokeObjectURL(generatedImage);
    };
  }, [generatedImage]);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    // өмнөх зургийн objectURL-ийг цэвэрлэх
    if (generatedImage) {
      URL.revokeObjectURL(generatedImage);
      setGeneratedImage(null);
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      // сервер алдаа (json) буцааж магадгүй
      const ct = res.headers.get("content-type") || "";
      if (!res.ok) {
        const msg = ct.includes("application/json")
          ? (await res.json())?.error
          : await res.text();
        throw new Error(msg || `Request failed (${res.status})`);
      }

      // image blob
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedImage(url);
    } catch (e: any) {
      console.error("Generation error:", e);
      setError(e?.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setPrompt("");
    setError(null);
    if (generatedImage) URL.revokeObjectURL(generatedImage);
    setGeneratedImage(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Food image creator</h2>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            aria-label="Reset"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          What food image do you want? Describe it briefly.
        </p>

        <div className="rounded-lg border border-gray-200 bg-white">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Хоолны тайлбар"
            className="h-[170px] w-full resize-none rounded-lg bg-transparent p-4 text-base outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex justify-end">
          <Button
            className="bg-zinc-800 hover:bg-zinc-700"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Result</h3>
        </div>

        {error ? (
          <p className="text-sm text-red-600 bg-muted p-4 rounded-lg">
            {error}
          </p>
        ) : generatedImage ? (
          <div className="bg-muted p-4 rounded-lg">
            <img
              src={generatedImage}
              alt="Generated"
              className="w-full rounded-lg"
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            First, enter your text to generate an image.
          </p>
        )}
      </div>
    </div>
  );
}
