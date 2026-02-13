"use client";

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pipeline } from "@huggingface/transformers";
import ChatWidget from "./_components/ChatWidget";
import ImageAnalysisTab from "./_components/ImageAnalysisTab";
import IngredientTab from "./_components/IngredientTab";
import ImageCreatorTab from "./_components/ImageCreatorTab";

const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;

export default function Home() {

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const captionerRef = useRef<any>(null);

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
        setResult(output[0].generated_text);
      }
    } catch {
      setResult("Error analyzing image.");
    } finally {
      setIsLoading(false);
    }
  };


  const [foodText, setFoodText] = useState("");
  const [ingLoading, setIngLoading] = useState(false);
  const [ingModelLoading, setIngModelLoading] = useState(false);
  const [ingResult, setIngResult] = useState<string | null>(null);
  const ingredientRef = useRef<any>(null);

const handleIngredientGenerate = async () => {
  if (!foodText.trim()) return;

  setIngLoading(true);
  setIngResult(null);

  try {
    if (!ingredientRef.current) {
      setIngModelLoading(true);

      ingredientRef.current = await pipeline(
        "text2text-generation",
        "Xenova/flan-t5-base"
      );

      setIngModelLoading(false);
    }

    const out = await ingredientRef.current(
      `Extract ingredients from this food description as a bullet list:\n${foodText}`
    );

    const text = Array.isArray(out)
      ? out[0]?.generated_text
      : out.generated_text;

    setIngResult(text || "No ingredients found.");
  } catch (e) {
    setIngResult("Error extracting ingredients.");
  } finally {
    setIngLoading(false);
  }
};


  const handleIngredientReset = () => {
    setFoodText("");
    setIngResult(null);
  };


  const [prompt, setPrompt] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createResultUrl, setCreateResultUrl] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!prompt.trim() || !HF_TOKEN) return;

    setCreateLoading(true);
    setCreateError(null);

    try {
      const res = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt }),
        },
      );

      const blob = await res.blob();
      setCreateResultUrl(URL.createObjectURL(blob));
    } catch {
      setCreateError("Image generation error.");
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
          <Tabs defaultValue="image-analysis">
            <TabsList className="mb-6 grid grid-cols-3">
              <TabsTrigger value="image-analysis">Image analysis</TabsTrigger>
              <TabsTrigger value="ingredient-recognition">
                Ingredient recognition
              </TabsTrigger>
              <TabsTrigger value="image-creator">Image creator</TabsTrigger>
            </TabsList>

            <TabsContent value="image-analysis">
              <ImageAnalysisTab
                selectedFile={selectedFile}
                imagePreview={imagePreview}
                isLoading={isLoading}
                isModelLoading={isModelLoading}
                result={result}
                onReset={handleReset}
                onFileChange={handleFileChange}
                onGenerate={handleGenerate}
              />
            </TabsContent>

            <TabsContent value="ingredient-recognition">
              <IngredientTab
                foodText={foodText}
                ingLoading={ingLoading}
                ingModelLoading={ingModelLoading}
                ingResult={ingResult}
                onChange={setFoodText}
                onReset={handleIngredientReset}
                onGenerate={handleIngredientGenerate}
              />
            </TabsContent>

            <TabsContent value="image-creator">
              <ImageCreatorTab
                prompt={prompt}
                createLoading={createLoading}
                createResultUrl={createResultUrl}
                createError={createError}
                onChange={setPrompt}
                onReset={handleCreateReset}
                onGenerate={handleCreate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}
