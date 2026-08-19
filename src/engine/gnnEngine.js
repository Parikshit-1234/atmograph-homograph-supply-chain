// Graph Neural Network (GNN) Ripple Engine for AtmoGraph

/**
 * GNN Multi-Hop Message Passing Algorithm Simulator
 * Computes downstream delays, inventory depletion, and risk scores across nodes
 * over time horizons (0, 30, 60, 90 days).
 */
export function computeGNNRippleEffect(nodes, edges, timelineDays = 0, reroutedEdges = []) {
  // Map of node ID to calculated state
  const nodeMap = new Map();
  
  // Initialize node states
  nodes.forEach(node => {
    nodeMap.set(node.id, {
      ...node,
      gnnLayer0: node.disruptionScore || 0,
      gnnLayer1: 0,
      gnnLayer2: 0,
      gnnLayer3: 0,
      effectiveRisk: node.disruptionScore || 0,
      hopDistance: node.disruptionScore > 0.5 ? 0 : Infinity,
      upstreamSources: [],
      attentionWeights: {},
      isRerouted: false
    });
  });

  // Identify active edges (excluding rerouted/bypassed edges unless replaced)
  const activeEdges = edges.filter(e => !e.isRerouted);

  // --- GNN LAYER 1 PASS: Direct 1-hop Neighbors ---
  activeEdges.forEach(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    if (!sourceNode || !targetNode) return;

    // Weight factor based on edge lead time and capacity dependency
    const weight = Math.min(1.0, (edge.capacityTEU || 2000) / 8000 + 0.4);
    const propagatedRisk = sourceNode.gnnLayer0 * weight * 0.95;

    if (propagatedRisk > 0.05) {
      targetNode.gnnLayer1 = Math.max(targetNode.gnnLayer1, propagatedRisk);
      if (sourceNode.hopDistance + 1 < targetNode.hopDistance) {
        targetNode.hopDistance = sourceNode.hopDistance + 1;
      }
      targetNode.upstreamSources.push({ id: sourceNode.id, name: sourceNode.name, risk: propagatedRisk });
      targetNode.attentionWeights[sourceNode.id] = weight;
    }
  });

  // --- GNN LAYER 2 PASS: 2-Hop Downstream Propagation ---
  activeEdges.forEach(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    if (!sourceNode || !targetNode) return;

    const sourceCombinedRisk = Math.max(sourceNode.gnnLayer0, sourceNode.gnnLayer1);
    const weight = Math.min(1.0, (edge.capacityTEU || 2000) / 8000 + 0.35);
    const propagatedRisk = sourceCombinedRisk * weight * 0.88;

    if (propagatedRisk > 0.05) {
      targetNode.gnnLayer2 = Math.max(targetNode.gnnLayer2, propagatedRisk);
      if (sourceNode.hopDistance + 1 < targetNode.hopDistance) {
        targetNode.hopDistance = sourceNode.hopDistance + 1;
      }
    }
  });

  // --- GNN LAYER 3 PASS: 3-Hop Deep Downstream Propagation ---
  activeEdges.forEach(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    if (!sourceNode || !targetNode) return;

    const sourceCombinedRisk = Math.max(sourceNode.gnnLayer0, sourceNode.gnnLayer1, sourceNode.gnnLayer2);
    const weight = 0.8;
    const propagatedRisk = sourceCombinedRisk * weight;

    if (propagatedRisk > 0.05) {
      targetNode.gnnLayer3 = Math.max(targetNode.gnnLayer3, propagatedRisk);
      if (sourceNode.hopDistance + 1 < targetNode.hopDistance) {
        targetNode.hopDistance = sourceNode.hopDistance + 1;
      }
    }
  });

  // --- TIMELINE REGRESSION & FINAL RISK AGGREGATION ---
  const timelineFactor = timelineDays / 30; // 0, 1, 2, 3 months out

  const updatedNodes = Array.from(nodeMap.values()).map(node => {
    // Aggregated GNN score (ReLU non-linearity + max pooling)
    let aggregatedRisk = Math.max(
      node.gnnLayer0,
      node.gnnLayer1 * 0.95,
      node.gnnLayer2 * 0.9,
      node.gnnLayer3 * 0.85
    );

    // Check direct and upstream reroute/mitigation status
    const isDirectlyRerouted = node.isRerouted || (node.status === "REROUTED");
    const areUpstreamMitigated = node.upstreamSources.length > 0 && node.upstreamSources.every(src => {
      const srcNode = nodeMap.get(src.id);
      return !srcNode || srcNode.status === "REROUTED" || srcNode.isRerouted || srcNode.gnnLayer0 < 0.2;
    });
    const isMitigated = isDirectlyRerouted || areUpstreamMitigated;

    // Apply timeline propagation multiplier: as time progresses, inventory depletes & delays compound
    let dynamicRisk = aggregatedRisk;
    if (isMitigated) {
      dynamicRisk = 0;
    } else if (timelineDays > 0 && aggregatedRisk > 0.05) {
      dynamicRisk = Math.min(1.0, aggregatedRisk * (1 + timelineFactor * 0.6));
    }

    // Calculate Inventory Buffer Depletion
    // Only deplete inventory if there is active, unmitigated risk
    let depletionRate = 0;
    if (!isMitigated && timelineDays > 0 && dynamicRisk > 0.1) {
      depletionRate = timelineDays * (0.35 + dynamicRisk * 0.9);
    }
    const remainingInventoryDays = Math.max(0, Math.round(node.inventoryDays - depletionRate));

    // Calculate Downstream Delay Projection in Days
    let delayDays = 0;
    if (isMitigated) {
      delayDays = 0;
    } else if (node.disruptionScore >= 0.6) {
      // Direct disruption
      delayDays = Math.round(30 * (1 + timelineFactor) * node.disruptionScore);
    } else if (dynamicRisk > 0.1) {
      // Downstream ripple effect
      const hopMult = node.hopDistance === 1 ? 1.2 : node.hopDistance === 2 ? 1.6 : 2.0;
      delayDays = Math.round(15 * dynamicRisk * hopMult * (1 + timelineFactor * 0.7));
    }

    // Status classification
    let status = "NORMAL";
    if (isDirectlyRerouted) {
      status = "REROUTED";
    } else if (node.disruptionScore >= 0.6 && !isDirectlyRerouted) {
      status = "DISRUPTED";
    } else if (!isMitigated && (dynamicRisk >= 0.25 || remainingInventoryDays < 15)) {
      status = "WARNING";
    }

    // Financial Risk Impact ($ Millions)
    const baseVal = node.tier === 1 ? 120 : node.tier === 2 ? 65 : node.type === "Port" ? 300 : 40;
    const financialRisk = Math.round(baseVal * dynamicRisk * (1 + timelineFactor * 0.8));

    return {
      ...node,
      effectiveRisk: Number(dynamicRisk.toFixed(2)),
      remainingInventoryDays,
      delayDays,
      financialRisk,
      status,
      gnnAttention: Number(Math.min(1.0, dynamicRisk * 1.2).toFixed(2))
    };
  });

  // Calculate Edge Risk Highlights
  const updatedEdges = edges.map(edge => {
    const source = updatedNodes.find(n => n.id === edge.source);
    const target = updatedNodes.find(n => n.id === edge.target);

    let riskLevel = "low";
    let isRerouted = edge.isRerouted || false;

    if (source && target) {
      const edgeRisk = Math.max(source.effectiveRisk, target.effectiveRisk);
      if (edgeRisk >= 0.7) riskLevel = "critical";
      else if (edgeRisk >= 0.4) riskLevel = "high";
      else if (edgeRisk >= 0.2) riskLevel = "medium";
    }

    return {
      ...edge,
      riskLevel,
      isRerouted
    };
  });

  // Compute Overall Supply Chain Network Health Metrics
  const totalNodes = updatedNodes.length;
  const disruptedCount = updatedNodes.filter(n => n.status === "DISRUPTED").length;
  const warningCount = updatedNodes.filter(n => n.status === "WARNING").length;
  const reroutedCount = updatedNodes.filter(n => n.status === "REROUTED").length;

  const totalFinancialImpact = updatedNodes.reduce((acc, n) => acc + n.financialRisk, 0);
  const avgDelayDays = Math.round(
    updatedNodes.reduce((acc, n) => acc + n.delayDays, 0) / (totalNodes || 1)
  );

  const healthScore = Math.max(
    0,
    Math.round(100 - (disruptedCount * 18 + warningCount * 8 - reroutedCount * 5))
  );

  return {
    nodes: updatedNodes,
    edges: updatedEdges,
    metrics: {
      healthScore,
      totalNodes,
      disruptedCount,
      warningCount,
      reroutedCount,
      totalFinancialImpact,
      avgDelayDays,
      timelineDays
    }
  };
}
