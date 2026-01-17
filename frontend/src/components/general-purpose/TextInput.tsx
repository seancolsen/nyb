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
      className="p-1 rounded border-2 border-gray-300 hover:border-black w-[15ch]"
    />
  );
}
