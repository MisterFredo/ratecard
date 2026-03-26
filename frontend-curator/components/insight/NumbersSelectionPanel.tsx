"use client";

import SelectionPanelCore from "./SelectionPanelCore";
import NumbersSelectionRenderer from "./renderers/NumbersSelectionRenderer";
import BasicAnalysisRenderer from "./renderers/BasicAnalysisRenderer";

export default function NumbersSelectionPanel(props: any) {

  const { items, selectedIds, analysis, loading } = props;

  return (
    <SelectionPanelCore
      selectedCount={selectedIds.length}
      onGenerate={props.onGenerateInsight}
      onClose={props.onClose}
      loading={loading}

      labels={{
        generate: "Structurer les données",
        empty: "Sélectionne des chiffres",
      }}

      renderSelection={() => (
        <NumbersSelectionRenderer
          items={items}
          selectedIds={selectedIds}
        />
      )}

      renderAnalysis={() => (
        <BasicAnalysisRenderer
          analysis={analysis}
          loading={loading}
        />
      )}
    />
  );
}
