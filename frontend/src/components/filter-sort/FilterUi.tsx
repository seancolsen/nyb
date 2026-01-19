import type { Filter } from "@/api_types/Filter";
import { Button } from "@/components/general-purpose/Button";
import { PhrasingContainer } from "@/components/general-purpose/PhrasingContainer";
import { TextInput } from "@/components/general-purpose/TextInput";
import { match } from "@/utils";

import { ComparisonUi } from "./ComparisonUi";
import {
  buildTextFilter,
  getFilterType,
  changeFilterType,
  buildNumericalFilter,
} from "./filter.utils";
import { FilterTypeUi } from "./FilterTypeUi";
import { SearchMethodUi } from "./SearchMethodUi";
import { StatisticUi } from "./StatisticUi";

export function FilterUi({
  filter,
  onChange,
  onRemove,
}: {
  filter: Filter;
  onChange: (filter: Filter) => void;
  onRemove: () => void;
}) {
  const filterTypeUi = (
    <FilterTypeUi
      filterType={getFilterType(filter)}
      onChange={(t) => onChange(changeFilterType(filter, t))}
    />
  );

  return (
    <li className="mb-4">
      <div className="grid grid-flow-col gap-2 justify-between">
        <div className="grid gap-2">
          {match(filter, "type", {
            textual: (textQuery) => (
              <PhrasingContainer>
                {filterTypeUi}
                <SearchMethodUi
                  searchMethod={textQuery.method}
                  onChange={(method) =>
                    onChange(buildTextFilter(textQuery.query, method))
                  }
                />
                <TextInput
                  value={textQuery.query}
                  onChange={(query) =>
                    onChange(buildTextFilter(query.trim(), textQuery.method))
                  }
                />
              </PhrasingContainer>
            ),
            numerical: (statisticFilter) => (
              <>
                <div>
                  <PhrasingContainer>
                    {filterTypeUi}
                    <StatisticUi
                      statistic={statisticFilter.statistic}
                      hasMeasurementType={false}
                      onChange={(statistic) =>
                        onChange(
                          buildNumericalFilter(
                            statistic,
                            statisticFilter.comparison,
                          ),
                        )
                      }
                    />
                  </PhrasingContainer>
                </div>
                <div>
                  <ComparisonUi
                    comparison={statisticFilter.comparison}
                    onChange={(comparison) =>
                      onChange(
                        buildNumericalFilter(
                          statisticFilter.statistic,
                          comparison,
                        ),
                      )
                    }
                  />
                </div>
              </>
            ),
          })}
        </div>
        <div>
          <Button onClick={onRemove}>Remove</Button>
        </div>
      </div>
    </li>
  );
}
