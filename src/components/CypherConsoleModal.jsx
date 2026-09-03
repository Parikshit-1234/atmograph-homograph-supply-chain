import React, { useState } from "react";
import { X, Database, Play, Code, CheckCircle, Terminal } from "lucide-react";
import { executeCypherQuery } from "../engine/cypherEngine";

export default function CypherConsoleModal({
  isOpen,
  onClose,
  nodes = [],
  edges = [],
  onUpdateNodes
}) {
  const [queryText, setQueryText] = useState("MATCH (n)\nRETURN n.id, n.name, n.type, n.status, n.disruptionScore;");
  const [queryResult, setQueryResult] = useState(null);

  if (!isOpen) return null;

  const handleRunQuery = () => {
    const res = executeCypherQuery(queryText, nodes, edges);
    setQueryResult(res);
  };

  const presetQueries = [
    { label: "Return All Disrupted Nodes", cypher: "MATCH (n) WHERE n.status = 'DISRUPTED' RETURN n;" },
    { label: "Select Global Seaports", cypher: "MATCH (p:Port) RETURN p.id, p.name, p.country, p.status;" },
    { label: "Update Rotterdam Risk", cypher: "MATCH (p:Port {id: 'port_rotterdam'})\nSET p.disruptionScore = 0.85, p.status = 'DISRUPTED'\nRETURN p;" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400">
              <Database size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Neo4j Cypher Database Console</h3>
              <p className="text-[11px] text-slate-400">Execute live Cypher queries against the global supply chain graph</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Console Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Preset Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 font-semibold shrink-0">Sample Cypher Templates:</span>
            {presetQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQueryText(q.cypher);
                  const res = executeCypherQuery(q.cypher, nodes, edges);
                  setQueryResult(res);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 font-mono shrink-0 transition"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Query Input Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Code size={14} className="text-purple-400" />
                Cypher Editor
              </span>
              <button
                onClick={handleRunQuery}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-purple-600/30"
              >
                <Play size={14} />
                <span>Execute Cypher</span>
              </button>
            </div>

            <textarea
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="w-full h-32 bg-slate-950 font-mono text-xs text-purple-200 border border-slate-800 focus:border-purple-500 rounded-xl p-3 focus:outline-none resize-none"
            />
          </div>

          {/* Query Output Result Table */}
          {queryResult && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <Terminal size={14} className="text-emerald-400" />
                  Cypher Execution Output
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {queryResult.executionTimeMs}ms • {queryResult.message}
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] sticky top-0">
                    <tr>
                      {queryResult.columns.map((col, idx) => (
                        <th key={idx} className="p-2.5 border-b border-slate-800 font-semibold">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {queryResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2.5">
                            {typeof cell === "object" ? JSON.stringify(cell) : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
