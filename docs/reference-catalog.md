# Reference Repository Audit Catalog (`Omid-r/Pilot`)

| Capability / Module | Status | Evidence / File Path | Notes |
| :--- | :--- | :--- | :--- |
| Architecture Studio UI | UI-only or Mock | `splunk-cluster-doctor-&-architecture-studio.zip` | Upgraded to dynamic SVA sizing calculator & topology builder. |
| Network Port Scanning | Partially implemented | `scripts/network_scan` | Rebuilt with strict CIDR allowlist & exclusion validation in FastAPI. |
| Live Topology Graph | UI-only or Mock | `src/components/Diagram` | Implemented interactive dark-mode NOC canvas with contextual side drawer. |
| Automated OS Provisioning | Not found | Unverified in source | Added Out-of-Band / SSH validation and dry-run hooks. |
| Splunk Best Practice Auto-Apply | TODO | Static UI rules | Implemented interactive Dry-Run diff viewer and execution state. |
