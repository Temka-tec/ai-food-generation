export type ToolTab = {
  id: "image-analysis" | "ingredient" | "creator";
  label: string;
  disabled?: boolean;
};

export default function ToolTabs({
  tabs,
  activeId,
  onChange,
}: {
  tabs: ToolTab[];
  activeId: ToolTab["id"];
  onChange: (id: ToolTab["id"]) => void;
}) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-full bg-gray-100 p-1">
        {tabs.map((t) => {
          const active = t.id === activeId;

          return (
            <button
              key={t.id}
              type="button"
              disabled={t.disabled}
              onClick={() => onChange(t.id)}
              className={[
                "px-4 py-2 text-sm rounded-full transition",
                active
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900",
                t.disabled
                  ? "opacity-50 cursor-not-allowed hover:text-gray-600"
                  : "",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
