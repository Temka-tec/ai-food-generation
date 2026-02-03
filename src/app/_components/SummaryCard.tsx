export default function SummaryCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[620px] rounded-md border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <span className="text-lg">📄</span>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>

      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}
