#!/usr/bin/env node
/**
 * generate-specs.js — Generate OAS 3.0 JSON from Fastify app (route schemas), split by domain, write to openapi-nodejs.
 * Run: npm run spec  OR  node scripts/generate-specs.js
 * Clean: npm run spec:clean  OR  node scripts/generate-specs.js clean
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OPENAPI_DIR = path.join(ROOT, "openapi-nodejs");
const SPECS = [
  { name: "products", prefix: "/api/products" },
  { name: "orders", prefix: "/api/orders" },
  { name: "customers", prefix: "/api/customers" },
];

function clean() {
  if (!fs.existsSync(OPENAPI_DIR)) {
    console.log("openapi-nodejs/ does not exist; nothing to clean.");
    return;
  }
  for (const { name } of SPECS) {
    const p = path.join(OPENAPI_DIR, `${name}.json`);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`Deleted ${p}`);
    }
  }
  console.log("Clean done.");
}

function filterPaths(paths, prefix) {
  const out = {};
  for (const [key, value] of Object.entries(paths || {})) {
    if (key.startsWith(prefix)) out[key] = value;
  }
  return out;
}

async function generate() {
  const { buildApp } = require(path.join(ROOT, "app.js"));

  if (!fs.existsSync(OPENAPI_DIR)) {
    fs.mkdirSync(OPENAPI_DIR, { recursive: true });
    console.log(`Created ${OPENAPI_DIR}`);
  }

  const fastify = await buildApp();
  await fastify.ready();

  const full = fastify.swagger();
  const paths = full.paths || {};
  const components = full.components || {};
  const baseInfo = full.info || { title: "Mock Retail API", version: "1.0.0" };
  const servers = full.servers || [{ url: "/", description: "Relative to host" }];

  for (const { name, prefix } of SPECS) {
    const filteredPaths = filterPaths(paths, prefix);
    if (Object.keys(filteredPaths).length === 0) {
      console.warn(`No paths found for prefix ${prefix}; skipping ${name}.json`);
      continue;
    }
    const title = `Mock Retail API – ${name.charAt(0).toUpperCase() + name.slice(1)}`;
    const spec = {
      openapi: "3.0.0",
      info: { ...baseInfo, title },
      servers,
      paths: filteredPaths,
      components: { ...components },
    };
    const outPath = path.join(OPENAPI_DIR, `${name}.json`);
    fs.writeFileSync(outPath, JSON.stringify(spec, null, 2), "utf8");
    console.log(`Wrote ${outPath}`);
  }

  await fastify.close();
  console.log("Done.");
}

const isClean = process.argv.includes("clean");
if (isClean) {
  clean();
} else {
  generate().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
