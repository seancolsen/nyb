import type { Statistic } from "./api_types/Statistic";
import type { Measurement } from "./api_types/Measurement";
import type { Selection } from "./api_types/Selection";
import MeasurementUi from "./MeasurementUi";
import SelectionUi from "./SelectionUi";

interface Props {
  statistic: Statistic;
  onChange: (statistic: Statistic) => void;
}

function buildStatistic(
  measurement: Measurement,
  selection: Selection,
): Statistic {
  return { measurement, selection };
}

function StatisticUi({ statistic, onChange }: Props) {
  return (
    <SelectionUi
      selection={statistic.selection}
      onChange={(selection) =>
        onChange(buildStatistic(statistic.measurement, selection))
      }
      measurementUi={
        <MeasurementUi
          measurement={statistic.measurement}
          onChange={(measurement) =>
            onChange(buildStatistic(measurement, statistic.selection))
          }
        />
      }
    />
  );
}

export default StatisticUi;
