import type { Measurement } from "@/api_types/Measurement";
import type { Selection } from "@/api_types/Selection";
import type { Statistic } from "@/api_types/Statistic";
import { MAX_YEAR } from "@/constants";

import { changeMeasurementType } from "./measurement.utils";

export function buildStatistic(
  measurement: Measurement,
  selection: Selection,
): Statistic {
  return { measurement, selection };
}

export function getDefaultStatistic(): Statistic {
  return buildStatistic(
    { type: "popularity", genderSelection: "both" },
    { type: "oneYear", year: MAX_YEAR },
  );
}

export function changeStatisticType(
  statistic: Statistic,
  newMeasurementType: Measurement["type"],
): Statistic {
  const { measurement } = statistic;
  const newMeasurement = changeMeasurementType(measurement, newMeasurementType);
  return buildStatistic(newMeasurement, statistic.selection);
}
