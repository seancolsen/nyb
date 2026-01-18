import type { Measurement } from "@/api_types/Measurement";
import { PhrasingSelect } from "@/components/general-purpose/PhrasingSelect";

import { measurementTypeOptions } from "./measurement.utils";

interface MeasurementTypeUiProps {
  value: Measurement["type"];
  onChange: (v: Measurement["type"]) => void;
}

export function MeasurementTypeUi({ value, onChange }: MeasurementTypeUiProps) {
  return (
    <PhrasingSelect
      value={value}
      onChange={onChange}
      options={measurementTypeOptions}
    />
  );
}
