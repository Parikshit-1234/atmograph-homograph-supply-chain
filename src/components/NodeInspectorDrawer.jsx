import React from "react";
import { X, AlertTriangle, ShieldCheck, ArrowRight, Activity, DollarSign, Clock, GitBranch, RefreshCw, Cpu, Layers } from "lucide-react";

export default function NodeInspectorDrawer({
  node,
  onClose,
  onRerouteNode,
  timelineDays = 0
}) {
  if (!node) return null;

  const isDisrupted = node.status === "DISRUPTED";
  const isWarning = node.status === "WARNING";
  const isRerouted = node.status === "REROUTED";

  return (
    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900/95 border-l border-slate-800/90 shadow-2xl z-40 backdrop-blur-xl flex flex-col transition-all duration-300 transform translate-x-0">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
              isRerouted ? 'bg-purple-950/80 text-purple-400 border border-purple-800' :
              isDisrupted ? 'bg-rose-950/80 text-rose-400 border border-rose-800' :
              isWarning ? 'bg-amber-950/80 text-amber-400 border border-amber-800' :
              'bg-cyan-950/80 text-cyan-400 border border-cyan-800'
            }`}>
              {node.status}
            </span>
            <span className="text-xs text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
              Tier {node.tier || 0} {node.type}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white leading-snug">{node.name}</h2>
          <p className="text-xs text-slate-400">{node.country} ({node.region}) • {node.industry}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Node Overview Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">{node.description}</p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Clock size={14} className="text-amber-400" />
                <span>Predicted Delay</span>
              </div>
              <div className="text-lg font-black text-white">
                +{node.delayDays || 0} Days
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Day {timelineDays} Horizon</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <DollarSign size={14} className="text-rose-400" />
                <span>Financial Impact</span>
              </div>
              <div className="text-lg font-black text-white">
                ${node.financialRisk || 0}M
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Estimated Revenue At Risk</div>
            </div>
          </div>
        </div>

        {/* Proactive Action Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-purple-950/40 border border-cyan-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
              <ShieldCheck size={18} />
              <span>Proactive Reroute Strategy</span>
            </div>
            {isRerouted && (
              <span className="text-[10px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full font-semibold">
                Reroute Active
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {isRerouted
              ? "Strategic supply bypass has been applied. Cargo is actively rerouted around bottleneck nodes, mitigating downstream delay by up to 80%."
              : "Instantly reconfigure supply paths in Neo4j and recalculate Graph Neural Network risk vectors to bypass bottlenecks."}
          </p>

          <button
            onClick={() => onRerouteNode(node.id)}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
              isRerouted
                ? "bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-700/50"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25"
            }`}
          >
            <RefreshCw size={14} className={isRerouted ? "" : "animate-spin-slow"} />
            <span>{isRerouted ? "Reset Rerouted Supply Line" : "Execute Proactive Reroute"}</span>
          </button>
        </div>

        {/* GNN Math & Explainability Tensor Matrix */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Cpu size={16} className="text-purple-400" />
            <span>GNN Feature Vector & Attention</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>GNN Node Risk Feature ($h_v^{(3)}$)</span>
                <span className="font-mono text-cyan-400">{((node.effectiveRisk || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    node.effectiveRisk > 0.6 ? "bg-rose-500" : node.effectiveRisk > 0.3 ? "bg-amber-400" : "bg-cyan-400"
                  }`}
                  style={{ width: `${Math.min(100, (node.effectiveRisk || 0) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Remaining Inventory Buffer</span>
                <span className="font-mono text-amber-400">{node.remainingInventoryDays || 0} Days</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((node.remainingInventoryDays || 0) / (node.inventoryDays || 60)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Hop Upstream Influences */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <GitBranch size={16} className="text-cyan-400" />
            <span>Multi-Hop Ripple Dependency</span>
          </div>

          {node.upstreamSources && node.upstreamSources.length > 0 ? (
            <div className="space-y-2 text-xs">
              {node.upstreamSources.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-400" />
                    <span className="font-semibold text-slate-200">{source.name}</span>
                  </div>
                  <span className="text-rose-400 font-mono font-bold">
                    +{(source.risk * 100).toFixed(0)}% Risk
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic">
              No upstream bottleneck direct dependencies detected. Node operating on nominal supply baseline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
