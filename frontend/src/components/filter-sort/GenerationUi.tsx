import type { Generation } from "@/api_types/Generation";
import { PhrasingSelect } from "@/components/general-purpose/PhrasingSelect";

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
    <PhrasingSelect value={generation} onChange={onChange} options={options} />
  );
}
