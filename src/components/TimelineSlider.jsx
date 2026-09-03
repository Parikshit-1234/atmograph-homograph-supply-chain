import React, { useEffect, useState } from "react";
import { Play, Pause, Calendar, TrendingUp, AlertTriangle, ShieldCheck, Zap } from "lucide-react";

export default function TimelineSlider({
  timelineDays = 0,
  onChangeTimeline,
  metrics
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onChangeTimeline((prev) => {
          if (prev >= 90) {
            setIsPlaying(false);
            return 90;
          }
          return prev + 30;
        });
      }, 2200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, onChangeTimeline]);

  const steps = [
    { days: 0, label: "Present Day", subtitle: "Immediate Impact" },
    { days: 30, label: "+30 Days", subtitle: "Buffer Depletion" },
    { days: 60, label: "+60 Days", subtitle: "Assembly Stoppage" },
    { days: 90, label: "+90 Days", subtitle: "Global Shortage" }
  ];

  const hasDisruption = metrics && (metrics.disruptedCount > 0 || metrics.warningCount > 0);
  const hasReroute = metrics && metrics.reroutedCount > 0 && metrics.disruptedCount === 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border transition ${
            hasDisruption 
              ? "bg-rose-500/20 border-rose-500/40 text-rose-400" 
              : hasReroute 
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
              : "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
          }`}>
            <Calendar size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm">GNN Predictive Time Horizon</h3>
              {hasDisruption && (
                <span className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-800 text-rose-400 text-[10px] font-extrabold flex items-center gap-1 animate-pulse">
                  <AlertTriangle size={10} />
                  ACTIVE RISK INCOMING
                </span>
              )}
              {hasReroute && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1">
                  <ShieldCheck size={10} />
                  REROUTE SHIELD ACTIVE (+{metrics.reroutedCount})
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Simulate downstream supply chain state 30/60/90 days out</p>
          </div>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition shadow-lg ${
            isPlaying
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
              : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20"
          }`}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          <span>{isPlaying ? "Pause Simulation" : "Auto-Play 90-Day Horizon"}</span>
        </button>
      </div>

      {/* Timeline Controls & Track Line */}
      <div className="relative pt-4 pb-2">
        <div className="w-full h-2.5 bg-slate-800 rounded-full relative overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              hasReroute
                ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"
                : hasDisruption
                ? "bg-gradient-to-r from-rose-500 via-amber-400 to-purple-500"
                : "bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-400"
            }`}
            style={{ width: `${(timelineDays / 90) * 100}%` }}
          />
        </div>

        {/* Timeline Steps with Risk Indicators */}
        <div className="flex justify-between -mt-4 relative z-10">
          {steps.map((step) => {
            const isActive = timelineDays === step.days;
            const isPassed = timelineDays >= step.days;

            // Compute dynamic risk level per step
            let stepRiskBadge = null;
            if (hasReroute) {
              stepRiskBadge = (
                <span className="mt-1 px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-800 text-[9px] font-mono font-bold">
                  🛡️ REROUTED
                </span>
              );
            } else if (hasDisruption) {
              if (step.days === 0) {
                stepRiskBadge = (
                  <span className="mt-1 px-1.5 py-0.5 rounded bg-rose-950/90 text-rose-400 border border-rose-800 text-[9px] font-mono font-bold">
                    🔴 GROUND DISRUPTION
                  </span>
                );
              } else if (step.days === 30) {
                stepRiskBadge = (
                  <span className="mt-1 px-1.5 py-0.5 rounded bg-amber-950/90 text-amber-400 border border-amber-800 text-[9px] font-mono font-bold">
                    ⚠️ BUFFER LOSS
                  </span>
                );
              } else if (step.days === 60) {
                stepRiskBadge = (
                  <span className="mt-1 px-1.5 py-0.5 rounded bg-orange-950/90 text-orange-400 border border-orange-800 text-[9px] font-mono font-bold">
                    ⚡ STOPPAGE
                  </span>
                );
              } else if (step.days === 90) {
                stepRiskBadge = (
                  <span className="mt-1 px-1.5 py-0.5 rounded bg-purple-950/90 text-purple-400 border border-purple-800 text-[9px] font-mono font-bold">
                    💥 GLOBAL SHORTAGE
                  </span>
                );
              }
            }

            return (
              <button
                key={step.days}
                onClick={() => {
                  setIsPlaying(false);
                  onChangeTimeline(step.days);
                }}
                className="flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    isActive
                      ? hasDisruption && !hasReroute
                        ? "bg-slate-900 border-rose-500 scale-125 shadow-[0_0_15px_#f43f5e]"
                        : "bg-slate-900 border-cyan-400 scale-125 shadow-[0_0_15px_#00f2fe]"
                      : isPassed
                      ? hasDisruption && !hasReroute
                        ? "bg-rose-600 border-rose-400 text-white"
                        : "bg-cyan-500 border-cyan-400 text-white"
                      : "bg-slate-900 border-slate-700 text-slate-500"
                  }`}
                >
                  {isActive && <div className={`w-2.5 h-2.5 rounded-full ${hasDisruption && !hasReroute ? "bg-rose-500" : "bg-cyan-400"}`} />}
                </div>

                <div className="mt-2 text-center flex flex-col items-center">
                  <span className={`block text-xs font-bold transition ${isActive ? "text-cyan-400" : "text-slate-300"}`}>
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-500">{step.subtitle}</span>
                  {stepRiskBadge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Banner */}
      {metrics && (
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <TrendingUp size={16} className="text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Predicted Avg Delay:</span>
              <span className="font-bold text-amber-400 text-sm">+{metrics.avgDelayDays} Days</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <AlertTriangle size={16} className={hasDisruption && !hasReroute ? "text-rose-400 shrink-0" : "text-emerald-400 shrink-0"} />
            <div>
              <span className="text-[10px] text-slate-400 block">Network Impacted Nodes:</span>
              <span className={`font-bold text-sm ${hasDisruption && !hasReroute ? "text-rose-400" : "text-emerald-400"}`}>
                {metrics.disruptedCount + metrics.warningCount} High Risk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck size={16} className={hasReroute ? "text-emerald-400 shrink-0" : "text-purple-400 shrink-0"} />
            <div>
              <span className="text-[10px] text-slate-400 block">Reroute Protection Score:</span>
              <span className={`font-bold text-sm ${hasReroute ? "text-emerald-400" : "text-slate-400"}`}>
                {hasReroute ? `+${metrics.reroutedCount} Mitigated (100% Shielded)` : "Baseline (0 Rerouted)"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
