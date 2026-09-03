import React, { useState, useMemo } from "react";
import HeaderNavbar from "./components/HeaderNavbar";
import GraphCanvas from "./components/GraphCanvas";
import NodeInspectorDrawer from "./components/NodeInspectorDrawer";
import NLPFeedPanel from "./components/NLPFeedPanel";
import TimelineSlider from "./components/TimelineSlider";
import AnalyticsPanel from "./components/AnalyticsPanel";
import CypherConsoleModal from "./components/CypherConsoleModal";

import { INITIAL_NODES, INITIAL_EDGES, PRESET_DISRUPTIONS } from "./data/mockGraph";
import { computeGNNRippleEffect } from "./engine/gnnEngine";

export default function App() {
  // Master Graph State
  const [nodesState, setNodesState] = useState(INITIAL_NODES);
  const [edgesState, setEdgesState] = useState(INITIAL_EDGES);

  // User UI State
  const [timelineDays, setTimelineDays] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [filterRegion, setFilterRegion] = useState("ALL");
  const [filterIndustry, setFilterIndustry] = useState("ALL");
  const [cypherModalOpen, setCypherModalOpen] = useState(false);
  const [reroutedNodeIds, setReroutedNodeIds] = useState(new Set());

  // Execute PyTorch-inspired Graph Neural Network (GNN) Ripple Engine
  const gnnOutput = useMemo(() => {
    return computeGNNRippleEffect(nodesState, edgesState, timelineDays);
  }, [nodesState, edgesState, timelineDays]);

  const { nodes: gnnNodes, edges: gnnEdges, metrics } = gnnOutput;

  // Currently Selected Node Object
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return gnnNodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, gnnNodes]);

  // Handler: Ingest Disruption from NLP Engine
  const handleIngestDisruption = (extractedData) => {
    const { matchedNodeId, disruptionScore } = extractedData;

    // Reset previous rerouted states so the new disruption starts clean
    setReroutedNodeIds(new Set());

    setNodesState(prevNodes =>
      prevNodes.map(node => {
        if (node.id === matchedNodeId) {
          return {
            ...node,
            disruptionScore,
            status: "DISRUPTED",
            isRerouted: false
          };
        }
        return {
          ...node,
          isRerouted: false,
          status: node.status === "REROUTED" ? "NORMAL" : node.status
        };
      })
    );
  };

  // Handler: Execute Proactive Reroute Strategy
  const handleRerouteNode = (nodeId) => {
    const nextRerouted = new Set(reroutedNodeIds);
    const isCurrentlyRerouted = nextRerouted.has(nodeId);

    if (isCurrentlyRerouted) {
      nextRerouted.delete(nodeId);
    } else {
      nextRerouted.add(nodeId);
    }
    setReroutedNodeIds(nextRerouted);

    // Update node status & edges in graph database state
    setNodesState(prevNodes =>
      prevNodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            disruptionScore: isCurrentlyRerouted ? 0.85 : 0.0,
            status: isCurrentlyRerouted ? "DISRUPTED" : "REROUTED",
            isRerouted: !isCurrentlyRerouted
          };
        }
        return node;
      })
    );

    setEdgesState(prevEdges =>
      prevEdges.map(edge => {
        if (edge.source === nodeId || edge.target === nodeId) {
          return {
            ...edge,
            isRerouted: !isCurrentlyRerouted
          };
        }
        return edge;
      })
    );
  };

  // Handler: Reset Graph Baseline
  const handleResetGraph = () => {
    setNodesState(INITIAL_NODES);
    setEdgesState(INITIAL_EDGES);
    setReroutedNodeIds(new Set());
    setTimelineDays(0);
    setSelectedNodeId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar & Telemetry Header */}
      <HeaderNavbar
        metrics={metrics}
        filterRegion={filterRegion}
        setFilterRegion={setFilterRegion}
        filterIndustry={filterIndustry}
        setFilterIndustry={setFilterIndustry}
        onOpenCypherConsole={() => setCypherModalOpen(true)}
        onResetGraph={handleResetGraph}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1920px] mx-auto w-full">
        {/* Left / Center Main Graph Canvas & Timeline Scrubber (Col 8) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex-1 relative min-h-[580px]">
            <GraphCanvas
              nodes={gnnNodes}
              edges={gnnEdges}
              onSelectNode={(node) => setSelectedNodeId(node.id)}
              selectedNodeId={selectedNodeId}
              timelineDays={timelineDays}
              filterRegion={filterRegion}
              filterIndustry={filterIndustry}
            />
          </div>

          <TimelineSlider
            timelineDays={timelineDays}
            onChangeTimeline={setTimelineDays}
            metrics={metrics}
          />
        </section>

        {/* Right Side Control & Analytics Panel (Col 4) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <NLPFeedPanel
            nodes={gnnNodes}
            presets={PRESET_DISRUPTIONS}
            onIngestDisruption={handleIngestDisruption}
          />

          <AnalyticsPanel
            nodes={gnnNodes}
            metrics={metrics}
            onRerouteNode={handleRerouteNode}
          />
        </section>
      </main>

      {/* Slide-Out Node Inspector Drawer */}
      {selectedNode && (
        <NodeInspectorDrawer
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onRerouteNode={handleRerouteNode}
          timelineDays={timelineDays}
        />
      )}

      {/* Neo4j Cypher Studio Modal */}
      <CypherConsoleModal
        isOpen={cypherModalOpen}
        onClose={() => setCypherModalOpen(false)}
        nodes={gnnNodes}
        edges={gnnEdges}
      />
    </div>
  );
}
