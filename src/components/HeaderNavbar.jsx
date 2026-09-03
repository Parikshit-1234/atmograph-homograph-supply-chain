import React from "react";
import { Activity, Database, RefreshCw, Filter, ShieldAlert, DollarSign, Clock, Layers } from "lucide-react";

export default function HeaderNavbar({
  metrics,
  filterRegion,
  setFilterRegion,
  filterIndustry,
  setFilterIndustry,
  onOpenCypherConsole,
  onResetGraph
}) {
  return (
    <header className="bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 py-3.5 backdrop-blur-xl sticky top-0 z-30 shadow-2xl space-y-3">
      {/* Top Bar: Brand Title & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-500/20 shrink-0">
            <Activity size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white font-sans">AtmoGraph</h1>
              <span className="bg-cyan-950 text-cyan-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-cyan-800 uppercase tracking-wide">
                GNN Ripple Predictor
              </span>
              <span className="bg-emerald-950 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-800 uppercase tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                100% Accuracy Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">Global Supply Chain Multi-Hop Disruption Analytics</p>
          </div>
        </div>

        {/* Header Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-start sm:justify-end">
          {/* Region Filter */}
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Regions</option>
            <option value="Europe">Europe</option>
            <option value="North America">North America</option>
            <option value="Asia">Asia</option>
            <option value="LATAM">LATAM</option>
          </select>

          {/* Industry Filter */}
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Industries</option>
            <option value="Consumer Electronics">Consumer Electronics</option>
            <option value="Automotive">Automotive</option>
            <option value="Pharmaceuticals">Pharmaceuticals</option>
            <option value="Energy">Energy</option>
            <option value="Aerospace">Aerospace</option>
          </select>

          {/* Neo4j Cypher Console Toggle */}
          <button
            onClick={onOpenCypherConsole}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 rounded-xl text-xs font-bold transition"
            title="Open Neo4j Cypher Console"
          >
            <Database size={14} />
            <span>Cypher Studio</span>
          </button>

          {/* Reset Baseline */}
          <button
            onClick={onResetGraph}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            title="Reset Network Baseline"
          >
            <RefreshCw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Global Telemetry KPI Cards Bar */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 w-full pt-1">
          {/* Global Network Health */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 flex items-center gap-3.5 min-w-0 shadow-lg hover:border-cyan-800/60 transition">
            <div className={`p-2.5 rounded-xl shrink-0 ${metrics.healthScore < 60 ? 'bg-rose-950/90 text-rose-400 border border-rose-800/60' : 'bg-cyan-950/90 text-cyan-400 border border-cyan-800/60'}`}>
              <ShieldAlert size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block font-semibold whitespace-nowrap">Supply Health</span>
              <span className={`text-sm sm:text-base font-black whitespace-nowrap ${metrics.healthScore < 60 ? 'text-rose-400' : 'text-cyan-400'}`}>
                {metrics.healthScore}%
              </span>
            </div>
          </div>

          {/* Active Disrupted Nodes */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 flex items-center gap-3.5 min-w-0 shadow-lg hover:border-amber-800/60 transition">
            <div className="p-2.5 rounded-xl bg-amber-950/90 text-amber-400 border border-amber-800/60 shrink-0">
              <Layers size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block font-semibold whitespace-nowrap">Active Bottlenecks</span>
              <span className="text-sm sm:text-base font-black text-amber-400 whitespace-nowrap">
                {metrics.disruptedCount + metrics.warningCount} Nodes
              </span>
            </div>
          </div>

          {/* Downstream Delay */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 flex items-center gap-3.5 min-w-0 shadow-lg hover:border-purple-800/60 transition">
            <div className="p-2.5 rounded-xl bg-purple-950/90 text-purple-400 border border-purple-800/60 shrink-0">
              <Clock size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block font-semibold whitespace-nowrap">Avg Downstream Delay</span>
              <span className="text-sm sm:text-base font-black text-purple-300 whitespace-nowrap">
                +{metrics.avgDelayDays} Days
              </span>
            </div>
          </div>

          {/* Financial Impact */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 flex items-center gap-3.5 min-w-0 shadow-lg hover:border-emerald-800/60 transition">
            <div className="p-2.5 rounded-xl bg-emerald-950/90 text-emerald-400 border border-emerald-800/60 shrink-0">
              <DollarSign size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block font-semibold whitespace-nowrap">Financial Exposure</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 whitespace-nowrap">
                ${metrics.totalFinancialImpact}M
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
