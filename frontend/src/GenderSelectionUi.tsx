import { Select } from "antd";
import type { GenderSelection } from "./api_types/GenderSelection";
import { buildOptions } from "./utils";

interface GenderSelectionUiProps {
  value: GenderSelection;
  onChange: (genderSelection: GenderSelection) => void;
}

const options: Record<GenderSelection, string> = {
  f: "For girls",
  m: "For boys",
  both: "For girls & boys",
};

function GenderSelectionUi({ value, onChange }: GenderSelectionUiProps) {
  return (
    <Select
      value={value}
      onChange={onChange}
      popupMatchSelectWidth={false}
      options={buildOptions(options)}
    />
  );
}

export default GenderSelectionUi;
