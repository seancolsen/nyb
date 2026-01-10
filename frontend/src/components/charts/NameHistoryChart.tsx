import type { NameHistoryData } from "@/api_types";

interface NameHistoryChartProps {
  nameHistory: NameHistoryData;
}

export function NameHistoryChart({ nameHistory }: NameHistoryChartProps) {
  const width = 800;
  const height = 400;
  const padding = { top: 20, right: 40, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const centerY = padding.top + chartHeight / 2;

  const startYear = 1880;
  const endYear = startYear + nameHistory.popularityF.length - 1;
  const yearRange = endYear - startYear;

  const scale = chartHeight / 2;

  const getX = (index: number) =>
    padding.left + (index / (nameHistory.popularityF.length - 1)) * chartWidth;
  const getYF = (value: number) => centerY - value * scale;
  const getYM = (value: number) => centerY + value * scale;

  let pathF = `M ${getX(0)} ${centerY}`;
  for (let i = 0; i < nameHistory.popularityF.length; i++) {
    pathF += ` L ${getX(i)} ${getYF(nameHistory.popularityF[i])}`;
  }
  pathF += ` L ${getX(nameHistory.popularityF.length - 1)} ${centerY} Z`;

  let pathM = `M ${getX(0)} ${centerY}`;
  for (let i = 0; i < nameHistory.popularityM.length; i++) {
    pathM += ` L ${getX(i)} ${getYM(nameHistory.popularityM[i])}`;
  }
  pathM += ` L ${getX(nameHistory.popularityM.length - 1)} ${centerY} Z`;

  const gridLines = [];
  const labels = [];
  for (let year = startYear; year <= endYear; year += 10) {
    const x = padding.left + ((year - startYear) / yearRange) * chartWidth;
    gridLines.push(
      <line
        key={year}
        x1={x}
        y1={padding.top}
        x2={x}
        y2={padding.top + chartHeight}
        stroke="var(--theme-chart-grid-line)"
        strokeWidth="1"
      />,
    );
    if ((year - startYear) % 20 === 0) {
      labels.push(
        <text
          key={year}
          x={x}
          y={padding.top + chartHeight + 25}
          fill="var(--theme-text)"
          fontSize="12"
          textAnchor="middle"
        >
          {year}
        </text>,
      );
    }
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {gridLines}
      <path d={pathF} fill="var(--theme-girl)" />
      <path d={pathM} fill="var(--theme-boy)" />
      <line
        x1={padding.left}
        y1={centerY}
        x2={padding.left + chartWidth}
        y2={centerY}
        stroke="var(--theme-axis)"
        strokeWidth="2"
      />
      {labels}
    </svg>
  );
}
