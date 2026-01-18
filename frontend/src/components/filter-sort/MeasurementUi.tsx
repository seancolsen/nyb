import type { Measurement } from "@/api_types/Measurement";

import { GenderSelectionUi } from "./GenderSelectionUi";
import { getGenderSelection, buildMeasurement } from "./measurement.utils";
import { MeasurementTypeUi } from "./MeasurementTypeUi";

export function MeasurementUi({
  measurement,
  hasMeasurementType,
  onChange,
}: {
  measurement: Measurement;
  hasMeasurementType?: boolean;
  onChange: (measurement: Measurement) => void;
}) {
  const genderSelection = getGenderSelection(measurement);

  return (
    <>
      {(hasMeasurementType ?? true) && (
        <MeasurementTypeUi
          value={measurement.type}
          onChange={(type) => onChange(buildMeasurement(type, genderSelection))}
        />
      )}

      {genderSelection && (
        <GenderSelectionUi
          genderSelection={genderSelection}
          onChange={(genderSelection) =>
            onChange(buildMeasurement(measurement.type, genderSelection))
          }
        />
      )}
    </>
  );
}
