"use client";

import { Sparkles, FileText, RotateCw, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  selectedFile: File | null;
  imagePreview: string | null;
  isLoading: boolean;
  isModelLoading: boolean;
  result: string | null;

  onReset: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
};

export default function ImageAnalysisTab({
  selectedFile,
  imagePreview,
  isLoading,
  isModelLoading,
  result,
  onReset,
  onFileChange,
  onGenerate,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Image analysis</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onReset}>
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
                  onChange={onFileChange}
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
            onClick={onGenerate}
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
    </div>
  );
}
