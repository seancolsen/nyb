import type { AggregateFunction } from "@/api_types/AggregateFunction";
import { InlineSelect } from "@/components/general-purpose/InlineSelect";

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
    <InlineSelect
      value={aggregateStrategy}
      onChange={onChange}
      options={options}
    />
  );
}
