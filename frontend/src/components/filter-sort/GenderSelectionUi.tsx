import type { GenderSelection } from "@/api_types/GenderSelection";
import { PhrasingSelect } from "@/components/general-purpose/PhrasingSelect";

interface GenderSelectionUiProps {
  genderSelection: GenderSelection;
  onChange: (genderSelection: GenderSelection) => void;
}

const options: Record<GenderSelection, string> = {
  f: "girls",
  m: "boys",
  both: "everyone",
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
