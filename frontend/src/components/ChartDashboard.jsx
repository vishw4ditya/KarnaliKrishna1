import React, { useState } from 'react';

export const SalesTrendChart = ({ data = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400">
        No sales data available.
      </div>
    );
  }

  // Dimensions
  const width = 500;
  const height = 200;
  const padding = 30;

  // Extents
  const salesValues = data.map((d) => d.sales);
  const maxSales = Math.max(...salesValues, 1000);
  const minSales = 0;

  const points = data.map((d, index) => {
    const x = padding + (index * (width - 2 * padding)) / (data.length - 1 || 1);
    // Invert Y coordinate since SVG (0,0) is top-left
    const y = height - padding - ((d.sales - minSales) * (height - 2 * padding)) / (maxSales - minSales);
    return { x, y, info: d };
  });

  // Build path string
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
  }

  // Area under path
  let areaD = '';
  if (points.length > 0) {
    areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {/* Y Axis Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * (height - 2 * padding);
          const val = Math.round(maxSales - ratio * (maxSales - minSales));
          return (
            <g key={i} className="opacity-20 dark:opacity-10 text-slate-400">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeDasharray="4 4" />
              <text x={padding - 5} y={y + 4} textAnchor="end" fontSize="8" className="fill-current font-semibold">
                Rs.{val}
              </text>
            </g>
          );
        })}

        {/* Gradient fill */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Areas & Paths */}
        {areaD && <path d={areaD} fill="url(#areaGrad)" />}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_2px_4px_rgba(139,92,246,0.3)] animate-fade-in"
          />
        )}

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredPoint === i ? 6 : 4}
              className="fill-white dark:fill-slate-950 stroke-primary-500 cursor-pointer transition-all duration-150"
              strokeWidth="2.5"
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            {/* X Labels */}
            {i % 2 === 0 && (
              <text
                x={p.x}
                y={height - 10}
                textAnchor="middle"
                fontSize="8"
                className="fill-slate-400 font-semibold"
              >
                {p.info.date.split('/').slice(0, 2).join('/')}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredPoint !== null && (
        <div
          className="absolute z-10 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl text-xs text-left transition-all duration-150"
          style={{
            left: `${(points[hoveredPoint].x / width) * 100}%`,
            top: `${(points[hoveredPoint].y / height) * 100 - 30}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-semibold text-slate-400">{points[hoveredPoint].info.date}</div>
          <div className="text-slate-900 dark:text-white font-bold mt-0.5">
            Sales: Rs. {points[hoveredPoint].info.sales.toLocaleString()}
          </div>
          <div className="text-primary-500 font-medium">
            Orders: {points[hoveredPoint].info.orders}
          </div>
        </div>
      )}
    </div>
  );
};

export const BranchPerformanceChart = ({ data = [] }) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400">
        No branch metrics available.
      </div>
    );
  }

  // Dimensions
  const width = 500;
  const height = 200;
  const padding = 30;
  const bottomPadding = 40;

  // Extents
  const maxSales = Math.max(...data.map((d) => d.sales), 1000);

  const barWidth = Math.min(40, (width - 2 * padding) / data.length / 1.5);
  const spacing = (width - 2 * padding - barWidth * data.length) / (data.length - 1 || 1);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {/* Y Axis Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + ratio * (height - padding - bottomPadding);
          const val = Math.round(maxSales - ratio * maxSales);
          return (
            <g key={i} className="opacity-20 dark:opacity-10 text-slate-400">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeDasharray="4 4" />
              <text x={padding - 5} y={y + 4} textAnchor="end" fontSize="8" className="fill-current font-semibold">
                Rs.{val}
              </text>
            </g>
          );
        })}

        {/* Draw bars */}
        {data.map((d, index) => {
          const x = padding + index * (barWidth + spacing);
          const barHeight = (d.sales / maxSales) * (height - padding - bottomPadding);
          const y = height - bottomPadding - barHeight;

          return (
            <g
              key={d.id || index}
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
              className="cursor-pointer"
            >
              {/* Rounded Background Hover Area */}
              <rect
                x={x - spacing / 4}
                y={padding}
                width={barWidth + spacing / 2}
                height={height - padding - bottomPadding + 10}
                className="fill-transparent hover:fill-slate-100/50 dark:hover:fill-slate-900/30 transition-colors"
                rx="4"
              />

              {/* Data Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx="4"
                className="fill-primary-500 hover:fill-primary-600 transition-colors duration-150"
              />

              {/* Text label underneath */}
              <text
                x={x + barWidth / 2}
                y={height - 20}
                textAnchor="middle"
                fontSize="8"
                className="fill-slate-400 font-semibold"
                width={barWidth}
              >
                {d.name.length > 8 ? d.name.slice(0, 7) + '..' : d.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredBar !== null && (
        <div
          className="absolute z-10 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl text-xs text-left"
          style={{
            left: `${((padding + hoveredBar * (barWidth + spacing) + barWidth / 2) / width) * 100}%`,
            top: `${((height - bottomPadding - (data[hoveredBar].sales / maxSales) * (height - padding - bottomPadding)) / height) * 100 - 15}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-semibold text-slate-400">{data[hoveredBar].name}</div>
          <div className="text-slate-900 dark:text-white font-bold mt-0.5">
            Sales: Rs. {data[hoveredBar].sales.toLocaleString()}
          </div>
          <div className="text-primary-500 font-medium">
            Orders: {data[hoveredBar].ordersCount}
          </div>
        </div>
      )}
    </div>
  );
};
