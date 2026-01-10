interface NameHistoryChartMiniProps {
  shape: string;
}

export function NameHistoryChartMini({ shape }: NameHistoryChartMiniProps) {
  const decoded = Uint8Array.from(atob(shape), (c) => c.charCodeAt(0));

  const width = 100;
  const height = 50;
  const centerY = height / 2;
  const scale = height / 2;

  // Split array: first half = female, second half = male
  const dataPoints = decoded.length / 2;
  const popularityF = Array.from(decoded.slice(0, dataPoints));
  const popularityM = Array.from(decoded.slice(dataPoints));

  const getX = (index: number) => (index / (dataPoints - 1)) * width;
  const getYF = (value: number) => centerY - (value / 255) * scale;
  const getYM = (value: number) => centerY + (value / 255) * scale;

  // Build female path
  let pathF = `M ${getX(0)} ${centerY}`;
  for (let i = 0; i < popularityF.length; i++) {
    pathF += ` L ${getX(i)} ${getYF(popularityF[i])}`;
  }
  pathF += ` L ${getX(popularityF.length - 1)} ${centerY} Z`;

  // Build male path
  let pathM = `M ${getX(0)} ${centerY}`;
  for (let i = 0; i < popularityM.length; i++) {
    pathM += ` L ${getX(i)} ${getYM(popularityM[i])}`;
  }
  pathM += ` L ${getX(popularityM.length - 1)} ${centerY} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline"
    >
      <path d={pathF} fill="var(--theme-girl)" />
      <path d={pathM} fill="var(--theme-boy)" />
      <line
        x1="0"
        y1={centerY}
        x2={width}
        y2={centerY}
        stroke="var(--theme-axis)"
        strokeWidth="1"
      />
    </svg>
  );
}
