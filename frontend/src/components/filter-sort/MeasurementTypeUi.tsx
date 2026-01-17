import type { Measurement } from "@/api_types/Measurement";
import { PhrasingSelect } from "@/components/general-purpose/PhrasingSelect";

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
  return <PhrasingSelect value={value} onChange={onChange} options={options} />;
}
