import type { NameHistoryData } from "./api_types";
import NameHistoryChart from "./NameHistoryChart";

interface NameHistoryProps {
  name_history: NameHistoryData;
}

function NameHistory({ name_history }: NameHistoryProps) {
  return <NameHistoryChart name_history={name_history} />;
}

export default NameHistory;
