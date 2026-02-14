import type { Measurement } from "@/api_types/Measurement";
import type { Statistic } from "@/api_types/Statistic";
import type { YearRange } from "@/api_types/YearRange";
import { MAX_YEAR } from "@/constants";

import { changeMeasurementType } from "./measurement.utils";

export function buildStatistic(
  measurement: Measurement,
  yearRange: YearRange,
): Statistic {
  return { measurement, yearRange };
}

export function getDefaultStatistic(): Statistic {
  return buildStatistic(
    { type: "popularity", genderSelection: "both" },
    { min: MAX_YEAR, max: MAX_YEAR },
  );
}

export function changeStatisticType(
  statistic: Statistic,
  newMeasurementType: Measurement["type"],
): Statistic {
  const { measurement } = statistic;
  const newMeasurement = changeMeasurementType(measurement, newMeasurementType);
  return buildStatistic(newMeasurement, statistic.yearRange);
}
