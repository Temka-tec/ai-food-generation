"use client";

import { Sparkles, FileText, RotateCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  foodText: string;
  ingLoading: boolean;
  ingModelLoading: boolean;
  ingResult: string | null;

  onChange: (v: string) => void;
  onReset: () => void;
  onGenerate: () => void;
};

export default function IngredientTab({
  foodText,
  ingLoading,
  ingModelLoading,
  ingResult,
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
            <h2 className="text-xl font-semibold">Ingredient recognition</h2>
          </div>

          <Button variant="ghost" size="icon" onClick={onReset}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Describe the food, and AI will detect the ingredients.
        </p>

        <div className="rounded-lg border border-gray-200 bg-white">
          <textarea
            value={foodText}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Орц тодорхойлох"
            className="h-[170px] w-full resize-none rounded-lg bg-transparent p-4 text-base outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="flex justify-end">
          <Button
            className="bg-zinc-800 hover:bg-zinc-700"
            onClick={onGenerate}
            disabled={!foodText.trim() || ingLoading}
          >
            {ingLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {ingModelLoading ? "Loading model..." : "Generating..."}
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Identified Ingredients</h3>
        </div>

        {ingResult ? (
          <pre className="text-sm text-foreground bg-muted p-4 rounded-lg whitespace-pre-wrap">
            {ingResult}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">
            First, enter your text to recognize an ingredients.
          </p>
        )}
      </div>
    </div>
  );
}
