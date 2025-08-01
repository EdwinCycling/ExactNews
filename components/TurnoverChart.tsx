import React, { useState, useRef, useLayoutEffect } from 'react';
import { TurnoverDataPoint, Language } from '../types';

interface TurnoverChartProps {
  data: TurnoverDataPoint[];
  language: Language;
  theme: string;
}

const TurnoverChart: React.FC<TurnoverChartProps> = ({ data, language, theme }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; period: string; turnoverIndex: number; } | null>(null);

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const t = {
    nl: {
      title: 'Omzetontwikkeling MKB',
      yAxis: 'Omzetindex',
      period: 'Periode',
      index: 'Index'
    },
    en: {
      title: 'SME Turnover Development',
      yAxis: 'Turnover Index',
      period: 'Period',
      index: 'Index'
    }
  }

  if (!data || data.length === 0) {
    return null;
  }

  const padding = { top: 20, right: 30, bottom: 60, left: 50 };
  const width = containerWidth;
  const height = 400;

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const yMin = Math.floor(Math.min(...data.map(d => d.turnoverIndex)) / 5) * 5;
  const yMax = Math.ceil(Math.max(...data.map(d => d.turnoverIndex)) / 5) * 5;

  const xScale = (index: number) => padding.left + (index / (data.length - 1)) * innerWidth;
  const yScale = (value: number) => padding.top + innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(d.turnoverIndex)}`).join(' ');

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;

    const index = Math.round(((x - padding.left) / innerWidth) * (data.length - 1));

    if (index >= 0 && index < data.length) {
      const point = data[index];
      setTooltip({
        x: xScale(index),
        y: yScale(point.turnoverIndex),
        ...point
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };
  
  const textColor = theme === 'dark' ? '#cbd5e1' : '#475569'; // slate-300, slate-600
  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb'; // gray-700, gray-200

  return (
    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 sm:p-6" ref={containerRef}>
      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">{t[language].title}</h3>
      {containerWidth > 0 && (
        <svg
          width="100%"
          height={height}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="overflow-visible"
        >
          <g>
            {/* Y-axis grid lines and labels */}
            {Array.from({ length: (yMax - yMin) / 5 + 1 }).map((_, i) => {
              const value = yMin + i * 5;
              const y = yScale(value);
              return (
                <g key={value} className="text-xs">
                  <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke={gridColor} strokeWidth="1" strokeDasharray="2,2"/>
                  <text x={padding.left - 10} y={y + 4} fill={textColor} textAnchor="end">
                    {value}
                  </text>
                </g>
              );
            })}
             <text
                transform={`translate(${padding.left / 4}, ${height / 2}) rotate(-90)`}
                textAnchor="middle"
                className="text-sm font-semibold"
                fill={textColor}
            >
                {t[language].yAxis}
            </text>
          </g>

          <g>
            {/* X-axis labels */}
            {data.map((d, i) => {
              const x = xScale(i);
              return (
                <text key={d.period} x={x} y={height - padding.bottom + 20} fill={textColor} textAnchor="middle" className="text-xs">
                  {d.period}
                </text>
              );
            })}
          </g>

          {/* Line */}
          <path d={linePath} fill="none" stroke="url(#line-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
           <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
           </defs>
          
          {/* Tooltip */}
          {tooltip && (
            <g>
              <line x1={tooltip.x} y1={padding.top} x2={tooltip.x} y2={height - padding.bottom} stroke={textColor} strokeWidth="1" strokeDasharray="3,3" />
              <circle cx={tooltip.x} cy={tooltip.y} r="6" fill={theme === 'dark' ? '#1f2937' : '#f8fafc'} strokeWidth="3" className="stroke-teal-400"/>
              
               <g transform={`translate(${tooltip.x + (tooltip.x > innerWidth / 2 ? -10 : 10)}, ${tooltip.y})`}>
                 <rect 
                   x={tooltip.x > innerWidth / 2 ? -120 : 0}
                   y="-25"
                   width="120" 
                   height="45" 
                   rx="5"
                   className="fill-slate-800/80 dark:fill-slate-900/80 stroke-teal-400/50" 
                 />
                 <text 
                   x={tooltip.x > innerWidth / 2 ? -60 : 60}
                   y="-5"
                   textAnchor="middle" 
                   className="fill-white font-bold text-sm"
                 >
                   {`${t[language].period}: ${tooltip.period}`}
                 </text>
                 <text 
                   x={tooltip.x > innerWidth / 2 ? -60 : 60}
                   y="15"
                   textAnchor="middle" 
                   className="fill-slate-300 text-xs"
                 >
                   {`${t[language].index}: ${tooltip.turnoverIndex}`}
                 </text>
               </g>
            </g>
          )}
        </svg>
      )}
    </div>
  );
};

export default TurnoverChart;
