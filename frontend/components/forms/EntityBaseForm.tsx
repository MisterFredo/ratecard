"use client";

type Props = {
  values: {
    name: string;
    linkedinUrl?: string;
    websiteUrl?: string;
  };
  onChange: {
    setName: (v: string) => void;
    setLinkedinUrl?: (v: string) => void;
    setWebsiteUrl?: (v: string) => void;
  };
  labels?: {
    name?: string;
  };
};

export default function EntityBaseForm({
  values,
  onChange,
  labels,
}: Props) {
  return (
    <div className="space-y-4 max-w-2xl">
      {/* NAME */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {labels?.name || "Nom"} *
        </label>
        <input
          className="border p-2 w-full rounded"
          value={values.name}
          onChange={(e) => onChange.setName(e.target.value)}
          placeholder="Ex : Google, Bespoke, Criteo"
        />
      </div>

      {/* LINKEDIN */}
      {onChange.setLinkedinUrl && (
        <div>
          <label className="block text-sm font-medium mb-1">
            URL LinkedIn
          </label>
          <input
            className="border p-2 w-full rounded"
            value={values.linkedinUrl || ""}
            onChange={(e) =>
              onChange.setLinkedinUrl?.(e.target.value)
            }
            placeholder="https://www.linkedin.com/company/..."
          />
        </div>
      )}

      {/* WEBSITE */}
      {onChange.setWebsiteUrl && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Site web
          </label>
          <input
            className="border p-2 w-full rounded"
            value={values.websiteUrl || ""}
            onChange={(e) =>
              onChange.setWebsiteUrl?.(e.target.value)
            }
            placeholder="https://www.exemple.com"
          />
        </div>
      )}
    </div>
  );
}

