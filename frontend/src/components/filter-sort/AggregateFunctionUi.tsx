import { Select } from "antd";

import type { AggregateFunction } from "@/api_types/AggregateFunction";
import { buildOptions } from "@/utils";

interface Props {
  aggregateFunction: AggregateFunction;
  onChange: (aggregateFunction: AggregateFunction) => void;
}

const options: Record<AggregateFunction, string> = {
  ave: "Average",
  min: "Lowest",
  max: "Highest",
  trend: "Linear regression slope of",
};

export function AggregateFunctionUi({ aggregateFunction, onChange }: Props) {
  return (
    <Select
      value={aggregateFunction}
      onChange={onChange}
      popupMatchSelectWidth={false}
      options={buildOptions(options)}
    />
  );
}
