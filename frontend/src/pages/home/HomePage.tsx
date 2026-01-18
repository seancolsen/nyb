import { useState } from "react";

import { api } from "@/api";
import type { NameData, Sort } from "@/api_types";
import type { Filter } from "@/api_types/Filter";
import { getDefaultNumericalFilter } from "@/components/filter-sort/filter.utils";
import { FilterUi } from "@/components/filter-sort/FilterUi";
import { getDefaultSort } from "@/components/filter-sort/sort.utils";
import { SortUi } from "@/components/filter-sort/SortUi";
import { Button } from "@/components/general-purpose/Button";
import { Fieldset } from "@/components/general-purpose/Fieldset";
import { AppLayout } from "@/layouts/AppLayout";

import { NameResult } from "./NameResult";

export function HomePage() {
  const [results, setResults] = useState<NameData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sort, setSort] = useState<Sort>(getDefaultSort());

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await api.search_names.query({
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
    setFilters([...filters, getDefaultNumericalFilter()]);
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
