import type { SearchMethod } from "@/api_types/SearchMethod";
import { InlineSelect } from "@/components/general-purpose/InlineSelect";

const options: Record<SearchMethod, string> = {
  contains: "Contains",
  startsWith: "Starts with",
  regExp: "Regular expression",
};

interface Props {
  searchMethod: SearchMethod;
  onChange: (m: SearchMethod) => void;
}

export function SearchMethodUi({ searchMethod, onChange }: Props) {
  return (
    <InlineSelect value={searchMethod} onChange={onChange} options={options} />
  );
}
