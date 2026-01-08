import { Select } from "antd";
import type { SearchMethod } from "@/api_types/SearchMethod";
import { buildOptions } from "@/utils";

const options: Record<SearchMethod, string> = {
  contains: "Contains",
  startsWith: "Starts with",
  regExp: "Regular expression",
};

interface Props {
  searchMethod: SearchMethod;
  onChange: (m: SearchMethod) => void;
}

export default function SearchMethodUi({ searchMethod, onChange }: Props) {
  return (
    <Select
      value={searchMethod}
      onChange={(value) => onChange(value as SearchMethod)}
      popupMatchSelectWidth={false}
      options={buildOptions(options)}
    />
  );
}
