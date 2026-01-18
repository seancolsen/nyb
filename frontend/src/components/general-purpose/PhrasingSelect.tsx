import * as Select from "@radix-ui/react-select";

import { cn } from "@/utils";

interface Props<V extends string> {
  options: Record<V, React.ReactNode>;
  value: V;
  onChange: (value: V) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function PhrasingSelect<V extends string>(p: Props<V>) {
  return (
    <Select.Root
      disabled={p.disabled}
      value={p.value}
      onValueChange={p.onChange}
    >
      <Select.Trigger
        className={cn(
          "px-1.5 rounded-xl border-b-5 border-gray-300 cursor-pointer hover:border-black",
          p.className,
        )}
      >
        <Select.Value />
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          className="bg-white rounded shadow-lg"
        >
          <Select.Viewport className="p-1">
            {Object.entries(p.options).map(([option, label]) => (
              <Select.Item
                key={option}
                value={option}
                className="p-1 rounded-md cursor-pointer hover:bg-gray-100"
              >
                <Select.ItemText>{label as React.ReactNode}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
