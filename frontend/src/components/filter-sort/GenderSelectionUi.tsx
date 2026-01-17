import type { GenderSelection } from "@/api_types/GenderSelection";
import { PhrasingSelect } from "@/components/general-purpose/PhrasingSelect";

interface GenderSelectionUiProps {
  genderSelection: GenderSelection;
  onChange: (genderSelection: GenderSelection) => void;
}

const options: Record<GenderSelection, string> = {
  f: "for girls",
  m: "for boys",
  both: "for everyone",
};

export function GenderSelectionUi({
  genderSelection,
  onChange,
}: GenderSelectionUiProps) {
  return (
    <PhrasingSelect
      options={options}
      value={genderSelection}
      onChange={onChange}
    />
  );
}
