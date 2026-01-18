import { PhrasingSelect } from "@/components/general-purpose/PhrasingSelect";
import { capitalizeValues } from "@/utils";

import { measurementTypeOptions } from "./measurement.utils";

import type { FilterType } from "./filter.utils";

const options: Record<FilterType, string> = {
  spelling: "Spelling",
  ...capitalizeValues(measurementTypeOptions),
};

export function FilterTypeUi({
  filterType,
  onChange,
}: {
  filterType: FilterType;
  onChange: (v: FilterType) => void;
}) {
  return (
    <PhrasingSelect value={filterType} onChange={onChange} options={options} />
  );
}
