import networkx as nx
from typing import Dict, Any, List

class GraphManager:
    """Manages the Code Property Graph (CPG) using NetworkX"""
    def __init__(self):
        self.graph = nx.DiGraph()

    def add_node(self, node_id: str, data: Dict[str, Any] = None):
        """Add a component node (e.g., frontend, db)"""
        if data is None:
            data = {}
        self.graph.add_node(node_id, **data)

    def add_edge(self, source_id: str, target_id: str, data: Dict[str, Any] = None):
        """Add a connection edge between components"""
        if data is None:
            data = {}
        self.graph.add_edge(source_id, target_id, **data)

    def get_node(self, node_id: str) -> Dict[str, Any]:
        return self.graph.nodes.get(node_id, {})

    def export_cytoscape(self) -> Dict[str, List[Dict[str, Any]]]:
        """Export graph to format easily readable by React Flow / Cytoscape"""
        data = nx.cytoscape_data(self.graph)
        return data["elements"]

    def get_subgraph(self, root_id: str, depth: int = 2) -> Dict[str, Any]:
        """Return only the nodes within `depth` hops of root_id — backend viewport filter.
        Prevents pushing the full graph payload over the WebSocket."""
        if root_id not in self.graph:
            return {"nodes": [], "edges": []}
        sub = nx.ego_graph(self.graph, root_id, radius=depth, undirected=True)
        nodes = [
            {"id": n, "data": dict(self.graph.nodes[n])}
            for n in sub.nodes
        ]
        edges = [
            {"source": u, "target": v, "data": dict(d)}
            for u, v, d in sub.edges(data=True)
        ]
        return {"nodes": nodes, "edges": edges}

    def run_heuristics(self) -> List[Dict[str, Any]]:
        """Run deterministic static analysis rules against the graph"""
        alerts = []
        # Example naive validation: DB should not be accessed directly from frontend
        for edge in self.graph.edges(data=True):
            src, dst, data = edge
            src_node = self.graph.nodes[src]
            dst_node = self.graph.nodes[dst]
            
            if src_node.get("type") == "frontend" and dst_node.get("type") == "database":
                alerts.append({
                    "severity": "high",
                    "title": "Direct DB Access",
                    "description": f"Component {src} directly connects to {dst}. This is a critical security vulnerability.",
                    "edge": [src, dst]
                })
        return alerts
