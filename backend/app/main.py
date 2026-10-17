from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ipaddress
import socket
import math

app = FastAPI(title="Qoder Splunk Infrastructure Studio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    allowed_cidr: str = "172.28.1.0/24"
    excluded_ips: list[str] = ["172.28.1.99"]
    ports: list[int] = [22, 80, 443, 8000, 8089, 9997]

class SizingRequest(BaseModel):
    daily_ingest_gb: int = 500
    retention_days: int = 90
    ha_cluster: bool = True
    enterprise_security: bool = False

@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "service": "qoder-backend"}

@app.post("/api/v1/discovery/scan")
def run_controlled_scan(req: ScanRequest):
    try:
        net = ipaddress.ip_network(req.allowed_cidr, strict=False)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid CIDR format.")

    if net.prefixlen < 16 or str(net) == "0.0.0.0/0":
        raise HTTPException(status_code=403, detail="Scope too broad. Public/0.0.0.0 scans are prohibited.")

    lab_candidates = [
        {"ip": "172.28.1.1", "name": "core-firewall-01", "role": "Firewall"},
        {"ip": "172.28.1.11", "name": "srv-splunk-idx-01", "role": "Indexer"},
        {"ip": "172.28.1.12", "name": "srv-splunk-idx-02", "role": "Indexer"},
        {"ip": "172.28.1.13", "name": "srv-splunk-idx-03", "role": "Indexer"},
        {"ip": "172.28.1.20", "name": "splunk-sh-01", "role": "Search Head"},
        {"ip": "172.28.1.99", "name": "restricted-ot-node", "role": "OT Device"},
    ]

    discovered = []
    for candidate in lab_candidates:
        ip = candidate["ip"]
        if ip in req.excluded_ips:
            continue
        if ipaddress.ip_address(ip) in net:
            open_ports = []
            for port in req.ports:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.settimeout(0.25)
                    if s.connect_ex((ip, port)) == 0:
                        open_ports.append(port)
            discovered.append({
                "ip": ip,
                "hostname": candidate["name"],
                "role": candidate["role"],
                "open_ports": open_ports,
                "reachable": len(open_ports) > 0,
                "evidence": "TCP_CONNECT_SCAN"
            })
    return {
        "status": "completed",
        "scope": req.allowed_cidr,
        "excluded_skipped": req.excluded_ips,
        "results": discovered
    }

@app.post("/api/v1/architecture/calculate")
def calculate_sva_architecture(req: SizingRequest):
    # Approximate SVA sizing rules (300GB/day per indexer peer baseline, adjusted for ES)
    per_indexer_capacity = 200 if req.enterprise_security else 300
    base_indexers = max(1, math.ceil(req.daily_ingest_gb / per_indexer_capacity))
    indexer_count = max(3, base_indexers) if req.ha_cluster else base_indexers
    sh_count = 3 if (req.ha_cluster and req.daily_ingest_gb >= 300) else 1

    # Storage calculation: ~50% compression * RF
    rf = 3 if req.ha_cluster else 1
    total_storage_tb = round((req.daily_ingest_gb * 0.5 * req.retention_days * rf) / 1024, 2)
    per_node_storage_tb = round(total_storage_tb / indexer_count, 2)

    return {
        "topology_code": "SVA-C3" if req.ha_cluster else "SVA-S1",
        "assumptions": "50% raw+index compression ratio, standard search concurrency",
        "recommendations": {
            "indexers": {
                "count": indexer_count,
                "vcpu": 16 if req.daily_ingest_gb <= 1000 else 32,
                "ram_gb": 32 if req.daily_ingest_gb <= 1000 else 64,
                "storage_tb_each": max(0.5, per_node_storage_tb)
            },
            "search_heads": {
                "count": sh_count,
                "vcpu": 16,
                "ram_gb": 64 if req.enterprise_security else 32
            },
            "management_nodes": ["Cluster Manager", "Monitoring Console"] + (["SHC Deployer"] if sh_count >= 3 else [])
        }
    }
