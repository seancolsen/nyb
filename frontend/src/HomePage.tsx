import { useState } from "react";
import { Input, Select, Button } from "antd";
import { api } from "./api";
import type { SearchMethod } from "./api_types/SearchMethod";
import type { NameData } from "./api_types";
import type { Filter } from "./api_types/Filter";
import type { Statistic } from "./api_types/Statistic";
import NameResult from "./NameResult";
import FilterUi from "./FilterUi";
import StatisticUi from "./StatisticUi";

function HomePage() {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<SearchMethod>("contains");
  const [results, setResults] = useState<NameData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sort, setSort] = useState<Statistic | null>(null);

  const handleSearch = async () => {
    const trimmedQuery = query.trim();

    setLoading(true);
    try {
      const result = await api.search_names.query({
        textQuery: trimmedQuery
          ? { query: trimmedQuery, method: method }
          : null,
        filters: filters,
        sort: sort,
      });

      if ("Ok" in result) {
        setResults(result.Ok.names);
      } else {
        console.error("Error searching names:", result.Err);
        setResults([]);
      }
    } catch (error) {
      console.error("Failed to search names:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const addFilter = () => {
    setFilters([
      ...filters,
      {
        statistic: {
          measurement: { type: "popularity", genderSelection: "both" },
          selection: { type: "oneYear", year: 2000 },
        },
        comparison: { type: "gt", value: 0 },
      },
    ]);
  };

  const updateFilter = (index: number, filter: Filter) => {
    const newFilters = [...filters];
    newFilters[index] = filter;
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          value={method}
          onChange={(value) => setMethod(value as SearchMethod)}
          style={{ width: 150 }}
        >
          <Select.Option value="contains">Contains</Select.Option>
          <Select.Option value="startsWith">StartsWith</Select.Option>
          <Select.Option value="regExp">RegExp</Select.Option>
        </Select>
        <Button type="primary" htmlType="submit" disabled={loading}>
          Search
        </Button>
      </form>

      <div>
        <h3>Filters</h3>
        {filters.map((filter, index) => (
          <FilterUi
            key={index}
            value={filter}
            onChange={(f) => updateFilter(index, f)}
            onRemove={() => removeFilter(index)}
          />
        ))}
        <Button onClick={addFilter}>Add Filter</Button>
      </div>

      <div>
        <h3>Sort</h3>
        <StatisticUi value={sort} onChange={setSort} />
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
