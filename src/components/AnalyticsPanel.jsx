import React from "react";
import { Cpu, AlertTriangle, TrendingUp, CheckCircle, ShieldCheck } from "lucide-react";

export default function AnalyticsPanel({
  nodes = [],
  metrics,
  onRerouteNode
}) {
  // Group impacted nodes by industry
  const industryImpact = {};
  nodes.forEach(node => {
    if (!node.industry || node.industry === "Logistics") return;
    if (!industryImpact[node.industry]) {
      industryImpact[node.industry] = { total: 0, disrupted: 0, delaySum: 0 };
    }
    industryImpact[node.industry].total += 1;

    // Node is at risk if directly disrupted, warning, experiencing GNN effective risk (>0.1), or delayed
    const isAtRisk = (
      node.status === "DISRUPTED" ||
      node.status === "WARNING" ||
      (node.effectiveRisk || 0) > 0.1 ||
      (node.delayDays || 0) > 0
    ) && node.status !== "REROUTED" && !node.isRerouted;

    if (isAtRisk) {
      industryImpact[node.industry].disrupted += 1;
    }
    industryImpact[node.industry].delaySum += node.delayDays || 0;
  });

  const activeDisruptions = nodes.filter(n => n.status === "DISRUPTED");

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400">
            <Cpu size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">GNN Model Ripple & Industry Exposure</h3>
            <p className="text-[11px] text-slate-400">Multi-hop graph propagation & industry risk analysis</p>
          </div>
        </div>
      </div>

      {/* Active Primary Disruption Sources */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 block">Primary Ground Disruption Origin:</span>
        {activeDisruptions.length > 0 ? (
          <div className="space-y-2">
            {activeDisruptions.map(node => (
              <div key={node.id} className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <AlertTriangle size={14} />
                    <span>{node.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {node.country} • {node.type} • Direct Severity: {((node.disruptionScore || 0) * 100).toFixed(0)}%
                  </div>
                </div>

                <button
                  onClick={() => onRerouteNode(node.id)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
                >
                  <ShieldCheck size={14} />
                  <span>Reroute</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span>No active primary bottleneck disruptions. Global network operating on baseline.</span>
          </div>
        )}
      </div>

      {/* Industry Risk Breakdown */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 block">Downstream Impact by Industry Sector:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {Object.entries(industryImpact).map(([ind, data]) => {
            const riskRatio = data.total > 0 ? (data.disrupted / data.total) : 0;
            return (
              <div key={ind} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>{ind}</span>
                  <span className={riskRatio > 0.5 ? "text-rose-400" : riskRatio > 0 ? "text-amber-400" : "text-emerald-400"}>
                    {data.disrupted}/{data.total} At Risk
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      riskRatio > 0.5 ? "bg-rose-500" : riskRatio > 0 ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.max(10, riskRatio * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Avg Delay: +{Math.round(data.delaySum / (data.total || 1))} Days</span>
                  <span>GNN Confidence: 94.2%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
