"use client";

import { type WaveParticipants } from "@/lib/graphql/waves";
import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";

const MARGIN = { top: 16, right: 16, bottom: 80, left: 56 };

// Module-level D3 formatters — created once, not on every render.
const parseDate = d3.utcParse("%Y-%m-%d");
const formatLabel = d3.utcFormat("%Y \u25cf %m");
const formatMonth = d3.utcFormat("%Y-%m");
const formatY = (v: number) => v.toLocaleString("de-DE");

export default function WaveParticipantsChart({
  data,
  globalData,
}: {
  data: WaveParticipants[] | null;
  /** When provided, the Y axis maximum is derived from this instead of `data`, keeping the scale stable across filtered views. */
  globalData?: WaveParticipants[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const chart = useMemo(() => {
    if (!data || size.width === 0) return null;

    const { width, height } = size;
    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    const dated = data.map((d) => ({
      ...d,
      date: parseDate(d.month) ?? new Date(d.month),
    }));

    const [minDate, maxDate] = d3.extent(dated, (d) => d.date) as [Date, Date];
    const xDomainStart = d3.utcMonth.offset(minDate, -1);
    const xDomainEnd = d3.utcMonth.offset(maxDate, 1);

    const xScale = d3
      .scaleUtc()
      .domain([xDomainStart, xDomainEnd])
      .range([0, innerWidth]);

    const oneMonthPx = xScale(d3.utcMonth.offset(minDate, 1)) - xScale(minDate);
    const barWidth = Math.max(2, oneMonthPx * 0.7);

    const yMax = d3.max(globalData ?? data, (d) => d.participants) ?? 0;
    const yScale = d3
      .scaleLinear()
      .domain([0, yMax * 1.1])
      .range([innerHeight, 0])
      .nice();

    // One tick per month, from first to last data month (no padding ticks).
    const xTicks = d3.utcMonth.range(
      d3.utcMonth.floor(minDate),
      d3.utcMonth.offset(d3.utcMonth.floor(maxDate), 1),
    );
    const yTicks = yScale.ticks(5);
    const dataMonthSet = new Set(data.map((d) => d.month.substring(0, 7)));

    return {
      width,
      height,
      innerWidth,
      innerHeight,
      dated,
      xScale,
      yScale,
      barWidth,
      xTicks,
      yTicks,
      dataMonthSet,
    };
  }, [data, globalData, size]);

  if (data !== null && data.length === 0) {
    return (
      <div className="w-full h-80 rounded-2xl bg-lmp-gray1 flex items-center justify-center text-sm text-lmp-text/50">
        No measurement point data for the current selection.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold text-lmp-text">
        Participants per Measurement Point
      </p>
      <div ref={containerRef} className="w-full h-80 relative">
        {data === null || !chart ? (
          <div className="absolute inset-0 rounded-2xl bg-lmp-gray1 animate-pulse" />
        ) : (
          <svg
            width={chart.width}
            height={chart.height}
            viewBox={`0 0 ${chart.width} ${chart.height}`}
          >
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {/* Y gridlines */}
              {chart.yTicks.map((tick) => (
                <line
                  key={tick}
                  x1={0}
                  x2={chart.innerWidth}
                  y1={chart.yScale(tick)}
                  y2={chart.yScale(tick)}
                  stroke="#dae0ea"
                  strokeDasharray="3,3"
                />
              ))}

              {/* Bars */}
              {chart.dated.map((d) => (
                <rect
                  key={d.wave}
                  x={chart.xScale(d.date) - chart.barWidth / 2}
                  y={chart.yScale(d.participants)}
                  width={chart.barWidth}
                  height={chart.innerHeight - chart.yScale(d.participants)}
                  fill="#adde00"
                />
              ))}

              {/* X axis baseline */}
              <line
                x1={0}
                x2={chart.innerWidth}
                y1={chart.innerHeight}
                y2={chart.innerHeight}
                stroke="#cbd4e2"
              />

              {/* X axis tick labels — one per month, rotated upward */}
              {chart.xTicks.map((tick) => (
                <g
                  key={tick.getTime()}
                  transform={`translate(${chart.xScale(tick)},${chart.innerHeight})`}
                >
                  <text
                    dx="-0.5em"
                    dy="0.35em"
                    transform="rotate(-90)"
                    textAnchor="end"
                    fontSize={14}
                    fill={
                      chart.dataMonthSet.has(formatMonth(tick))
                        ? "#001a3a"
                        : "#cbd4e2"
                    }
                  >
                    {formatLabel(tick)}
                  </text>
                </g>
              ))}

              {/* Y axis tick marks and labels */}
              {chart.yTicks.map((tick) => (
                <g key={tick} transform={`translate(0,${chart.yScale(tick)})`}>
                  <line x1={-4} x2={0} stroke="#cbd4e2" />
                  <text
                    x={-8}
                    dy="0.32em"
                    textAnchor="end"
                    fontSize={14}
                    fill="#001a3a"
                  >
                    {formatY(tick)}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        )}
      </div>
    </div>
  );
}
