# Security & Threat Model
1. **Scope Enforcement:** Backend rejects `0.0.0.0/0` and any IP present in the Exclusion List.
2. **Credential Safety:** Secrets are never stored in frontend state or plaintext logs; references point to Vault/secret store IDs.
3. **Non-Destructive Defaults:** All Best Practice remediation tasks run in Dry-Run mode first and require explicit operator confirmation.
