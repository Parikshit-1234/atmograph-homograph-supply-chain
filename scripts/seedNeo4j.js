// Seeding script to populate Neo4j database with AtmoGraph supply chain nodes and edges
import dotenv from 'dotenv';
import neo4j from 'neo4j-driver';
import { INITIAL_NODES, INITIAL_EDGES } from '../src/data/mockGraph.js';

dotenv.config();

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD;

if (!uri || !password) {
  console.error('❌ Error: NEO4J_URI and NEO4J_PASSWORD environment variables must be defined in your .env file.');
  process.exit(1);
}

console.log(`Connecting to Neo4j database at ${uri}...`);
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function seedDatabase() {
  const session = driver.session();
  try {
    console.log('Clearing old data and creating constraints...');
    // Create uniqueness constraint on node ID
    await session.run(`CREATE CONSTRAINT node_id_unique IF NOT EXISTS FOR (n:SupplyChainNode) REQUIRE n.id IS UNIQUE;`);

    // Seed Nodes
    console.log(`Seeding ${INITIAL_NODES.length} supply chain nodes...`);
    for (const node of INITIAL_NODES) {
      const cypher = `
        MERGE (n:SupplyChainNode {id: $id})
        SET n.name = $name,
            n.type = $type,
            n.region = $region,
            n.country = $country,
            n.industry = $industry,
            n.tier = $tier,
            n.baseCapacity = $baseCapacity,
            n.currentCapacity = $currentCapacity,
            n.disruptionScore = $disruptionScore,
            n.status = $status,
            n.inventoryDays = $inventoryDays,
            n.delayDays = $delayDays,
            n.financialRisk = $financialRisk,
            n.description = $description,
            n.lat = $lat,
            n.lng = $lng
      `;
      await session.run(cypher, node);
    }

    // Seed Edges
    console.log(`Seeding ${INITIAL_EDGES.length} transport edges...`);
    for (const edge of INITIAL_EDGES) {
      const cypher = `
        MATCH (source:SupplyChainNode {id: $sourceId})
        MATCH (target:SupplyChainNode {id: $targetId})
        MERGE (source)-[r:CONNECTED_TO {id: $edgeId}]->(target)
        SET r.transportMode = $transportMode,
            r.leadTimeDays = $leadTimeDays,
            r.capacityTEU = $capacityTEU,
            r.status = $status
      `;
      await session.run(cypher, {
        sourceId: edge.source,
        targetId: edge.target,
        edgeId: edge.id,
        transportMode: edge.transportMode || 'Maritime',
        leadTimeDays: edge.leadTimeDays || 10,
        capacityTEU: edge.capacityTEU || 5000,
        status: edge.status || 'ACTIVE'
      });
    }

    console.log('✅ Success! Neo4j supply chain graph network successfully seeded!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedDatabase();
