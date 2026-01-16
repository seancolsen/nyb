interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function NumberInput({ value, onChange }: Props) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
