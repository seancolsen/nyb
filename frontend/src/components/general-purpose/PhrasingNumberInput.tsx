import { cn } from "@/utils";

import { phrasingClasses } from "./phrasing.utils";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function PhrasingNumberInput({ value, onChange }: Props) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        phrasingClasses,
        "cursor-text w-[4.5ch] box-content text-center",
      )}
    />
  );
}
