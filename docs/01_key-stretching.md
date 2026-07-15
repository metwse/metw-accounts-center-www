# Key Streching Standards

draft version: 2026-15-07

Current API, by its contract, does not provide the algorithm of key streching
to log into accounts. In future versions, there will be an option to fetch
accounts' key streching algorithms.


## Key Streching Methods

### 0
This version is reserved for API-specific behavior.

### 1 - Base64-encoded PBKDF2-SHA256
This method takes 2 arguments:
- salt (default = `metw-accounts-center`)
- iterations (default = `500_000`)
