import { Select } from "antd";

import type { Range } from "@/api_types/Range";
import { buildOptions } from "@/utils";

interface Props {
  rangeType: Range["type"];
  onChange: (rangeType: Range["type"]) => void;
}

const options: Record<Exclude<Range["type"], "allLivingPeople">, string> = {
  generation: "within generation",
  previous: "over the past",
  between: "between years",
  allYears: "since 1880",
};

export function RangeTypeUi({ rangeType, onChange }: Props) {
  return (
    <Select
      value={rangeType}
      onChange={onChange}
      popupMatchSelectWidth={false}
      options={buildOptions(options)}
    />
  );
}
