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
      className="px-1 rounded-xl border-b-5 border-gray-300 cursor-pointer hover:border-black w-[4.5ch] box-content text-center"
    />
  );
}
