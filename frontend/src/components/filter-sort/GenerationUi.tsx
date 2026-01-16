import type { Generation } from "@/api_types/Generation";
import { InlineSelect } from "@/components/general-purpose/InlineSelect";

interface Props {
  generation: Generation;
  onChange: (generation: Generation) => void;
}

const options: Record<Generation, string> = {
  lost: "Lost",
  greatest: "Greatest",
  silent: "Silent",
  boomer: "Boomer",
  x: "X",
  millennial: "Millennial",
  z: "Z",
  alpha: "Alpha",
};

export function GenerationUi({ generation, onChange }: Props) {
  return (
    <InlineSelect value={generation} onChange={onChange} options={options} />
  );
}
