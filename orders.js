/**
 * orders.js — Mock Retail Orders API (Node.js)
 * Run: node orders.js
 */

// ── Reference Data ────────────────────────────────────────────────────────────

const CUSTOMERS = {
  1: { name: "Alice Dupont",  country: "FR" },
  2: { name: "Bob Nguyen",    country: "US" },
  3: { name: "Clara Schmidt", country: "DE" },
  4: { name: "David Martin",  country: "FR" },
};

const PRODUCTS = {
  "P001": { name: "Running Shoes",         unitPrice:  89.99 },
  "P002": { name: "Slim-Fit Denim Jeans",  unitPrice:  49.99 },
  "P003": { name: "Stainless Water Bottle",unitPrice:  19.99 },
  "P004": { name: "Yoga Mat",              unitPrice:  34.99 },
  "P005": { name: "Wireless Earbuds",      unitPrice: 129.99 },
  "P006": { name: "Scented Candle Set",    unitPrice:  24.99 },
  "P007": { name: "Leather Wallet",        unitPrice:  39.99 },
  "P008": { name: "Sunscreen SPF 50",      unitPrice:  14.99 },
  "P009": { name: "Vintage Cap",           unitPrice:  22.99 },
};

// ── Mock Orders ───────────────────────────────────────────────────────────────

