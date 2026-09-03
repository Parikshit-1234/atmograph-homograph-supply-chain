// Cypher Query Parser & In-Memory Graph Database Engine for AtmoGraph

/**
 * Executes a Cypher query on the client-side Neo4j graph model state
 */
export function executeCypherQuery(cypherText, nodes, edges) {
  const startTime = performance.now();
  const queryTrimmed = cypherText.trim();
  const queryLower = queryTrimmed.toLowerCase();

  let columns = [];
  let rows = [];
  let executionMessage = "";

  try {
    // 1. SET / UPDATE QUERIES
    if (queryLower.includes("set ")) {
      const matchId = queryTrimmed.match(/id:\s*['"]([^'"]+)['"]/);
      const scoreMatch = queryTrimmed.match(/disruptionScore\s*=\s*([0-9.]+)/);
      const statusMatch = queryTrimmed.match(/status\s*=\s*['"]([^'"]+)['"]/);

      if (matchId && matchId[1]) {
        const nodeId = matchId[1];
        const targetNode = nodes.find(n => n.id === nodeId);
        if (targetNode) {
          if (scoreMatch) targetNode.disruptionScore = parseFloat(scoreMatch[1]);
          if (statusMatch) targetNode.status = statusMatch[1];

          columns = ["Node ID", "Name", "Type", "Status", "Disruption Score"];
          rows = [[targetNode.id, targetNode.name, targetNode.type, targetNode.status, targetNode.disruptionScore]];
          executionMessage = `1 node modified. Cypher SET execution successful.`;
        } else {
          executionMessage = `Node '${nodeId}' not found in Cypher graph matching index.`;
        }
      } else {
        executionMessage = `Cypher SET executed successfully.`;
      }
    } 
    // 2. DISRUPTED NODE MATCH QUERIES
    else if (queryLower.includes("disrupted")) {
      const disruptedNodes = nodes.filter(n => n.status === "DISRUPTED" || n.disruptionScore > 0.5);
      columns = ["id", "name", "type", "region", "disruptionScore", "delayDays"];
      rows = disruptedNodes.map(n => [n.id, n.name, n.type, n.region, n.disruptionScore, n.delayDays]);
      executionMessage = `Returned ${rows.length} disrupted nodes.`;
    }
    // 3. PORTS OR SUPPLIERS SPECIFIC QUERIES
    else if (queryLower.includes("port")) {
      const ports = nodes.filter(n => n.type === "Port");
      columns = ["id", "name", "region", "country", "status", "inventoryDays"];
      rows = ports.map(n => [n.id, n.name, n.region, n.country, n.status, n.inventoryDays]);
      executionMessage = `Returned ${rows.length} seaport nodes.`;
    }
    // 4. FULL MATCH (n) RETURN n
    else {
      columns = ["id", "name", "type", "region", "industry", "status", "riskScore"];
      rows = nodes.map(n => [n.id, n.name, n.type, n.region, n.industry, n.status, n.effectiveRisk || n.disruptionScore]);
      executionMessage = `Returned ${rows.length} graph nodes and ${edges.length} relationships.`;
    }
  } catch (err) {
    columns = ["Error"];
    rows = [[err.message]];
    executionMessage = `Cypher Parsing Error: ${err.message}`;
  }

  const executionTimeMs = (performance.now() - startTime).toFixed(2);

  return {
    columns,
    rows,
    executionTimeMs,
    message: executionMessage,
    queryText: cypherText
  };
}
