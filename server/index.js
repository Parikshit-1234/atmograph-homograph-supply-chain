// Express API Server for AtmoGraph Supply Chain Platform
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import neo4j from 'neo4j-driver';

// Import domain engines and mock graph data
import { INITIAL_NODES, INITIAL_EDGES } from '../src/data/mockGraph.js';
import { computeGNNRippleEffect } from '../src/engine/gnnEngine.js';
import { extractEntitiesAndGenerateCypher, HUGGINGFACE_MODEL_METADATA } from '../src/engine/nlpEngine.js';
import { executeCypherQuery } from '../src/engine/cypherEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// In-Memory state fallback
let currentNodes = JSON.parse(JSON.stringify(INITIAL_NODES));
let currentEdges = JSON.parse(JSON.stringify(INITIAL_EDGES));

// Optional Neo4j Driver setup
let neo4jDriver = null;
if (process.env.NEO4J_URI && process.env.NEO4J_USER && process.env.NEO4J_PASSWORD) {
  try {
    neo4jDriver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );
    console.log('[Neo4j] Driver initialized with URI:', process.env.NEO4J_URI);
  } catch (err) {
    console.error('[Neo4j] Failed to initialize driver:', err.message);
  }
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// 1. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AtmoGraph API Backend',
    version: '1.0.0',
    neo4jConnected: !!neo4jDriver,
    timestamp: new Date().toISOString(),
    nlpModel: HUGGINGFACE_MODEL_METADATA
  });
});

// 2. Supply Chain Graph Network State
app.get('/api/graph', (req, res) => {
  res.json({
    success: true,
    nodes: currentNodes,
    edges: currentEdges
  });
});

// 3. GNN Ripple Simulation Endpoint
app.post('/api/gnn/simulate', (req, res) => {
  try {
    const { nodes = currentNodes, edges = currentEdges, timelineDays = 0, reroutedEdges = [] } = req.body;
    const simulationResult = computeGNNRippleEffect(nodes, edges, timelineDays, reroutedEdges);
    
    res.json({
      success: true,
      timelineDays,
      ...simulationResult
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. NLP Breaking News Ingestion & NER Processing
app.post('/api/nlp/parse', (req, res) => {
  try {
    const { headline } = req.body;
    if (!headline) {
      return res.status(400).json({ success: false, error: 'Headline is required' });
    }

    const nlpResult = extractEntitiesAndGenerateCypher(headline, currentNodes);
    res.json({
      success: true,
      headline,
      result: nlpResult
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Neo4j Cypher Query Execution
app.post('/api/cypher', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, error: 'Cypher query string is required' });
  }

  // If connected to a real Neo4j Cloud / Aura DB instance
  if (neo4jDriver) {
    const session = neo4jDriver.session();
    const startTime = Date.now();
    try {
      const result = await session.run(query);
      const executionTime = (Date.now() - startTime).toFixed(2);
      
      const columns = result.records.length > 0 ? result.records[0].keys : [];
      const rows = result.records.map(record => record.toObject());

      return res.json({
        success: true,
        source: 'Neo4j Database',
        columns,
        rows,
        message: `Executed successfully on Neo4j cluster in ${executionTime}ms (${result.records.length} records returned).`,
        executionTime: `${executionTime}ms`
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message, source: 'Neo4j Database' });
    } finally {
      await session.close();
    }
  }

  // In-memory fallback
  try {
    const executionResult = executeCypherQuery(query, currentNodes, currentEdges);
    if (executionResult.updatedNodes) {
      currentNodes = executionResult.updatedNodes;
    }
    return res.json({
      success: true,
      source: 'In-Memory Cypher Engine',
      ...executionResult
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Express Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AtmoGraph API Backend listening on http://0.0.0.0:${PORT}`);
});
