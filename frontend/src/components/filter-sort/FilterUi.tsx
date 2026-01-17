import type { Filter } from "@/api_types/Filter";
import { Button } from "@/components/general-purpose/Button";
import { PhrasingContainer } from "@/components/general-purpose/PhrasingContainer";

import { ComparisonUi } from "./ComparisonUi";
import { StatisticUi } from "./StatisticUi";

interface FilterUiProps {
  filter: Filter;
  onChange: (filter: Filter) => void;
  onRemove: () => void;
}

export function FilterUi({ filter, onChange, onRemove }: FilterUiProps) {
  const { statistic, comparison } = filter;
  return (
    <li>
      <PhrasingContainer>
        <StatisticUi
          statistic={statistic}
          capitalized={true}
          onChange={(s) => onChange({ statistic: s, comparison })}
        />
      </PhrasingContainer>
      <div>
        <ComparisonUi
          comparison={comparison}
          onChange={(c) => onChange({ statistic, comparison: c })}
        />
      </div>
      <Button onClick={onRemove}>Remove</Button>
    </li>
  );
}
