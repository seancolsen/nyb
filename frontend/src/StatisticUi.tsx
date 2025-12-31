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

function StatisticUi({ value, onChange: on_change }: StatisticUiProps) {
  const get_measurement_type = (m: Measurement | undefined): string => {
    if (!m) return "";
    if (typeof m === "string") {
      return m;
    }
    if ("Popularity" in m) return "Popularity";
    if ("DenseRank" in m) return "DenseRank";
    if ("Count" in m) return "Count";
    return "";
  };

  const get_gender_selection = (m: Measurement | undefined): GenderSelection => {
    if (!m || typeof m === "string") return "Both";
    if ("Popularity" in m) return m.Popularity;
    if ("DenseRank" in m) return m.DenseRank;
    if ("Count" in m) return m.Count;
    return "Both";
  };

  const [measurement_type, set_measurement_type] = useState<string>(
    get_measurement_type(value?.measurement)
  );

  const [gender_selection, set_gender_selection] = useState<GenderSelection>(
    get_gender_selection(value?.measurement)
  );

  const [selection_type, set_selection_type] = useState<string>(
    value?.selection ? ("OneYear" in value.selection ? "OneYear" : "ManyYears") : ""
  );

  const [one_year, set_one_year] = useState<number>(
    value?.selection && "OneYear" in value.selection ? value.selection.OneYear : 2000
  );

  const [aggregate_function, set_aggregate_function] = useState<AggregateFunction>(
    value?.selection && "ManyYears" in value.selection
      ? value.selection.ManyYears.aggregate_function
      : "Ave"
  );

  const get_range_type = (r: Range | undefined): string => {
    if (!r) return "";
    if (typeof r === "string") {
      return r;
    }
    if ("Generation" in r) return "Generation";
    if ("Previous" in r) return "Previous";
    if ("Between" in r) return "Between";
    return "";
  };

  const [range_type, set_range_type] = useState<string>(
    value?.selection && "ManyYears" in value.selection
      ? get_range_type(value.selection.ManyYears.range)
      : ""
  );

  const [generation, set_generation] = useState<Generation>(
    value?.selection && "ManyYears" in value.selection && value.selection.ManyYears.range && typeof value.selection.ManyYears.range === "object" && "Generation" in value.selection.ManyYears.range
      ? value.selection.ManyYears.range.Generation
      : "Millennial"
  );

  const [previous, set_previous] = useState<number>(
    value?.selection && "ManyYears" in value.selection && value.selection.ManyYears.range && typeof value.selection.ManyYears.range === "object" && "Previous" in value.selection.ManyYears.range
      ? value.selection.ManyYears.range.Previous
      : 10
  );

  const [between_start, set_between_start] = useState<number>(
    value?.selection && "ManyYears" in value.selection && value.selection.ManyYears.range && typeof value.selection.ManyYears.range === "object" && "Between" in value.selection.ManyYears.range
      ? value.selection.ManyYears.range.Between[0]
      : 2000
  );

  const [between_end, set_between_end] = useState<number>(
    value?.selection && "ManyYears" in value.selection && value.selection.ManyYears.range && typeof value.selection.ManyYears.range === "object" && "Between" in value.selection.ManyYears.range
      ? value.selection.ManyYears.range.Between[1]
      : 2020
  );

  const needs_gender_selection = measurement_type === "Popularity" || measurement_type === "DenseRank" || measurement_type === "Count";

  const update_statistic = (
    new_measurement_type: string,
    new_gender_selection: GenderSelection,
    new_selection_type: string,
    new_one_year: number,
    new_aggregate_function: AggregateFunction,
    new_range_type: string,
    new_generation: Generation,
    new_previous: number,
    new_between_start: number,
    new_between_end: number
  ) => {
    if (!new_measurement_type || !new_selection_type) {
      on_change(null);
      return;
    }

    let measurement: Measurement;
    if (new_measurement_type === "Popularity") {
      measurement = { Popularity: new_gender_selection };
    } else if (new_measurement_type === "DenseRank") {
      measurement = { DenseRank: new_gender_selection };
    } else if (new_measurement_type === "Count") {
      measurement = { Count: new_gender_selection };
    } else if (new_measurement_type === "Masculinity") {
      measurement = "Masculinity";
    } else if (new_measurement_type === "Femininity") {
      measurement = "Femininity";
    } else {
      measurement = "GenderNeutrality";
    }

    let selection: Selection;
    if (new_selection_type === "OneYear") {
      selection = { OneYear: new_one_year };
    } else {
      if (!new_range_type) {
        on_change(null);
        return;
      }

      let range: Range;
      if (new_range_type === "Generation") {
        range = { Generation: new_generation };
      } else if (new_range_type === "Previous") {
        range = { Previous: new_previous };
      } else if (new_range_type === "Between") {
        range = { Between: [new_between_start, new_between_end] };
      } else if (new_range_type === "AllLivingPeople") {
        range = "AllLivingPeople";
      } else {
        range = "AllYears";
      }

      selection = {
        ManyYears: {
          aggregate_function: new_aggregate_function,
          range: range,
        },
      };
    }

    on_change({ measurement, selection });
  };

  return (
    <div>
      <select
        value={measurement_type}
        onChange={(e) => {
          const new_type = e.target.value;
          set_measurement_type(new_type);
          if (!new_type) {
            on_change(null);
            return;
          }
          update_statistic(
            new_type,
            gender_selection,
            selection_type,
            one_year,
            aggregate_function,
            range_type,
            generation,
            previous,
            between_start,
            between_end
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

      {needs_gender_selection && (
        <select
          value={gender_selection}
          onChange={(e) => {
            const new_gender = e.target.value as GenderSelection;
            set_gender_selection(new_gender);
            update_statistic(
              measurement_type,
              new_gender,
              selection_type,
              one_year,
              aggregate_function,
              range_type,
              generation,
              previous,
              between_start,
              between_end
            );
          }}
        >
          <option value="F">F</option>
          <option value="M">M</option>
          <option value="Both">Both</option>
        </select>
      )}

      {measurement_type && (
        <>
          <select
            value={selection_type}
            onChange={(e) => {
              const new_type = e.target.value;
              set_selection_type(new_type);
              update_statistic(
                measurement_type,
                gender_selection,
                new_type,
                one_year,
                aggregate_function,
                range_type,
                generation,
                previous,
                between_start,
                between_end
              );
            }}
          >
            <option value="">Select Selection</option>
            <option value="OneYear">OneYear</option>
            <option value="ManyYears">ManyYears</option>
          </select>

          {selection_type === "OneYear" && (
            <input
              type="number"
              value={one_year}
              onChange={(e) => {
                const new_year = parseInt(e.target.value) || 2000;
                set_one_year(new_year);
                update_statistic(
                  measurement_type,
                  gender_selection,
                  selection_type,
                  new_year,
                  aggregate_function,
                  range_type,
                  generation,
                  previous,
                  between_start,
                  between_end
                );
              }}
            />
          )}

          {selection_type === "ManyYears" && (
            <>
              <select
                value={aggregate_function}
                onChange={(e) => {
                  const new_agg = e.target.value as AggregateFunction;
                  set_aggregate_function(new_agg);
                  update_statistic(
                    measurement_type,
                    gender_selection,
                    selection_type,
                    one_year,
                    new_agg,
                    range_type,
                    generation,
                    previous,
                    between_start,
                    between_end
                  );
                }}
              >
                <option value="Ave">Ave</option>
                <option value="Min">Min</option>
                <option value="Max">Max</option>
                <option value="Trend">Trend</option>
              </select>

              <select
                value={range_type}
                onChange={(e) => {
                  const new_range_type = e.target.value;
                  set_range_type(new_range_type);
                  update_statistic(
                    measurement_type,
                    gender_selection,
                    selection_type,
                    one_year,
                    aggregate_function,
                    new_range_type,
                    generation,
                    previous,
                    between_start,
                    between_end
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

              {range_type === "Generation" && (
                <select
                  value={generation}
                  onChange={(e) => {
                    const new_gen = e.target.value as Generation;
                    set_generation(new_gen);
                    update_statistic(
                      measurement_type,
                      gender_selection,
                      selection_type,
                      one_year,
                      aggregate_function,
                      range_type,
                      new_gen,
                      previous,
                      between_start,
                      between_end
                    );
                  }}
                >
                  <option value="Lost">Lost</option>
                  <option value="Greatest">Greatest</option>
                  <option value="Silent">Silent</option>
                  <option value="Boomer">Boomer</option>
                  <option value="X">X</option>
                  <option value="Millennial">Millennial</option>
                  <option value="Z">Z</option>
                  <option value="Alpha">Alpha</option>
                </select>
              )}

              {range_type === "Previous" && (
                <input
                  type="number"
                  value={previous}
                  onChange={(e) => {
                    const new_prev = parseInt(e.target.value) || 10;
                    set_previous(new_prev);
                    update_statistic(
                      measurement_type,
                      gender_selection,
                      selection_type,
                      one_year,
                      aggregate_function,
                      range_type,
                      generation,
                      new_prev,
                      between_start,
                      between_end
                    );
                  }}
                />
              )}

              {range_type === "Between" && (
                <>
                  <input
                    type="number"
                    value={between_start}
                    onChange={(e) => {
                      const new_start = parseInt(e.target.value) || 2000;
                      set_between_start(new_start);
                      update_statistic(
                        measurement_type,
                        gender_selection,
                        selection_type,
                        one_year,
                        aggregate_function,
                        range_type,
                        generation,
                        previous,
                        new_start,
                        between_end
                      );
                    }}
                  />
                  <input
                    type="number"
                    value={between_end}
                    onChange={(e) => {
                      const new_end = parseInt(e.target.value) || 2020;
                      set_between_end(new_end);
                      update_statistic(
                        measurement_type,
                        gender_selection,
                        selection_type,
                        one_year,
                        aggregate_function,
                        range_type,
                        generation,
                        previous,
                        between_start,
                        new_end
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

