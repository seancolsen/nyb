import { Select } from "antd";

import type { Comparison } from "@/api_types/Comparison";
import { buildOptions } from "@/utils";

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
    <Select
      value={type}
      onChange={onChange}
      popupMatchSelectWidth={false}
      options={buildOptions(options)}
    />
  );
}
