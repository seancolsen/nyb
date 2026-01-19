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
      className="
        grid grid-cols-subgrid col-span-full gap-x-2 items-center
        px-2 py-1 rounded-l
        hover:bg-violet-50
        group
      "
    >
      <NameHistoryChartMini shape={name.shape} />

      <span className="text-xl group-hover:underline">{name.name}</span>

      <div className="text-sm text-gray-400">
        <span className="hidden @md:inline">Measurement: </span>
        <span>0%</span>
      </div>
    </Link>
  );
}
