import type { Sort } from "@/api_types";
import { PhrasingContainer } from "@/components/general-purpose/PhrasingContainer";

import { getSortDirection } from "./sort.utils";
import { SortDirectionUi } from "./SortDirectionUi";
import { StatisticUi } from "./StatisticUi";

interface Props {
  sort: Sort;
  onChange: (sort: Sort) => void;
}

export function SortUi({ sort, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <PhrasingContainer>
          <StatisticUi
            statistic={sort.statistic}
            onChange={(statistic) => {
              const oldType = sort.statistic.measurement.type;
              const newType = statistic.measurement.type;
              const direction =
                newType === oldType
                  ? sort.direction
                  : getSortDirection(newType);
              return onChange({ statistic, direction });
            }}
          />
        </PhrasingContainer>
      </div>
      <div>
        <SortDirectionUi
          direction={sort.direction}
          onChange={(direction) =>
            onChange({ statistic: sort.statistic, direction })
          }
        />
      </div>
    </div>
  );
}
