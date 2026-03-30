export default function Column({
  title,
  items,
  variant,
  isFoundation = false,
}: any) {

  const styles = {
    foundation: {
      container: "bg-gray-50 border-gray-200",
      badge: "bg-white border-gray-300 text-gray-700",
    },
    retail: {
      container: "bg-green-50 border-green-200",
      badge: "bg-white border-green-300 text-green-800",
    },
    media: {
      container: "bg-purple-50 border-purple-200",
      badge: "bg-white border-purple-300 text-purple-800",
    },
  };

  const s = styles[variant];

  return (
    <div
      className={`
        rounded-2xl border p-6
        ${s.container}
        ${isFoundation ? "max-w-4xl mx-auto" : ""}
      `}
    >
      {/* TITLE */}
      <h2 className="text-xs uppercase tracking-widest text-gray-400 text-center mb-6">
        {title}
      </h2>

      {/* ITEMS */}
      <div className="flex flex-wrap justify-center gap-3">
        {items.map((t: any) => (
          <div
            key={t.id_topic}
            className={`
              px-4 py-2 rounded-full text-sm font-medium
              border transition hover:scale-105
              ${s.badge}
            `}
          >
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
}
