import type { Statistic } from "@/api_types/Statistic";

import { MeasurementUi } from "./MeasurementUi";
import { SelectionUi } from "./SelectionUi";
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
          onChange(buildStatistic(measurement, statistic.selection))
        }
      />
      <SelectionUi
        selection={statistic.selection}
        onChange={(selection) =>
          onChange(buildStatistic(statistic.measurement, selection))
        }
      />
    </>
  );
}
