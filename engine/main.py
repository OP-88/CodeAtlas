import asyncio
import json
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from engine.graph_manager import GraphManager

app = FastAPI(title="CodeAtlas Engine MVP")
graph_manager = GraphManager()

# CORS locked to localhost only — this engine is not a public API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "nodes": len(graph_manager.graph.nodes), "edges": len(graph_manager.graph.edges)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # Send initial graph state on connect
        await websocket.send_text(json.dumps({
            "type": "GRAPH_UPDATE",
            "data": graph_manager.export_cytoscape()
        }))
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            action = msg.get("action")

            if action == "GET_SUBGRAPH":
                root_id = msg.get("rootNodeId")
                depth = int(msg.get("depth", 2))
                tab = msg.get("tab", "deconstructor")
                subgraph = graph_manager.get_subgraph(root_id, depth)
                await websocket.send_text(json.dumps({
                    "type": "SUBGRAPH_RESPONSE",
                    "tab": tab,
                    "data": subgraph
                }))

            elif action == "RUN_HEURISTICS":
                alerts = graph_manager.run_heuristics()
                await websocket.send_text(json.dumps({
                    "type": "HEURISTIC_REPORT",
                    "data": alerts
                }))

            elif action == "ADD_NODE":
                node_id = msg.get("id")
                data = msg.get("data", {})
                if node_id:
                    graph_manager.add_node(node_id, data=data)

            elif action == "ADD_EDGE":
                graph_manager.add_edge(msg.get("source"), msg.get("target"), data=msg.get("data", {}))

    except Exception as e:
        print(f"[Engine] WebSocket closed: {e}")

if __name__ == "__main__":
    import uvicorn
    print("[CodeAtlas Engine MVP] Starting on ws://127.0.0.1:8000/ws")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")
