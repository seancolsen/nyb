import type { Comparison } from "@/api_types/Comparison";
import { PhrasingNumberInput } from "@/components/general-purpose/PhrasingNumberInput";

import { ComparisonTypeUi } from "./ComparisonTypeUi";

interface Props {
  comparison: Comparison;
  onChange: (comparison: Comparison) => void;
}

function buildComparison(
  type: Comparison["type"],
  value: number | null,
): Comparison {
  return { type, value: value ?? 0 };
}

export function ComparisonUi({ comparison, onChange }: Props) {
  return (
    <>
      <ComparisonTypeUi
        type={comparison.type}
        onChange={(type) => onChange(buildComparison(type, comparison.value))}
      />
      <PhrasingNumberInput
        value={comparison.value}
        onChange={(value) => onChange(buildComparison(comparison.type, value))}
      />
    </>
  );
}
