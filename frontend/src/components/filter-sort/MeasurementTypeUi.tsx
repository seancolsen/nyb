import type { Measurement } from "@/api_types/Measurement";
import { PhrasingSelect } from "@/components/general-purpose/PhrasingSelect";
import { capitalize } from "@/utils";

interface MeasurementTypeUiProps {
  value: Measurement["type"];
  capitalized?: boolean;
  onChange: (v: Measurement["type"]) => void;
}

const options: Record<Measurement["type"], string> = {
  popularity: "popularity",
  count: "count",
  denseRank: "rank",
  femininity: "femininity",
  masculinity: "masculinity",
  genderNeutrality: "gender Neutrality",
};

function getOptions(capitalized?: boolean) {
  if (!capitalized) return options;

  const capitalizedOptions = Object.fromEntries(
    Object.entries(options).map(([k, v]) => [k, capitalize(v)]),
  ) as Record<Measurement["type"], string>;
  return capitalizedOptions;
}

export function MeasurementTypeUi({
  value,
  capitalized,
  onChange,
}: MeasurementTypeUiProps) {
  return (
    <PhrasingSelect
      value={value}
      onChange={onChange}
      options={getOptions(capitalized)}
    />
  );
}
