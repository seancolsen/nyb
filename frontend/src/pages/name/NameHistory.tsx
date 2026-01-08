import type { NameHistoryData } from "../../api_types";
import NameHistoryChart from "../../components/charts/NameHistoryChart";

interface NameHistoryProps {
  nameHistory: NameHistoryData;
}

function NameHistory({ nameHistory }: NameHistoryProps) {
  return <NameHistoryChart nameHistory={nameHistory} />;
}

export default NameHistory;
