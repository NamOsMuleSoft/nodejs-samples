# OpenAPI implementation-first (Node to spec)

This project generates **OpenAPI 3.0 JSON** specs from the Fastify implementation.

- **Implementation**: Routes are defined in [app.js](../app.js) with JSON Schema (body, params, response); business logic lives in [APIimpl/](../APIimpl/). The app uses **Fastify** with **@fastify/swagger** so the OpenAPI spec is built from route schemas (real request/response documentation).
- **Specs**: Generated into **openapi-nodejs/** as JSON: `products.json`, `orders.json`, `customers.json`.
- **Generate**: Run `npm run spec` to build the Fastify app, get the spec via `fastify.swagger()`, split by path prefix, and write the JSON files.
- **Clean**: Run `npm run spec:clean` to delete the generated JSON files.

Flow: Fastify (app.js) + route schemas → @fastify/swagger → full spec → split by path prefix → openapi-nodejs/*.json. The server exposes the spec at runtime; `/api-docs` serves Swagger UI and split specs at `/api-docs/spec/products`, etc.
