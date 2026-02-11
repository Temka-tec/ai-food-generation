"use client";

import { useState, useRef } from "react";
import {
  Sparkles,
  FileText,
  RotateCw,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pipeline } from "@huggingface/transformers";
import ChatWidget from "./_components/ChatWidget";

const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const captionerRef = useRef<any>(null);

  const [foodText, setFoodText] = useState("");
  const [ingLoading, setIngLoading] = useState(false);
  const [ingModelLoading, setIngModelLoading] = useState(false);
  const [ingResult, setIngResult] = useState<string | null>(null);

  const ingredientRef = useRef<any>(null);

  const [prompt, setPrompt] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createResultUrl, setCreateResultUrl] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setSelectedFile(f);
    setResult(null);

    const dataUrl = await fileToDataUrl(f);
    setImagePreview(dataUrl);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setResult(null);

    setFoodText("");
    setIngResult(null);

    setPrompt("");
    setCreateResultUrl(null);
    setCreateError(null);
  };

  const handleGenerate = async () => {
    if (!imagePreview) return;

    setIsLoading(true);
    try {
      if (!captionerRef.current) {
        setIsModelLoading(true);
        captionerRef.current = await pipeline(
          "image-to-text",
          "Xenova/vit-gpt2-image-captioning",
        );
        setIsModelLoading(false);
      }

      const output = await captionerRef.current(imagePreview);

      if (Array.isArray(output) && output.length > 0) {
        const caption = (output[0] as { generated_text: string })
          .generated_text;
        setResult(caption);
      }
    } catch (error) {
      console.error("Error generating caption:", error);
      setResult("Error analyzing image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIngredientGenerate = async () => {
    if (!foodText.trim()) return;

    setIngLoading(true);
    setIngResult(null);

    try {
      if (!ingredientRef.current) {
        setIngModelLoading(true);
        ingredientRef.current = await pipeline(
          "text2text-generation",
          "Xenova/flan-t5-base",
        );
        setIngModelLoading(false);
      }

      const promptText =
        `Extract ingredients as a JSON array.\n` +
        `Only output JSON.\n` +
        `Text: "${foodText}"`;

      const out = await ingredientRef.current(promptText);

      const generated = Array.isArray(out)
        ? (out[0]?.generated_text ?? "")
        : ((out as { generated_text?: string }).generated_text ?? "");

      setIngResult(generated || "[]");
    } catch (error) {
      console.error("Ingredient error:", error);
      setIngResult("Error extracting ingredients. Please try again.");
    } finally {
      setIngLoading(false);
    }
  };

  const handleIngredientReset = () => {
    setFoodText("");
    setIngResult(null);
  };

  const handleCreate = async () => {
    if (!prompt.trim()) return;

    setCreateLoading(true);
    setCreateResultUrl(null);
    setCreateError(null);

    try {
      if (!HF_TOKEN) {
        setCreateError("Missing NEXT_PUBLIC_HF_TOKEN in .env.local");
        return;
      }

      const res = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
          }),
        },
      );

      if (!res.ok) {
        const text = await res.text();
        setCreateError(`HF error: ${res.status} ${text}`);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setCreateResultUrl(url);
    } catch (e) {
      console.error(e);
      setCreateError("Error generating image. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateReset = () => {
    setPrompt("");
    setCreateResultUrl(null);
    setCreateError(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">AI tools</h1>
      </header>

      <main className="flex justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          <Tabs defaultValue="image-analysis" className="w-full">
            <TabsList className="mb-6 grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="image-analysis">Image analysis</TabsTrigger>
              <TabsTrigger value="ingredient-recognition">
                Ingredient recognition
              </TabsTrigger>
              <TabsTrigger value="image-creator">Image creator</TabsTrigger>
            </TabsList>

            <TabsContent value="image-analysis" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Image analysis</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleReset}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Upload a food photo, and AI will detect the ingredients.
                </p>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Label
                          htmlFor="file-upload"
                          className="cursor-pointer text-sm font-medium"
                        >
                          Choose File
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {selectedFile ? selectedFile.name : "JPG , PNG"}
                        </span>
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>

                      {imagePreview && (
                        <div className="mt-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-64 rounded-lg object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    className="bg-zinc-800 hover:bg-zinc-700"
                    onClick={handleGenerate}
                    disabled={!selectedFile || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isModelLoading ? "Loading model..." : "Analyzing..."}
                      </>
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Here is the summary</h3>
                </div>
                {result ? (
                  <p className="text-sm text-foreground bg-muted p-4 rounded-lg">
                    {result}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    First, enter your image to recognize an ingredients.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ingredient-recognition" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">
                      Ingredient recognition
                    </h2>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFoodText?.("");
                      setIngResult?.(null);
                    }}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Describe the food, and AI will detect the ingredients.
                </p>

                <div className="rounded-lg border border-gray-200 bg-white">
                  <textarea
                    value={foodText}
                    onChange={(e) => setFoodText(e.target.value)}
                    placeholder="Орц тодорхойлох"
                    className="h-[170px] w-full resize-none rounded-lg bg-transparent p-4 text-base outline-none placeholder:text-gray-400"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    className="bg-zinc-800 hover:bg-zinc-700"
                    onClick={handleGenerate}
                    disabled={!selectedFile || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isModelLoading ? "Loading model..." : "Analyzing..."}
                      </>
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">
                      Identified Ingredients
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    First, enter your text to recognize an ingredients.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image-creator" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">
                      Food image creator
                    </h2>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setPrompt?.("");
                      setCreateResultUrl?.(null);
                      setCreateError?.(null);
                    }}
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
                    disabled={!selectedFile || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isModelLoading ? "Loading model..." : "Analyzing..."}
                      </>
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Result</h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    First, enter your text to generate an image.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}
