import type { Sort } from "@/api_types";
import { PhrasingContainer } from "@/components/general-purpose/PhrasingContainer";

import { SortDirectionUi } from "./SortDirectionUi";
import { StatisticUi } from "./StatisticUi";

interface Props {
  sort: Sort;
  onChange: (sort: Sort) => void;
}

export function SortUi({ sort, onChange }: Props) {
  return (
    <PhrasingContainer>
      <SortDirectionUi
        direction={sort.direction}
        onChange={(direction) =>
          onChange({ statistic: sort.statistic, direction })
        }
      />
      <StatisticUi
        statistic={sort.statistic}
        onChange={(statistic) =>
          onChange({ statistic, direction: sort.direction })
        }
      />
    </PhrasingContainer>
  );
}
