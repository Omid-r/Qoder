# Qoder — Splunk Infrastructure Studio & Network Discovery Platform

Enterprise platform for controlled network discovery, live topology mapping, Splunk Validated Architecture (SVA) sizing, and automated deployment.

## 🚀 Quick Start (Platform + Testing Lab)

### 1. Start the 6-Node Testing Lab
Spins up an isolated sandbox (`172.28.0.0/16`) with Linux SSH indexers (`8089`, `9997`), Search Head, Firewall, and an excluded OT asset (`172.28.1.99`):
```bash
docker compose -f lab/docker-compose.lab.yml up -d
```

### 2. Start Qoder UI & FastAPI Backend
```bash
docker compose up --build -d
```
- **Qoder Studio UI:** `http://localhost:8443`
- **Backend Swagger API Docs:** `http://localhost:8000/docs`
