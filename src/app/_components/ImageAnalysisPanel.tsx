import { useRef } from "react";

export const ImageAnalysisPanel = ({
  file,
  setFile,
  loading,
  onGenerate,
}: {
  file: File | null;
  setFile: (f: File | null) => void;
  loading: boolean;
  onGenerate: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="text-center">
      <h2 className="text-lg font-semibold text-gray-900">✨ Image analysis</h2>
      <p className="mt-2 text-sm text-gray-600">
        Upload a food photo, and AI will detect the ingredients.
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="flex w-full max-w-[520px] items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
              onClick={() => inputRef.current?.click()}
            >
              Choose File
            </button>

            <span className="text-xs text-gray-500">JPG , PNG</span>
          </div>

          <span className="max-w-[240px] truncate text-sm text-gray-600">
            {file ? file.name : ""}
          </span>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={!file || loading}
          className={[
            "h-10 rounded-md px-5 text-sm font-medium",
            !file || loading
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-600 text-white hover:bg-gray-700",
          ].join(" ")}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
    </div>
  );
};
