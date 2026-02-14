import type { Statistic } from "@/api_types/Statistic";

import { MeasurementUi } from "./MeasurementUi";
import { YearRangeUi } from "./YearRangeUi";
import { buildStatistic } from "./statistic.utils";

export function StatisticUi({
  statistic,
  hasMeasurementType,
  onChange,
}: {
  statistic: Statistic;
  hasMeasurementType?: boolean;
  onChange: (statistic: Statistic) => void;
}) {
  return (
    <>
      <MeasurementUi
        measurement={statistic.measurement}
        hasMeasurementType={hasMeasurementType}
        onChange={(measurement) =>
          onChange(buildStatistic(measurement, statistic.yearRange))
        }
      />
      <YearRangeUi
        yearRange={statistic.yearRange}
        onChange={(yearRange) =>
          onChange(buildStatistic(statistic.measurement, yearRange))
        }
      />
    </>
  );
}
