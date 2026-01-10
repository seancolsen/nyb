import { Link } from "react-router-dom";

import type { NameData } from "@/api_types";
import { NameHistoryChartMini } from "@/components/charts/NameHistoryChartMini";

interface NameResultProps {
  name: NameData;
}

export function NameResult({ name }: NameResultProps) {
  return (
    <Link
      to={`/${name.name}`}
      className="grid grid-flow-col gap-2 items-center max-w-max hover:underline"
    >
      <NameHistoryChartMini shape={name.shape} />
      <span className="text-xl">{name.name}</span>
    </Link>
  );
}
