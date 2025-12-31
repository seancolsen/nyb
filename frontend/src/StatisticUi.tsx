import { useState } from "react";
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
    getMeasurementType(value?.measurement)
  );

  const [genderSelection, setGenderSelection] = useState<GenderSelection>(
    getGenderSelection(value?.measurement)
  );

  const [selectionType, setSelectionType] = useState<string>(
    value?.selection ? ("oneYear" in value.selection ? "OneYear" : "ManyYears") : ""
  );

  const [oneYear, setOneYear] = useState<number>(
    value?.selection && "oneYear" in value.selection ? value.selection.oneYear : 2000
  );

  const [aggregateFunction, setAggregateFunction] = useState<AggregateFunction>(
    value?.selection && "manyYears" in value.selection
      ? value.selection.manyYears.aggregateFunction
      : "ave"
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
      : ""
  );

  const [generation, setGeneration] = useState<Generation>(
    value?.selection && "manyYears" in value.selection && value.selection.manyYears.range && typeof value.selection.manyYears.range === "object" && "generation" in value.selection.manyYears.range
      ? value.selection.manyYears.range.generation
      : "millennial"
  );

  const [previous, setPrevious] = useState<number>(
    value?.selection && "manyYears" in value.selection && value.selection.manyYears.range && typeof value.selection.manyYears.range === "object" && "previous" in value.selection.manyYears.range
      ? value.selection.manyYears.range.previous
      : 10
  );

  const [betweenStart, setBetweenStart] = useState<number>(
    value?.selection && "manyYears" in value.selection && value.selection.manyYears.range && typeof value.selection.manyYears.range === "object" && "between" in value.selection.manyYears.range
      ? value.selection.manyYears.range.between[0]
      : 2000
  );

  const [betweenEnd, setBetweenEnd] = useState<number>(
    value?.selection && "manyYears" in value.selection && value.selection.manyYears.range && typeof value.selection.manyYears.range === "object" && "between" in value.selection.manyYears.range
      ? value.selection.manyYears.range.between[1]
      : 2020
  );

  const needsGenderSelection = measurementType === "Popularity" || measurementType === "DenseRank" || measurementType === "Count";

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
    newBetweenEnd: number
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
      <select
        value={measurementType}
        onChange={(e) => {
          const newType = e.target.value;
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
            betweenEnd
          );
        }}
      >
        <option value="">Select Measurement</option>
        <option value="Popularity">Popularity</option>
        <option value="DenseRank">DenseRank</option>
        <option value="Count">Count</option>
        <option value="Masculinity">Masculinity</option>
        <option value="Femininity">Femininity</option>
        <option value="GenderNeutrality">GenderNeutrality</option>
      </select>

      {needsGenderSelection && (
        <select
          value={genderSelection}
          onChange={(e) => {
            const newGender = e.target.value as GenderSelection;
            setGenderSelection(newGender);
            updateStatistic(
              measurementType,
              newGender,
              selectionType,
              oneYear,
              aggregateFunction,
              rangeType,
              generation,
              previous,
              betweenStart,
              betweenEnd
            );
          }}
        >
          <option value="f">F</option>
          <option value="m">M</option>
          <option value="both">Both</option>
        </select>
      )}

      {measurementType && (
        <>
          <select
            value={selectionType}
            onChange={(e) => {
              const newType = e.target.value;
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
                betweenEnd
              );
            }}
          >
            <option value="">Select Selection</option>
            <option value="OneYear">OneYear</option>
            <option value="ManyYears">ManyYears</option>
          </select>

          {selectionType === "OneYear" && (
            <input
              type="number"
              value={oneYear}
              onChange={(e) => {
                const newYear = parseInt(e.target.value) || 2000;
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
                  betweenEnd
                );
              }}
            />
          )}

          {selectionType === "ManyYears" && (
            <>
              <select
                value={aggregateFunction}
                onChange={(e) => {
                  const newAgg = e.target.value as AggregateFunction;
                  setAggregateFunction(newAgg);
                  updateStatistic(
                    measurementType,
                    genderSelection,
                    selectionType,
                    oneYear,
                    newAgg,
                    rangeType,
                    generation,
                    previous,
                    betweenStart,
                    betweenEnd
                  );
                }}
              >
                <option value="ave">Ave</option>
                <option value="min">Min</option>
                <option value="max">Max</option>
                <option value="trend">Trend</option>
              </select>

              <select
                value={rangeType}
                onChange={(e) => {
                  const newRangeType = e.target.value;
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
                    betweenEnd
                  );
                }}
              >
                <option value="">Select Range</option>
                <option value="Generation">Generation</option>
                <option value="Previous">Previous</option>
                <option value="Between">Between</option>
                <option value="AllLivingPeople">AllLivingPeople</option>
                <option value="AllYears">AllYears</option>
              </select>

              {rangeType === "Generation" && (
                <select
                  value={generation}
                  onChange={(e) => {
                    const newGen = e.target.value as Generation;
                    setGeneration(newGen);
                    updateStatistic(
                      measurementType,
                      genderSelection,
                      selectionType,
                      oneYear,
                      aggregateFunction,
                      rangeType,
                      newGen,
                      previous,
                      betweenStart,
                      betweenEnd
                    );
                  }}
                >
                  <option value="lost">Lost</option>
                  <option value="greatest">Greatest</option>
                  <option value="silent">Silent</option>
                  <option value="boomer">Boomer</option>
                  <option value="x">X</option>
                  <option value="millennial">Millennial</option>
                  <option value="z">Z</option>
                  <option value="alpha">Alpha</option>
                </select>
              )}

              {rangeType === "Previous" && (
                <input
                  type="number"
                  value={previous}
                  onChange={(e) => {
                    const newPrev = parseInt(e.target.value) || 10;
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
                      betweenEnd
                    );
                  }}
                />
              )}

              {rangeType === "Between" && (
                <>
                  <input
                    type="number"
                    value={betweenStart}
                    onChange={(e) => {
                      const newStart = parseInt(e.target.value) || 2000;
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
                        betweenEnd
                      );
                    }}
                  />
                  <input
                    type="number"
                    value={betweenEnd}
                    onChange={(e) => {
                      const newEnd = parseInt(e.target.value) || 2020;
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
                        newEnd
                      );
                    }}
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

