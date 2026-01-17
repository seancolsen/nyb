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

export function InlineSelect<V extends string>(p: Props<V>) {
  return (
    <Select.Root
      disabled={p.disabled}
      value={p.value}
      onValueChange={p.onChange}
    >
      <Select.Trigger
        className={cn(
          "inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md border border-gray-300",
          p.className,
        )}
      >
        <Select.Value />
        <Select.Icon aria-hidden>▾</Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content position="popper" sideOffset={4}>
          <Select.Viewport>
            {Object.entries(p.options).map(([option, label]) => (
              <Select.Item key={option} value={option}>
                <Select.ItemText>{label as React.ReactNode}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
