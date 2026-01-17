import type { SearchMethod } from "@/api_types/SearchMethod";
import { PhrasingSelect } from "@/components/general-purpose/PhrasingSelect";

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
    <PhrasingSelect
      value={searchMethod}
      onChange={onChange}
      options={options}
    />
  );
}
