import { useState } from "react";
import { Select, InputNumber } from "antd";
import type { Statistic } from "./api_types/Statistic";
import type { Measurement } from "./api_types/Measurement";
import type { Selection } from "./api_types/Selection";
import type { AggregateFunction } from "./api_types/AggregateFunction";
import type { Range } from "./api_types/Range";
import type { Generation } from "./api_types/Generation";
import MeasurementUi from "./MeasurementUi";

interface StatisticUiProps {
  value: Statistic | null;
  onChange: (statistic: Statistic | null) => void;
}

function StatisticUi({ value, onChange: onChange }: StatisticUiProps) {
  const getMeasurementType = (m: Measurement | undefined): string => {
    if (!m) return "";
    if (m.type === "popularity") return "Popularity";
    if (m.type === "denseRank") return "DenseRank";
    if (m.type === "count") return "Count";
    if (m.type === "masculinity") return "masculinity";
    if (m.type === "femininity") return "femininity";
    if (m.type === "genderNeutrality") return "genderNeutrality";
    return "";
  };

  const [measurementType, setMeasurementType] = useState<string>(
    getMeasurementType(value?.measurement),
  );

  const [selectionType, setSelectionType] = useState<string>(
    value?.selection
      ? value.selection.type === "oneYear"
        ? "OneYear"
        : "ManyYears"
      : "",
  );

  const [oneYear, setOneYear] = useState<number>(
    value?.selection && value.selection.type === "oneYear"
      ? value.selection.year
      : 2000,
  );

  const [aggregateFunction, setAggregateFunction] = useState<AggregateFunction>(
    value?.selection && value.selection.type === "manyYears"
      ? value.selection.aggregateFunction
      : "ave",
  );

  const getRangeType = (r: Range | undefined): string => {
    if (!r) return "";
    if (r.type === "generation") return "Generation";
    if (r.type === "previous") return "Previous";
    if (r.type === "between") return "Between";
    if (r.type === "allLivingPeople") return "AllLivingPeople";
    if (r.type === "allYears") return "AllYears";
    return "";
  };

  const [rangeType, setRangeType] = useState<string>(
    value?.selection && value.selection.type === "manyYears"
      ? getRangeType(value.selection.range)
      : "",
  );

  const [generation, setGeneration] = useState<Generation>(
    value?.selection &&
      value.selection.type === "manyYears" &&
      value.selection.range.type === "generation"
      ? value.selection.range.generation
      : "millennial",
  );

  const [previous, setPrevious] = useState<number>(
    value?.selection &&
      value.selection.type === "manyYears" &&
      value.selection.range.type === "previous"
      ? value.selection.range.previous
      : 10,
  );

  const [betweenStart, setBetweenStart] = useState<number>(
    value?.selection &&
      value.selection.type === "manyYears" &&
      value.selection.range.type === "between"
      ? value.selection.range.min
      : 2000,
  );

  const [betweenEnd, setBetweenEnd] = useState<number>(
    value?.selection &&
      value.selection.type === "manyYears" &&
      value.selection.range.type === "between"
      ? value.selection.range.max
      : 2020,
  );

  const updateStatistic = (
    newMeasurement: Measurement | undefined,
    newSelectionType: string,
    newOneYear: number,
    newAggregateFunction: AggregateFunction,
    newRangeType: string,
    newGeneration: Generation,
    newPrevious: number,
    newBetweenStart: number,
    newBetweenEnd: number,
  ) => {
    if (!newMeasurement || !newSelectionType) {
      onChange(null);
      return;
    }

    const measurement = newMeasurement;

    let selection: Selection;
    if (newSelectionType === "OneYear") {
      selection = { type: "oneYear", year: newOneYear };
    } else {
      if (!newRangeType) {
        onChange(null);
        return;
      }

      let range: Range;
      if (newRangeType === "Generation") {
        range = { type: "generation", generation: newGeneration };
      } else if (newRangeType === "Previous") {
        range = { type: "previous", previous: newPrevious };
      } else if (newRangeType === "Between") {
        range = { type: "between", min: newBetweenStart, max: newBetweenEnd };
      } else if (newRangeType === "AllLivingPeople") {
        range = { type: "allLivingPeople" };
      } else {
        range = { type: "allYears" };
      }

      selection = {
        type: "manyYears",
        aggregateFunction: newAggregateFunction,
        range: range,
      };
    }

    onChange({ measurement, selection });
  };

  const handleMeasurementChange = (newMeasurement: Measurement | undefined) => {
    const newMeasurementType = getMeasurementType(newMeasurement);
    setMeasurementType(newMeasurementType);
    updateStatistic(
      newMeasurement,
      selectionType,
      oneYear,
      aggregateFunction,
      rangeType,
      generation,
      previous,
      betweenStart,
      betweenEnd,
    );
  };

  return (
    <div>
      <MeasurementUi
        value={value?.measurement}
        onChange={handleMeasurementChange}
      />

      {measurementType && (
        <>
          <Select
            value={selectionType || undefined}
            placeholder="Select Selection"
            onChange={(newType) => {
              setSelectionType(newType);
              updateStatistic(
                value?.measurement,
                newType,
                oneYear,
                aggregateFunction,
                rangeType,
                generation,
                previous,
                betweenStart,
                betweenEnd,
              );
            }}
            popupMatchSelectWidth={false}
          >
            <Select.Option value="OneYear">OneYear</Select.Option>
            <Select.Option value="ManyYears">ManyYears</Select.Option>
          </Select>

          {selectionType === "OneYear" && (
            <InputNumber
              value={oneYear}
              onChange={(yearValue) => {
                const newYear = yearValue || 2000;
                setOneYear(newYear);
                updateStatistic(
                  value?.measurement,
                  selectionType,
                  newYear,
                  aggregateFunction,
                  rangeType,
                  generation,
                  previous,
                  betweenStart,
                  betweenEnd,
                );
              }}
              controls={false}
              style={{ width: 60 }}
            />
          )}

          {selectionType === "ManyYears" && (
            <>
              <Select
                value={aggregateFunction}
                onChange={(newAgg) => {
                  setAggregateFunction(newAgg as AggregateFunction);
                  updateStatistic(
                    value?.measurement,
                    selectionType,
                    oneYear,
                    newAgg as AggregateFunction,
                    rangeType,
                    generation,
                    previous,
                    betweenStart,
                    betweenEnd,
                  );
                }}
                popupMatchSelectWidth={false}
              >
                <Select.Option value="ave">Ave</Select.Option>
                <Select.Option value="min">Min</Select.Option>
                <Select.Option value="max">Max</Select.Option>
                <Select.Option value="trend">Trend</Select.Option>
              </Select>

              <Select
                value={rangeType || undefined}
                placeholder="Select Range"
                onChange={(newRangeType) => {
                  setRangeType(newRangeType);
                  updateStatistic(
                    value?.measurement,
                    selectionType,
                    oneYear,
                    aggregateFunction,
                    newRangeType,
                    generation,
                    previous,
                    betweenStart,
                    betweenEnd,
                  );
                }}
                popupMatchSelectWidth={false}
              >
                <Select.Option value="Generation">Generation</Select.Option>
                <Select.Option value="Previous">Previous</Select.Option>
                <Select.Option value="Between">Between</Select.Option>
                <Select.Option value="AllLivingPeople">
                  AllLivingPeople
                </Select.Option>
                <Select.Option value="AllYears">AllYears</Select.Option>
              </Select>

              {rangeType === "Generation" && (
                <Select
                  value={generation}
                  onChange={(newGen) => {
                    setGeneration(newGen as Generation);
                    updateStatistic(
                      value?.measurement,
                      selectionType,
                      oneYear,
                      aggregateFunction,
                      rangeType,
                      newGen as Generation,
                      previous,
                      betweenStart,
                      betweenEnd,
                    );
                  }}
                  popupMatchSelectWidth={false}
                >
                  <Select.Option value="lost">Lost</Select.Option>
                  <Select.Option value="greatest">Greatest</Select.Option>
                  <Select.Option value="silent">Silent</Select.Option>
                  <Select.Option value="boomer">Boomer</Select.Option>
                  <Select.Option value="x">X</Select.Option>
                  <Select.Option value="millennial">Millennial</Select.Option>
                  <Select.Option value="z">Z</Select.Option>
                  <Select.Option value="alpha">Alpha</Select.Option>
                </Select>
              )}

              {rangeType === "Previous" && (
                <InputNumber
                  value={previous}
                  onChange={(prevValue) => {
                    const newPrev = prevValue || 10;
                    setPrevious(newPrev);
                    updateStatistic(
                      value?.measurement,
                      selectionType,
                      oneYear,
                      aggregateFunction,
                      rangeType,
                      generation,
                      newPrev,
                      betweenStart,
                      betweenEnd,
                    );
                  }}
                  controls={false}
                  style={{ width: 60 }}
                />
              )}

              {rangeType === "Between" && (
                <>
                  <InputNumber
                    value={betweenStart}
                    onChange={(startValue) => {
                      const newStart = startValue || 2000;
                      setBetweenStart(newStart);
                      updateStatistic(
                        value?.measurement,
                        selectionType,
                        oneYear,
                        aggregateFunction,
                        rangeType,
                        generation,
                        previous,
                        newStart,
                        betweenEnd,
                      );
                    }}
                    controls={false}
                    style={{ width: 60 }}
                  />
                  <InputNumber
                    value={betweenEnd}
                    onChange={(endValue) => {
                      const newEnd = endValue || 2020;
                      setBetweenEnd(newEnd);
                      updateStatistic(
                        value?.measurement,
                        selectionType,
                        oneYear,
                        aggregateFunction,
                        rangeType,
                        generation,
                        previous,
                        betweenStart,
                        newEnd,
                      );
                    }}
                    controls={false}
                    style={{ width: 60 }}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default StatisticUi;
