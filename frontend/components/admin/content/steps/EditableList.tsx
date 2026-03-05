"use client";

type Props = {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
};

export default function EditableList({
  label,
  items,
  onChange,
  placeholder,
}: Props) {

  function updateItem(index: number, value: string) {
    const copy = [...items];
    copy[index] = value;
    onChange(copy);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, ""]);
  }

  return (
    <div className="space-y-2">

      <label className="block text-sm font-medium">
        {label}
      </label>

      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
            className="flex-1 border rounded px-2 py-1 text-sm"
            placeholder={placeholder}
          />
          <button
            onClick={() => removeItem(i)}
            className="text-red-500 text-sm"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={addItem}
        className="text-sm text-blue-600"
      >
        + Ajouter
      </button>

    </div>
  );
}
