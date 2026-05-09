"use client";

/* ========================================================= */

type Props = {
  loading: boolean;
  analysis: string;
};

/* ========================================================= */

export default function WorkspaceAnalysis({
  loading,
  analysis,
}: Props) {

  return (
    <div
      className="
        pt-4
        border-t
      "
    >

      {loading && (
        <div
          className="
            text-xs
            text-gray-400
          "
        >
          Génération en cours...
        </div>
      )}

      {!loading &&
        !analysis && (
          <div
            className="
              text-xs
              text-gray-400
            "
          >
            Lance une génération
          </div>
        )}

      {!loading &&
        analysis && (
          <div
            className="
              text-sm
              text-gray-800
              whitespace-pre-wrap
              leading-relaxed
            "
          >
            {analysis}
          </div>
        )}

    </div>
  );
}
