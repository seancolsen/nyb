import { InputNumber } from "antd";
import { ComparisonTypeUi } from "./ComparisonTypeUi";
import type { Comparison } from "@/api_types/Comparison";

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
      <InputNumber
        value={comparison.value}
        onChange={(value) => onChange(buildComparison(comparison.type, value))}
        style={{ width: 60 }}
        controls={false}
      />
    </>
  );
}
