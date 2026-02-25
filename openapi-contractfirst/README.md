# OpenAPI contract-first

This project uses a **contract-first** approach: the API is defined by OpenAPI specs before implementation.

- **Specs**: `nodejs-openapi/*.yaml` (products, orders, customers)
- **Generate**: `npm run spec` to normalize/validate YAML
- **Implementation**: `APIimpl/` and `server.js` implement the contracts
