import type { YearRange } from "@/api_types/YearRange";
import { PhrasingConst } from "@/components/general-purpose/PhrasingConst";
import { PhrasingNumberInput } from "@/components/general-purpose/PhrasingNumberInput";

interface Props {
  yearRange: YearRange;
  onChange: (yearRange: YearRange) => void;
}

export function YearRangeUi({ yearRange, onChange }: Props) {
  return (
    <>
      <PhrasingConst>between</PhrasingConst>
      <PhrasingNumberInput
        value={yearRange.min}
        onChange={(min) => min && onChange({ ...yearRange, min })}
      />
      <PhrasingConst>and</PhrasingConst>
      <PhrasingNumberInput
        value={yearRange.max}
        onChange={(max) => max && onChange({ ...yearRange, max })}
      />
    </>
  );
}
