import { Select } from "antd";

import type { Measurement } from "@/api_types/Measurement";
import { buildOptions } from "@/utils";

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

export function MeasurementTypeUi({ value, onChange }: MeasurementTypeUiProps) {
  return (
    <Select
      value={value}
      onChange={onChange}
      popupMatchSelectWidth={false}
      options={buildOptions(options)}
    />
  );
}
