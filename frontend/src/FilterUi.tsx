import StatisticUi from "./StatisticUi";
import type { Filter } from "./api_types/Filter";

interface FilterUiProps {
  value: Filter;
  onChange: (filter: Filter) => void;
  onRemove: () => void;
}

function FilterUi({ value, onChange: on_change, onRemove: on_remove }: FilterUiProps) {
  const comparison_type = "Gt" in value.comparison ? "Gt" : "Lt";
  const comparison_value = "Gt" in value.comparison ? value.comparison.Gt : value.comparison.Lt;

  const handle_comparison_type_change = (new_type: "Gt" | "Lt") => {
    on_change({
      ...value,
      comparison: new_type === "Gt" ? { Gt: comparison_value } : { Lt: comparison_value },
    });
  };

  const handle_comparison_value_change = (new_value: number) => {
    on_change({
      ...value,
      comparison: comparison_type === "Gt" ? { Gt: new_value } : { Lt: new_value },
    });
  };

  const handle_statistic_change = (statistic: typeof value.statistic | null) => {
    if (statistic) {
      on_change({
        ...value,
        statistic,
      });
    }
  };

  return (
    <div>
      <StatisticUi value={value.statistic} onChange={handle_statistic_change} />
      <select
        value={comparison_type}
        onChange={(e) => handle_comparison_type_change(e.target.value as "Gt" | "Lt")}
      >
        <option value="Gt">Greater than</option>
        <option value="Lt">Less than</option>
      </select>
      <input
        type="number"
        value={comparison_value}
        onChange={(e) => handle_comparison_value_change(parseFloat(e.target.value) || 0)}
      />
      <button type="button" onClick={on_remove}>
        Remove
      </button>
    </div>
  );
}

export default FilterUi;

