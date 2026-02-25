/**
 * server.js — Express API for products, orders, customers (Heroku-ready)
 * Listens on process.env.PORT for Heroku compatibility.
 */

const fs = require("fs");
const path = require("path");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const yaml = require("js-yaml");
const products = require("./APIimpl/products");
const orders = require("./APIimpl/orders");
const customers = require("./APIimpl/customers");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const openapiDir = path.join(__dirname, "nodejs-openapi");
function loadSpec(name) {
  const p = path.join(openapiDir, `${name}.yaml`);
  try {
    return yaml.load(fs.readFileSync(p, "utf8"));
  } catch (e) {
    return null;
  }
}
const specProducts = loadSpec("products");
const specOrders = loadSpec("orders");
const specCustomers = loadSpec("customers");

// ── API discovery ────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({
    name: "Mock Retail API",
    endpoints: {
      products: "/api/products",
      orders: "/api/orders",
      customers: "/api/customers",
    },
  });
});

app.get("/api", (req, res) => {
  res.json({
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
  });
});

// ── Products ─────────────────────────────────────────────────────────────────

app.get("/api/products", (req, res) => {
  const onlyActive = req.query.onlyActive === "true";
  const list = products.getAllProducts(onlyActive);
  res.json(list);
});

app.get("/api/products/low-stock", (req, res) => {
  const threshold = parseInt(req.query.threshold, 10) || 50;
  const alerts = products.getLowStockAlerts(threshold);
  res.json(alerts);
});

app.get("/api/products/inventory-value", (req, res) => {
  const total = products.getInventoryValue();
  res.json({ total });
});

app.get("/api/products/by-category", (req, res) => {
  const grouped = products.getProductsByCategory();
  res.json(grouped);
});

app.get("/api/products/:id", (req, res) => {
  const product = products.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

app.post("/api/products", (req, res) => {
  const { name, category, price, stock, sku } = req.body || {};
  if (!name || !category || price == null || stock == null || !sku) {
    return res.status(400).json({ error: "Missing required fields: name, category, price, stock, sku" });
  }
  const entry = products.addProduct({ name, category, price, stock, sku });
  if (!entry) return res.status(409).json({ error: "SKU already exists" });
  res.status(201).json(entry);
});

app.patch("/api/products/:id/stock", (req, res) => {
  const qty = req.body?.qty;
  if (qty == null || typeof qty !== "number") {
    return res.status(400).json({ error: "Body must include numeric qty" });
  }
  const product = products.updateStock(req.params.id, qty);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

app.post("/api/products/bulk-discount", (req, res) => {
  const { category, discountPct } = req.body || {};
  if (!category || discountPct == null) {
    return res.status(400).json({ error: "Missing required fields: category, discountPct" });
  }
  const targets = products.applyBulkDiscount(category, Number(discountPct));
  res.json(targets);
});

// ── Orders (specific routes before :id) ────────────────────────────────────────

app.get("/api/orders", (req, res) => {
  const list = orders.getAllOrders();
  res.json(list);
});

app.get("/api/orders/revenue", (req, res) => {
  const summary = orders.getRevenueSummary();
  res.json(summary);
});

app.get("/api/orders/customer/:customerId", (req, res) => {
  const customerId = parseInt(req.params.customerId, 10);
  if (Number.isNaN(customerId)) {
    return res.status(400).json({ error: "Invalid customerId" });
  }
  const list = orders.getOrdersByCustomer(customerId);
  res.json(list);
});

app.get("/api/orders/:id", (req, res) => {
  const order = orders.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

app.post("/api/orders", (req, res) => {
  const { customerId, items } = req.body || {};
  if (customerId == null || !Array.isArray(items)) {
    return res.status(400).json({ error: "Missing required fields: customerId, items" });
  }
  const order = orders.placeOrder(Number(customerId), items);
  if (!order) return res.status(404).json({ error: "Customer not found" });
  res.status(201).json(order);
});

app.patch("/api/orders/:id/advance", (req, res) => {
  const order = orders.advanceStatus(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found or cannot be advanced" });
  res.json(order);
});

app.post("/api/orders/:id/cancel", (req, res) => {
  const ok = orders.cancelOrder(req.params.id);
  if (!ok) return res.status(400).json({ error: "Order not found or cannot be cancelled" });
  res.json({ cancelled: true });
});

// ── Customers (specific routes before :id) ────────────────────────────────────

app.get("/api/customers", (req, res) => {
  const list = customers.getAllCustomers();
  res.json(list);
});

app.get("/api/customers/stats", (req, res) => {
  const stats = customers.getStats();
  res.json(stats);
});

app.get("/api/customers/tier/:tier", (req, res) => {
  const list = customers.getCustomersByTier(req.params.tier);
  res.json(list);
});

app.get("/api/customers/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid customer id" });
  const customer = customers.getCustomerById(id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  res.json(customer);
});

app.post("/api/customers", (req, res) => {
  const { name, email, country, tier } = req.body || {};
  if (!name || !email || !country || !tier) {
    return res.status(400).json({ error: "Missing required fields: name, email, country, tier" });
  }
  const entry = customers.addCustomer({ name, email, country, tier });
  res.status(201).json(entry);
});

app.patch("/api/customers/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid customer id" });
  const customer = customers.updateCustomer(id, req.body || {});
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  res.json(customer);
});

app.delete("/api/customers/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid customer id" });
  const ok = customers.deleteCustomer(id);
  if (!ok) return res.status(404).json({ error: "Customer not found" });
  res.status(204).send();
});

// ── API docs (OpenAPI specs + Swagger UI) ───────────────────────────────────

app.get("/api-docs/spec/products", (req, res) => {
  if (!specProducts) return res.status(503).json({ error: "Spec not generated; run npm run spec" });
  res.json(specProducts);
});
app.get("/api-docs/spec/orders", (req, res) => {
  if (!specOrders) return res.status(503).json({ error: "Spec not generated; run npm run spec" });
  res.json(specOrders);
});
app.get("/api-docs/spec/customers", (req, res) => {
  if (!specCustomers) return res.status(503).json({ error: "Spec not generated; run npm run spec" });
  res.json(specCustomers);
});

app.get("/api-docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>API Docs</title></head>
      <body>
        <h1>Mock Retail API – OpenAPI docs</h1>
        <ul>
          <li><a href="/api-docs/products">Products API</a></li>
          <li><a href="/api-docs/orders">Orders API</a></li>
          <li><a href="/api-docs/customers">Customers API</a></li>
        </ul>
        <p>Specs: <a href="/api-docs/spec/products">products</a>, <a href="/api-docs/spec/orders">orders</a>, <a href="/api-docs/spec/customers">customers</a> (YAML served as JSON)</p>
      </body>
    </html>
  `);
});

if (specProducts) {
  app.use("/api-docs/products", swaggerUi.serve, swaggerUi.setup(specProducts));
}
if (specOrders) {
  app.use("/api-docs/orders", swaggerUi.serve, swaggerUi.setup(specOrders));
}
if (specCustomers) {
  app.use("/api-docs/customers", swaggerUi.serve, swaggerUi.setup(specCustomers));
}

// ── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Mock Retail API listening on port ${PORT}`);
});
