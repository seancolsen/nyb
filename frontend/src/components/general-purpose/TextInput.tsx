interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function TextInput({ value, onChange }: Props) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
