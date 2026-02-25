/**
 * app.js — Fastify app for products, orders, customers (no listen).
 * OpenAPI spec is generated from route schemas via @fastify/swagger.
 * Used by server.js and by scripts/generate-specs.js for spec generation.
 * Swagger UI is only served when generated spec files exist (openapi/openapi-nodejs/*.json).
 */

const fs = require("fs");
const path = require("path");
const Fastify = require("fastify");
const swagger = require("@fastify/swagger");
const swaggerUi = require("@fastify/swagger-ui");
const products = require("./APIimpl/products");
const orders = require("./APIimpl/orders");
const customers = require("./APIimpl/customers");
const {
  errorSchema,
  productSchema,
  orderSchema,
  customerSchema,
  orderItemSchema,
} = require("./schemas");

const openapiDir = path.join(__dirname, "openapi", "openapi-nodejs");
function hasGeneratedSpecs() {
  try {
    if (!fs.existsSync(openapiDir)) return false;
    const names = ["products", "orders", "customers"];
    return names.some((name) => fs.existsSync(path.join(openapiDir, `${name}.json`)));
  } catch {
    return false;
  }
}

async function buildApp() {
  const fastify = Fastify({ logger: false });
  const serveSwaggerUi = hasGeneratedSpecs();

  await fastify.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Mock Retail API",
        version: "1.0.0",
        description: "Products, orders, customers API — generated from Fastify route schemas.",
      },
      servers: [{ url: "/", description: "Relative to host" }],
      tags: [
        { name: "products", description: "Products API" },
        { name: "orders", description: "Orders API" },
        { name: "customers", description: "Customers API" },
      ],
      components: {
        schemas: {
          Error: errorSchema,
          Product: productSchema,
          Order: orderSchema,
          Customer: customerSchema,
          OrderItem: orderItemSchema,
        },
      },
    },
  });

  // Register spec-split routes before swagger-ui so /api-docs/spec/* are not shadowed
  fastify.get("/api-docs/spec/products", {
    schema: { hide: true },
    handler: async (request, reply) => {
      await fastify.ready();
      const full = fastify.swagger();
      const paths = {};
      for (const [key, value] of Object.entries(full.paths || {})) {
        if (key.startsWith("/api/products")) paths[key] = value;
      }
      return reply.send({
        openapi: "3.0.0",
        info: { ...full.info, title: "Mock Retail API – Products" },
        servers: full.servers,
        paths,
        components: full.components || {},
      });
    },
  });
  fastify.get("/api-docs/spec/orders", {
    schema: { hide: true },
    handler: async (request, reply) => {
      await fastify.ready();
      const full = fastify.swagger();
      const paths = {};
      for (const [key, value] of Object.entries(full.paths || {})) {
        if (key.startsWith("/api/orders")) paths[key] = value;
      }
      return reply.send({
        openapi: "3.0.0",
        info: { ...full.info, title: "Mock Retail API – Orders" },
        servers: full.servers,
        paths,
        components: full.components || {},
      });
    },
  });
  fastify.get("/api-docs/spec/customers", {
    schema: { hide: true },
    handler: async (request, reply) => {
      await fastify.ready();
      const full = fastify.swagger();
      const paths = {};
      for (const [key, value] of Object.entries(full.paths || {})) {
        if (key.startsWith("/api/customers")) paths[key] = value;
      }
      return reply.send({
        openapi: "3.0.0",
        info: { ...full.info, title: "Mock Retail API – Customers" },
        servers: full.servers,
        paths,
        components: full.components || {},
      });
    },
  });
  fastify.get("/api-docs/index", {
    schema: { hide: true },
    handler: async (request, reply) => {
      const uiNote = serveSwaggerUi
        ? '<ul><li><a href="/api-docs">Swagger UI</a></li></ul>'
        : '<p>Run <code>npm run spec</code> to generate specs and enable Swagger UI.</p>';
      reply.type("text/html").send(`
    <!DOCTYPE html>
    <html>
      <head><title>API Docs</title></head>
      <body>
        <h1>Mock Retail API – OpenAPI docs</h1>
        ${uiNote}
        <p>Specs (JSON): <a href="/api-docs/spec/products">products</a>, <a href="/api-docs/spec/orders">orders</a>, <a href="/api-docs/spec/customers">customers</a></p>
      </body>
    </html>
  `);
    },
  });

  if (serveSwaggerUi) {
    await fastify.register(swaggerUi, {
      routePrefix: "/api-docs",
      uiConfig: { docExpansion: "list" },
    });
  } else {
    fastify.get("/api-docs", {
      schema: { hide: true },
      handler: async (request, reply) => {
        reply.type("text/html").send(`
    <!DOCTYPE html>
    <html>
      <head><title>API Docs</title></head>
      <body>
        <h1>Mock Retail API – API Docs</h1>
        <p>OpenAPI specs have not been generated yet. Run <code>npm run spec</code> to generate them and enable Swagger UI.</p>
        <p>API is available at <a href="/api">/api</a>.</p>
      </body>
    </html>
  `);
      },
    });
  }

  // ── API discovery ────────────────────────────────────────────────────────────

  fastify.get("/", {
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            name: { type: "string" },
            endpoints: {
              type: "object",
              properties: {
                products: { type: "string" },
                orders: { type: "string" },
                customers: { type: "string" },
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      return {
        name: "Mock Retail API",
        endpoints: {
          products: "/api/products",
          orders: "/api/orders",
          customers: "/api/customers",
        },
      };
    },
  });

  fastify.get("/api", {
    schema: {
      response: {
        200: { type: "object", properties: { products: {}, orders: {}, customers: {} } },
      },
    },
    handler: async () => ({
      products: {
        "GET /api/products": "List all products (query: onlyActive=true)",
        "GET /api/products/low-stock": "Low stock alerts (query: threshold=50)",
        "GET /api/products/inventory-value": "Total inventory value",
        "GET /api/products/by-category": "Products grouped by category",
        "GET /api/products/:id": "Get product by id",
        "POST /api/products": "Add product (body: name, category, price, stock, sku)",
        "PATCH /api/products/:id/stock": "Update stock (body: qty)",
        "POST /api/products/bulk-discount": "Bulk discount (body: category, discountPct)",
      },
      orders: {
        "GET /api/orders": "List all orders",
        "GET /api/orders/revenue": "Revenue summary",
        "GET /api/orders/customer/:customerId": "Orders by customer",
        "GET /api/orders/:id": "Get order by id",
        "POST /api/orders": "Place order (body: customerId, items)",
        "PATCH /api/orders/:id/advance": "Advance order status",
        "POST /api/orders/:id/cancel": "Cancel order",
      },
      customers: {
        "GET /api/customers": "List all customers",
        "GET /api/customers/stats": "Customer stats",
        "GET /api/customers/tier/:tier": "Customers by tier",
        "GET /api/customers/:id": "Get customer by id",
        "POST /api/customers": "Add customer (body: name, email, country, tier)",
        "PATCH /api/customers/:id": "Update customer (body: updates)",
        "DELETE /api/customers/:id": "Delete customer",
      },
    }),
  });

  // ── Products ─────────────────────────────────────────────────────────────────

  fastify.get("/api/products", {
    schema: {
      tags: ["products"],
      querystring: {
        type: "object",
        properties: { onlyActive: { type: "string", enum: ["true", "false"] } },
      },
      response: {
        200: { type: "array", items: productSchema },
      },
    },
    handler: async (request) => {
      const onlyActive = request.query.onlyActive === "true";
      return products.getAllProducts(onlyActive);
    },
  });

  fastify.get("/api/products/low-stock", {
    schema: {
      tags: ["products"],
      querystring: {
        type: "object",
        properties: { threshold: { type: "string" } },
      },
      response: {
        200: { type: "array", items: productSchema },
      },
    },
    handler: async (request) => {
      const threshold = parseInt(request.query.threshold, 10) || 50;
      return products.getLowStockAlerts(threshold);
    },
  });

  fastify.get("/api/products/inventory-value", {
    schema: {
      tags: ["products"],
      response: {
        200: { type: "object", properties: { total: { type: "number" } } },
      },
    },
    handler: async () => {
      const total = products.getInventoryValue();
      return { total };
    },
  });

  fastify.get("/api/products/by-category", {
    schema: {
      tags: ["products"],
      response: {
        200: { type: "object", additionalProperties: { type: "array", items: { type: "string" } } },
      },
    },
    handler: async () => products.getProductsByCategory(),
  });

  fastify.get("/api/products/:id", {
    schema: {
      tags: ["products"],
      params: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
      response: {
        200: productSchema,
        404: errorSchema,
      },
    },
    handler: async (request, reply) => {
      const product = products.getProductById(request.params.id);
      if (!product) return reply.code(404).send({ error: "Product not found" });
      return product;
    },
  });

  fastify.post("/api/products", {
    schema: {
      tags: ["products"],
      body: {
        type: "object",
        required: ["name", "category", "price", "stock", "sku"],
        properties: {
          name: { type: "string" },
          category: { type: "string" },
          price: { type: "number" },
          stock: { type: "integer" },
          sku: { type: "string" },
        },
      },
      response: {
        201: productSchema,
        400: errorSchema,
        409: errorSchema,
      },
    },
    handler: async (request, reply) => {
      const { name, category, price, stock, sku } = request.body || {};
      if (!name || !category || price == null || stock == null || !sku) {
        return reply.code(400).send({ error: "Missing required fields: name, category, price, stock, sku" });
      }
      const entry = products.addProduct({ name, category, price, stock, sku });
      if (!entry) return reply.code(409).send({ error: "SKU already exists" });
      return reply.code(201).send(entry);
    },
  });

  fastify.patch("/api/products/:id/stock", {
    schema: {
      tags: ["products"],
      params: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
      body: {
        type: "object",
        required: ["qty"],
        properties: { qty: { type: "number" } },
      },
      response: {
        200: productSchema,
        400: errorSchema,
        404: errorSchema,
      },
    },
    handler: async (request, reply) => {
      const qty = request.body?.qty;
      if (qty == null || typeof qty !== "number") {
        return reply.code(400).send({ error: "Body must include numeric qty" });
      }
      const product = products.updateStock(request.params.id, qty);
      if (!product) return reply.code(404).send({ error: "Product not found" });
      return product;
    },
  });

  fastify.post("/api/products/bulk-discount", {
    schema: {
      tags: ["products"],
      body: {
        type: "object",
        required: ["category", "discountPct"],
        properties: {
          category: { type: "string" },
          discountPct: { type: "number" },
        },
      },
      response: {
        200: { type: "array", items: productSchema },
        400: errorSchema,
      },
    },
    handler: async (request, reply) => {
      const { category, discountPct } = request.body || {};
      if (!category || discountPct == null) {
        return reply.code(400).send({ error: "Missing required fields: category, discountPct" });
      }
      return products.applyBulkDiscount(category, Number(discountPct));
    },
  });

  // ── Orders (specific routes before :id) ────────────────────────────────────────

  fastify.get("/api/orders", {
    schema: {
      tags: ["orders"],
      response: {
        200: { type: "array", items: orderSchema },
      },
    },
    handler: async () => orders.getAllOrders(),
  });

  fastify.get("/api/orders/revenue", {
    schema: {
      tags: ["orders"],
      response: {
        200: {
          type: "object",
          properties: {
            total: { type: "number" },
            byStatus: { type: "object", additionalProperties: { type: "integer" } },
          },
        },
      },
    },
    handler: async () => orders.getRevenueSummary(),
  });

  fastify.get("/api/orders/customer/:customerId", {
    schema: {
      tags: ["orders"],
      params: { type: "object", properties: { customerId: { type: "string" } }, required: ["customerId"] },
      response: {
        200: { type: "array", items: orderSchema },
        400: errorSchema,
      },
    },
    handler: async (request, reply) => {
      const customerId = parseInt(request.params.customerId, 10);
      if (Number.isNaN(customerId)) {
        return reply.code(400).send({ error: "Invalid customerId" });
      }
      return orders.getOrdersByCustomer(customerId);
    },
  });

  fastify.get("/api/orders/:id", {
    schema: {
      tags: ["orders"],
      params: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
      response: {
        200: orderSchema,
        404: errorSchema,
      },
    },
    handler: async (request, reply) => {
      const order = orders.getOrderById(request.params.id);
      if (!order) return reply.code(404).send({ error: "Order not found" });
      return order;
    },
  });

  fastify.post("/api/orders", {
    schema: {
      tags: ["orders"],
      body: {
        type: "object",
        required: ["customerId", "items"],
        properties: {
          customerId: { type: "integer" },
          items: { type: "array", items: orderItemSchema },
        },
      },
      response: {
        201: orderSchema,
        400: errorSchema,
        404: errorSchema,
      },
    },
    handler: async (request, reply) => {
      const { customerId, items } = request.body || {};
      if (customerId == null || !Array.isArray(items)) {
        return reply.code(400).send({ error: "Missing required fields: customerId, items" });
      }
      const order = orders.placeOrder(Number(customerId), items);
      if (!order) return reply.code(404).send({ error: "Customer not found" });
      return reply.code(201).send(order);
    },
  });

  fastify.patch("/api/orders/:id/advance", {
    schema: {
      tags: ["orders"],
      params: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
      response: {
        200: orderSchema,
        404: errorSchema,
      },
    },
    handler: async (request, reply) => {
      const order = orders.advanceStatus(request.params.id);
      if (!order) return reply.code(404).send({ error: "Order not found or cannot be advanced" });
      return order;
    },
  });

  fastify.post("/api/orders/:id/cancel", {
    schema: {
      tags: ["orders"],
      params: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
      response: {
        200: { type: "object", properties: { cancelled: { type: "boolean" } } },
        400: errorSchema,
      },
    },
    handler: async (request, reply) => {
      const ok = orders.cancelOrder(request.params.id);
      if (!ok) return reply.code(400).send({ error: "Order not found or cannot be cancelled" });
      return { cancelled: true };
    },
  });

  // ── Customers (specific routes before :id) ────────────────────────────────────

  fastify.get("/api/customers", {
    schema: {
      tags: ["customers"],
      response: {
        200: { type: "array", items: customerSchema },
      },
    },
    handler: async () => customers.getAllCustomers(),
  });

  fastify.get("/api/customers/stats", {
    schema: {
      tags: ["customers"],
      response: {
        200: {
          type: "object",
          properties: {
            total: { type: "integer" },
            byTier: { type: "object", additionalProperties: { type: "integer" } },
          },
        },
      },
    },
    handler: async () => customers.getStats(),
  });

  fastify.get("/api/customers/tier/:tier", {
    schema: {
      tags: ["customers"],
      params: { type: "object", properties: { tier: { type: "string" } }, required: ["tier"] },
      response: {
        200: { type: "array", items: customerSchema },
      },
    },
    handler: async (request) => customers.getCustomersByTier(request.params.tier),
  });

  fastify.get("/api/customers/:id", {
    schema: {
      tags: ["customers"],
      params: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
      response: {
        200: customerSchema,
        400: errorSchema,
        404: errorSchema,
      },
    },
    handler: async (request, reply) => {
      const id = parseInt(request.params.id, 10);
      if (Number.isNaN(id)) return reply.code(400).send({ error: "Invalid customer id" });
      const customer = customers.getCustomerById(id);
      if (!customer) return reply.code(404).send({ error: "Customer not found" });
      return customer;
    },
  });

  fastify.post("/api/customers", {
    schema: {
      tags: ["customers"],
      body: {
        type: "object",
        required: ["name", "email", "country", "tier"],
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          country: { type: "string" },
          tier: { type: "string" },
        },
      },
      response: {
        201: customerSchema,
        400: errorSchema,
      },
    },
    handler: async (request, reply) => {
      const { name, email, country, tier } = request.body || {};
      if (!name || !email || !country || !tier) {
        return reply.code(400).send({ error: "Missing required fields: name, email, country, tier" });
      }
      const entry = customers.addCustomer({ name, email, country, tier });
      return reply.code(201).send(entry);
    },
  });

  fastify.patch("/api/customers/:id", {
    schema: {
      tags: ["customers"],
      params: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
      body: {
        type: "object",
        properties: { name: { type: "string" }, email: { type: "string" }, country: { type: "string" }, tier: { type: "string" } },
      },
      response: {
        200: customerSchema,
        400: errorSchema,
        404: errorSchema,
      },
    },
    handler: async (request, reply) => {
      const id = parseInt(request.params.id, 10);
      if (Number.isNaN(id)) return reply.code(400).send({ error: "Invalid customer id" });
      const customer = customers.updateCustomer(id, request.body || {});
      if (!customer) return reply.code(404).send({ error: "Customer not found" });
      return customer;
    },
  });

  fastify.delete("/api/customers/:id", {
    schema: {
      tags: ["customers"],
      params: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
      response: {
        204: { type: "null", description: "No content" },
        400: errorSchema,
        404: errorSchema,
      },
    },
    handler: async (request, reply) => {
      const id = parseInt(request.params.id, 10);
      if (Number.isNaN(id)) return reply.code(400).send({ error: "Invalid customer id" });
      const ok = customers.deleteCustomer(id);
      if (!ok) return reply.code(404).send({ error: "Customer not found" });
      return reply.code(204).send();
    },
  });

  return fastify;
}

module.exports = { buildApp };
