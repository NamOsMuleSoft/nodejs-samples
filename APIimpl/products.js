/**
 * products.js - Mock Retail Products API (Node.js)
 * Run: node APIimpl/products.js
 */

const products = [
  { id: "P001", name: "Running Shoes",          category: "footwear",    price:  89.99, stock: 120, sku: "FW-001", active: true  },
  { id: "P002", name: "Slim-Fit Denim Jeans",   category: "clothing",    price:  49.99, stock:  85, sku: "CL-002", active: true  },
  { id: "P003", name: "Stainless Water Bottle",  category: "accessories", price:  19.99, stock: 200, sku: "AC-003", active: true  },
  { id: "P004", name: "Yoga Mat",                category: "sports",      price:  34.99, stock:  60, sku: "SP-004", active: true  },
  { id: "P005", name: "Wireless Earbuds",        category: "electronics", price: 129.99, stock:  45, sku: "EL-005", active: true  },
  { id: "P006", name: "Scented Candle Set",      category: "home",        price:  24.99, stock:  90, sku: "HM-006", active: true  },
  { id: "P007", name: "Leather Wallet",          category: "accessories", price:  39.99, stock:  75, sku: "AC-007", active: true  },
  { id: "P008", name: "Sunscreen SPF 50",        category: "beauty",      price:  14.99, stock: 150, sku: "BT-008", active: true  },
  { id: "P009", name: "Vintage Cap",             category: "clothing",    price:  22.99, stock:  40, sku: "CL-009", active: true  },
  { id: "P010", name: "Foam Roller (Retired)",   category: "sports",      price:  18.99, stock:   0, sku: "SP-010", active: false },
];

// -- Helpers ----------------------------------------------------------------------

const findById       = (id) => products.find((p) => p.id === id);
const findByCategory = (cat) => products.filter((p) => p.category === cat);
const activeProducts = () => products.filter((p) => p.active);

function applyDiscount(price, pct) {
  return parseFloat((price * (1 - pct / 100)).toFixed(2));
}

// -- Operations -------------------------------------------------------------------

function getAllProducts(onlyActive = false) {
  const list = onlyActive ? activeProducts() : products;
  console.log(`\n[LIST] Products (${onlyActive ? "active only" : "all"}):`);
  console.table(list.map(({ id, name, category, price, stock, active }) =>
    ({ id, name, category, price: `$${price}`, stock, active })
  ));
  return list;
}

function getProductById(id) {
  const product = findById(id);
  if (!product) {
    console.log(`\n[ERROR] Product "${id}" not found.`);
    return null;
  }
  console.log(`\n[OK] Product ${id}:`, product);
  return product;
}

function addProduct(newProduct) {
  if (products.some((p) => p.sku === newProduct.sku)) {
    console.log(`\n[WARN] SKU "${newProduct.sku}" already exists.`);
    return null;
  }
  const id = `P${String(products.length + 1).padStart(3, "0")}`;
  const entry = { id, active: true, ...newProduct };
  products.push(entry);
  console.log(`\n[OK] Product added:`, entry);
  return entry;
}

function updateStock(id, qty) {
  const product = findById(id);
  if (!product) {
    console.log(`\n[ERROR] Product "${id}" not found.`);
    return null;
  }
  const previous = product.stock;
  product.stock = Math.max(0, product.stock + qty);
  console.log(`\n[OK] Stock updated for "${product.name}": ${previous} -> ${product.stock}`);
  return product;
}

function applyBulkDiscount(category, discountPct) {
  const targets = findByCategory(category).filter((p) => p.active);
  console.log(`\n[OK] Applying ${discountPct}% discount to "${category}" products:`);
  targets.forEach((p) => {
    const original = p.price;
    p.price = applyDiscount(p.price, discountPct);
    console.log(`   ${p.name}: $${original} -> $${p.price}`);
  });
  return targets;
}

function getLowStockAlerts(threshold = 50) {
  const alerts = products.filter((p) => p.stock <= threshold && p.active);
  console.log(`\n[WARN] Low Stock Alerts (<= ${threshold} units):`);
  if (alerts.length === 0) console.log("   None - all good!");
  else console.table(alerts.map(({ id, name, category, stock }) => ({ id, name, category, stock })));
  return alerts;
}

function getInventoryValue() {
  const total = products
    .filter((p) => p.active)
    .reduce((sum, p) => sum + p.price * p.stock, 0);
  console.log(`\n[STATS] Total Inventory Value: $${total.toFixed(2)}`);
  return total;
}

function getProductsByCategory() {
  const grouped = products.filter((p) => p.active).reduce((acc, p) => {
    acc[p.category] = acc[p.category] || [];
    acc[p.category].push(p.name);
    return acc;
  }, {});
  console.log("\n[LIST] Products by Category:");
  Object.entries(grouped).forEach(([cat, names]) =>
    console.log(`   ${cat.padEnd(14)}: ${names.join(", ")}`)
  );
  return grouped;
}

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateStock,
  applyBulkDiscount,
  getLowStockAlerts,
  getInventoryValue,
  getProductsByCategory,
};

// -- Demo -------------------------------------------------------------------------

if (require.main === module) {
  console.log("=".repeat(60));
  console.log("   PRODUCTS MODULE - Retail Mock Data Demo");
  console.log("=".repeat(60));

  getAllProducts(true);
  getProductById("P005");
  getProductById("P999");
  addProduct({ name: "Canvas Tote Bag", category: "accessories", price: 17.99, stock: 110, sku: "AC-011" });
  updateStock("P001", -30);
  updateStock("P003", 50);
  applyBulkDiscount("clothing", 20);
  getLowStockAlerts(50);
  getProductsByCategory();
  getInventoryValue();
}
