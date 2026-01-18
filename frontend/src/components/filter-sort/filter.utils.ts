import type { Filter } from "@/api_types";
import type { Comparison } from "@/api_types/Comparison";
import type { Measurement } from "@/api_types/Measurement";
import type { SearchMethod } from "@/api_types/SearchMethod";
import type { Statistic } from "@/api_types/Statistic";
import { match } from "@/utils";

import { getDefaultComparison } from "./comparison.utils";
import { changeStatisticType, getDefaultStatistic } from "./statistic.utils";

export type FilterType = Measurement["type"] | "spelling";

export function buildNumericalFilter(
  statistic: Statistic,
  comparison: Comparison,
): Filter {
  return { type: "numerical", statistic, comparison };
}

export function buildTextFilter(
  query: string = "",
  method: SearchMethod = "contains",
): Filter {
  return { type: "textual", query, method };
}

export function getDefaultNumericalFilter(): Filter {
  return {
    type: "numerical",
    statistic: getDefaultStatistic(),
    comparison: { type: "gt", value: 0 },
  };
}

export function getFilterType(filter: Filter): FilterType {
  return match(filter, "type", {
    textual: () => "spelling" as const,
    numerical: (f) => f.statistic.measurement.type,
  });
}

export function changeFilterType(
  currentFilter: Filter,
  newType: FilterType,
): Filter {
  const currentType = getFilterType(currentFilter);
  if (newType === currentType) return currentFilter;
  if (newType === "spelling") return buildTextFilter();

  return match(currentFilter, "type", {
    numerical: ({ statistic }): Filter => {
      const comparison = getDefaultComparison(newType);
      const newStatistic = changeStatisticType(statistic, newType);
      return buildNumericalFilter(newStatistic, comparison);
    },

    textual: () => getDefaultNumericalFilter(),
  });
}
