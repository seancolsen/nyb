import { Select } from "antd";
import { buildOptions } from "@/utils";
import type { Generation } from "@/api_types/Generation";

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
    <Select
      value={generation}
      onChange={onChange}
      popupMatchSelectWidth={false}
      options={buildOptions(options)}
    />
  );
}
