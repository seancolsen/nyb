import type { NameHistoryData } from "./api_types";
import NameHistoryChart from "./NameHistoryChart";

interface NameHistoryProps {
  nameHistory: NameHistoryData;
}

function NameHistory({ nameHistory }: NameHistoryProps) {
  return <NameHistoryChart nameHistory={nameHistory} />;
}

export default NameHistory;
