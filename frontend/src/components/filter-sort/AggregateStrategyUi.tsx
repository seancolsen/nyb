import type { AggregateFunction } from "@/api_types/AggregateFunction";
import { PhrasingSelect } from "@/components/general-purpose/PhrasingSelect";

export type AggregateStrategy = AggregateFunction | "inYear";

interface Props {
  aggregateStrategy: AggregateStrategy;
  onChange: (aggregateStrategy: AggregateStrategy) => void;
}

const options: Record<AggregateStrategy, string> = {
  inYear: "in the year",
  ave: "averaged",
  min: "at its lowest",
  max: "at its highest",
  trend: "linear trend slope",
};

export function AggregateStrategyUi({ aggregateStrategy, onChange }: Props) {
  return (
    <PhrasingSelect
      value={aggregateStrategy}
      onChange={onChange}
      options={options}
    />
  );
}
