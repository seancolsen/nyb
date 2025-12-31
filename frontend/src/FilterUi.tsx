import StatisticUi from "./StatisticUi";
import type { Filter } from "./api_types/Filter";

interface FilterUiProps {
  value: Filter;
  onChange: (filter: Filter) => void;
  onRemove: () => void;
}

function FilterUi({ value, onChange: onChange, onRemove: onRemove }: FilterUiProps) {
  const comparisonType = "gt" in value.comparison ? "gt" : "lt";
  const comparisonValue = "gt" in value.comparison ? value.comparison.gt : value.comparison.lt;

  const handleComparisonTypeChange = (newType: "gt" | "lt") => {
    onChange({
      ...value,
      comparison: newType === "gt" ? { gt: comparisonValue } : { lt: comparisonValue },
    });
  };

  const handleComparisonValueChange = (newValue: number) => {
    onChange({
      ...value,
      comparison: comparisonType === "gt" ? { gt: newValue } : { lt: newValue },
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
      <select
        value={comparisonType}
        onChange={(e) => handleComparisonTypeChange(e.target.value as "gt" | "lt")}
      >
        <option value="gt">Greater than</option>
        <option value="lt">Less than</option>
      </select>
      <input
        type="number"
        value={comparisonValue}
        onChange={(e) => handleComparisonValueChange(parseFloat(e.target.value) || 0)}
      />
      <button type="button" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

export default FilterUi;

