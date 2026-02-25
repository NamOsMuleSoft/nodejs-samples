# Heroku – Mock Retail API

Deployed app: **https://nodejsapis-81c9760cfd2e.herokuapp.com**

Use the base URL below in your terminal, or set it once:

```bash
BASE_URL="https://nodejsapis-81c9760cfd2e.herokuapp.com"
```

---

## Discovery

```bash
# Root – endpoints overview
curl -s "$BASE_URL/"

# Full API description
curl -s "$BASE_URL/api"
```

---

## Products

```bash
# List all products
curl -s "$BASE_URL/api/products"

# List active products only
curl -s "$BASE_URL/api/products?onlyActive=true"

# Low stock alerts (default threshold 50)
curl -s "$BASE_URL/api/products/low-stock"
curl -s "$BASE_URL/api/products/low-stock?threshold=30"

# Inventory value
curl -s "$BASE_URL/api/products/inventory-value"

# Products by category
curl -s "$BASE_URL/api/products/by-category"

# Get one product
curl -s "$BASE_URL/api/products/P001"

# Add product
curl -s -X POST "$BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","category":"accessories","price":9.99,"stock":100,"sku":"TEST-001"}'

# Update stock
curl -s -X PATCH "$BASE_URL/api/products/P001/stock" \
  -H "Content-Type: application/json" \
  -d '{"qty":-10}'

# Bulk discount by category
curl -s -X POST "$BASE_URL/api/products/bulk-discount" \
  -H "Content-Type: application/json" \
  -d '{"category":"clothing","discountPct":15}'
```

---

## Orders

```bash
# List all orders
curl -s "$BASE_URL/api/orders"

# Revenue summary
curl -s "$BASE_URL/api/orders/revenue"

# Orders by customer ID
curl -s "$BASE_URL/api/orders/customer/1"

# Get one order
curl -s "$BASE_URL/api/orders/ORD-2024-001"

# Place order
curl -s -X POST "$BASE_URL/api/orders" \
  -H "Content-Type: application/json" \
  -d '{"customerId":1,"items":[{"productId":"P001","qty":1},{"productId":"P003","qty":2}]}'

# Advance order status
curl -s -X PATCH "$BASE_URL/api/orders/ORD-2024-003/advance"

# Cancel order
curl -s -X POST "$BASE_URL/api/orders/ORD-2025-001/cancel"
```

---

## Customers

```bash
# List all customers
curl -s "$BASE_URL/api/customers"

# Customer stats
curl -s "$BASE_URL/api/customers/stats"

# Customers by tier
curl -s "$BASE_URL/api/customers/tier/gold"
curl -s "$BASE_URL/api/customers/tier/silver"

# Get one customer
curl -s "$BASE_URL/api/customers/1"

# Add customer
curl -s -X POST "$BASE_URL/api/customers" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","country":"US","tier":"bronze"}'

# Update customer
curl -s -X PATCH "$BASE_URL/api/customers/1" \
  -H "Content-Type: application/json" \
  -d '{"tier":"gold"}'

# Delete customer
curl -s -X DELETE "$BASE_URL/api/customers/5"
```

---

## OpenAPI docs (when specs are generated)

```bash
# Docs index (run npm run spec first for Swagger UI)
curl -s "$BASE_URL/api-docs/index"

# JSON specs (always available from app)
curl -s "$BASE_URL/api-docs/spec/products"
curl -s "$BASE_URL/api-docs/spec/orders"
curl -s "$BASE_URL/api-docs/spec/customers"
```

---

## One-liner to test the API is up

```bash
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/products"
# Expect: 200
```
