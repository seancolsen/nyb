import { useState } from "react";

import { api } from "@/api";
import type { NameData, Sort } from "@/api_types";
import type { Filter } from "@/api_types/Filter";
import type { SearchMethod } from "@/api_types/SearchMethod";
import type { Statistic } from "@/api_types/Statistic";
import { FilterUi } from "@/components/filter-sort/FilterUi";
import { SearchMethodUi } from "@/components/filter-sort/SearchMethodUi";
import { SortUi } from "@/components/filter-sort/SortUi";
import { Button } from "@/components/general-purpose/Button";
import { Fieldset } from "@/components/general-purpose/Fieldset";
import { PhrasingConst } from "@/components/general-purpose/PhrasingConst";
import { PhrasingContainer } from "@/components/general-purpose/PhrasingContainer";
import { TextInput } from "@/components/general-purpose/TextInput";
import { MAX_YEAR } from "@/constants";
import { AppLayout } from "@/layouts/AppLayout";

import { NameResult } from "./NameResult";

function getDefaultStatistic(): Statistic {
  return {
    measurement: { type: "popularity", genderSelection: "both" },
    selection: { type: "oneYear", year: MAX_YEAR },
  };
}

function getDefaultSort(): Sort {
  return {
    statistic: getDefaultStatistic(),
    direction: "desc",
  };
}

function getDefaultFilter(): Filter {
  return {
    statistic: getDefaultStatistic(),
    comparison: { type: "gt", value: 0 },
  };
}

export function HomePage() {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<SearchMethod>("startsWith");
  const [results, setResults] = useState<NameData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sort, setSort] = useState<Sort>(getDefaultSort());

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
    setFilters([...filters, getDefaultFilter()]);
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
    <AppLayout>
      <h2>Search Names</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Fieldset legend="Filters">
          <ul>
            <li>
              <PhrasingContainer>
                <PhrasingConst>Spelling</PhrasingConst>
                <SearchMethodUi searchMethod={method} onChange={setMethod} />
                <TextInput value={query} onChange={setQuery} />
              </PhrasingContainer>
            </li>
            {filters.map((filter, index) => (
              <FilterUi
                key={index}
                filter={filter}
                onChange={(f: Filter) => updateFilter(index, f)}
                onRemove={() => removeFilter(index)}
              />
            ))}
          </ul>
          <Button onClick={addFilter}>Add Filter</Button>
        </Fieldset>

        <Fieldset legend="Sort by">
          <SortUi sort={sort} onChange={setSort} />
        </Fieldset>

        <div>
          <Button type="submit" disabled={loading}>
            Show names
          </Button>
        </div>
      </form>

      {results.map((name) => (
        <div key={name.name} className="p-1">
          <NameResult name={name} />
        </div>
      ))}
    </AppLayout>
  );
}
