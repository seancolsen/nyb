import type { Range } from "@/api_types/Range";
import { PhrasingSelect } from "@/components/general-purpose/PhrasingSelect";

type RangeType = Exclude<Range["type"], "allLivingPeople">;

interface Props {
  rangeType: RangeType;
  onChange: (rangeType: RangeType) => void;
}

const options: Record<RangeType, string> = {
  generation: "within generation",
  previous: "over the past",
  between: "between years",
  allYears: "since 1880",
};

export function RangeTypeUi({ rangeType, onChange }: Props) {
  return (
    <PhrasingSelect value={rangeType} onChange={onChange} options={options} />
  );
}
