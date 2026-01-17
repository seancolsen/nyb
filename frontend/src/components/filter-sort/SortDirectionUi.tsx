import type { SortDirection } from "@/api_types/SortDirection";
import { PhrasingSelect } from "@/components/general-purpose/PhrasingSelect";

interface Props {
  direction: SortDirection;
  onChange: (direction: SortDirection) => void;
}

const options: Record<SortDirection, string> = {
  asc: "Ascending",
  desc: "Descending",
};

export function SortDirectionUi({ direction, onChange }: Props) {
  return (
    <PhrasingSelect options={options} value={direction} onChange={onChange} />
  );
}
