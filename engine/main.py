import asyncio
import json
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from engine.graph_manager import GraphManager

app = FastAPI(title="CodeAtlas Engine MVP")
graph_manager = GraphManager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "nodes": len(graph_manager.graph.nodes), "edges": len(graph_manager.graph.edges)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # Send initial graph state
        await websocket.send_text(json.dumps({
            "type": "GRAPH_UPDATE",
            "data": graph_manager.export_cytoscape()
        }))
        while True:
            # wait for messages from UI (if any commands)
            data = await websocket.receive_text()
            pass
    except Exception as e:
        print("WebSocket Connection Closed:", e)

if __name__ == "__main__":
    import uvicorn
    # Generate some dummy data for the MVP canvas
    graph_manager.add_node("frontend", data={"label": "React UI", "type": "frontend"})
    graph_manager.add_node("backend", data={"label": "FastAPI", "type": "backend"})
    graph_manager.add_node("db", data={"label": "PostgreSQL", "type": "database"})
    graph_manager.add_edge("frontend", "backend", data={"label": "HTTP/REST"})
    graph_manager.add_edge("backend", "db", data={"label": "TCP/5432"})

    print("Starting CodeAtlas Engine on ws://localhost:8000/ws")
    uvicorn.run(app, host="0.0.0.0", port=8000)
