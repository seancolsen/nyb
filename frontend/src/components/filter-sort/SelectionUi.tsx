import type { AggregateFunction } from "@/api_types/AggregateFunction";
import type { Generation } from "@/api_types/Generation";
import type { Range } from "@/api_types/Range";
import type { Selection } from "@/api_types/Selection";
import { NumberInput } from "@/components/general-purpose/NumberInput";
import { MAX_YEAR } from "@/constants";
import { exhaustive, match } from "@/utils";

import {
  AggregateStrategyUi,
  type AggregateStrategy,
} from "./AggregateStrategyUi";
import { GenerationUi } from "./GenerationUi";
import { RangeTypeUi } from "./RangeTypeUi";

interface Props {
  selection: Selection;
  onChange: (selection: Selection) => void;
}

const defaultRanges = {
  generation: { type: "generation", generation: "alpha" },
  previous: { type: "previous", previous: 50 },
  between: { type: "between", min: MAX_YEAR - 100, max: MAX_YEAR },
  allLivingPeople: { type: "allLivingPeople" },
  allYears: { type: "allYears" },
} as const satisfies Record<Range["type"], Range>;

function buildSelection({
  rangeType,
  aggregateStrategy,
}: {
  rangeType: Range["type"];
  aggregateStrategy: AggregateStrategy;
}): Selection {
  if (aggregateStrategy === "inYear") {
    return { type: "oneYear", year: MAX_YEAR - 20 };
  }

  return {
    type: "manyYears",
    aggregateFunction: aggregateStrategy,
    range: defaultRanges[rangeType],
  };
}

function buildSingleYearSelection({ year }: { year: number }): Selection {
  return { type: "oneYear", year };
}

function buildGenerationalSelection({
  generation,
  aggregateFunction,
}: {
  generation: Generation;
  aggregateFunction: AggregateFunction;
}): Selection {
  return {
    type: "manyYears",
    aggregateFunction,
    range: { type: "generation", generation },
  };
}

function buildRelativeSelection({
  previous,
  aggregateFunction,
}: {
  previous: number;
  aggregateFunction: AggregateFunction;
}): Selection {
  return {
    type: "manyYears",
    aggregateFunction,
    range: { type: "previous", previous },
  };
}

function buildBetweenSelection({
  min,
  max,
  aggregateFunction,
}: {
  min: number;
  max: number;
  aggregateFunction: AggregateFunction;
}): Selection {
  return {
    type: "manyYears",
    aggregateFunction,
    range: { type: "between", min, max },
  };
}

export function SelectionUi({ selection, onChange }: Props) {
  const aggregateStrategy: AggregateStrategy = match(selection, "type", {
    oneYear: () => "inYear" as const,
    manyYears: ({ aggregateFunction }) => aggregateFunction,
  });

  const rangeTypeForUi: Exclude<Range["type"], "allLivingPeople"> =
    selection.type === "manyYears" && selection.range.type !== "allLivingPeople"
      ? selection.range.type
      : "allYears";

  function handleNewAggregateStrategy(newAggregateStrategy: AggregateStrategy) {
    const rangeType = rangeTypeForUi;
    return onChange(
      buildSelection({
        rangeType,
        aggregateStrategy: newAggregateStrategy,
      }),
    );
  }

  const aggregateStrategyUi = (
    <AggregateStrategyUi
      aggregateStrategy={aggregateStrategy}
      onChange={handleNewAggregateStrategy}
    />
  );

  if (selection.type === "oneYear") {
    return (
      <>
        {aggregateStrategyUi}
        <NumberInput
          value={selection.year}
          onChange={(year) =>
            year && onChange(buildSingleYearSelection({ year }))
          }
        />
      </>
    );
  }

  if (selection.type === "manyYears") {
    const { aggregateFunction, range } = selection;
    return (
      <>
        {aggregateStrategyUi}

        <RangeTypeUi
          rangeType={rangeTypeForUi}
          onChange={(r) =>
            onChange(buildSelection({ rangeType: r, aggregateStrategy }))
          }
        />

        {range.type === "generation" && (
          <GenerationUi
            generation={range.generation}
            onChange={(generation) =>
              onChange(
                buildGenerationalSelection({ generation, aggregateFunction }),
              )
            }
          />
        )}

        {range.type === "previous" && (
          <>
            <NumberInput
              value={range.previous}
              onChange={(previous) =>
                previous &&
                onChange(
                  buildRelativeSelection({ previous, aggregateFunction }),
                )
              }
            />
            <span>years</span>
          </>
        )}

        {range.type === "between" && (
          <>
            <NumberInput
              value={range.min}
              onChange={(min) =>
                min &&
                onChange(
                  buildBetweenSelection({
                    min,
                    max: range.max,
                    aggregateFunction,
                  }),
                )
              }
            />
            <span>and</span>
            <NumberInput
              value={range.max}
              onChange={(max) =>
                max &&
                onChange(
                  buildBetweenSelection({
                    min: range.min,
                    max,
                    aggregateFunction,
                  }),
                )
              }
            />
          </>
        )}
      </>
    );
  }

  return exhaustive(selection);
}
