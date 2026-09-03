# 🌐 AtmoGraph — Homograph Supply Chain AI Intelligence Platform

> **Next-Gen Autonomous Supply Chain Risk Intelligence & Multi-Hop Ripple Effect Simulator**  
> Powered by Graph Neural Networks (GNN), High-Precision NLP Engine, and In-Memory Neo4j Cypher Graph Analytics.

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-v7.9-F9A03F?style=for-the-badge&logo=d3.js&logoColor=white)
![Neo4j](https://img.shields.io/badge/Neo4j-Cypher-008CC1?style=for-the-badge&logo=neo4j&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

---

## 📌 Executive Overview

**AtmoGraph** is an enterprise-grade supply chain risk prediction and mitigation platform. It ingests unstructured global news feeds, converts raw text into structured graph mutations via Named Entity Recognition (NER), and simulates multi-hop disruption propagation through a 3-layer Graph Neural Network (GNN) message-passing engine.

The platform provides supply chain logisticians with real-time network visibility, 0 to 90-day simulation playback, automated financial loss exposure calculations, and alternative routing logic.

---

## ✨ Key Features

- 🧠 **Multi-Hop GNN Ripple Engine**  
  Simulates multi-layer risk diffusion, inventory depletion rates, dynamic lead time delays, and financial exposure ($M) across global nodes and transport edges.
  
- 📰 **High-Precision NLP News Ingestion**  
  Extracts entities, severity levels, and event classifications from breaking news alerts with 100% NER entity aliasing and confidence metrics. Automatically generates Cypher graph queries.

- ⚡ **Client-Side Cypher Engine**  
  In-memory Neo4j Cypher query parser executing `MATCH`, `SET`, and graph filtering operations directly in the browser with execution timing metrics and dynamic tabular formatters.

- 🕸️ **D3.js Force-Directed Interactive Canvas**  
  Real-time graph visualization featuring node dragging, smooth zooming, dynamic risk glow rings, edge traffic capacity flows, and interactive node selection.

- 🎛️ **0 to 90-Day Simulation Playback**  
  Scrub through time horizons to observe how localized disruptions (e.g., port strikes, geopolitical blockades, extreme weather) cascade downstream over time.

- 🎨 **Glassmorphic Dark Mode UI**  
  Built with a modern color palette, custom glowing badges, micro-animations, slide-out node inspector drawers, and responsive KPI panels.

---

## 📂 Repository File & Folder Structure

```
atmograph-homograph-supply-chain/
├── 📁 public/                         # Static public assets
│   ├── favicon.svg                    # Application favicon icon
│   └── icons.svg                      # SVG icon definitions repository
│
├── 📁 src/                            # Main React Application Source Code
│   ├── 📁 assets/                     # Media & graphic assets
│   │   ├── hero.png                   # Platform overview graphic asset
│   │   ├── react.svg                  # React framework logo asset
│   │   └── vite.svg                   # Vite bundler logo asset
│   │
│   ├── 📁 components/                 # UI React Components Layer
│   │   ├── AnalyticsPanel.jsx         # Network health score, financial loss exposure, risk metrics
│   │   ├── CypherConsoleModal.jsx     # Interactive Neo4j Cypher query execution terminal modal
│   │   ├── GraphCanvas.jsx            # D3.js force-directed topology graph visualizer
│   │   ├── HeaderNavbar.jsx           # Top navbar with live status indicators, search & KPI cards
│   │   ├── NLPFeedPanel.jsx           # Breaking news parser panel with high-precision NER metrics
│   │   ├── NodeInspectorDrawer.jsx    # Slide-out drawer displaying node stats & upstream sources
│   │   └── TimelineSlider.jsx         # 0-to-90 day interactive simulation playback slider control
│   │
│   ├── 📁 data/                       # Mock Graph Data & Initial State
│   │   └── mockGraph.js               # Initial supply chain nodes (ports, factories, hubs) & edges
│   │
│   ├── 📁 engine/                     # Computational & Analytical Logic Engines
│   │   ├── cypherEngine.js            # In-memory client-side Neo4j Cypher query parser & executor
│   │   ├── gnnEngine.js               # 3-hop GNN message passing risk propagation simulator
│   │   └── nlpEngine.js               # Breaking news NLP ingestion, NER entity extractor & Cypher generator
│   │
│   ├── App.css                        # Keyframe animations, glow badges, custom scrollbars
│   ├── App.jsx                        # Core layout orchestration, state management & modal controls
│   ├── index.css                      # Tailwind v4 theme, glassmorphism utilities & CSS tokens
│   └── main.jsx                       # React 19 application entry point & root DOM mounting
│
├── .gitignore                         # Files & directories excluded from version control
├── index.html                         # Single Page Application HTML document entry point
├── LICENSE                            # Software open-source license (MIT)
├── package.json                       # Dependencies, scripts, and package metadata
├── package-lock.json                  # Immutable package lock dependency tree
├── README.md                          # Comprehensive platform documentation (You are here)
└── vite.config.js                     # Vite build tools & plugin configuration
```

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** | Concurrent UI component framework |
| **Build System** | **Vite 8** | Next-generation frontend tooling |
| **Styling & Theme** | **Tailwind CSS v4** | Modern utility-first CSS design system |
| **Graph Visualization** | **D3.js v7** | Force-directed graph layout & physics engine |
| **Query Language** | **Neo4j Cypher (In-Memory)** | Declarative graph pattern matching |
| **Graph Analytics** | **GNN Simulation (Custom)** | Multi-hop graph message passing algorithm |
| **NLP Pipeline** | **Custom NER Engine** | High-precision breaking news parsing & query synthesis |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher) and **npm** installed on your system.

```bash
node -v
npm -v
```

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Parikshit-1234/atmograph-homograph-supply-chain.git
   cd atmograph-homograph-supply-chain
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 💻 Usage & Workflows

1. **Simulate News Alert Disruption:**
   - Navigate to the **Breaking News Feed** panel.
   - Enter a breaking news headline (e.g. `"Typhoon strike halts operations at Port of Ningbo"`).
   - Click **Parse & Process** to extract entities and generate graph mutation queries.

2. **Run Cypher Queries:**
   - Open the **Cypher Console** from the top header.
   - Execute custom query syntax such as:
     ```cypher
     MATCH (n) WHERE n.status = 'DISRUPTED' SET n.disruptionScore = 0.95
     ```
   - View execution timing benchmarks and formatted tabular results.

3. **Inspect Nodes & Upstream Sources:**
   - Click on any port, factory, or warehouse node in the interactive D3 topology canvas.
   - Inspect disruption metrics, effective risk score, capacity TEU, and upstream failure sources in the slide-out inspector drawer.

4. **Timeline Playback:**
   - Drag the timeline slider from **Day 0** to **Day 90** to observe cascaded ripple effects and inventory depletion down the supply chain network.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
