/**
 * Shared JSON Schema definitions for OpenAPI (Fastify route schemas).
 * Shapes match APIimpl responses.
 */

const errorSchema = {
  type: "object",
  properties: { error: { type: "string" } },
};

const productSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    category: { type: "string" },
    price: { type: "number" },
    stock: { type: "integer" },
    sku: { type: "string" },
    active: { type: "boolean" },
  },
};

const orderItemSchema = {
  type: "object",
  properties: {
    productId: { type: "string" },
    qty: { type: "integer" },
  },
};

const orderSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    customerId: { type: "integer" },
    status: { type: "string" },
    createdAt: { type: "string" },
    items: { type: "array", items: orderItemSchema },
    customer: { type: "string" },
    country: { type: "string" },
    total: { type: "string" },
  },
};

const customerSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    email: { type: "string" },
    country: { type: "string" },
    tier: { type: "string" },
    createdAt: { type: "string" },
  },
};

module.exports = {
  errorSchema,
  productSchema,
  orderItemSchema,
  orderSchema,
  customerSchema,
};
