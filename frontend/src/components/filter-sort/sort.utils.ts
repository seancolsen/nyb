import type { Sort } from "@/api_types";
import type { Measurement } from "@/api_types/Measurement";
import type { SortDirection } from "@/api_types/SortDirection";

import { getDefaultStatistic } from "./statistic.utils";

export function getDefaultSort(): Sort {
  return {
    statistic: getDefaultStatistic(),
    direction: "desc",
  };
}

const sortDirectionMap: Record<Measurement["type"], SortDirection> = {
  popularity: "desc",
  denseRank: "asc",
  count: "desc",
  masculinity: "desc",
  femininity: "desc",
  genderNeutrality: "desc",
};

export function getSortDirection(
  measurementType: Measurement["type"],
): SortDirection {
  return sortDirectionMap[measurementType];
}
