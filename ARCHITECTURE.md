# CodeAtlas - Architecture & Local Setup

**Version**: 0.1.0-alpha
**Author**: OP-88

## Executive Summary
CodeAtlas is a local-first static analysis simulator and architectural graphing tool. It prevents "vibe coding" by mapping project architecture continuously using Tree-sitter and NetworkX, and rendering it locally via an offline React Flow canvas inside an Electron wrapper.

## System Design (Hub and Spoke)

### 1. The Engine (Python Backend)
Location: `engine/`
- **Main App (`main.py`)**: Uses FastAPI with a WebSocket `/ws` endpoint to stream graph states continuously.
- **Graph Manager (`graph_manager.py`)**: Stores the unified Code Property Graph (CPG) using NetworkX and exports it as Cytoscape JSON.
- **Parser (`parser.py`)**: Uses Tree-sitter's Island Parsing capability and `.scm` queries to resiliently map source files, even when syntax is broken.

### 2. The Face (React Flow + Electron)
Location: `ui/`
- A Vite+React application using `@xyflow/react` for the "Mental Map."
- Operates totally offline. The engine pushes CPG states over localhost WebSockets.
- Wrapped in Electron to run as a desktop app natively in the background.

## Running Locally

To run the full stack locally for testing:
```bash
./start.sh
```
This script will:
1. Start the FastAPI WebSocket engine on port 8000.
2. Install npm dependencies for the React frontend.
3. Start the Vite React app for local viewing.

## Snap Packaging
The application is packaged for distribution through the `snap/snapcraft.yaml` file. It isolates both the node/React dependencies and the Python engine securely inside an Ubuntu 22.04 base sandbox.
