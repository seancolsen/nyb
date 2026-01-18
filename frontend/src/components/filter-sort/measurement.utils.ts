import type { GenderSelection } from "@/api_types/GenderSelection";
import type { Measurement } from "@/api_types/Measurement";

export const measurementTypeOptions: Record<Measurement["type"], string> = {
  popularity: "popularity",
  count: "count",
  denseRank: "rank",
  femininity: "femininity",
  masculinity: "masculinity",
  genderNeutrality: "gender neutrality",
};

export function getGenderSelection(
  m: Measurement,
): GenderSelection | undefined {
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

export function buildMeasurement(
  type: Measurement["type"],
  genderSelection?: GenderSelection,
): Measurement {
  return hasGenderSelection(type)
    ? { type, genderSelection: genderSelection ?? "both" }
    : { type };
}

export function changeMeasurementType(
  measurement: Measurement,
  newType: Measurement["type"],
): Measurement {
  return buildMeasurement(newType, getGenderSelection(measurement));
}