const orders = [
  {
    id: "ORD-2024-001",
    customerId: 1,
    status: "delivered",
    createdAt: "2024-02-10",
    items: [
      { productId: "P001", qty: 1 },  // Running Shoes
      { productId: "P004", qty: 1 },  // Yoga Mat
      { productId: "P003", qty: 2 },  // Water Bottle x2
    ],
  },
  {
    id: "ORD-2024-002",
    customerId: 2,
    status: "shipped",
    createdAt: "2024-04-22",
    items: [
      { productId: "P005", qty: 1 },  // Wireless Earbuds
      { productId: "P007", qty: 1 },  // Leather Wallet
    ],
  },
  {
    id: "ORD-2024-003",
    customerId: 3,
    status: "pending",
    createdAt: "2024-06-15",
    items: [
      { productId: "P002", qty: 2 },  // Denim Jeans x2
      { productId: "P009", qty: 1 },  // Vintage Cap
      { productId: "P006", qty: 3 },  // Scented Candle x3
    ],
  },
  {
    id: "ORD-2024-004",
    customerId: 4,
    status: "cancelled",
    createdAt: "2024-08-30",
    items: [
      { productId: "P008", qty: 4 },  // Sunscreen x4
      { productId: "P003", qty: 1 },  // Water Bottle
    ],
  },
  {
    id: "ORD-2025-001",
    customerId: 1,
    status: "pending",
    createdAt: "2025-01-05",
    items: [
      { productId: "P005", qty: 1 },  // Wireless Earbuds
      { productId: "P002", qty: 1 },  // Denim Jeans
      { productId: "P008", qty: 2 },  // Sunscreen x2
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_FLOW = ["pending", "confirmed", "shipped", "delivered"];

function computeTotal(items) {
  return items.reduce((sum, { productId, qty }) => {
    const product = PRODUCTS[productId];
    return sum + (product ? product.unitPrice * qty : 0);
  }, 0);
}

function enrichOrder(order) {
  const customer = CUSTOMERS[order.customerId];
  const items = order.items.map(({ productId, qty }) => ({
    productId,
    product: PRODUCTS[productId]?.name ?? "Unknown",
    qty,
    lineTotal: `$${((PRODUCTS[productId]?.unitPrice ?? 0) * qty).toFixed(2)}`,
  }));
  return {
    ...order,
    customer: customer?.name ?? "Unknown",
    country: customer?.country ?? "??",
    items,
    total: `$${computeTotal(order.items).toFixed(2)}`,
  };
}

// ── Operations ────────────────────────────────────────────────────────────────

function getAllOrders() {
  console.log(`\n📋 All Orders (${orders.length}):`);
  console.table(
    orders.map((o) => ({
      id: o.id,
      customer: CUSTOMERS[o.customerId]?.name,
      status: o.status,
      items: o.items.length,
      total: `$${computeTotal(o.items).toFixed(2)}`,
      date: o.createdAt,
    }))
  );
  return orders;
}

function getOrderById(id) {
  const order = orders.find((o) => o.id === id);
  if (!order) {
    console.log(`\n❌ Order "${id}" not found.`);
    return null;
  }
  const rich = enrichOrder(order);
  console.log(`\n🔍 Order ${id}:`);
  console.log(`   Customer : ${rich.customer} (${rich.country})`);
  console.log(`   Status   : ${rich.status}`);
  console.log(`   Date     : ${rich.createdAt}`);
  console.log(`   Items:`);
  rich.items.forEach((i) => console.log(`     • ${i.product} × ${i.qty}  →  ${i.lineTotal}`));
  console.log(`   TOTAL    : ${rich.total}`);
  return rich;
}

function placeOrder(customerId, items) {
  if (!CUSTOMERS[customerId]) {
    console.log(`\n❌ Cannot place order — Customer #${customerId} not found.`);
    return null;
  }
  const year = new Date().getFullYear();
  const seq  = String(orders.filter((o) => o.id.startsWith(`ORD-${year}`)).length + 1).padStart(3, "0");
  const order = {
    id: `ORD-${year}-${seq}`,
    customerId,
    status: "pending",
    createdAt: new Date().toISOString().slice(0, 10),
    items,
  };
  orders.push(order);
  console.log(`\n✅ Order placed: ${order.id} | Total: $${computeTotal(items).toFixed(2)}`);
  return order;
}

function advanceStatus(id) {
  const order = orders.find((o) => o.id === id);
  if (!order) {
    console.log(`\n❌ Order "${id}" not found.`);
    return null;
  }
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  if (currentIndex === -1 || order.status === "cancelled") {
    console.log(`\n⚠️  Order "${id}" cannot be advanced (status: ${order.status}).`);
    return null;
  }
  if (currentIndex === STATUS_FLOW.length - 1) {
    console.log(`\n✅ Order "${id}" is already at final status: ${order.status}.`);
    return order;
  }
  const previous = order.status;
  order.status = STATUS_FLOW[currentIndex + 1];
  console.log(`\n🚀 Order ${id}: ${previous} → ${order.status}`);
  return order;
}

function cancelOrder(id) {
  const order = orders.find((o) => o.id === id);
  if (!order) {
    console.log(`\n❌ Order "${id}" not found.`);
    return false;
  }
  if (["shipped", "delivered"].includes(order.status)) {
    console.log(`\n⚠️  Cannot cancel — Order "${id}" is already ${order.status}.`);
    return false;
  }
  order.status = "cancelled";
  console.log(`\n🚫 Order "${id}" cancelled.`);
  return true;
}

function getOrdersByCustomer(customerId) {
  const result = orders.filter((o) => o.customerId === customerId);
  const customer = CUSTOMERS[customerId];
  console.log(`\n👤 Orders for ${customer?.name ?? "Unknown"} (${result.length}):`);
  result.forEach((o) =>
    console.log(`   ${o.id}  |  ${o.status.padEnd(10)}  |  $${computeTotal(o.items).toFixed(2)}`)
  );
  return result;
}

function getRevenueSummary() {
  const completed = orders.filter((o) => o.status === "delivered");
  const total = completed.reduce((sum, o) => sum + computeTotal(o.items), 0);
  const byStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  console.log("\n📊 Revenue Summary:");
  console.log(`   Delivered Revenue : $${total.toFixed(2)}`);
  console.log(`   Orders by Status  :`);
  Object.entries(byStatus).forEach(([s, n]) => console.log(`     ${s.padEnd(12)}: ${n}`));
  return { total, byStatus };
}

module.exports = {
  getAllOrders,
  getOrderById,
  placeOrder,
  advanceStatus,
  cancelOrder,
  getOrdersByCustomer,
  getRevenueSummary,
};

// ── Demo ──────────────────────────────────────────────────────────────────────

if (require.main === module) {
  console.log("═".repeat(60));
  console.log("   ORDERS MODULE — Retail Mock Data Demo");
  console.log("═".repeat(60));

  getAllOrders();
  getOrderById("ORD-2024-001");
  getOrderById("ORD-9999-000");

  placeOrder(3, [
    { productId: "P001", qty: 1 },  // Running Shoes
    { productId: "P006", qty: 2 },  // Scented Candle x2
  ]);

  advanceStatus("ORD-2024-003");   // pending → confirmed
  advanceStatus("ORD-2024-003");   // confirmed → shipped

  cancelOrder("ORD-2025-001");     // pending → cancelled ✅
  cancelOrder("ORD-2024-002");     // already shipped → ⚠️ blocked

  getOrdersByCustomer(1);
  getRevenueSummary();
}
