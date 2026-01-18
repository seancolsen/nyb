import type { Sort } from "@/api_types";

import { getDefaultStatistic } from "./statistic.utils";

export function getDefaultSort(): Sort {
  return {
    statistic: getDefaultStatistic(),
    direction: "desc",
  };
}
