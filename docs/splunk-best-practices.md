# Splunk Best Practices Catalog (v9.x / v10.x)
- **SYS-THP-001:** Disable Transparent Huge Pages (`enabled=never`, `defrag=never`) on all Linux Indexers and Search Heads.
- **SYS-LIM-002:** Set `ulimit -n` (open files) >= `64000` and `ulimit -u` (processes) >= `16000`.
- **SPL-CLU-003:** Enforce Replication Factor (RF) >= 3 and Search Factor (SF) >= 2 for HA Indexer Clusters.
