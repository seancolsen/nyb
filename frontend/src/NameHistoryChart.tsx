import type { NameHistoryData } from "../../shared_types";

interface NameHistoryChartProps {
  name_history: NameHistoryData;
}

function NameHistoryChart({ name_history }: NameHistoryChartProps) {
  const width = 800;
  const height = 400;
  const padding = { top: 20, right: 40, bottom: 40, left: 40 };
  const chart_width = width - padding.left - padding.right;
  const chart_height = height - padding.top - padding.bottom;
  const center_y = padding.top + chart_height / 2;

  const start_year = 1880;
  const end_year = start_year + name_history.popularity_f.length - 1;
  const year_range = end_year - start_year;

  const scale = chart_height / 2;

  const get_x = (index: number) =>
    padding.left +
    (index / (name_history.popularity_f.length - 1)) * chart_width;
  const get_y_f = (value: number) => center_y - value * scale;
  const get_y_m = (value: number) => center_y + value * scale;

  let path_f = `M ${get_x(0)} ${center_y}`;
  for (let i = 0; i < name_history.popularity_f.length; i++) {
    path_f += ` L ${get_x(i)} ${get_y_f(name_history.popularity_f[i])}`;
  }
  path_f += ` L ${get_x(name_history.popularity_f.length - 1)} ${center_y} Z`;

  let path_m = `M ${get_x(0)} ${center_y}`;
  for (let i = 0; i < name_history.popularity_m.length; i++) {
    path_m += ` L ${get_x(i)} ${get_y_m(name_history.popularity_m[i])}`;
  }
  path_m += ` L ${get_x(name_history.popularity_m.length - 1)} ${center_y} Z`;

  const grid_lines = [];
  const labels = [];
  for (let year = start_year; year <= end_year; year += 10) {
    const x = padding.left + ((year - start_year) / year_range) * chart_width;
    grid_lines.push(
      <line
        key={year}
        x1={x}
        y1={padding.top}
        x2={x}
        y2={padding.top + chart_height}
        stroke="var(--theme-chart-grid-line)"
        strokeWidth="1"
      />,
    );
    if ((year - start_year) % 20 === 0) {
      labels.push(
        <text
          key={year}
          x={x}
          y={padding.top + chart_height + 25}
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
      {grid_lines}
      <path d={path_f} fill="var(--theme-girl)" />
      <path d={path_m} fill="var(--theme-boy)" />
      <line
        x1={padding.left}
        y1={center_y}
        x2={padding.left + chart_width}
        y2={center_y}
        stroke="var(--theme-axis)"
        strokeWidth="2"
      />
      {labels}
    </svg>
  );
}

export default NameHistoryChart;
