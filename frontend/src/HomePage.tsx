import { useState } from "react";
import { api } from "./api";
import type { SearchMethod } from "./api_types/SearchMethod";
import type { NameData } from "./api_types";
import NameResult from "./NameResult";

function HomePage() {
  const [query, set_query] = useState("");
  const [method, set_method] = useState<SearchMethod>("Contains");
  const [results, set_results] = useState<NameData[]>([]);
  const [loading, set_loading] = useState(false);

  const handle_search = async () => {
    if (!query.trim()) {
      return;
    }

    set_loading(true);
    try {
      const result = await api.search_names.query({
        text_query: {
          query: query.trim(),
          method: method,
        },
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
      {results.map((name) => (
        <div key={name.name} className="p-1">
          <NameResult name={name} />
        </div>
      ))}
    </div>
  );
}

export default HomePage;
