import type { Range } from "@/api_types/Range";
import { InlineSelect } from "@/components/general-purpose/InlineSelect";

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
    <InlineSelect value={rangeType} onChange={onChange} options={options} />
  );
}
