import { useState } from "react";
import { Select, InputNumber } from "antd";
import type { Statistic } from "./api_types/Statistic";
import type { Measurement } from "./api_types/Measurement";
import type { Selection } from "./api_types/Selection";
import type { GenderSelection } from "./api_types/GenderSelection";
import type { AggregateFunction } from "./api_types/AggregateFunction";
import type { Range } from "./api_types/Range";
import type { Generation } from "./api_types/Generation";

interface StatisticUiProps {
  value: Statistic | null;
  onChange: (statistic: Statistic | null) => void;
}

function StatisticUi({ value, onChange: onChange }: StatisticUiProps) {
  const getMeasurementType = (m: Measurement | undefined): string => {
    if (!m) return "";
    if (typeof m === "string") {
      return m;
    }
    if ("popularity" in m) return "Popularity";
    if ("denseRank" in m) return "DenseRank";
    if ("count" in m) return "Count";
    return "";
  };

  const getGenderSelection = (m: Measurement | undefined): GenderSelection => {
    if (!m || typeof m === "string") return "both";
    if ("popularity" in m) return m.popularity;
    if ("denseRank" in m) return m.denseRank;
    if ("count" in m) return m.count;
    return "both";
  };

  const [measurementType, setMeasurementType] = useState<string>(
    getMeasurementType(value?.measurement),
  );

  const [genderSelection, setGenderSelection] = useState<GenderSelection>(
    getGenderSelection(value?.measurement),
  );

  const [selectionType, setSelectionType] = useState<string>(
    value?.selection
      ? "oneYear" in value.selection
        ? "OneYear"
        : "ManyYears"
      : "",
  );

  const [oneYear, setOneYear] = useState<number>(
    value?.selection && "oneYear" in value.selection
      ? value.selection.oneYear
      : 2000,
  );

  const [aggregateFunction, setAggregateFunction] = useState<AggregateFunction>(
    value?.selection && "manyYears" in value.selection
      ? value.selection.manyYears.aggregateFunction
      : "ave",
  );

  const getRangeType = (r: Range | undefined): string => {
    if (!r) return "";
    if (typeof r === "string") {
      return r;
    }
    if ("generation" in r) return "Generation";
    if ("previous" in r) return "Previous";
    if ("between" in r) return "Between";
    return "";
  };

  const [rangeType, setRangeType] = useState<string>(
    value?.selection && "manyYears" in value.selection
      ? getRangeType(value.selection.manyYears.range)
      : "",
  );

  const [generation, setGeneration] = useState<Generation>(
    value?.selection &&
      "manyYears" in value.selection &&
      value.selection.manyYears.range &&
      typeof value.selection.manyYears.range === "object" &&
      "generation" in value.selection.manyYears.range
      ? value.selection.manyYears.range.generation
      : "millennial",
  );

  const [previous, setPrevious] = useState<number>(
    value?.selection &&
      "manyYears" in value.selection &&
      value.selection.manyYears.range &&
      typeof value.selection.manyYears.range === "object" &&
      "previous" in value.selection.manyYears.range
      ? value.selection.manyYears.range.previous
      : 10,
  );

  const [betweenStart, setBetweenStart] = useState<number>(
    value?.selection &&
      "manyYears" in value.selection &&
      value.selection.manyYears.range &&
      typeof value.selection.manyYears.range === "object" &&
      "between" in value.selection.manyYears.range
      ? value.selection.manyYears.range.between[0]
      : 2000,
  );

  const [betweenEnd, setBetweenEnd] = useState<number>(
    value?.selection &&
      "manyYears" in value.selection &&
      value.selection.manyYears.range &&
      typeof value.selection.manyYears.range === "object" &&
      "between" in value.selection.manyYears.range
      ? value.selection.manyYears.range.between[1]
      : 2020,
  );

  const needsGenderSelection =
    measurementType === "Popularity" ||
    measurementType === "DenseRank" ||
    measurementType === "Count";

  const updateStatistic = (
    newMeasurementType: string,
    newGenderSelection: GenderSelection,
    newSelectionType: string,
    newOneYear: number,
    newAggregateFunction: AggregateFunction,
    newRangeType: string,
    newGeneration: Generation,
    newPrevious: number,
    newBetweenStart: number,
    newBetweenEnd: number,
  ) => {
    if (!newMeasurementType || !newSelectionType) {
      onChange(null);
      return;
    }

    let measurement: Measurement;
    if (newMeasurementType === "Popularity") {
      measurement = { popularity: newGenderSelection };
    } else if (newMeasurementType === "DenseRank") {
      measurement = { denseRank: newGenderSelection };
    } else if (newMeasurementType === "Count") {
      measurement = { count: newGenderSelection };
    } else if (newMeasurementType === "Masculinity") {
      measurement = "masculinity";
    } else if (newMeasurementType === "Femininity") {
      measurement = "femininity";
    } else {
      measurement = "genderNeutrality";
    }

    let selection: Selection;
    if (newSelectionType === "OneYear") {
      selection = { oneYear: newOneYear };
    } else {
      if (!newRangeType) {
        onChange(null);
        return;
      }

      let range: Range;
      if (newRangeType === "Generation") {
        range = { generation: newGeneration };
      } else if (newRangeType === "Previous") {
        range = { previous: newPrevious };
      } else if (newRangeType === "Between") {
        range = { between: [newBetweenStart, newBetweenEnd] };
      } else if (newRangeType === "AllLivingPeople") {
        range = "allLivingPeople";
      } else {
        range = "allYears";
      }

      selection = {
        manyYears: {
          aggregateFunction: newAggregateFunction,
          range: range,
        },
      };
    }

    onChange({ measurement, selection });
  };

  return (
    <div>
      <Select
        value={measurementType || undefined}
        placeholder="Select Measurement"
        onChange={(newType) => {
          setMeasurementType(newType);
          if (!newType) {
            onChange(null);
            return;
          }
          updateStatistic(
            newType,
            genderSelection,
            selectionType,
            oneYear,
            aggregateFunction,
            rangeType,
            generation,
            previous,
            betweenStart,
            betweenEnd,
          );
        }}
        style={{ width: 200 }}
      >
        <Select.Option value="Popularity">Popularity</Select.Option>
        <Select.Option value="DenseRank">DenseRank</Select.Option>
        <Select.Option value="Count">Count</Select.Option>
        <Select.Option value="Masculinity">Masculinity</Select.Option>
        <Select.Option value="Femininity">Femininity</Select.Option>
        <Select.Option value="GenderNeutrality">GenderNeutrality</Select.Option>
      </Select>

      {needsGenderSelection && (
        <Select
          value={genderSelection}
          onChange={(newGender) => {
            setGenderSelection(newGender as GenderSelection);
            updateStatistic(
              measurementType,
              newGender as GenderSelection,
              selectionType,
              oneYear,
              aggregateFunction,
              rangeType,
              generation,
              previous,
              betweenStart,
              betweenEnd,
            );
          }}
          style={{ width: 120 }}
        >
          <Select.Option value="f">F</Select.Option>
          <Select.Option value="m">M</Select.Option>
          <Select.Option value="both">Both</Select.Option>
        </Select>
      )}

      {measurementType && (
        <>
          <Select
            value={selectionType || undefined}
            placeholder="Select Selection"
            onChange={(newType) => {
              setSelectionType(newType);
              updateStatistic(
                measurementType,
                genderSelection,
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
            style={{ width: 200 }}
          >
            <Select.Option value="OneYear">OneYear</Select.Option>
            <Select.Option value="ManyYears">ManyYears</Select.Option>
          </Select>

          {selectionType === "OneYear" && (
            <InputNumber
              value={oneYear}
              onChange={(value) => {
                const newYear = value || 2000;
                setOneYear(newYear);
                updateStatistic(
                  measurementType,
                  genderSelection,
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
              style={{ width: 120 }}
            />
          )}

          {selectionType === "ManyYears" && (
            <>
              <Select
                value={aggregateFunction}
                onChange={(newAgg) => {
                  setAggregateFunction(newAgg as AggregateFunction);
                  updateStatistic(
                    measurementType,
                    genderSelection,
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
                style={{ width: 120 }}
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
                    measurementType,
                    genderSelection,
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
                style={{ width: 200 }}
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
                      measurementType,
                      genderSelection,
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
                  style={{ width: 150 }}
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
                  onChange={(value) => {
                    const newPrev = value || 10;
                    setPrevious(newPrev);
                    updateStatistic(
                      measurementType,
                      genderSelection,
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
                  style={{ width: 120 }}
                />
              )}

              {rangeType === "Between" && (
                <>
                  <InputNumber
                    value={betweenStart}
                    onChange={(value) => {
                      const newStart = value || 2000;
                      setBetweenStart(newStart);
                      updateStatistic(
                        measurementType,
                        genderSelection,
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
                    style={{ width: 120 }}
                  />
                  <InputNumber
                    value={betweenEnd}
                    onChange={(value) => {
                      const newEnd = value || 2020;
                      setBetweenEnd(newEnd);
                      updateStatistic(
                        measurementType,
                        genderSelection,
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
                    style={{ width: 120 }}
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
