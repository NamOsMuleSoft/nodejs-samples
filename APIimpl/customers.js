/**
 * customers.js - Mock Customers API (Node.js)
 * Run: node APIimpl/customers.js
 */

const version = "1.0.1";

const customers = [
  { id: 1, name: "Alice Dupont",    email: "alice@acme.com",   country: "FR", tier: "gold",   createdAt: "2023-01-15" },
  { id: 2, name: "Bob Nguyen",      email: "bob@orbit.io",     country: "US", tier: "silver", createdAt: "2023-03-22" },
  { id: 3, name: "Clara Schmidt",   email: "clara@zenith.de",  country: "DE", tier: "gold",   createdAt: "2023-06-01" },
  { id: 4, name: "David Martin",    email: "david@apex.fr",    country: "FR", tier: "bronze", createdAt: "2024-01-10" },
  { id: 5, name: "Eva Lindstrom",   email: "eva@nordic.se",    country: "SE", tier: "silver", createdAt: "2024-02-28" },
];

// -- Helpers ----------------------------------------------------------------------

const findById   = (id) => customers.find((c) => c.id === id);
const findByTier = (tier) => customers.filter((c) => c.tier === tier);
const findByCountry = (country) => customers.filter((c) => c.country === country);

// -- Operations -------------------------------------------------------------------

function getAllCustomers() {
  console.log("\n[LIST] All Customers:");
  console.table(customers);
  return customers;
}

function getCustomerById(id) {
  const customer = findById(id);
  if (!customer) {
    console.log(`\n[ERROR] Customer #${id} not found.`);
    return null;
  }
  console.log(`\n[OK] Customer #${id}:`, customer);
  return customer;
}

function addCustomer(newCustomer) {
  const id = customers.length + 1;
  const entry = { id, createdAt: new Date().toISOString().slice(0, 10), ...newCustomer };
  customers.push(entry);
  console.log(`\n[OK] Customer added:`, entry);
  return entry;
}

function updateCustomer(id, updates) {
  const index = customers.findIndex((c) => c.id === id);
  if (index === -1) {
    console.log(`\n[ERROR] Cannot update - Customer #${id} not found.`);
    return null;
  }
  customers[index] = { ...customers[index], ...updates };
  console.log(`\n[OK] Customer #${id} updated:`, customers[index]);
  return customers[index];
}

function deleteCustomer(id) {
  const index = customers.findIndex((c) => c.id === id);
  if (index === -1) {
    console.log(`\n[ERROR] Cannot delete - Customer #${id} not found.`);
    return false;
  }
  const [removed] = customers.splice(index, 1);
  console.log(`\n[OK] Customer #${id} deleted:`, removed);
  return true;
}

function getCustomersByTier(tier) {
  const result = findByTier(tier);
  console.log(`\n[LIST] ${tier.toUpperCase()} customers (${result.length}):`);
  console.table(result);
  return result;
}

function getStats() {
  const tiers = customers.reduce((acc, c) => {
    acc[c.tier] = (acc[c.tier] || 0) + 1;
    return acc;
  }, {});
  console.log("\n[STATS] Customer Stats:");
  console.log(`  Total     : ${customers.length}`);
  Object.entries(tiers).forEach(([tier, count]) =>
    console.log(`  ${tier.padEnd(8)}: ${count}`)
  );
  return { total: customers.length, byTier: tiers };
}

module.exports = {
  version,
  getAllCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomersByTier,
  getStats,
};

// -- Demo -------------------------------------------------------------------------

if (require.main === module) {
  console.log("=".repeat(55));
  console.log("   CUSTOMERS MODULE - Mock Data Demo");
  console.log("=".repeat(55));

  getAllCustomers();
  getCustomerById(2);
  getCustomerById(99);
  addCustomer({ name: "Frank Rossi", email: "frank@italia.it", country: "IT", tier: "gold" });
  updateCustomer(4, { tier: "silver" });
  getCustomersByTier("silver");
  getStats();
  deleteCustomer(5);
  console.log(`\nFinal count: ${customers.length} customers`);
}
