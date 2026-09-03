import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { ZoomIn, ZoomOut, RotateCcw, Filter, Eye, Layers } from "lucide-react";

export default function GraphCanvas({
  nodes = [],
  edges = [],
  onSelectNode,
  selectedNodeId,
  timelineDays = 0,
  filterRegion = "ALL",
  filterIndustry = "ALL"
}) {
  const svgRef = useRef(null);
  const zoomGroupRef = useRef(null);
  const simulationRef = useRef(null);
  const zoomBehaviorRef = useRef(null);

  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Filter nodes & edges based on active filters
  const filteredNodes = nodes.filter(node => {
    if (filterRegion !== "ALL" && node.region !== filterRegion) return false;
    if (filterIndustry !== "ALL" && node.industry !== filterIndustry && node.type !== "Port") return false;
    return true;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = edges.filter(
    e => filteredNodeIds.has(e.source.id || e.source) && filteredNodeIds.has(e.target.id || e.target)
  );

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth || 1000;
    const height = svgRef.current.clientHeight || 650;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Container Group for Zoom/Pan
    const container = svg.append("g").attr("class", "zoom-container");
    zoomGroupRef.current = container;

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Deep clone nodes & links for D3 force simulation
    const simulationNodes = filteredNodes.map(d => ({
      ...d,
      x: d.coords ? d.coords.x : width / 2 + (Math.random() - 0.5) * 400,
      y: d.coords ? d.coords.y : height / 2 + (Math.random() - 0.5) * 300
    }));

    const simulationLinks = filteredEdges.map(d => ({
      ...d,
      source: d.source.id || d.source,
      target: d.target.id || d.target
    }));

    // Define Arrow Marker definitions for edge directionality
    const defs = svg.append("defs");

    // Standard arrow
    defs.append("marker")
      .attr("id", "arrow-normal")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 24)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#00f2fe");

    // Disrupted arrow
    defs.append("marker")
      .attr("id", "arrow-disrupted")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 24)
      .attr("refY", 0)
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#ff0055");

    // Rerouted arrow
    defs.append("marker")
      .attr("id", "arrow-rerouted")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 24)
      .attr("refY", 0)
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#a855f7");

    // Force Simulation Setup
    const simulation = d3.forceSimulation(simulationNodes)
      .force("link", d3.forceLink(simulationLinks).id(d => d.id).distance(140))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    simulationRef.current = simulation;

    // Draw Links (Edges)
    const linkGroup = container.append("g").attr("class", "links");

    const link = linkGroup.selectAll("path")
      .data(simulationLinks)
      .enter()
      .append("path")
      .attr("class", "graph-edge")
      .attr("stroke", d => {
        if (d.isRerouted) return "#a855f7";
        if (d.riskLevel === "critical") return "#ff0055";
        if (d.riskLevel === "high") return "#ffb703";
        return "#00f2fe";
      })
      .attr("stroke-width", d => (d.isRerouted ? 3 : d.riskLevel === "critical" ? 2.5 : 1.5))
      .attr("stroke-dasharray", d => (d.isRerouted ? "6,4" : "none"))
      .attr("stroke-opacity", d => (d.isRerouted ? 0.9 : 0.6))
      .attr("marker-end", d => {
        if (d.isRerouted) return "url(#arrow-rerouted)";
        if (d.riskLevel === "critical") return "url(#arrow-disrupted)";
        return "url(#arrow-normal)";
      });

    // Link Particles (Animated Flow along edges)
    const particleGroup = container.append("g").attr("class", "particles");
    const particles = particleGroup.selectAll("circle")
      .data(simulationLinks.filter(l => !l.isRerouted))
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("fill", d => (d.riskLevel === "critical" ? "#ff0055" : "#00f2fe"))
      .attr("opacity", 0.8);

    // Draw Node Groups
    const nodeGroup = container.append("g").attr("class", "nodes");

    const node = nodeGroup.selectAll("g")
      .data(simulationNodes)
      .enter()
      .append("g")
      .attr("class", "node-group")
      .style("cursor", "pointer")
      .call(
        d3.drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("click", (event, d) => {
        event.stopPropagation();
        onSelectNode(d);
      })
      .on("mouseover", (event, d) => {
        setHoveredNode(d);
        setTooltipPos({ x: event.clientX, y: event.clientY });
      })
      .on("mousemove", (event) => {
        setTooltipPos({ x: event.clientX, y: event.clientY });
      })
      .on("mouseout", () => {
        setHoveredNode(null);
      });

    // Pulsing Aura Ring for Disrupted Nodes
    node.filter(d => d.status === "DISRUPTED")
      .append("circle")
      .attr("r", 28)
      .attr("fill", "none")
      .attr("stroke", "#ff0055")
      .attr("stroke-width", 2)
      .attr("class", "animate-ping")
      .style("opacity", 0.6);

    // Node Circle Outer Border
    node.append("circle")
      .attr("r", d => (d.type === "Port" ? 22 : d.type === "Manufacturer" ? 19 : 16))
      .attr("fill", d => {
        if (d.status === "REROUTED") return "rgba(168, 85, 247, 0.2)";
        if (d.status === "DISRUPTED") return "rgba(255, 0, 85, 0.25)";
        if (d.status === "WARNING") return "rgba(255, 183, 3, 0.2)";
        return "rgba(0, 242, 254, 0.15)";
      })
      .attr("stroke", d => {
        if (d.id === selectedNodeId) return "#ffffff";
        if (d.status === "REROUTED") return "#a855f7";
        if (d.status === "DISRUPTED") return "#ff0055";
        if (d.status === "WARNING") return "#ffb703";
        return "#00f2fe";
      })
      .attr("stroke-width", d => (d.id === selectedNodeId ? 3.5 : 2));

    // Inner Node Icon / Symbol Representation
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#ffffff")
      .attr("font-size", d => (d.type === "Port" ? "13px" : "11px"))
      .attr("font-weight", "bold")
      .text(d => {
        if (d.type === "Port") return "⚓";
        if (d.type === "Supplier") return "🏭";
        if (d.type === "Manufacturer") return "⚙️";
        if (d.type === "DistributionCenter") return "📦";
        if (d.type === "Retailer") return "🛒";
        return "🌐";
      });

    // Node Label Text
    node.append("text")
      .attr("dy", d => (d.type === "Port" ? 34 : 28))
      .attr("text-anchor", "middle")
      .attr("fill", d => (d.id === selectedNodeId ? "#00f2fe" : "#e2e8f0"))
      .attr("font-size", "11px")
      .attr("font-weight", d => (d.id === selectedNodeId ? "bold" : "500"))
      .attr("class", "pointer-events-none drop-shadow")
      .text(d => (d.name.length > 20 ? d.name.substring(0, 18) + "..." : d.name));

    // Node Delay Badge (if delayed)
    node.filter(d => d.delayDays > 0)
      .append("rect")
      .attr("x", 12)
      .attr("y", -22)
      .attr("width", 42)
      .attr("height", 16)
      .attr("rx", 8)
      .attr("fill", d => (d.status === "DISRUPTED" ? "#ff0055" : "#ffb703"))
      .attr("opacity", 0.9);

    node.filter(d => d.delayDays > 0)
      .append("text")
      .attr("x", 33)
      .attr("y", -11)
      .attr("text-anchor", "middle")
      .attr("fill", "#000000")
      .attr("font-size", "9px")
      .attr("font-weight", "800")
      .text(d => `+${d.delayDays}d`);

    // Simulation Tick Listener
    let particleProgress = 0;
    simulation.on("tick", () => {
      // Update link paths
      link.attr("d", d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      // Update node positions
      node.attr("transform", d => `translate(${d.x},${d.y})`);

      // Animate edge particles along path curves
      particleProgress = (particleProgress + 0.008) % 1;
      particles.attr("cx", d => d.source.x + (d.target.x - d.source.x) * particleProgress)
        .attr("cy", d => d.source.y + (d.target.y - d.source.y) * particleProgress);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredEdges, selectedNodeId, timelineDays]);

  // Zoom control handlers
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[620px] bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Network Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/90 border border-slate-700/60 rounded-xl p-1.5 shadow-lg backdrop-blur-md">
        <button
          onClick={handleZoomIn}
          className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
          title="Reset Camera"
        >
          <RotateCcw size={18} />
        </button>

        <div className="h-5 w-px bg-slate-700 mx-1" />

        <div className="flex items-center gap-2 text-xs font-semibold px-2 text-slate-300">
          <Layers size={14} className="text-cyan-400" />
          <span>{filteredNodes.length} Nodes</span>
          <span className="text-slate-500">•</span>
          <span>{filteredEdges.length} Routes</span>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 border border-slate-700/60 rounded-xl p-3 shadow-lg text-xs space-y-2 backdrop-blur-md">
        <div className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
          <span>GNN Risk Overlay</span>
          <span className="text-[10px] text-cyan-400 font-normal">Day {timelineDays} Horizon</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
            <span>Nominal Operation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#ffb703]" />
            <span>Elevated Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#ff0055]" />
            <span>Severe Disruption</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
            <span>Rerouted Route</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Render */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Node Hover Tooltip */}
      {hoveredNode && (
        <div
          className="fixed z-50 pointer-events-none bg-slate-900/95 border border-slate-700 text-white rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]"
          style={{
            left: `${tooltipPos.x + 15}px`,
            top: `${tooltipPos.y + 15}px`
          }}
        >
          <div className="font-bold text-sm text-cyan-400 flex items-center justify-between">
            <span>{hoveredNode.name}</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
              {hoveredNode.type}
            </span>
          </div>
          <div className="text-slate-400">
            {hoveredNode.country} ({hoveredNode.region}) • {hoveredNode.industry}
          </div>

          <div className="pt-1.5 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block">GNN Risk Score</span>
              <span className={`font-bold ${hoveredNode.effectiveRisk > 0.6 ? 'text-rose-400' : hoveredNode.effectiveRisk > 0.3 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {(hoveredNode.effectiveRisk * 100).toFixed(0)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Downstream Delay</span>
              <span className={`font-bold ${hoveredNode.delayDays > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                +{hoveredNode.delayDays} Days
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
