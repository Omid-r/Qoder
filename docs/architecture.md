# Technical Architecture
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons (Port `8443` / `3000`).
- **Backend:** Python FastAPI providing REST endpoints for controlled TCP/SSH discovery, SVA sizing engine, and Ansible/SSH dry-run execution (Port `8000`).
- **Testing Lab:** Isolated Docker bridge network (`172.28.0.0/16`) simulating 6 infrastructure nodes including SSH-enabled indexers, search heads, and excluded OT assets.
