import type { Measurement } from "@/api_types/Measurement";
import { InlineSelect } from "@/components/general-purpose/InlineSelect";

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
    <InlineSelect value={value} onChange={onChange} options={options} />
  );
}
