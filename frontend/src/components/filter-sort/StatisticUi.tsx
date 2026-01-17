import type { Measurement } from "@/api_types/Measurement";
import type { Selection } from "@/api_types/Selection";
import type { Statistic } from "@/api_types/Statistic";

import { MeasurementUi } from "./MeasurementUi";
import { SelectionUi } from "./SelectionUi";

interface Props {
  statistic: Statistic;
  capitalized?: boolean;
  onChange: (statistic: Statistic) => void;
}

function buildStatistic(
  measurement: Measurement,
  selection: Selection,
): Statistic {
  return { measurement, selection };
}

export function StatisticUi({ statistic, capitalized, onChange }: Props) {
  return (
    <>
      <MeasurementUi
        measurement={statistic.measurement}
        capitalized={capitalized}
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
