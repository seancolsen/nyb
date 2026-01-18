import type { Filter } from "@/api_types/Filter";
import type { StatisticFilter } from "@/api_types/StatisticFilter";
import type { TextQuery } from "@/api_types/TextQuery";
import { Button } from "@/components/general-purpose/Button";
import { PhrasingConst } from "@/components/general-purpose/PhrasingConst";
import { PhrasingContainer } from "@/components/general-purpose/PhrasingContainer";
import { TextInput } from "@/components/general-purpose/TextInput";
import { match } from "@/utils";

import { ComparisonUi } from "./ComparisonUi";
import { SearchMethodUi } from "./SearchMethodUi";
import { StatisticUi } from "./StatisticUi";

function TextQueryUi({
  textQuery,
  onChange,
}: {
  textQuery: TextQuery;
  onChange: (textQuery: TextQuery) => void;
}) {
  return (
    <PhrasingContainer>
      <PhrasingConst>Spelling</PhrasingConst>
      <SearchMethodUi
        searchMethod={textQuery.method}
        onChange={(method) => onChange({ query: textQuery.query, method })}
      />
      <TextInput
        value={textQuery.query}
        onChange={(query) =>
          onChange({ query: query.trim(), method: textQuery.method })
        }
      />
    </PhrasingContainer>
  );
}

function StatisticFilterUi({
  statisticFilter,
  onChange,
}: {
  statisticFilter: StatisticFilter;
  onChange: (filter: StatisticFilter) => void;
}) {
  return (
    <>
      <PhrasingContainer>
        <StatisticUi
          statistic={statisticFilter.statistic}
          capitalized={true}
          onChange={(statistic) =>
            onChange({ statistic, comparison: statisticFilter.comparison })
          }
        />
      </PhrasingContainer>
      <div>
        <ComparisonUi
          comparison={statisticFilter.comparison}
          onChange={(comparison) =>
            onChange({ statistic: statisticFilter.statistic, comparison })
          }
        />
      </div>
    </>
  );
}

export function FilterUi({
  filter,
  onChange,
  onRemove,
}: {
  filter: Filter;
  onChange: (filter: Filter) => void;
  onRemove: () => void;
}) {
  return (
    <li>
      <div>
        {match(filter, "type", {
          textual: (textQuery) => (
            <TextQueryUi
              textQuery={textQuery}
              onChange={(q) => onChange({ type: "textual", ...q })}
            />
          ),
          numerical: (statisticFilter) => (
            <StatisticFilterUi
              statisticFilter={statisticFilter}
              onChange={(f) => onChange({ type: "numerical", ...f })}
            />
          ),
        })}
      </div>
      <div>
        <Button onClick={onRemove}>Remove</Button>
      </div>
    </li>
  );
}
