import React, { useMemo, useState } from "react";
import type { LeaderboardRow, PlayerDoc } from "../lib/types";

const LEADERBOARD_PAGE_SIZE = 50;

const rankLabels: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

function ordinal(n: number): string {
  if (rankLabels[n]) return rankLabels[n];
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function Leaderboard({ players, rows }: { players?: PlayerDoc[]; rows?: LeaderboardRow[] }) {
  const [showAll, setShowAll] = useState(false);
  const [expandedUid, setExpandedUid] = useState<string | null>(null);

  const computedRows = useMemo(() => {
    if (rows && rows.length) {
      return [...rows].sort((a, b) => b.profit - a.profit);
    }
    const source = players ?? [];
    const enriched = source.map((p) => {
      const orders = (p.ordersByWeek ?? []).filter((x) => typeof x === "number") as number[];
      const avgOrder = orders.length ? orders.reduce((a, b) => a + b, 0) / orders.length : 0;
      return {
        uid: p.uid,
        name: p.name ?? "Anonymous",
        profit: p.cumulativeProfit ?? 0,
        avgOrder,
        ordersByWeek: p.ordersByWeek,
        profitsByWeek: undefined as number[] | undefined,
      };
    });
    enriched.sort((a, b) => b.profit - a.profit);
    return enriched;
  }, [players, rows]);

  const displayedRows = showAll ? computedRows : computedRows.slice(0, LEADERBOARD_PAGE_SIZE);
  const hasMore = computedRows.length > LEADERBOARD_PAGE_SIZE;

  if (computedRows.length === 0) {
    return (
      <div className="card">
        <h2>Leaderboard</h2>
        <p className="small">No players yet.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Leaderboard</h2>
        <span className="badge">{computedRows.length} players</span>
      </div>
      <p className="small">
        Click a row to see per-week breakdown.
        {hasMore && !showAll && ` Showing top ${LEADERBOARD_PAGE_SIZE}.`}
      </p>

      <div className="hr" />
      <div style={{ overflowX: "auto", maxHeight: 600, overflowY: "auto" }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 60 }}>Rank</th>
              <th>Baker</th>
              <th style={{ textAlign: "right" }}>Total Profit</th>
              <th style={{ textAlign: "right" }}>Avg Order</th>
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((r, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const profitColor = r.profit >= 0 ? "var(--success)" : "var(--danger)";
              const isExpanded = expandedUid === r.uid;
              const hasWeekData = r.ordersByWeek && r.ordersByWeek.length > 0;

              return (
                <React.Fragment key={r.uid}>
                  <tr
                    className={isTop3 ? "highlight" : ""}
                    style={{ cursor: hasWeekData ? "pointer" : "default" }}
                    onClick={() => {
                      if (hasWeekData) setExpandedUid(isExpanded ? null : r.uid);
                    }}
                  >
                    <td className="mono" style={{ fontWeight: isTop3 ? 700 : 400 }}>
                      {ordinal(rank)}
                    </td>
                    <td style={{ fontWeight: isTop3 ? 600 : 400 }}>
                      {r.name}
                      {hasWeekData && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: "var(--muted)" }}>
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      )}
                    </td>
                    <td className="mono" style={{ textAlign: "right", color: profitColor, fontWeight: 600 }}>
                      {r.profit >= 0 ? "+" : ""}{r.profit.toFixed(2)}
                    </td>
                    <td className="mono" style={{ textAlign: "right" }}>{r.avgOrder.toFixed(1)}</td>
                  </tr>

                  {isExpanded && hasWeekData && (
                    <tr>
                      <td colSpan={4} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.03)" }}>
                        <table style={{ width: "100%", margin: 0 }}>
                          <thead>
                            <tr>
                              <th style={{ fontSize: 11, padding: "4px 8px" }}>Week</th>
                              <th style={{ fontSize: 11, padding: "4px 8px", textAlign: "right" }}>Order Qty</th>
                              <th style={{ fontSize: 11, padding: "4px 8px", textAlign: "right" }}>Week Profit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(r.ordersByWeek ?? []).map((order, wIdx) => {
                              const weekProfit = r.profitsByWeek?.[wIdx];
                              const wpColor = weekProfit !== undefined
                                ? (weekProfit >= 0 ? "var(--success)" : "var(--danger)")
                                : "var(--muted)";
                              return (
                                <tr key={wIdx}>
                                  <td style={{ fontSize: 12, padding: "3px 8px" }}>Week {wIdx + 1}</td>
                                  <td className="mono" style={{ fontSize: 12, padding: "3px 8px", textAlign: "right" }}>
                                    {order !== null ? order : "—"}
                                  </td>
                                  <td className="mono" style={{ fontSize: 12, padding: "3px 8px", textAlign: "right", color: wpColor }}>
                                    {weekProfit !== undefined
                                      ? (weekProfit >= 0 ? "+" : "") + weekProfit.toFixed(2)
                                      : "—"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button className="btn ghost" onClick={() => setShowAll((s) => !s)}>
            {showAll ? "Show top 50 only" : `Show all ${computedRows.length} players`}
          </button>
        </div>
      )}
    </div>
  );
}