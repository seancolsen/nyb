interface NameHistoryChartMiniProps {
  shape: string;
}

function NameHistoryChartMini({ shape }: NameHistoryChartMiniProps) {
  const decoded = Uint8Array.from(atob(shape), (c) => c.charCodeAt(0));

  const width = 100;
  const height = 50;
  const center_y = height / 2;
  const scale = height / 2;

  // Split array: first half = female, second half = male
  const data_points = decoded.length / 2;
  const popularity_f = Array.from(decoded.slice(0, data_points));
  const popularity_m = Array.from(decoded.slice(data_points));

  const get_x = (index: number) => (index / (data_points - 1)) * width;
  const get_y_f = (value: number) => center_y - (value / 255) * scale;
  const get_y_m = (value: number) => center_y + (value / 255) * scale;

  // Build female path
  let path_f = `M ${get_x(0)} ${center_y}`;
  for (let i = 0; i < popularity_f.length; i++) {
    path_f += ` L ${get_x(i)} ${get_y_f(popularity_f[i])}`;
  }
  path_f += ` L ${get_x(popularity_f.length - 1)} ${center_y} Z`;

  // Build male path
  let path_m = `M ${get_x(0)} ${center_y}`;
  for (let i = 0; i < popularity_m.length; i++) {
    path_m += ` L ${get_x(i)} ${get_y_m(popularity_m[i])}`;
  }
  path_m += ` L ${get_x(popularity_m.length - 1)} ${center_y} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline"
    >
      <path d={path_f} fill="var(--theme-girl)" />
      <path d={path_m} fill="var(--theme-boy)" />
      <line
        x1="0"
        y1={center_y}
        x2={width}
        y2={center_y}
        stroke="var(--theme-axis)"
        strokeWidth="1"
      />
    </svg>
  );
}

export default NameHistoryChartMini;
