import type { Measurement } from "@/api_types/Measurement";
import type { GenderSelection } from "@/api_types/GenderSelection";
import { GenderSelectionUi } from "./GenderSelectionUi";
import { MeasurementTypeUi } from "./MeasurementTypeUi";

interface MeasurementUiProps {
  measurement: Measurement;
  onChange: (measurement: Measurement) => void;
}

function getGenderSelection(m: Measurement): GenderSelection | undefined {
  return "genderSelection" in m ? m.genderSelection : undefined;
}

const genderSelectionPresence = {
  popularity: true,
  denseRank: true,
  count: true,
  masculinity: false,
  femininity: false,
  genderNeutrality: false,
} as const satisfies Record<Measurement["type"], boolean>;
type TrueKeys<T> = { [K in keyof T]: T[K] extends true ? K : never }[keyof T];
type MeasurementWithGenderSelection = TrueKeys<typeof genderSelectionPresence>;

function hasGenderSelection(
  type: Measurement["type"],
): type is MeasurementWithGenderSelection {
  return genderSelectionPresence[type];
}

function buildMeasurement(
  type: Measurement["type"],
  genderSelection?: GenderSelection,
): Measurement {
  return hasGenderSelection(type)
    ? { type, genderSelection: genderSelection ?? "both" }
    : { type };
}

export function MeasurementUi({ measurement, onChange }: MeasurementUiProps) {
  const genderSelection = getGenderSelection(measurement);

  return (
    <>
      <MeasurementTypeUi
        value={measurement.type}
        onChange={(type) => onChange(buildMeasurement(type, genderSelection))}
      />

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
