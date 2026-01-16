import type { Comparison } from "@/api_types/Comparison";
import { InlineSelect } from "@/components/general-purpose/InlineSelect";

interface ComparisonTypeUiProps {
  type: Comparison["type"];
  onChange: (type: Comparison["type"]) => void;
}

const options: Record<Comparison["type"], string> = {
  gt: "Greater than",
  lt: "Less than",
};

export function ComparisonTypeUi({ type, onChange }: ComparisonTypeUiProps) {
  return (
    <InlineSelect value={type} onChange={onChange} options={options} />
  );
}
