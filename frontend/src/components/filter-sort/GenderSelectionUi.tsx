import type { GenderSelection } from "@/api_types/GenderSelection";
import { InlineSelect } from "@/components/general-purpose/InlineSelect";

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
    <InlineSelect
      options={options}
      value={genderSelection}
      onChange={onChange}
    />
  );
}
