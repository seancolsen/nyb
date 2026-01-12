import { Select } from "antd";

import type { AggregateFunction } from "@/api_types/AggregateFunction";
import { buildOptions } from "@/utils";

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
    <Select
      value={aggregateStrategy}
      onChange={onChange}
      popupMatchSelectWidth={false}
      options={buildOptions(options)}
    />
  );
}
