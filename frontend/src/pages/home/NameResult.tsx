import { Link } from "react-router-dom";

import type { NameData } from "@/api_types";
import type { Measurement } from "@/api_types/Measurement";
import { NameHistoryChartMini } from "@/components/charts/NameHistoryChartMini";
import {
  formatMeasurementValue,
  measurementTypeOptions,
} from "@/components/filter-sort/measurement.utils";

export function NameResult({
  name,
  sortingMeasurementType,
}: {
  name: NameData;
  sortingMeasurementType?: Measurement["type"];
}) {
  return (
    <Link
      to={`/${name.name}`}
      className="
        grid grid-cols-subgrid col-span-full gap-x-2 items-center
        px-2 py-1 rounded-l
        hover:bg-violet-50
        group
      "
    >
      <NameHistoryChartMini shape={name.shape} />

      <span className="text-xl group-hover:underline">{name.name}</span>

      {sortingMeasurementType && (
        <div className="text-sm text-gray-400">
          <span className="hidden @md:inline">
            {measurementTypeOptions[sortingMeasurementType]}:{" "}
          </span>
          <span>
            {formatMeasurementValue(sortingMeasurementType, name.sortingValue)}
          </span>
        </div>
      )}
    </Link>
  );
}
