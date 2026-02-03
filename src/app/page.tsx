"use client";

import { useMemo, useState } from "react";
import ToolTabs, { ToolTab } from "./_components/ToolTabs";
import { ImageAnalysisPanel } from "./_components/ImageAnalysisPanel";
import SummaryCard from "./_components/SummaryCard";
import { MessageCircleMore, RotateCcw } from "lucide-react";

export default function AiToolsPage() {
  const tabs: ToolTab[] = useMemo(
    () => [
      { id: "image-analysis", label: "Image analysis" },
      { id: "ingredient", label: "Ingredient recognition", disabled: true },
      { id: "creator", label: "Image creator", disabled: true },
    ],
    [],
  );

  const [activeTab, setActiveTab] = useState<ToolTab["id"]>("image-analysis");
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>(
    "First, enter your image to recognize an ingredients.",
  );
  const [loading, setLoading] = useState(false);

  const onGenerate = async () => {
    if (!file) return;
    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setSummary(
        "✅ Uploaded successfully. (Mock) Ingredients: tomato, cheese, basil.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[980px] px-6 pt-10">
        <div className="mb-8">
          <h1 className="text-sm font-medium text-gray-700">AI tools</h1>
        </div>

        <div className="flex items-start justify-center">
          <div className="w-full max-w-[720px]">
            <ToolTabs
              tabs={tabs}
              activeId={activeTab}
              onChange={setActiveTab}
            />

            <div className="mt-8">
              {activeTab === "image-analysis" && (
                <ImageAnalysisPanel
                  file={file}
                  setFile={setFile}
                  loading={loading}
                  onGenerate={onGenerate}
                />
              )}

              <div className="mt-10">
                <SummaryCard
                  title="Here is the summary"
                  description={summary}
                />
              </div>
            </div>
          </div>

          <div className="ml-8 hidden md:block">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              aria-label="Refresh"
              onClick={() => {
                setFile(null);
                setSummary(
                  "First, enter your image to recognize an ingredients.",
                );
              }}
            >
              <RotateCcw />
            </button>
          </div>
        </div>

        <div className="fixed bottom-6 right-6">
          <button
            type="button"
            className="h-12 w-12 rounded-full bg-black text-white shadow-lg hover:opacity-90"
            aria-label="Chat"
          >
            <MessageCircleMore />
          </button>
        </div>
      </div>
    </div>
  );
}
