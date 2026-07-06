"use client";

import { type WaveParticipants } from "@/lib/graphql/waves";
import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";

const MARGIN = { top: 16, right: 1, bottom: 90, left: 45 };
const DAILY_MARGIN = { top: 25, right: 1, bottom: 40, left: 45 };
const DAILY_HEIGHT = 200;

// Module-level D3 formatters — created once, not on every render.
const parseDate = d3.utcParse("%Y-%m-%d");
const formatLabel = d3.utcFormat("%Y ● %m");
const formatMonth = d3.utcFormat("%Y-%m");
const formatY = (v: number) => v.toLocaleString("de-DE");

const AUG_2022 = new Date(Date.UTC(2022, 7, 1));

export default function WaveParticipantsChart({
  data,
  globalData,
  headline,
  selectedWaves,
  onWaveToggle,
  hasActiveFilter,
}: {
  data: WaveParticipants[] | null;
  /** When provided, the Y axis maximum is derived from this instead of `data`, keeping the scale stable across filtered views. */
  globalData?: WaveParticipants[];
  headline?: string;
  /** When provided together with onWaveToggle, the chart enters select mode. */
  selectedWaves?: string[];
  /** Called with the wave name when the user clicks a bar in select mode. */
  onWaveToggle?: (wave: string) => void;
  /** When true, the chart knows a question/filter is actively applied — used to auto-expand the daily sub-chart. */
  hasActiveFilter?: boolean;
}) {
  const selectMode = !!onWaveToggle;
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [showDaily, setShowDaily] = useState(selectMode);
  // On the questions page (no selectMode): auto-expand when a filter is active and data contains daily waves.
  // On the measurement page (selectMode): auto-expand when a daily wave is among the selected waves.
  const autoExpand = selectMode
    ? !!selectedWaves?.some((w) => w.toLowerCase().includes("dd"))
    : !!hasActiveFilter &&
      !!data?.some((d) => d.wave.toLowerCase().includes("dd"));
  const effectiveShowDaily = showDaily || autoExpand;

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

    const dated = data
      .filter((d) => !d.wave.toLowerCase().includes("dd"))
      .map((d) => ({
        ...d,
        date: parseDate(d.month) ?? new Date(d.month),
      }));

    // Use global data for X extents and grey background bars, so both stay stable in filtered views.
    const globalDated = (globalData ?? data)
      .filter((d) => !d.wave.toLowerCase().includes("dd"))
      .map((d) => ({
        ...d,
        date: parseDate(d.month) ?? new Date(d.month),
      }));

    const [minDate, maxDate] = d3.extent(globalDated, (d) => d.date) as [
      Date,
      Date,
    ];
    const xDomainStart = d3.utcMonth.offset(minDate, -1);
    const xDomainEnd = d3.utcMonth.offset(maxDate, 1);

    const xScale = d3
      .scaleUtc()
      .domain([xDomainStart, xDomainEnd])
      .range([0, innerWidth]);

    const oneMonthPx = xScale(d3.utcMonth.offset(minDate, 1)) - xScale(minDate);
    const barWidth = Math.max(2, oneMonthPx * 0.7);

    const yMaxSource = (globalData ?? data).filter(
      (d) => !d.wave.toLowerCase().includes("dd"),
    );
    const yMax = d3.max(yMaxSource, (d) => d.participants) ?? 0;
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

    // January 1st dates within the x domain — rendered as year-change dividers.
    const yearLines = d3.utcYear.range(xDomainStart, xDomainEnd);

    // Daily (dd) waves — all in August 2022.
    const dailyDated = (globalData ?? data)
      .filter((d) => d.wave.toLowerCase().includes("dd"))
      .map((d) => ({ ...d, date: parseDate(d.month) ?? new Date(d.month) }));

    const filteredDailyDated = data
      .filter((d) => d.wave.toLowerCase().includes("dd"))
      .map((d) => ({ ...d, date: parseDate(d.month) ?? new Date(d.month) }));

    // X position of T31 in the main chart — used to anchor the arrow and sub-chart.
    const t31 = globalDated.find((d) => d.wave === "T31");
    const aug2022CenterX = t31 ? xScale(t31.date) : 0;

    // Sub-chart: fixed inner width, centered under T31.
    // DAILY_MARGIN.left == MARGIN.left so margins cancel in the centering formula.
    const dailyInnerWidth = Math.max(260, dailyDated.length * 50);
    const dailyInnerHeight =
      DAILY_HEIGHT - DAILY_MARGIN.top - DAILY_MARGIN.bottom;

    // marginLeft positions the sub-chart SVG so its inner area is centered on T31.
    const dailyMarginLeft = aug2022CenterX - dailyInnerWidth / 2;

    // Daily time scale: Aug 1 – Sep 1, 2022.
    const aug2022End = d3.utcMonth.offset(AUG_2022, 1);
    const dailyXScale = d3
      .scaleUtc()
      .domain([AUG_2022, aug2022End])
      .range([0, dailyInnerWidth]);

    const oneDayPx =
      dailyXScale(d3.utcDay.offset(AUG_2022, 1)) - dailyXScale(AUG_2022);
    const dailyBarWidth = Math.max(2, oneDayPx * 0.7);

    // Ticks every 3 days to avoid label crowding.
    const dailyXTicks = d3.utcDay.range(AUG_2022, aug2022End, 3);

    // Y scale based on daily data max only.
    const dailyYMax = d3.max(dailyDated, (d) => d.participants) ?? 0;
    const dailyYScale = d3
      .scaleLinear()
      .domain([0, dailyYMax * 1.1])
      .range([dailyInnerHeight, 0])
      .nice();

    const dailyYTicks = dailyYScale.ticks(5);

    const formatDay = d3.utcFormat("%d");

    return {
      width,
      height,
      innerWidth,
      innerHeight,
      dated,
      globalDated,
      xScale,
      yScale,
      barWidth,
      oneMonthPx,
      xTicks,
      yTicks,
      dataMonthSet,
      yMax,
      yearLines,
      dailyDated,
      filteredDailyDated,
      aug2022CenterX,
      dailyInnerWidth,
      dailyInnerHeight,
      dailyMarginLeft,
      dailyXScale,
      dailyBarWidth,
      dailyXTicks,
      dailyYMax,
      dailyYScale,
      dailyYTicks,
      formatDay,
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
        {headline || "Participants per Measurement Point for all Questions"}
      </p>
      <div className="overflow-x-auto">
        <div ref={containerRef} className="min-w-300 pb-1 w-full h-80 relative">
          {data === null || !chart ? (
            <div className="absolute inset-0 rounded-2xl bg-lmp-gray1 animate-pulse" />
          ) : (
            <svg
              width={chart.width}
              height={chart.height}
              viewBox={`0 0 ${chart.width} ${chart.height}`}
            >
              <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
                {/* Grey background bars — all global waves, always visible */}
                {chart.globalDated.map((d) => (
                  <rect
                    key={`bg-${d.wave}`}
                    x={chart.xScale(d.date) - chart.barWidth / 2}
                    y={chart.yScale(chart.yMax)}
                    width={chart.barWidth}
                    height={chart.innerHeight - chart.yScale(chart.yMax)}
                    fill="#F3F4F8"
                  />
                ))}

                {/* Transparent click targets in select mode — one per wave, full height */}
                {selectMode &&
                  chart.globalDated.map((d) => (
                    <rect
                      key={`hit-${d.wave}`}
                      x={chart.xScale(d.date) - chart.barWidth / 2}
                      y={chart.yScale(chart.yMax)}
                      width={chart.barWidth}
                      height={chart.innerHeight - chart.yScale(chart.yMax)}
                      fill="transparent"
                      className="cursor-pointer"
                      onClick={() => onWaveToggle?.(d.wave)}
                    />
                  ))}
                {/* Green/blue bars — filtered data only; in select mode only selected waves are highlighted */}
                {selectMode
                  ? chart.globalDated.map((d) => {
                      const isSelected = selectedWaves?.includes(d.wave);
                      return (
                        <rect
                          key={`bar-${d.wave}`}
                          x={chart.xScale(d.date) - chart.barWidth / 2}
                          y={chart.yScale(d.participants)}
                          width={chart.barWidth}
                          height={
                            chart.innerHeight - chart.yScale(d.participants)
                          }
                          className={
                            isSelected
                              ? "fill-lmp-green"
                              : "cursor-pointer fill-lmp-gray3 hover:fill-lmp-green/70"
                          }
                          onClick={() => onWaveToggle?.(d.wave)}
                        />
                      );
                    })
                  : chart.dated.map((d) => (
                      <g key={`bar-${d.wave}`} className="group">
                        <rect
                          x={chart.xScale(d.date) - chart.barWidth / 2}
                          y={chart.yScale(d.participants)}
                          width={chart.barWidth}
                          height={
                            chart.innerHeight - chart.yScale(d.participants)
                          }
                          fill="#adde00"
                        />
                        <text
                          x={chart.xScale(d.date)}
                          y={chart.yScale(d.participants) - 5}
                          textAnchor="middle"
                          fontSize={12}
                          fill="#001a3a"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {formatY(d.participants)}
                        </text>
                      </g>
                    ))}

                {/* Y gridlines */}
                {chart.yTicks.map((tick) => (
                  <line
                    key={tick}
                    x1={0}
                    x2={chart.innerWidth}
                    y1={chart.yScale(tick)}
                    y2={chart.yScale(tick)}
                    stroke="#001C42"
                    strokeOpacity={0.5}
                    strokeWidth={0.25}
                  />
                ))}
                {/* Year-change vertical dividers */}
                {chart.yearLines.map((date) => (
                  <line
                    key={date.getTime()}
                    x1={chart.xScale(date) - chart.oneMonthPx / 2}
                    x2={chart.xScale(date) - chart.oneMonthPx / 2}
                    y1={0}
                    y2={chart.innerHeight + MARGIN.bottom - 18}
                    stroke="#001C42"
                    strokeWidth={0.75}
                  />
                ))}

                {/* Wave labels — rotated upward, starting at the bar's bottom edge */}
                {chart.globalDated.map((d) => (
                  <g
                    key={`wl-${d.wave}`}
                    transform={`translate(${chart.xScale(d.date)},${chart.innerHeight})`}
                  >
                    <text
                      dx="0.3em"
                      dy="0.35em"
                      transform="rotate(-90)"
                      textAnchor="start"
                      fontSize={11}
                      fill="#001a3a"
                      className="pointer-events-none"
                    >
                      {d.wave}
                    </text>
                  </g>
                ))}

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
                  <g
                    key={tick}
                    transform={`translate(0,${chart.yScale(tick)})`}
                  >
                    {/* <line x1={-4} x2={0} stroke="#cbd4e2" /> */}
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

                {/* Y axis title — top left, above the plot area */}
                <text
                  x={-MARGIN.left + 2}
                  y={-6}
                  textAnchor="start"
                  fontSize={12}
                  fill="#001a3a"
                >
                  Number of Participants
                </text>

                {/* X axis title — bottom left, below the tick labels */}
                <text
                  x={12}
                  y={chart.innerHeight + MARGIN.bottom - 6}
                  textAnchor="start"
                  fontSize={12}
                  fill="#001a3a"
                  dominantBaseline="middle"
                >
                  Measurement Points
                </text>

                {/* Expand/collapse arrow below Aug 2022 — only shown when daily waves exist */}
                {chart.dailyDated.length > 0 && (
                  <g
                    transform={`translate(${chart.aug2022CenterX}, ${chart.innerHeight + MARGIN.bottom - 10})`}
                    onClick={() => setShowDaily((v) => !v)}
                    className="cursor-pointer"
                  >
                    <circle
                      r={10}
                      className="fill-lmp-gray3 hover:fill-lmp-gray3/70 transition"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={12}
                      fill="#001a3a"
                      className="select-none"
                    >
                      {effectiveShowDaily ? "▲" : "▼"}
                    </text>
                    <text
                      x={16}
                      textAnchor="start"
                      dominantBaseline="central"
                      fontSize={12}
                      fill="#001a3a"
                      className="select-none font-medium"
                    >
                      Daily Diary Study
                    </text>
                  </g>
                )}
              </g>
            </svg>
          )}
        </div>

        {/* Daily waves sub-chart — collapsed by default */}
        {chart && chart.dailyDated.length > 0 && effectiveShowDaily && (
          <div
            style={{
              height: DAILY_HEIGHT,
              width:
                DAILY_MARGIN.left + chart.dailyInnerWidth + DAILY_MARGIN.right,
              marginLeft: chart.dailyMarginLeft,
            }}
          >
            <svg
              width={
                DAILY_MARGIN.left + chart.dailyInnerWidth + DAILY_MARGIN.right
              }
              height={DAILY_HEIGHT}
            >
              <g
                transform={`translate(${DAILY_MARGIN.left},${DAILY_MARGIN.top})`}
              >
                {/* Y gridlines */}
                {chart.dailyYTicks.map((tick) => (
                  <line
                    key={tick}
                    x1={0}
                    x2={chart.dailyInnerWidth}
                    y1={chart.dailyYScale(tick)}
                    y2={chart.dailyYScale(tick)}
                    stroke="#001C42"
                    strokeOpacity={0.5}
                    strokeWidth={0.25}
                  />
                ))}

                {/* Grey background bars — all global daily waves */}
                {chart.dailyDated.map((d) => (
                  <rect
                    key={`dbg-${d.wave}`}
                    x={chart.dailyXScale(d.date) - chart.dailyBarWidth / 2}
                    y={chart.dailyYScale(chart.dailyYMax)}
                    width={chart.dailyBarWidth}
                    height={
                      chart.dailyInnerHeight -
                      chart.dailyYScale(chart.dailyYMax)
                    }
                    fill="#F3F4F8"
                  />
                ))}

                {/* Transparent click targets in select mode */}
                {selectMode &&
                  chart.dailyDated.map((d) => (
                    <rect
                      key={`dhit-${d.wave}`}
                      x={chart.dailyXScale(d.date) - chart.dailyBarWidth / 2}
                      y={chart.dailyYScale(chart.dailyYMax)}
                      width={chart.dailyBarWidth}
                      height={
                        chart.dailyInnerHeight -
                        chart.dailyYScale(chart.dailyYMax)
                      }
                      fill="transparent"
                      className="cursor-pointer"
                      onClick={() => onWaveToggle?.(d.wave)}
                    />
                  ))}

                {/* Colored bars — select mode uses globalDated; normal mode uses filteredDailyDated */}
                {selectMode
                  ? chart.dailyDated.map((d) => {
                      const isSelected = selectedWaves?.includes(d.wave);
                      return (
                        <rect
                          key={`dbar-${d.wave}`}
                          x={
                            chart.dailyXScale(d.date) - chart.dailyBarWidth / 2
                          }
                          y={chart.dailyYScale(d.participants)}
                          width={chart.dailyBarWidth}
                          height={
                            chart.dailyInnerHeight -
                            chart.dailyYScale(d.participants)
                          }
                          className={
                            isSelected
                              ? "fill-lmp-green"
                              : "cursor-pointer fill-lmp-gray3 hover:fill-lmp-green/70"
                          }
                          onClick={() => onWaveToggle?.(d.wave)}
                        />
                      );
                    })
                  : chart.filteredDailyDated.map((d) => (
                      <g key={`dbar-${d.wave}`} className="group">
                        <rect
                          x={
                            chart.dailyXScale(d.date) - chart.dailyBarWidth / 2
                          }
                          y={chart.dailyYScale(d.participants)}
                          width={chart.dailyBarWidth}
                          height={
                            chart.dailyInnerHeight -
                            chart.dailyYScale(d.participants)
                          }
                          fill="#adde00"
                        />
                        <text
                          x={chart.dailyXScale(d.date)}
                          y={chart.dailyYScale(d.participants) - 5}
                          textAnchor="middle"
                          fontSize={12}
                          fill="#001a3a"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {formatY(d.participants)}
                        </text>
                      </g>
                    ))}

                {/* Wave labels — rotated upward */}
                {chart.dailyDated.map((d) => (
                  <g
                    key={`dwl-${d.wave}`}
                    transform={`translate(${chart.dailyXScale(d.date)},${chart.dailyInnerHeight})`}
                  >
                    <text
                      dx="0.3em"
                      dy="0.35em"
                      transform="rotate(-90)"
                      textAnchor="start"
                      fontSize={11}
                      fill="#001a3a"
                      className="pointer-events-none"
                    >
                      {d.wave}
                    </text>
                  </g>
                ))}

                {/* X axis day ticks — every 3 days */}
                {chart.dailyXTicks.map((tick) => (
                  <g
                    key={tick.getTime()}
                    transform={`translate(${chart.dailyXScale(tick)},${chart.dailyInnerHeight})`}
                  >
                    <line y1={0} y2={4} stroke="#001C42" strokeWidth={0.75} />
                    <text
                      y={8}
                      textAnchor="middle"
                      dominantBaseline="hanging"
                      fontSize={14}
                      fill="#001a3a"
                    >
                      {chart.formatDay(tick)}
                    </text>
                  </g>
                ))}

                {/* X axis label */}
                <text
                  x={chart.dailyInnerWidth / 2}
                  y={chart.dailyInnerHeight + DAILY_MARGIN.bottom - 6}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#001a3a"
                  dominantBaseline="middle"
                >
                  August 2022 (Measurement Points of Daily Diary Study)
                </text>

                {/* Y axis title */}
                <text
                  x={-DAILY_MARGIN.left + 2}
                  y={-15}
                  textAnchor="start"
                  fontSize={12}
                  fill="#001a3a"
                >
                  Number of Participants
                </text>

                {/* Y axis tick labels */}
                {chart.dailyYTicks.map((tick) => (
                  <g
                    key={tick}
                    transform={`translate(0,${chart.dailyYScale(tick)})`}
                  >
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
          </div>
        )}
      </div>
    </div>
  );
}
