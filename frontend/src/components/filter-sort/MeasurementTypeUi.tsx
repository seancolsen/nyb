import { Select } from "antd";
import { buildOptions } from "../../utils";
import type { Measurement } from "../../api_types/Measurement";

interface MeasurementTypeUiProps {
  value: Measurement["type"];
  onChange: (v: Measurement["type"]) => void;
}

const options: Record<Measurement["type"], string> = {
  popularity: "Popularity",
  count: "Count",
  denseRank: "Rank",
  femininity: "Femininity",
  masculinity: "Masculinity",
  genderNeutrality: "Gender Neutrality",
};

function MeasurementTypeUi({ value, onChange }: MeasurementTypeUiProps) {
  return (
    <Select
      value={value}
      onChange={onChange}
      popupMatchSelectWidth={false}
      options={buildOptions(options)}
    />
  );
}

export default MeasurementTypeUi;
