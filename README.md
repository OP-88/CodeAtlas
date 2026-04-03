<div align="center">
  <img src="ui/public/codeatlas_icon.png" alt="CodeAtlas Logo" width="160" />

  # CodeAtlas v2.0
  **Multi-Modal Code Cartography & Diagnostic Engine**
  
  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
  [![Electron](https://img.shields.io/badge/Electron-Latest-47848F.svg)](https://www.electronjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688.svg)](https://fastapi.tiangolo.com/)
  [![Zustand](https://img.shields.io/badge/Zustand-State-black.svg)](https://github.com/pmndrs/zustand)
</div>

<br />

CodeAtlas is an enterprise-grade forensic workbench and architectural modeling tool. It bridges the gap between high-level system architecture design and raw component execution. 

Unlike traditional drawing boards, CodeAtlas is a *living* environment. You drag and drop system components (databases, APIs, load balancers, client apps) onto a cartography board, write the actual execution code inside an integrated Monaco IDE, and spawn native sub-shells to execute and evaluate your multi-node architecture in real-time.

---

## 🚀 Key Features

### 🗺️ Multi-Modal Cartography Board
CodeAtlas operates across specialized viewing modes to handle different layers of system abstraction:
- **Recon Map:** The primary architecture playground. Drag over 150+ components from the collapsible sidebar, define network edges, and build complex topologies. Double-click any module in the library to instantly spawn it at center stage.
- **Deconstructor & Simulator:** Use the contextual `Send to...` pivot menu to isolate components and evaluate heuristic safety rules against deterministic structural graphs.

### 💻 Integrated IDE & Terminal
- **Monaco Engine:** Write logic for any node seamlessly. The IDE features language automatic detection based on the node context (Python, TypeScript, SQL, Dockerfile, etc.) and exposes native VS Code formatting and inline AST validation.
- **Native PTY Shell:** Fully interactive `node-pty` terminal built right into the inspector. Spin up servers, query databases, or analyze logs right next to your code, rather than switching to an external terminal.

### 💾 File-System Native Workspaces ( `.catlas` )
CodeAtlas mimics heavy-duty IDEs like VS Code or Burp Suite. Workspaces aren't cached in volatile local storage—they are serialized to dedicated `.catlas` files. 
- Fully portable JSON topography objects.
- Comprehensive native window File menus (New, Open, Save, Save As...).
- Workload recovery and "unsaved modifications" tracking.
- Sleek welcome screen dashboard tracking your most recent sessions.

## 🛠️ Technology Stack

CodeAtlas leverages a decoupled native-web integration pattern:
- **Frontend Container:** Electron bridging a local Node.js environment with native OS bindings.
- **Renderer UI:** React 18 powered by Vite, utilizing `@xyflow/react` for hyper-performant WebGL-accelerated node layouts.
- **State Backbone:** Zustand controls all asynchronous data operations across tabs seamlessly tracking cross-tab pivots.
- **Diagnostic Backend:** A local WebSocket-driven Python server running FastAPI and `networkx`, evaluating deterministic heuristic conditions against your active payload graph.

## ⚙️ Getting Started

### Prerequisites
- Node.js > 18.x
- Python 3.10+
- `node-gyp` dependencies (build-essential, python3-dev) for PTY compilation.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/OP-88/CodeAtlas.git
   cd CodeAtlas
   ```

2. **Setup the Python Engine:**
   ```bash
   cd engine
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Install UI/Electron Dependencies:**
   ```bash
   cd ../ui
   npm install
   # Rebuild native modules for Electron (required for node-pty)
   npm run postinstall 
   ```

4. **Launch the Engine & App:**
   From the project root:
   ```bash
   ./start.sh
   # or individually:
   # python3 engine/main.py (Backend)
   # npm run dev (in ui/ for Frontend)
   ```

## 🔒 Security Configuration
CodeAtlas is designed as a local diagnostic engine. To prevent inadvertent LAN or WAN exposure during forensic workloads, the Python engine is strictly bound to `127.0.0.1` and CORS is explicitly whitelisted to authorized Electron ports only. Be mindful of raw execution scripts within the integrated terminal if assessing hostile code.

---
<div align="center">
  <i>Developed for advanced architectural simulation and vulnerability cartography.</i>
</div>
