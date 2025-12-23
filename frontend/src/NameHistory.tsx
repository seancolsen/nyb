import type { NameHistoryData } from "../../shared_types";

interface NameHistoryProps {
  name_history: NameHistoryData;
}

function NameHistory({ name_history }: NameHistoryProps) {
  const max_count_both = Math.max(
    ...name_history.count_both.map((count: bigint) => Number(count)),
  );
  return <div>Maximum count_both: {max_count_both}</div>;
}

export default NameHistory;
