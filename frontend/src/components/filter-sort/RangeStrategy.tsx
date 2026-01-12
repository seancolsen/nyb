import { Select } from "antd";

import type { Range } from "@/api_types/Range";
import { buildOptions } from "@/utils";

export type RangeStrategy = Range["type"] | "oneYear";

interface Props {
  rangeStrategy: RangeStrategy;
  onChange: (rangeStrategy: RangeStrategy) => void;
}

const options: Record<Exclude<RangeStrategy, "allLivingPeople">, string> = {
  generation: "within generation",
  previous: "over the past",
  between: "between years",
  allYears: "since 1880",
  oneYear: "in year",
};

export function RangeStrategyUi({ rangeStrategy, onChange }: Props) {
  return (
    <Select
      value={rangeStrategy}
      onChange={onChange}
      popupMatchSelectWidth={false}
      options={buildOptions(options)}
    />
  );
}
