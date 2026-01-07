import { Select, InputNumber, Button } from "antd";
import StatisticUi from "./StatisticUi";
import type { Filter } from "./api_types/Filter";

interface FilterUiProps {
  value: Filter;
  onChange: (filter: Filter) => void;
  onRemove: () => void;
}

function FilterUi({
  value,
  onChange: onChange,
  onRemove: onRemove,
}: FilterUiProps) {
  const comparisonType = value.comparison.type;
  const comparisonValue = value.comparison.value;

  const handleComparisonTypeChange = (newType: "gt" | "lt") => {
    onChange({
      ...value,
      comparison:
        newType === "gt"
          ? { type: "gt", value: comparisonValue }
          : { type: "lt", value: comparisonValue },
    });
  };

  const handleComparisonValueChange = (newValue: number) => {
    onChange({
      ...value,
      comparison:
        comparisonType === "gt"
          ? { type: "gt", value: newValue }
          : { type: "lt", value: newValue },
    });
  };

  const handleStatisticChange = (statistic: typeof value.statistic | null) => {
    if (statistic) {
      onChange({
        ...value,
        statistic,
      });
    }
  };

  return (
    <div>
      <StatisticUi value={value.statistic} onChange={handleStatisticChange} />
      <Select
        value={comparisonType}
        onChange={(newType) =>
          handleComparisonTypeChange(newType as "gt" | "lt")
        }
        style={{ width: 150 }}
      >
        <Select.Option value="gt">Greater than</Select.Option>
        <Select.Option value="lt">Less than</Select.Option>
      </Select>
      <InputNumber
        value={comparisonValue}
        onChange={(value) => handleComparisonValueChange(value || 0)}
        style={{ width: 120 }}
      />
      <Button onClick={onRemove}>Remove</Button>
    </div>
  );
}

export default FilterUi;
