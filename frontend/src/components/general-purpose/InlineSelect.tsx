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
    <select
      className={p.className}
      style={{ minWidth: "min-content" }}
      disabled={p.disabled}
      value={p.value}
      onChange={(e) => p.onChange(e.target.value as V)}
    >
      {Object.entries(p.options).map(([option, label]) => (
        <option key={option} value={option}>
          {label as React.ReactNode}
        </option>
      ))}
    </select>
  );
}
