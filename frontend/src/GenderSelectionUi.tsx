import { Select } from "antd";
import type { GenderSelection } from "./api_types/GenderSelection";

interface GenderSelectionUiProps {
  value: GenderSelection | undefined;
  onChange: (genderSelection: GenderSelection) => void;
}

function GenderSelectionUi({ value, onChange }: GenderSelectionUiProps) {
  return (
    <Select
      value={value || "both"}
      onChange={(newGender) => {
        const selectedGender = (newGender as GenderSelection) || "both";
        onChange(selectedGender);
      }}
      popupMatchSelectWidth={false}
    >
      <Select.Option value="f">F</Select.Option>
      <Select.Option value="m">M</Select.Option>
      <Select.Option value="both">Both</Select.Option>
    </Select>
  );
}

export default GenderSelectionUi;

