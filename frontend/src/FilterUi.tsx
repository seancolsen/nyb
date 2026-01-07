import { Button } from "antd";
import StatisticUi from "./StatisticUi";
import type { Filter } from "./api_types/Filter";
import ComparisonUi from "./ComparisonUi";

interface FilterUiProps {
  filter: Filter;
  onChange: (filter: Filter) => void;
  onRemove: () => void;
}

function FilterUi({ filter, onChange, onRemove }: FilterUiProps) {
  const { statistic, comparison } = filter;
  return (
    <div>
      <StatisticUi
        statistic={statistic}
        onChange={(s) => onChange({ statistic: s, comparison })}
      />
      <ComparisonUi
        comparison={comparison}
        onChange={(c) => onChange({ statistic, comparison: c })}
      />
      <Button onClick={onRemove}>Remove</Button>
    </div>
  );
}

export default FilterUi;
