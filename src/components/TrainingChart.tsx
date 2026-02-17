import React from "react";
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, Line, DefaultTooltipContent, ReferenceLine, ReferenceArea, Label } from "recharts";
import { histogram, normalCurvePoints } from "../lib/stats";

export function TrainingChart({
  demands,
  meanHat,
  sigmaHat,
  totalDays,
  nTrain = 50,
  weeks = 10,
}: {
  demands: number[];
  meanHat: number;
  sigmaHat: number;
  totalDays: number;
  nTrain?: number;
  weeks?: number;
}) {
  const daysPerWeek = 5;

  // ── Histogram (top chart) ──
  const bins = histogram(demands, 10);
  const curve = normalCurvePoints(meanHat, sigmaHat, bins.minX, bins.maxX, bins.data.length).map(
    (p) => p.y * bins.scaleToHistogram
  );
  const chartData = bins.data.map((b, i) => ({
    ...b,
    curve: curve[i] ?? 0,
  }));

  // ── Time series (bottom chart) ──
  const series = demands.map((d, i) => {
    const day = i + 1;
    const isTraining = i < nTrain;
    return {
      day,
      demand: isTraining ? d : undefined,
      demandRevealed: isTraining ? undefined : d,
    };
  });

  // Bridge: give last training point a demandRevealed value so orange connects from green
  if (nTrain > 0 && nTrain < demands.length) {
    series[nTrain - 1].demandRevealed = demands[nTrain - 1];
  }

  const latestIndex = demands.length - 1;
  const latestDot = (props: any) => {
    const { cx, cy, index } = props;
    if (typeof cx !== "number" || typeof cy !== "number") return <circle r={0} />;
    if (index !== latestIndex) return <circle cx={cx} cy={cy} r={0} />;
    return (
      <g>
        <circle key={`latest-ring-${latestIndex}`} className="latest-dot-ring" cx={cx} cy={cy} r={10} />
        <circle className="latest-dot" cx={cx} cy={cy} r={4} />
      </g>
    );
  };

  // Build phase info — label all expected weeks
  const nRevealed = Math.max(0, demands.length - nTrain);
  const weeksRevealed = Math.ceil(nRevealed / daysPerWeek);
  const weeksToLabel = Math.max(weeksRevealed, weeks);

  const phases: { label: string; x1: number; x2: number }[] = [];
  if (nTrain > 0) {
    phases.push({ label: "Past data", x1: 1, x2: nTrain });
  }
  for (let w = 0; w < weeksToLabel; w++) {
    const start = nTrain + w * daysPerWeek + 1;
    const end = nTrain + (w + 1) * daysPerWeek;
    if (start <= totalDays) {
      phases.push({ label: `Wk ${w + 1}`, x1: start, x2: Math.min(end, totalDays) });
    }
  }

  // ONLY phase midpoints as ticks — no individual day ticks to avoid crowding
  const phaseMidpoints: number[] = phases.map((p) => Math.round((p.x1 + p.x2) / 2));

  // Custom x-axis tick renderer — only shows phase labels
  const PhaseAxisTick = (props: any): React.ReactElement => {
    const { x, y, payload } = props;
    const dayVal = payload?.value;
    if (typeof dayVal !== "number") return <g />;

    const phase = phases.find((p) => Math.round((p.x1 + p.x2) / 2) === dayVal);
    if (phase) {
      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={14} textAnchor="middle" fill="var(--muted)" fontSize={10}>
            {phase.label}
          </text>
        </g>
      );
    }

    return <g />;
  };

  // Week divider lines (between weeks in the game phase)
  const weekDividers: number[] = [];
  for (let w = 1; w < weeksToLabel; w++) {
    weekDividers.push(nTrain + w * daysPerWeek + 0.5);
  }

  // Day tick reference lines within each week (small subtle vertical marks)
  const dayTickLines: number[] = [];
  for (let w = 0; w < weeksToLabel; w++) {
    for (let d = 1; d < daysPerWeek; d++) {
      const dayNum = nTrain + w * daysPerWeek + d + 0.5;
      if (dayNum < totalDays) {
        dayTickLines.push(dayNum);
      }
    }
  }

  // Total observations for histogram tooltip
  const totalObs = demands.length;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column" }}>
      <h2>Demand Data</h2>
      <p className="small">
        Mean: <span className="mono">{meanHat.toFixed(2)}</span> &middot; Std:{" "}
        <span className="mono">{sigmaHat.toFixed(2)}</span> &middot; n={demands.length}
      </p>

      {/* ── Histogram ── */}
      <div style={{ height: 140 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ bottom: 18 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted)" }} interval={0} stroke="var(--border)">
              <Label value="Demand range" position="insideBottom" offset={-12} style={{ fontSize: 11, fill: "var(--muted)" }} />
            </XAxis>
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} stroke="var(--border)">
              <Label value="Frequency" angle={-90} position="insideLeft" style={{ fontSize: 11, fill: "var(--muted)", textAnchor: "middle" }} />
            </YAxis>
            <Tooltip
              contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: "var(--radius-sm)", color: "var(--ink)" }}
              itemStyle={{ color: "var(--ink)" }}
              content={(props) => {
                const payload = props.payload?.filter((p: any) => p?.dataKey !== "curve");
                if (!payload || payload.length === 0) return null;
                const item = payload[0];
                const count = item?.value ?? 0;
                const label = item?.payload?.label ?? "";
                const pct = totalObs > 0 ? ((Number(count) / totalObs) * 100).toFixed(1) : "0";
                return (
                  <div style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px 10px",
                    color: "var(--ink)",
                    fontSize: 12,
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>Demand {label}</div>
                    <div>Frequency: {count} ({pct}%)</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" fill="var(--chart-bar)" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="curve" stroke="var(--chart-line)" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Time series ── */}
      <div style={{ flex: 1, minHeight: 160, marginTop: 8 }}>
        <ResponsiveContainer>
          <ComposedChart data={series} margin={{ bottom: 4 }}>
            <XAxis
              dataKey="day"
              type="number"
              domain={[1, totalDays]}
              tick={PhaseAxisTick}
              ticks={phaseMidpoints}
              allowDataOverflow
              stroke="var(--border)"
              interval={0}
            />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} stroke="var(--border)">
              <Label value="Realized Demand" angle={-90} position="insideLeft" style={{ fontSize: 11, fill: "var(--muted)", textAnchor: "middle" }} />
            </YAxis>
            <Tooltip
              contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: "var(--radius-sm)", color: "var(--ink)" }}
              formatter={(value: any, name: string) => {
                const label = name === "demand" ? "Past data" : "Revealed";
                return [value, label];
              }}
            />
            {/* Subtle background shading */}
            {nTrain > 0 && (
              <ReferenceArea x1={1} x2={nTrain} fill="rgba(76, 175, 80, 0.06)" />
            )}
            {weeksToLabel > 0 && (
              <ReferenceArea x1={nTrain + 1} x2={totalDays} fill="rgba(255, 183, 77, 0.06)" />
            )}
            {/* Strong divider between past data and game data */}
            {nTrain > 0 && nTrain < totalDays && (
              <ReferenceLine x={nTrain} stroke="#aaa" strokeWidth={2} strokeDasharray="8 4" />
            )}
            {/* Dividers between weeks */}
            {weekDividers.map((xVal) => (
              <ReferenceLine key={`wd-${xVal}`} x={xVal} stroke="var(--border)" strokeDasharray="3 3" strokeOpacity={0.6} />
            ))}
            {/* Small day tick marks within weeks */}
            {dayTickLines.map((xVal) => (
              <ReferenceLine key={`dt-${xVal}`} x={xVal} stroke="var(--border)" strokeWidth={0.5} strokeOpacity={0.25} />
            ))}
            {/* Training data in green, DASHED */}
            <Line
              type="monotone"
              dataKey="demand"
              stroke="#66bb6a"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
              name="demand"
            />
            {/* Revealed game data in yellow-orange, SOLID */}
            <Line
              type="monotone"
              dataKey="demandRevealed"
              stroke="var(--chart-line)"
              strokeWidth={2}
              dot={latestDot}
              isAnimationActive={false}
              connectNulls={false}
              name="demandRevealed"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}