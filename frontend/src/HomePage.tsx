import { useState } from "react";
import { api } from "./api";
import type { SearchMethod } from "./api_types/SearchMethod";
import type { NameData } from "./api_types";
import type { Filter } from "./api_types/Filter";
import type { Statistic } from "./api_types/Statistic";
import NameResult from "./NameResult";
import FilterUi from "./FilterUi";
import StatisticUi from "./StatisticUi";

function HomePage() {
  const [query, set_query] = useState("");
  const [method, set_method] = useState<SearchMethod>("Contains");
  const [results, set_results] = useState<NameData[]>([]);
  const [loading, set_loading] = useState(false);
  const [filters, set_filters] = useState<Filter[]>([]);
  const [sort, set_sort] = useState<Statistic | null>(null);

  const handle_search = async () => {
    const trimmed_query = query.trim();

    set_loading(true);
    try {
      const result = await api.search_names.query({
        text_query: trimmed_query
          ? { query: trimmed_query, method: method }
          : null,
        filters: filters,
        sort: sort,
      });

      if ("Ok" in result) {
        set_results(result.Ok.names);
      } else {
        console.error("Error searching names:", result.Err);
        set_results([]);
      }
    } catch (error) {
      console.error("Failed to search names:", error);
      set_results([]);
    } finally {
      set_loading(false);
    }
  };

  const handle_submit = (e: React.FormEvent) => {
    e.preventDefault();
    handle_search();
  };

  const add_filter = () => {
    set_filters([
      ...filters,
      {
        statistic: {
          measurement: { Popularity: "Both" },
          selection: { OneYear: 2000 },
        },
        comparison: { Gt: 0 },
      },
    ]);
  };

  const update_filter = (index: number, filter: Filter) => {
    const new_filters = [...filters];
    new_filters[index] = filter;
    set_filters(new_filters);
  };

  const remove_filter = (index: number) => {
    set_filters(filters.filter((_, i) => i !== index));
  };

  return (
    <div>
      <form onSubmit={handle_submit}>
        <input
          type="text"
          value={query}
          onChange={(e) => set_query(e.target.value)}
        />
        <select
          value={method}
          onChange={(e) => set_method(e.target.value as SearchMethod)}
        >
          <option value="Contains">Contains</option>
          <option value="StartsWith">StartsWith</option>
          <option value="RegExp">RegExp</option>
        </select>
        <button type="submit" disabled={loading}>
          Search
        </button>
      </form>

      <div>
        <h3>Filters</h3>
        {filters.map((filter, index) => (
          <FilterUi
            key={index}
            value={filter}
            onChange={(f) => update_filter(index, f)}
            onRemove={() => remove_filter(index)}
          />
        ))}
        <button type="button" onClick={add_filter}>
          Add Filter
        </button>
      </div>

      <div>
        <h3>Sort</h3>
        <StatisticUi value={sort} onChange={set_sort} />
      </div>

      {results.map((name) => (
        <div key={name.name} className="p-1">
          <NameResult name={name} />
        </div>
      ))}
    </div>
  );
}

export default HomePage;
