"use client";

import { MessageCircleMore, Trash } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type Tab = "image" | "ingredient" | "creator";

export default function Page() {
  const tabs = useMemo(
    () => [
      { id: "image" as const, label: "Image analysis" },
      { id: "ingredient" as const, label: "Ingredient recognition" },
      { id: "creator" as const, label: "Image creator" },
    ],
    [],
  );

  const [tab, setTab] = useState<Tab>("image");

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [ingredientText, setIngredientText] = useState("");
  const [creatorText, setCreatorText] = useState("");

  const clearImage = () => {
    setImageFile(null);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const resetAll = () => {
    clearImage();
    setIngredientText("");
    setCreatorText("");
  };

  const onPickFile = (f: File | null) => {
    if (!f) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageFile(f);
    setImageUrl(URL.createObjectURL(f));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full border-b border-gray-100">
        <div className="mx-auto w-full max-w-[1200px] px-6 py-4">
          <h1 className="text-sm font-medium text-gray-800">AI tools</h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-6">
        <div className="flex justify-center pt-10">
          <div className="w-full max-w-[820px]">
            <div className="flex justify-center">
              <div className="inline-flex rounded-full bg-gray-100 p-1">
                {tabs.map((t) => {
                  const active = t.id === tab;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={[
                        "px-5 py-2 text-sm rounded-full transition",
                        active
                          ? "bg-white shadow-sm text-gray-900"
                          : "text-gray-400 hover:text-gray-700",
                      ].join(" ")}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-10 flex items-start justify-between gap-10">
              <div className="flex-1">
                {tab === "image" && (
                  <div>
                    <Header
                      title="Image analysis"
                      subtitle="Upload a food photo, and AI will detect the ingredients."
                    />

                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-[18px] font-semibold text-gray-900">
                            Choose File
                          </span>
                          <span className="text-sm text-gray-400">
                            JPG , PNG
                          </span>
                        </div>

                        {imageFile && (
                          <p className="mt-2 text-sm text-gray-500">
                            {imageFile.name}
                          </p>
                        )}
                      </button>

                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          onPickFile(e.target.files?.[0] ?? null)
                        }
                      />

                      {imageUrl && (
                        <div className="mt-4">
                          <div className="relative inline-block rounded-xl border border-gray-200 bg-white p-1">
                            <img
                              src={imageUrl}
                              alt="preview"
                              className="h-[110px] w-[210px] rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              onClick={clearImage}
                              className="absolute bottom-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50"
                              aria-label="Remove image"
                              title="Remove"
                            >
                              <Trash />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          className={[
                            "h-11 rounded-md px-6 text-sm font-medium",
                            imageFile
                              ? "bg-black text-white"
                              : "bg-gray-300 text-white",
                          ].join(" ")}
                        >
                          Generate
                        </button>
                      </div>
                    </div>

                    <SectionCard
                      icon="📄"
                      title="Here is the summary"
                      className="mt-10"
                    >
                      <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
                        <p className="text-base text-gray-500">
                          First, enter your image to recognize an ingredients.
                        </p>
                      </div>
                    </SectionCard>
                  </div>
                )}

                {tab === "ingredient" && (
                  <div>
                    <Header
                      title="Ingredient recognition"
                      subtitle="Describe the food, and AI will detect the ingredients."
                    />

                    <div className="mt-5">
                      <textarea
                        value={ingredientText}
                        onChange={(e) => setIngredientText(e.target.value)}
                        placeholder="Орц тодорхойлох"
                        className="h-36 w-full resize-none rounded-md border border-gray-200 bg-white p-3 text-base outline-none focus:ring-2 focus:ring-gray-100"
                      />

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          className={[
                            "h-11 rounded-md px-6 text-sm font-medium text-white",
                            ingredientText.trim() ? "bg-black" : "bg-gray-300",
                          ].join(" ")}
                        >
                          Generate
                        </button>
                      </div>
                    </div>

                    <SectionCard
                      icon="📄"
                      title="Identified Ingredients"
                      className="mt-10"
                    >
                      <p className="text-base text-gray-500">
                        First, enter your text to recognize an ingredients.
                      </p>
                    </SectionCard>
                  </div>
                )}

                {tab === "creator" && (
                  <div>
                    <Header
                      title="Food image creator"
                      subtitle="What food image do you want? Describe it briefly."
                    />

                    <div className="mt-5">
                      <textarea
                        value={creatorText}
                        onChange={(e) => setCreatorText(e.target.value)}
                        placeholder="Хоолны тайлбар"
                        className="h-36 w-full resize-none rounded-md border border-gray-200 bg-white p-3 text-base outline-none focus:ring-2 focus:ring-gray-100"
                      />

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          className={[
                            "h-11 rounded-md px-6 text-sm font-medium text-white",
                            creatorText.trim() ? "bg-black" : "bg-gray-300",
                          ].join(" ")}
                        >
                          Generate
                        </button>
                      </div>
                    </div>

                    <SectionCard icon="🖼" title="Result" className="mt-10">
                      <p className="text-base text-gray-500">
                        First, enter your text to generate an image.
                      </p>
                    </SectionCard>
                  </div>
                )}
              </div>

              <div className="pt-12">
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  aria-label="Refresh"
                  title="Refresh"
                >
                  ↻
                </button>
              </div>
            </div>
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

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-xl">✨</span>
        <h2 className="text-3xl font-semibold text-gray-900">{title}</h2>
      </div>
      <p className="mt-3 text-lg text-gray-500">{subtitle}</p>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  className,
  children,
}: {
  icon: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
