import { Select } from "antd";

import type { GenderSelection } from "@/api_types/GenderSelection";
import { buildOptions } from "@/utils";

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
    <Select
      value={genderSelection}
      onChange={onChange}
      popupMatchSelectWidth={false}
      options={buildOptions(options)}
    />
  );
}
