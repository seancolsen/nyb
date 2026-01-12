import { Select } from "antd";

import type { AggregateFunction } from "@/api_types/AggregateFunction";
import { buildOptions } from "@/utils";

interface Props {
  aggregateFunction: AggregateFunction;
  onChange: (aggregateFunction: AggregateFunction) => void;
}

const options: Record<AggregateFunction, string> = {
  ave: "averaged",
  min: "at its lowest",
  max: "at its highest",
  trend: "linear trend slope",
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
