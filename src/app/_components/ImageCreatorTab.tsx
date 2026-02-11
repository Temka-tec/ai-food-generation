"use client";

import { Sparkles, RotateCw, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  prompt: string;
  createLoading: boolean;
  createResultUrl: string | null;
  createError: string | null;

  onChange: (v: string) => void;
  onReset: () => void;
  onGenerate: () => void;
};

export default function ImageCreatorTab({
  prompt,
  createLoading,
  createResultUrl,
  createError,
  onChange,
  onReset,
  onGenerate,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Food image creator</h2>
          </div>

          <Button variant="ghost" size="icon" onClick={onReset}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          What food image do you want? Describe it briefly.
        </p>

        <div className="rounded-lg border border-gray-200 bg-white">
          <textarea
            value={prompt}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Хоолны тайлбар"
            className="h-[170px] w-full resize-none rounded-lg bg-transparent p-4 text-base outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex justify-end">
          <Button
            className="bg-zinc-800 hover:bg-zinc-700"
            onClick={onGenerate}
            disabled={!prompt.trim() || createLoading}
          >
            {createLoading ? (
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

        {createError ? (
          <p className="text-sm text-red-600 bg-muted p-4 rounded-lg">
            {createError}
          </p>
        ) : createResultUrl ? (
          <div className="bg-muted p-4 rounded-lg">
            <img src={createResultUrl} alt="Generated" className="w-full rounded-lg" />
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
