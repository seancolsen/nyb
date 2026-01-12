import { InputNumber } from "antd";

import type { AggregateFunction } from "@/api_types/AggregateFunction";
import type { Generation } from "@/api_types/Generation";
import type { Range } from "@/api_types/Range";
import type { Selection } from "@/api_types/Selection";
import { MAX_YEAR } from "@/constants";
import { exhaustive, match } from "@/utils";

import { AggregateFunctionUi } from "./AggregateFunctionUi";
import { GenerationUi } from "./GenerationUi";
import { RangeStrategyUi } from "./RangeStrategy";

import type { RangeStrategy } from "./RangeStrategy";

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
  rangeStrategy,
  aggregateFunction,
}: {
  rangeStrategy: RangeStrategy;
  aggregateFunction?: AggregateFunction;
}): Selection {
  if (rangeStrategy === "oneYear") {
    return { type: "oneYear", year: MAX_YEAR - 20 };
  }

  return {
    type: "manyYears",
    aggregateFunction: aggregateFunction ?? "ave",
    range: defaultRanges[rangeStrategy],
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
  const rangeStrategy: RangeStrategy = match(selection, "type", {
    oneYear: () => "oneYear" as const,
    manyYears: ({ range }) => range.type,
  });

  function handleNewRangeStrategy(newRangeStrategy: RangeStrategy) {
    const aggregateFunction =
      selection.type === "manyYears" ? selection.aggregateFunction : undefined;
    return onChange(
      buildSelection({
        rangeStrategy: newRangeStrategy,
        aggregateFunction,
      }),
    );
  }

  const rangeStrategyUi = (
    <RangeStrategyUi
      rangeStrategy={rangeStrategy}
      onChange={handleNewRangeStrategy}
    />
  );

  if (selection.type === "oneYear") {
    return (
      <>
        {rangeStrategyUi}
        <InputNumber
          value={selection.year}
          onChange={(year) =>
            year && onChange(buildSingleYearSelection({ year }))
          }
          controls={false}
          style={{ width: 60 }}
        />
      </>
    );
  }

  if (selection.type === "manyYears") {
    const { aggregateFunction, range } = selection;
    return (
      <>
        <AggregateFunctionUi
          aggregateFunction={aggregateFunction}
          onChange={(a: AggregateFunction) =>
            onChange(buildSelection({ rangeStrategy, aggregateFunction: a }))
          }
        />
        {rangeStrategyUi}
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
            <InputNumber
              value={range.previous}
              controls={false}
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
            <InputNumber
              value={range.min}
              controls={false}
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
            <InputNumber
              value={range.max}
              controls={false}
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
