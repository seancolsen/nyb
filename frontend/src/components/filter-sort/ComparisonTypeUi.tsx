import { Select } from "antd";
import { buildOptions } from "../../utils";
import type { Comparison } from "../../api_types/Comparison";

interface ComparisonTypeUiProps {
  type: Comparison["type"];
  onChange: (type: Comparison["type"]) => void;
}

const options: Record<Comparison["type"], string> = {
  gt: "Greater than",
  lt: "Less than",
};

function ComparisonTypeUi({ type, onChange }: ComparisonTypeUiProps) {
  return (
    <Select
      value={type}
      onChange={onChange}
      popupMatchSelectWidth={false}
      options={buildOptions(options)}
    />
  );
}

export default ComparisonTypeUi;
